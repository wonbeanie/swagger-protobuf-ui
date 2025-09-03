import SwaggerProtoMessage from "./plugin";
import SwaggerProtoBuf from "./core";
import {isBlank} from "./utils";
import {SwaggerUIBundle} from "swagger-ui-dist";
import "swagger-ui-dist/swagger-ui.css";
import "swagger-ui-dist/index.css";

globalThis.SwaggerProtoBufUIBundle = (libraryObject, options) => {
    const swaggerProtoBuf = new SwaggerProtoBuf(libraryObject);
    const swaggerProtoMessage = new SwaggerProtoMessage();

    const INTERCEPTOR_TYPE = Object.freeze({
        REQUEST: 'req',
        RESPONSE: 'res',
    });

    const createInterceptor = (type) => {
        return async (httpContext) => {
            const messageKey = `${type}Message`;
            const message = swaggerProtoMessage[messageKey];

            const interceptorKey = type === INTERCEPTOR_TYPE.REQUEST
                ? `requestInterceptor`
                : `responseInterceptor`;

            try{
                if(!isBlank(message)){
                    swaggerProtoBuf.setMessage = message;

                    httpContext = await swaggerProtoBuf[interceptorKey](httpContext);
                }
            }
            catch(err){
                console.error(err);
            }

            if(options[interceptorKey]){
                httpContext = options[interceptorKey](httpContext);
            }

            return httpContext;
        }
    }

    SwaggerUIBundle({
        ...options,
        plugins: [
            swaggerProtoMessage.swaggerPlugin,
            ...(options.plugins || [])
        ],
        requestInterceptor : createInterceptor(INTERCEPTOR_TYPE.REQUEST),
        responseInterceptor : createInterceptor(INTERCEPTOR_TYPE.RESPONSE)
    });
}