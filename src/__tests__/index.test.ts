import { SwaggerUIBundle } from "swagger-ui-dist";
import { mockBlob, mockBodyData, mockDescriptor, mockOptions, mockProto, mockSwaggerRequest, mockSwaggerResponse, mockUserInstance, UserMock } from "./mocks/proto-mock";

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

const MockedSwaggerUIBundle = SwaggerUIBundle as unknown as jest.Mock;

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
});