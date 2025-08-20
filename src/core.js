export default class SwaggerProtoBuf {
    #protobuf = null;
    #message = null;

    constructor(libraryObject){
        this.#protobuf = libraryObject;
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

    set setMessage(messageName){
        this.#message = this.#protobuf[messageName];
    }
}