import SwaggerProtoMessage from "./plugin";
import SwaggerProtoBuf from "./core";
import { isBlank } from "./utils";
import { SWAGGER_INTERCEPTOR_KEYS } from "./types/constants";
import type { ProtobufLibrary } from "./types/protobuf";
import type { SwaggerConfigs, SwaggerRequest, SwaggerResponse } from "swagger-ui-dist";

globalThis.SwaggerProtoBufUIBundle = (
	libraryObject: ProtobufLibrary,
	options: SwaggerConfigs
) => {
	if(!globalThis.SwaggerUIBundle){
		let swaggerUIElement = document.getElementById("swagger-ui") || document.createElement("div");

		let errorElement = document.createElement("div");

		errorElement.setAttribute("id", "bundle-error");

		errorElement.setAttribute("style", "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:40px;width:100%;text-align:center;");
		
		errorElement.innerText = "SwaggerUiBundle not found\nPlease import swagger-ui-bundle.js";

		swaggerUIElement.appendChild(errorElement);
		return;
	}

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

	globalThis.SwaggerUIBundle({
		...options,
		plugins: [swaggerProtoMessage.swaggerPlugin, ...(options.plugins || [])],
		requestInterceptor: requestInterceptor,
		responseInterceptor: responseInterceptor,
	});
};
