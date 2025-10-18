import SwaggerProtoMessage from "../../plugin";

export const mockSetMessage = jest.fn();
export const mockRequestInterceptor = jest.fn((req) => Promise.resolve(req));
export const mockResponseInterceptor = jest.fn((res) => Promise.resolve(res));

export const MockedSwaggerProtoMessage =
	SwaggerProtoMessage as jest.MockedClass<typeof SwaggerProtoMessage>;
