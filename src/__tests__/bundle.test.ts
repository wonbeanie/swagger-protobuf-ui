import { SwaggerUIBundle, type SwaggerRequest, type SwaggerResponse } from "swagger-ui-dist";
import { testDataBody } from "./mocks/proto-mock";
import * as MyProto from "./test-data/proto.bundle";
import "../index";

jest.mock('swagger-ui-dist', () => ({
    ...jest.requireActual('swagger-ui-dist'),
    SwaggerUIBundle: jest.fn(),
}));

describe('통합 테스트', () => {
	const testActionsRequest = {
		method : "post",
		pathName : "/users",
	}

	const testRequest = {
		url : "http://localhost:8080/users",
		method : "post",
		credentials : "application/protobuf",
		body : JSON.stringify(testDataBody)
	} as SwaggerRequest;

	const testResponse = {
		url : "http://localhost:8080/users",
		method : "post",
		credentials : "application/protobuf",
	} as SwaggerResponse;

	const mockSystem = {
		specSelectors: {
			specJson: () => ({
				toJS: () => mockSpec,
			}),
		},
	};

	const mockOriginalAction = jest.fn();
	const userRequestInterceptor = jest.fn(req => req);
    const userResponseInterceptor = jest.fn(res => res);

	const mockSpec = {
		"paths": {
			"/users": {
				"post": {
					"req_message": "User",
					"res_message": "User",
				},
			},
		},
	};

	test("번들을 통한 요청/응답 흐름 테스트", async () => {
		// 사용자 정의 인터셉터를 포함한 옵션으로 번들 초기화
		globalThis.SwaggerProtoBufUIBundle(MyProto,{
			url : "http://localhost:8080/server.json",
			dom_id: '#swagger-ui',
			requestInterceptor : userRequestInterceptor,
			responseInterceptor : userResponseInterceptor
		});

		// 메인 번들이 잘 호출되었는지 확인
		expect(SwaggerUIBundle).toHaveBeenCalledTimes(1);

		const swaggerConfig = (SwaggerUIBundle as unknown as jest.Mock).mock.calls[0][0];
		// 번들에 전달된 plugin.ts이 적용되었는지 확인
        expect(swaggerConfig.plugins).toHaveLength(1);

		// executeRequest을 통해 plugin.ts(getProtoMessageKey) 호출
		const executeRequestWrapper = swaggerConfig.plugins[0].statePlugins.spec.wrapActions.executeRequest;
        const wrappedExecuteRequest = executeRequestWrapper(mockOriginalAction, mockSystem);
        wrappedExecuteRequest(testActionsRequest);

		// index.ts(requestInterceptor) 호출
		const request = await swaggerConfig.requestInterceptor(testRequest);

		// index.ts(requestInterceptor) 호출
        testResponse.data = request.body; // 직렬화되어 반환된 body를 응답 데이터로 설정
        const response = await swaggerConfig.responseInterceptor(testResponse);

		// 요청이 직렬화 되었는지 확인
        expect(request.body).toBeInstanceOf(Blob);

		// 역직렬화되어 js객체로 변환되었는지 확인
        expect(response.data).toEqual(testDataBody);
        expect(typeof response.text).toBe('string');

		// 사용자 정의 interceptor 호출 확인
        expect(userRequestInterceptor).toHaveBeenCalledTimes(1);
        expect(userResponseInterceptor).toHaveBeenCalledTimes(1);
	});
});