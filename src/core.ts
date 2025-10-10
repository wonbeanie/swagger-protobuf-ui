import type { SwaggerRequest, SwaggerResponse } from "swagger-ui-dist";
import type {
	DescriptorFields,
	DescriptorNode,
	ProtobufLibrary,
	ProtoList,
	ProtoMessage,
} from "./types/protobuf";
import {
	DeserializationError,
	InvalidSetterError,
	NotFoundError,
	SerializationError,
} from "./custom-error";

/**
 * ProtoBuf 데이터를 파싱하거나 객체로 변환하는 클래스
 * Swagger의 Interceptor를 기반을 동작하며
 * 로드된 .proto 파일의 proto 객체와 descriptor 객체를 사용하여 메세지를 변환합니다.
 */
export default class SwaggerProtoBuf {
	#protobuf: ProtoList;
	#descriptor: DescriptorNode;
	#message = "";
	ARRAY_INDEX_FLAG = "List";

	/**
	 * SwaggerProtoBuf의 새 인스턴스를 생성합니다.
	 * @param root proto.bundle.js를 통해 생성된 Root 객체.
	 * @param root.proto protobuf 데이터가 들어가 있는 객체
	 * @param root.descriptor descriptor 데이터가 들어가 있는 객체
	 */
	constructor({ proto, descriptor }: ProtobufLibrary) {
		this.#protobuf = proto;
		this.#descriptor = descriptor.nested;
	}

	/**
	 * 주어진 namespace를 재귀적으로 탐색하여 일치하는 메세지의 filed를 추출합니다.
	 * @param messageName 추출할 메세지 이름
	 * @param namespace 검색을 시작할 최상위 descriptor
	 * @returns 추출된 Field, 찾지 못하면 null을 반환
	 */
	getDescriptorFields(
		messageName: string,
		namespace: DescriptorNode
	): DescriptorFields | null {
		if (namespace[messageName] && namespace[messageName].fields) {
			return namespace[messageName].fields;
		}

		for (const node of Object.values(namespace)) {
			if (node && node.nested) {
				const found = this.getDescriptorFields(messageName, node.nested);
				if (found) {
					return found;
				}
			}
		}

		return null;
	}

	/**
	 * js객체을 Descriptor를 이용하여 ProtoBuf 객체로 변환하는 함수
	 * @param jsObject 변환할 객체
	 * @param messageKey 변환할 최상위 메세지 이름
	 */
	async setProtoBufData(
		jsObject: JavaScriptObject,
		messageKey: string
	): Promise<ProtoMessage> {
		const message = this.#protobuf[messageKey];

		if (!message) {
			throw new NotFoundError(
				`Could not find message type "${messageKey}" in ProtoBuffer`
			);
		}

		const protoInstance = new message();

		const messageType = this.getDescriptorFields(messageKey, this.#descriptor);

		if (!messageType) {
			throw new NotFoundError(
				`Could not find descriptor for message type "${messageKey}"`
			);
		}

		const messageKeys = Object.keys(this.#protobuf);

		for (const key in jsObject) {
			if (key === "__proto__" || key === "constructor" || key === "prototype") {
				continue;
			}
			if (!messageType[key]) {
				throw new NotFoundError(
					`Could not find descriptor for field "${key}" in message "${messageKey}"`
				);
			}

			let setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;

			const type = messageType[key].type;

			if (jsObject[key] instanceof Array) {
				if (!messageKeys.includes(type)) {
					throw new NotFoundError(
						`Could not find message type "${type}" in ProtoBuffer`
					);
				}

				setterName += this.ARRAY_INDEX_FLAG;
				const protoInstanceList = await Promise.all(
					jsObject[key].map((arr) => {
						return this.setProtoBufData(arr, type);
					})
				);

				setInstanceValue(setterName, protoInstanceList);
				continue;
			}

			if (jsObject[key] instanceof Object) {
				const instance = await this.setProtoBufData(jsObject[key], type);

				setInstanceValue(setterName, instance);
				continue;
			}

			setInstanceValue(setterName, jsObject[key]);
		}

		return protoInstance;

		function setInstanceValue(setter: string, value: unknown) {
			if (!protoInstance[setter]) {
				throw new InvalidSetterError(
					`Invalid setter "${setter}" for message "${messageKey}"`
				);
			}

			protoInstance[setter](value);
		}
	}

	/**
	 * 역직렬화된 Message를 Array setter에 사용된 "ARRAY_INDEX_FLAG"를
	 * 제거하여 jsObject로 변환하는 함수
	 * @param data Message.toObject의 반환값
	 * @returns descriptor에 맞게 변환된 함수
	 */
	messageToObject(data: JavaScriptObject) {
		const result: JavaScriptObject = {};
		Object.keys(data).forEach((key) => {
			if (key === "__proto__" || key === "constructor" || key === "prototype") {
				return;
			}
			if (data[key] instanceof Array) {
				const keyName = key.replace(this.ARRAY_INDEX_FLAG, "");

				result[keyName] = data[key].map((arr) => {
					return this.messageToObject(arr);
				});
			} else if (data[key] instanceof Object) {
				result[key] = this.messageToObject(data[key]);
			} else if (data[key]) {
				result[key] = data[key];
			}
		});

		return result;
	}

	/**
	 * Blob 객체을 역직렬화를 통해 js객체로 변환하는 함수
	 * @param blobData 역직렬화될 Blob 객체
	 * @returns Blob 객체가 역직렬화된 js객체
	 */
	async getBlobToObject(blobData: Blob) {
		const message = this.#protobuf[this.#message];

		if (!message) {
			throw new NotFoundError(
				`Could not find message type "${this.#message}" in ProtoBuffer`
			);
		}

		try {
			const arrayBuffer = await blobData.arrayBuffer();

			const uint8Array = new Uint8Array(arrayBuffer);

			const protoMessage = message.deserializeBinary(uint8Array);

			return this.messageToObject(protoMessage.toObject() as JavaScriptObject);
		} catch (err) {
			throw new DeserializationError("Protobuf deserializeBinary failed", {
				cause: err,
			});
		}
	}

	/**
	 * JSON 문자열을 직렬화하여 Blob 객체로 변환하는 함수
	 * @param data 직렬화될 JSON 문자열
	 * @returns data가 직렬화된 Blob 객체
	 */
	async getObjectToBlob(data: string) {
		try {
			const requestData = JSON.parse(data);

			const protoMessage = await this.setProtoBufData(
				requestData,
				this.#message
			);

			const encodedBuffer = protoMessage.serializeBinary();

			const result = new Blob([encodedBuffer], {
				type: "application/octet-stream",
			});

			return result;
		} catch (err) {
			throw new SerializationError("Protobuf serializeBinary failed", {
				cause: err,
			});
		}
	}

	checkMessage() {
		if (!this.#message) {
			throw new NotFoundError("No appropriate message in ProtoBuffer");
		}
	}

	/**
	 * Swagger-UI 요청 인터셉터입니다.
	 * 요청 본문이 존재할경우, 이를 Blob으로 직렬화하여 요청 객체를 수정합니다.
	 * @param {SwaggerRequest} request Swagger-UI에서 보낸 요청 객체
	 * @returns {Promise<SwaggerRequest>} body가 직렬화된 요청 객체
	 */
	async requestInterceptor(request: SwaggerRequest) {
		this.checkMessage();

		if (request.body) {
			request.body = await this.getObjectToBlob(request.body);
		}

		return request;
	}

	/**
	 * Swagger-UI 응답 인터셉터입니다.
	 * 응답 data가 Blob 객체일 경우, 이를 역직렬화하여 요청 객체를 수정합니다.
	 * @param response Swagger-UI에서 보낸 응답 객체
	 * @returns data가 역직렬화된 응답 객체
	 */
	async responseInterceptor(response: SwaggerResponse) {
		this.checkMessage();

		if (response.data instanceof Blob) {
			const data = await this.getBlobToObject(response.data);
			response.data = data;
			response.text = JSON.stringify(data, null, 2);
		}

		return response;
	}

	set setMessage(messageName: string) {
		this.#message = messageName;
	}
}

type JavaScriptValue =
	| string
	| number
	| boolean
	| JavaScriptObject
	| JavaScriptObject[];
interface JavaScriptObject {
	[key: string]: JavaScriptValue;
}
