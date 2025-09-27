import type { SwaggerRequest, SwaggerResponse } from "swagger-ui-dist";
import SwaggerProtoBuf from "../core";
import { testDataBody } from "./mocks/proto-mock";
import * as MyProto from "./test-data/proto.bundle";

describe('데이터 변환 시나리오 테스트', () => {
   	const swaggerProtoBuf = new SwaggerProtoBuf(MyProto);
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


	afterEach(() => {
		swaggerProtoBuf.setMessage = "";
		jest.clearAllMocks();
	});

	test("데이터 변환 테스트", async () => {
		swaggerProtoBuf.setMessage = "User";

		const request = await swaggerProtoBuf.requestInterceptor(testRequest);

		testResponse.data = request.body;
		testResponse.text = JSON.stringify(request.body);

		const response = await swaggerProtoBuf.responseInterceptor(testResponse);

		expect(request.body).toBeInstanceOf(Blob);
		expect(response.data).toBeInstanceOf(Object);
		expect(typeof response.text).toEqual("string");
		expect(response.data).toEqual(testDataBody);
	});
});