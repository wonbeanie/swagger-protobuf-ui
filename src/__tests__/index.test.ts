import { SwaggerUIBundle } from "swagger-ui-dist";
import { mockBlob, mockBodyData, mockDescriptor, mockOptions, mockProto, mockSwaggerRequest, mockSwaggerResponse, mockUserInstance, UserMock } from "./mocks/proto-mock";
import SwaggerProtoBuf from "../core";
import SwaggerProtoMessage from "../plugin";

const mockSetMessage = jest.fn();
const mockRequestInterceptor = jest.fn(req => Promise.resolve(req));
const mockResponseInterceptor = jest.fn(res => Promise.resolve(res));

const MockedSwaggerProtoMessage = SwaggerProtoMessage as jest.MockedClass<typeof SwaggerProtoMessage>;
const MockedSwaggerUIBundle = SwaggerUIBundle as unknown as jest.Mock;

jest.mock('swagger-ui-dist', () => ({
  SwaggerUIBundle: jest.fn(),
}));

jest.mock('../plugin', () => {
  return jest.fn().mockImplementation(() => {
    return {
        reqMessage: '',
        resMessage: '',
        swaggerPlugin : {
            statePlugins: {
                spec: {
                    wrapActions: {
                        executeRequest : jest.fn()
                    }
                }
            }
        }
    }
  })
});

jest.mock('../core', () => {
    return jest.fn().mockImplementation(() => {
        const instance = {
            requestInterceptor: mockRequestInterceptor,
            responseInterceptor: mockResponseInterceptor,
        };
        Object.defineProperty(instance, 'setMessage', {
            set: mockSetMessage,
            configurable: true
        });
        return instance;
    });
})

describe('index.ts 테스트', () => {
    const libraryObject = {
        proto: mockProto as any,
        descriptor: mockDescriptor,
    };

    beforeAll(() => {
        require('../index');
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllMocks();
        mockSetMessage.mockClear();
        mockRequestInterceptor.mockClear();
        mockResponseInterceptor.mockClear();
    });

    it('SwaggerUIBundle 호출, 옵션 초기화, 인터셉트 테스트', () => {
        globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);

        expect(MockedSwaggerUIBundle).toHaveBeenCalledTimes(1);
        const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];

        expect(bundleConfig.dom_id).toBe(mockOptions.dom_id);
        expect(bundleConfig.url).toBe(mockOptions.url);
        expect(bundleConfig.plugins).toHaveLength(2);
        expect(bundleConfig.plugins[0]).toHaveProperty('statePlugins');
        expect(bundleConfig.plugins[1]).toEqual(mockOptions.plugins[0]);
        expect(typeof bundleConfig.requestInterceptor).toBe('function');
        expect(typeof bundleConfig.responseInterceptor).toBe('function');
    });

    describe("Request Interceptor 테스트",() => {
        test("option과 swaggerProtoBuf requestInterceptor 호출 검증", async () => {
            const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
            mockProtoMessageInstance.reqMessage = 'User';
            (SwaggerProtoMessage as jest.Mock).mockImplementation(() => mockProtoMessageInstance);

            globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
            const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];

            const result = await bundleConfig.requestInterceptor(mockSwaggerRequest);
            
            expect(mockSetMessage).toHaveBeenCalledWith('User');
            expect(mockRequestInterceptor).toHaveBeenCalledTimes(1);
            expect(mockOptions.requestInterceptor).toHaveBeenCalled();
            expect(result).toBe(mockSwaggerRequest);
        });

        test("options에 requestInterceptor가 없을때", async () => {
            globalThis.SwaggerProtoBufUIBundle(libraryObject, {
                ...mockOptions,
                requestInterceptor: undefined
            });

            const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
            await bundleConfig.requestInterceptor(mockSwaggerRequest);

            expect(mockOptions.requestInterceptor).not.toHaveBeenCalled();
        });

        test("메세지가 없을때", async () => {
            const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
            mockProtoMessageInstance.reqMessage = '';
            (SwaggerProtoMessage as jest.Mock).mockImplementation(() => mockProtoMessageInstance);


            globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
            const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
            await bundleConfig.requestInterceptor(mockSwaggerRequest);

            expect(mockRequestInterceptor).not.toHaveBeenCalled();
            expect(mockOptions.requestInterceptor).toHaveBeenCalled();
        });

        test("에러 로그 테스트", async () => {
            const errorMessage = 'Request Interceptor Error';
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            mockRequestInterceptor.mockRejectedValue(errorMessage);

            const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
            mockProtoMessageInstance.reqMessage = 'User';
            (SwaggerProtoMessage as jest.Mock).mockImplementation(() => mockProtoMessageInstance);

            globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
            const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
            await bundleConfig.requestInterceptor(mockSwaggerRequest);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);

            consoleErrorSpy.mockRestore();
        });
    })

    describe("Response Interceptor 테스트",() => {
        test("option과 swaggerProtoBuf responseInterceptor 호출 검증", async () => {
            const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
            mockProtoMessageInstance.resMessage = 'User';
            (SwaggerProtoMessage as jest.Mock).mockImplementation(() => mockProtoMessageInstance);

            globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
            const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];

            const result = await bundleConfig.responseInterceptor(mockSwaggerResponse);
            
            expect(mockSetMessage).toHaveBeenCalledWith('User');
            expect(mockResponseInterceptor).toHaveBeenCalledTimes(1);
            expect(mockOptions.responseInterceptor).toHaveBeenCalled();
            expect(result).toBe(mockSwaggerResponse);
        });

        test("options에 responseInterceptor가 없을때", async () => {
            globalThis.SwaggerProtoBufUIBundle(libraryObject, {
                ...mockOptions,
                responseInterceptor: undefined
            });

            const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
            await bundleConfig.responseInterceptor(mockSwaggerResponse);

            expect(mockOptions.responseInterceptor).not.toHaveBeenCalled();
        });

        test("메세지가 없을때", async () => {
            const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
            mockProtoMessageInstance.resMessage = '';
            (SwaggerProtoMessage as jest.Mock).mockImplementation(() => mockProtoMessageInstance);

            globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
            const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
            await bundleConfig.responseInterceptor(mockSwaggerResponse);

            expect(mockResponseInterceptor).not.toHaveBeenCalled();
            expect(mockOptions.responseInterceptor).toHaveBeenCalled();
        });

        test("에러 로그 테스트", async () => {
            const errorMessage = 'Response Interceptor Error';
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            mockResponseInterceptor.mockRejectedValue(errorMessage);

            const mockProtoMessageInstance = new MockedSwaggerProtoMessage();
            mockProtoMessageInstance.resMessage = 'User';
            (SwaggerProtoMessage as jest.Mock).mockImplementation(() => mockProtoMessageInstance);

            globalThis.SwaggerProtoBufUIBundle(libraryObject, mockOptions);
            const bundleConfig = MockedSwaggerUIBundle.mock.calls[0][0];
            await bundleConfig.responseInterceptor(mockSwaggerResponse);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);

            consoleErrorSpy.mockRestore();
        });
    });

});