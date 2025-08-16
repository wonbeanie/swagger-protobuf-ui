let SwaggerProtoBufUIBundle = (libraryObject, options) => {
    let reqMessage = "";
    let resMessage = "";

    const SwaggerPorotoBufPlugin = function(system) {
        return {
            statePlugins: {
                spec: {
                    wrapActions: {
                        executeRequest : (originalAction, system) => {
                            const isNullOrWhitespace = (str) => {
                                if (str === null) {
                                    return true;
                                }
                                
                                return typeof str !== 'string' || str.trim().length === 0;
                            }

                            return (request) => {
                                try{
                                    const spec = system.specSelectors.specJson().toJS();

                                    const pathName = request.pathName;
                                    const method = request.method;

                                    const pathItem = spec.paths[pathName];
                                    const operation = pathItem[method];
                                    if (operation.req_message) {
                                        reqMessage = operation.req_message;
                                    }
                                    if (operation.res_message) {
                                        resMessage = operation.res_message;
                                    }

                                    if(isNullOrWhitespace(resMessage)){
                                        throw Error("Error : The protobuf message is empty, undefined, null.");
                                    }

                                }
                                catch(err){
                                    console.error("Error : Protobuf message parsing failed in specification");
                                }

                                return originalAction(request);
                            }
                        }
                    }
                }
            }
        }
    }

    class SwaggerProtoBuf {
        #message = null;

        constructor(messageName){
            this.#message = libraryObject[messageName];
        }

        async setProtoBufData(jsObject){
            const protoInstance = new this.#message();

            for (const key in jsObject) {
                const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
                if (protoInstance[setterName]) {
                    protoInstance[setterName](jsObject[key]);
                }
            }

            return protoInstance;
        }

        async getBlobToObject(blobData) {
            try {
                const arrayBuffer = await blobData.arrayBuffer();

                const uint8Array = new Uint8Array(arrayBuffer);
                
                const userObject = this.#message.deserializeBinary(uint8Array);

                return userObject.toObject();
            } catch (err) {
                console.error("Error : Protobuf deserializeBinary failed");
            }
        }

        async getObjectToBlob(data) {
            try {
                data = JSON.parse(data);

                let protoMessage = await this.setProtoBufData(data);

                const encodedBuffer = protoMessage.serializeBinary();

                const result = new Blob([encodedBuffer], { type: 'application/octet-stream' });

                return result;
            } catch (err) {
                console.error("Error : Protobuf serializeBinary failed");
            }
        }

        checkMessage(){
            if(!this.#message){
                throw new Error("Error : No appropriate message in ProtoBuffer");
            }
        }

        checkSwaggerConfigFile(url){
            if(url === "http://127.0.0.1:5500/server.json"){
                return true;
            }
        }

        async requestInterceptor(request){
            if(this.checkSwaggerConfigFile(request.url)){
                return request;
            }

            this.checkMessage();

            if(request.body){
                request.body = await this.getObjectToBlob(request.body);
            }

            return request;
        }

        async responseInterceptor(response){
            if(this.checkSwaggerConfigFile(response.url)){
                return response;
            }

            this.checkMessage();

            if(response.data instanceof Blob) {
                let data = await this.getBlobToObject(response.data);
                response.data = data;
                response.text = JSON.stringify(data);
            }

            return response;
        }
    }

    SwaggerUIBundle({
        ...options,
        plugins: [
            SwaggerPorotoBufPlugin,
            options.plugins ? options.plugins : {}
        ],
        requestInterceptor : async (request) => {
            try{
                let swaggerProtoBuf = new SwaggerProtoBuf(reqMessage);

                request = await swaggerProtoBuf.requestInterceptor(request);
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
                let swaggerProtoBuf = new SwaggerProtoBuf(resMessage);

                response = await swaggerProtoBuf.responseInterceptor(response);
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