import SwaggerProtoMessage from "./plugin";
import SwaggerProtoBuf from "./core";
import {isBlank} from "./utils";

globalThis.SwaggerProtoBufUIBundle = (libraryObject, options) => {
    const swaggerProtoBuf = new SwaggerProtoBuf(libraryObject);
    const swaggerProtoMessage = new SwaggerProtoMessage();

    SwaggerUIBundle({
        ...options,
        plugins: [
            swaggerProtoMessage.swaggerPlugin,
            options.plugins ? options.plugins : {}
        ],
        requestInterceptor : async (request) => {
            try{
                const reqMessage = swaggerProtoMessage.reqMessage;
                if(!isBlank(reqMessage)){
                    swaggerProtoBuf.setMessage = reqMessage;

                    request = await swaggerProtoBuf.requestInterceptor(request);
                }
            }
            catch(err){
                console.error(err);
            }

            if(options.requestInterceptor){
                request = options.requestInterceptor(request);
            }

            return request;
        },
        responseInterceptor : async (response) => {
            try{
                const resMessage = swaggerProtoMessage.resMessage;
                if(!isBlank(resMessage)){
                    swaggerProtoBuf.setMessage = resMessage;

                    response = await swaggerProtoBuf.responseInterceptor(response);                    
                }
            }
            catch(err){
                console.error(err);
            }
            
            if(options.responseInterceptor){
                response = options.responseInterceptor(response);
            }

            return response;
        }
    });
}