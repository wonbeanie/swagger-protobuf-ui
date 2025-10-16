import { MockedSwaggerProtoMessage, mockRequestInterceptor, mockResponseInterceptor, mockSetMessage } from "./mocks/core-mock";
import { mockDescriptor, mockOptions, mockProto, mockSwaggerRequest, mockSwaggerResponse } from "./mocks/proto-mock";

const libraryObject = {
  proto: mockProto,
  descriptor: mockDescriptor,
};

export function runInterceptorTest(MockedSwaggerUIBundle : jest.Mock, SwaggerProtoMessage : jest.Mock){
  describe("Request Interceptor 테스트", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.clearAllMocks();
      mockSetMessage.mockClear();
      mockRequestInterceptor.mockClear();
      mockResponseInterceptor.mockClear();
    });

    test("option과 swaggerProtoBuf requestInterceptor 호출 검증", async () => {
      const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
      mockProtoMessageInstance.reqMessage = "User";
      (SwaggerProtoMessage as jest.Mock).mockImplementation(
        () => mockProtoMessageInstance
      );

      globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
      const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];

      const result = await bundleConfig.requestInterceptor(mockSwaggerRequest);

      expect(mockSetMessage).toHaveBeenCalledWith("User");
      expect(mockRequestInterceptor).toHaveBeenCalledTimes(1);
      expect(mockOptions.requestInterceptor).toHaveBeenCalled();
      expect(result).toBe(mockSwaggerRequest);
    });

    test("options에 requestInterceptor가 없을때", async () => {
      globalThis.SwaggerProtoBufUIBundle(libraryObject, {
        ...mockOptions,
        requestInterceptor: undefined,
      });

      const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
      await bundleConfig.requestInterceptor(mockSwaggerRequest);

      console.log(bundleConfig)

      expect(mockOptions.requestInterceptor).not.toHaveBeenCalled();
    });

    test("메세지가 없을때", async () => {
      const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
      mockProtoMessageInstance.reqMessage = "";
      (SwaggerProtoMessage as jest.Mock).mockImplementation(
        () => mockProtoMessageInstance
      );

      globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
      const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
      await bundleConfig.requestInterceptor(mockSwaggerRequest);

      expect(mockRequestInterceptor).not.toHaveBeenCalled();
      expect(mockOptions.requestInterceptor).toHaveBeenCalled();
    });

    test("에러 로그 테스트", async () => {
      const errorMessage = "Request Interceptor Error";
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockRequestInterceptor.mockRejectedValue(errorMessage);

      const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
      mockProtoMessageInstance.reqMessage = "User";
      (SwaggerProtoMessage as jest.Mock).mockImplementation(
        () => mockProtoMessageInstance
      );

      globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
      const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
      await bundleConfig.requestInterceptor(mockSwaggerRequest);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);

      consoleErrorSpy.mockRestore();
    });
  });

	describe("Response Interceptor 테스트", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.clearAllMocks();
      mockSetMessage.mockClear();
      mockRequestInterceptor.mockClear();
      mockResponseInterceptor.mockClear();
    });

		test("option과 swaggerProtoBuf responseInterceptor 호출 검증", async () => {
			const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
			mockProtoMessageInstance.resMessage = "User";
			(SwaggerProtoMessage as jest.Mock).mockImplementation(
				() => mockProtoMessageInstance
			);

			globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
			const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];

			const result =
				await bundleConfig.responseInterceptor(mockSwaggerResponse);

			expect(mockSetMessage).toHaveBeenCalledWith("User");
			expect(mockResponseInterceptor).toHaveBeenCalledTimes(1);
			expect(mockOptions.responseInterceptor).toHaveBeenCalled();
			expect(result).toBe(mockSwaggerResponse);
		});

		test("options에 responseInterceptor가 없을때", async () => {
			globalThis.SwaggerProtoBufUIBundle(libraryObject, {
				...mockOptions,
				responseInterceptor: undefined,
			});

			const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
			await bundleConfig.responseInterceptor(mockSwaggerResponse);

			expect(mockOptions.responseInterceptor).not.toHaveBeenCalled();
		});

		test("메세지가 없을때", async () => {
			const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
			mockProtoMessageInstance.resMessage = "";
			(SwaggerProtoMessage as jest.Mock).mockImplementation(
				() => mockProtoMessageInstance
			);

			globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
			const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
			await bundleConfig.responseInterceptor(mockSwaggerResponse);

			expect(mockResponseInterceptor).not.toHaveBeenCalled();
			expect(mockOptions.responseInterceptor).toHaveBeenCalled();
		});

		test("에러 로그 테스트", async () => {
			const errorMessage = "Response Interceptor Error";
			const consoleErrorSpy = jest
				.spyOn(console, "error")
				.mockImplementation(() => {});

			mockResponseInterceptor.mockRejectedValue(errorMessage);

			const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
			mockProtoMessageInstance.resMessage = "User";
			(SwaggerProtoMessage as jest.Mock).mockImplementation(
				() => mockProtoMessageInstance
			);

			globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
			const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
			await bundleConfig.responseInterceptor(mockSwaggerResponse);

			expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);

			consoleErrorSpy.mockRestore();
		});
	});
}