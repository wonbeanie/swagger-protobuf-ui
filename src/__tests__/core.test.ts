import SwaggerProtoBuf from "../core";
import {
	DeserializationError,
	InvalidSetterError,
	NotFoundError,
	SerializationError,
} from "../custom-error";
import type { Descriptor } from "../types/protobuf";
import {
	mockBlob,
	mockBodyData,
	mockDescriptor,
	mockProto,
	mockSwaggerRequest,
	mockSwaggerResponse,
	mockUserInstance,
	UserMock,
} from "./mocks/proto-mock";

describe("core.ts 테스트", () => {
	const swaggerProtoBuf = new SwaggerProtoBuf({
		proto: mockProto,
		descriptor: mockDescriptor,
	});

	afterEach(() => {
		swaggerProtoBuf.setMessage = "";
		jest.clearAllMocks();
	});

	describe("Request 테스트", () => {
		describe("setProtoBufData 테스트", () => {
			test("body 데이터가 정상적일때 기능 검증", async () => {
				const message = "User";

				const protoInstance = await swaggerProtoBuf.setProtoBufData(
					mockBodyData,
					message
				);

				expect(mockProto.User).toHaveBeenCalledTimes(1);
				expect(protoInstance.setName).toHaveBeenCalledWith("user");
				expect(protoInstance.setId).toHaveBeenCalledWith(1);

				expect(mockProto.Tag).toHaveBeenCalledTimes(2);
				expect(protoInstance.setTagsList).toHaveBeenCalledTimes(1);

				expect(mockProto.Address).toHaveBeenCalledTimes(1);
				expect(protoInstance.setAddress).toHaveBeenCalledTimes(1);
			});

			test("올바르지 않는 메시지키일때의 에러 검증", async () => {
				const message = "Address";

				await expect(
					swaggerProtoBuf.setProtoBufData(mockBodyData, message)
				).rejects.toThrow(NotFoundError);
			});

			test("메세지 타입과 맞지 않는 body 데이터일때 에러 검증", async () => {
				const message = "User";

				await expect(
					swaggerProtoBuf.setProtoBufData(
						{
							name: "user",
							id: 1,
							tags: { name: "tag1" },
							address: {
								street: "street",
								city: "city",
							},
						},
						message
					)
				).rejects.toThrow(InvalidSetterError);
			});

			test("descriptor와 proto가 일치하지 않을때 에러 검증", async () => {
				const mockNoDescriptor = new SwaggerProtoBuf({
					proto: mockProto,
					descriptor: {
						nested: {},
					},
				});

				const message = "User";

				await expect(
					mockNoDescriptor.setProtoBufData(mockBodyData, message)
				).rejects.toThrow(NotFoundError);
			});

			test("배열일때 descriptor에서 정의된 타입과 proto의 키가 일치하지 않을때 에러 검증", async () => {
				const mockInconsistencyDescriptor = new SwaggerProtoBuf({
					proto: mockProto,
					descriptor: {
						nested: {
							User: {
								fields: {
									tags: { rule: "repeated", type: "Tags" },
								},
							},
						},
					} as Descriptor,
				});

				const message = "User";

				const mockBodyErrorData = {
					tags: [{ name: "tag1" }, { name: "tag2" }],
				};

				await expect(
					mockInconsistencyDescriptor.setProtoBufData(
						mockBodyErrorData,
						message
					)
				).rejects.toThrow(NotFoundError);
			});

			test("존재하지 않는 메시지키일때의 에러 검증", async () => {
				const message = "";

				await expect(
					swaggerProtoBuf.setProtoBufData(mockBodyData, message)
				).rejects.toThrow(NotFoundError);
			});
		});

		describe("getObjectToBlob", () => {
			test("body 데이터가 정상적일때 기능 검증", async () => {
				swaggerProtoBuf.setMessage = "User";

				const blob = await swaggerProtoBuf.getObjectToBlob(
					JSON.stringify(mockBodyData)
				);

				expect(blob).toBeInstanceOf(Blob);
				expect(mockUserInstance.serializeBinary).toHaveBeenCalledTimes(1);
			});

			test("올바르지 않는 메시지키일때의 에러 검증", async () => {
				swaggerProtoBuf.setMessage = "Address";

				await expect(
					swaggerProtoBuf.getObjectToBlob(JSON.stringify(mockBodyData))
				).rejects.toThrow(SerializationError);
			});

			test("객체가 아닌 문자열일때의 에러 검증", async () => {
				swaggerProtoBuf.setMessage = "User";

				await expect(
					swaggerProtoBuf.getObjectToBlob("test data string")
				).rejects.toThrow(SerializationError);
			});
		});

		test("requestInterceptor 테스트", async () => {
			swaggerProtoBuf.setMessage = "User";
			const request =
				await swaggerProtoBuf.requestInterceptor(mockSwaggerRequest);

			expect(request).toBeInstanceOf(Object);
			expect(request.body).toBeInstanceOf(Blob);
		});
	});

	describe("responseInterceptor 테스트", () => {
		describe("getBlobToObject 테스트", () => {
			test("User 메세지일때 기능 검증", async () => {
				swaggerProtoBuf.setMessage = "User";

				const data = await swaggerProtoBuf.getBlobToObject(mockBlob);

				expect(UserMock.deserializeBinary).toHaveBeenCalledTimes(1);
				expect(mockUserInstance.toObject).toHaveBeenCalledTimes(1);
				expect(data).toEqual(mockBodyData);
			});

			test("메세지키를 찾을수 없을때의 오류 검증", async () => {
				swaggerProtoBuf.setMessage = "Error";

				await expect(swaggerProtoBuf.getBlobToObject(mockBlob)).rejects.toThrow(
					NotFoundError
				);
			});

			test("deserializeBinary가 실패할때의 오류 검증", async () => {
				swaggerProtoBuf.setMessage = "User";

				const mockDeserializeBinary = UserMock.deserializeBinary;

				UserMock.deserializeBinary = jest.fn().mockImplementation(() => {
					throw new Error();
				});

				const mockBlob = new Blob([JSON.stringify(mockBodyData)], {
					type: "application/octet-stream",
				});

				await expect(swaggerProtoBuf.getBlobToObject(mockBlob)).rejects.toThrow(
					DeserializationError
				);

				UserMock.deserializeBinary = mockDeserializeBinary;
			});

			test("responseInterceptor 테스트", async () => {
				swaggerProtoBuf.setMessage = "User";
				const response =
					await swaggerProtoBuf.responseInterceptor(mockSwaggerResponse);

				expect(response).toBeInstanceOf(Object);
				expect(response.data).toBeInstanceOf(Object);
				expect(typeof response.text).toEqual("string");
			});
		});
	});

	test("메세지키를 설정하지 않았을때 오류 테스트", () => {
		swaggerProtoBuf.setMessage = "";

		expect(() => swaggerProtoBuf.checkMessage()).toThrow(NotFoundError);
	});
});
