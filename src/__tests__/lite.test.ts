import { mockDescriptor, mockOptions, mockProto } from "./mocks/proto-mock";
import "../lite";
import { runInterceptorTest } from "./helpers";
import {
	mockRequestInterceptor,
	mockResponseInterceptor,
	mockSetMessage,
} from "./mocks/core-mock";
import SwaggerProtoMessage from "../plugin";

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

describe("lite.ts 테스트", () => {
	const libraryObject = {
		proto: mockProto,
		descriptor: mockDescriptor,
	};

	describe("SwaggerUIBundle이 import되지 않았을때", () => {
		const mockGetElementById = jest.fn().mockReturnValue({
			appendChild: jest.fn(),
		});

		const mockCreateElement = jest.fn().mockReturnValue({
			setAttribute: jest.fn(),
			innerText: jest.fn(),
			appendChild: jest.fn(),
		});

		beforeAll(() => {
			document.getElementById = mockGetElementById;
			document.createElement = mockCreateElement;
		});

		beforeEach(() => {
			mockCreateElement.mockClear();
			mockGetElementById.mockClear();
		});

		test("id가 존재할때", () => {
			globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);

			expect(document.getElementById).toHaveBeenCalledTimes(1);
			expect(document.createElement).toHaveBeenCalledTimes(1);
		});

		test("id가 존재하지 않을때", () => {
			document.getElementById = jest.fn().mockReturnValue(false);

			globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);

			expect(document.getElementById).toHaveBeenCalledTimes(1);
			expect(document.createElement).toHaveBeenCalledTimes(2);
		});
	});

	describe("Interceptor 테스트", () => {
		const mockSwaggerUiBundle = jest.fn();

		beforeAll(() => {
			globalThis.SwaggerUIBundle = mockSwaggerUiBundle;
		});

		beforeEach(() => {
			mockSwaggerUiBundle.mockClear();
		});

		runInterceptorTest(mockSwaggerUiBundle, SwaggerProtoMessage as jest.Mock);
	});
});
