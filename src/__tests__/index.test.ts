import { SwaggerUIBundle } from "swagger-ui-dist";
import { mockDescriptor, mockOptions, mockProto } from "./mocks/proto-mock";
import "../index";
import {
	mockRequestInterceptor,
	mockResponseInterceptor,
	mockSetMessage,
} from "./mocks/core-mock";
import { runInterceptorTest } from "./helpers";
import SwaggerProtoMessage from "../plugin";

export const MockedSwaggerUIBundle = SwaggerUIBundle as unknown as jest.Mock;

jest.mock("swagger-ui-dist", () => ({
	SwaggerUIBundle: jest.fn(),
}));

jest.mock("../plugin", () => {
	return jest.fn().mockImplementation(() => {
		return {
			reqMessage: "",
			resMessage: "",
			swaggerPlugin: {
				statePlugins: {
					spec: {
						wrapActions: {
							executeRequest: jest.fn(),
						},
					},
				},
			},
		};
	});
});

jest.mock("../core", () => {
	return jest.fn().mockImplementation(() => {
		const instance = {
			requestInterceptor: mockRequestInterceptor,
			responseInterceptor: mockResponseInterceptor,
		};
		Object.defineProperty(instance, "setMessage", {
			set: mockSetMessage,
			configurable: true,
		});
		return instance;
	});
});

describe("index.ts 테스트", () => {
	const libraryObject = {
		proto: mockProto,
		descriptor: mockDescriptor,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		jest.clearAllMocks();
		mockSetMessage.mockClear();
		mockRequestInterceptor.mockClear();
		mockResponseInterceptor.mockClear();
	});

	test("SwaggerUIBundle 호출, 옵션 초기화, 인터셉트 테스트", () => {
		globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);

		expect(MockedSwaggerUIBundle).toHaveBeenCalledTimes(1);
		const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];

		expect(bundleConfig.dom_id).toBe(mockOptions.dom_id);
		expect(bundleConfig.url).toBe(mockOptions.url);
		expect(bundleConfig.plugins).toHaveLength(2);
		expect(bundleConfig.plugins[0]).toHaveProperty("statePlugins");
		expect(bundleConfig.plugins[1]).toEqual(mockOptions.plugins[0]);
		expect(typeof bundleConfig.requestInterceptor).toBe("function");
		expect(typeof bundleConfig.responseInterceptor).toBe("function");
	});

	describe("Interceptor 테스트", () => {
		runInterceptorTest(MockedSwaggerUIBundle, SwaggerProtoMessage as jest.Mock);
	});
});
