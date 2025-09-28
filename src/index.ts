import SwaggerProtoMessage from "./plugin";
import SwaggerProtoBuf from "./core";
import { isBlank } from "./utils";
import {
	SwaggerUIBundle,
	type SwaggerConfigs,
	type SwaggerRequest,
	type SwaggerResponse,
} from "swagger-ui-dist";
import { SWAGGER_INTERCEPTOR_KEYS } from "./types/constants";
import type { ProtobufLibrary } from "./types/protobuf";

import "swagger-ui-dist/swagger-ui.css";
import "swagger-ui-dist/index.css";

globalThis.SwaggerProtoBufUIBundle = (
	libraryObject: ProtobufLibrary,
	options: SwaggerConfigs
) => {
	const swaggerProtoBuf = new SwaggerProtoBuf(libraryObject);
	const swaggerProtoMessage: SwaggerProtoMessage = new SwaggerProtoMessage();

	const requestInterceptor = async (httpContext: SwaggerRequest) => {
		const message = swaggerProtoMessage.reqMessage;
		const interceptorKey = SWAGGER_INTERCEPTOR_KEYS.REQUEST;

		try {
			if (!isBlank(message)) {
				swaggerProtoBuf.setMessage = message;
				httpContext = await swaggerProtoBuf.requestInterceptor(httpContext);
			}
		} catch (err) {
			console.error(err);
		}

		if (options[interceptorKey]) {
			httpContext = await options[interceptorKey](httpContext);
		}

		return httpContext;
	};

	const responseInterceptor = async (httpContext: SwaggerResponse) => {
		const message = swaggerProtoMessage.resMessage;
		const interceptorKey = SWAGGER_INTERCEPTOR_KEYS.RESPONSE;

		try {
			if (!isBlank(message)) {
				swaggerProtoBuf.setMessage = message;
				httpContext = await swaggerProtoBuf.responseInterceptor(httpContext);
			}
		} catch (err) {
			console.error(err);
		}

		if (options[interceptorKey]) {
			httpContext = await options[interceptorKey](httpContext);
		}

		return httpContext;
	};

	SwaggerUIBundle({
		...options,
		plugins: [swaggerProtoMessage.swaggerPlugin, ...(options.plugins || [])],
		requestInterceptor: requestInterceptor,
		responseInterceptor: responseInterceptor,
	});
};
