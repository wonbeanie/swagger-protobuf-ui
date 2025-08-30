export default class SwaggerProtoBuf {
    #protobuf = null;
    #descriptor = null;
    #message = null;

    constructor({proto, descriptor}){
        this.#protobuf = proto;
        this.#descriptor = descriptor.nested;
    }

    getDescriptorFields(messageName, namespace) {
        if(namespace[messageName] && namespace[messageName].fields){
            return namespace[messageName].fields;
        }

        for (const key in namespace){
            if (namespace[key] && namespace[key].nested){
                const found = this.getDescriptorFields(messageName, namespace[key].nested);
                if(found){
                    return found;
                }
            }
        }

        return null;
    }

    async setProtoBufData(jsObject, message){
        try{
            const protoInstance = new this.#protobuf[message];
            const messageType = this.getDescriptorFields(message, this.#descriptor);
            const messageKeys = Object.keys(this.#protobuf);

            if(jsObject instanceof Array){
                let protoInstanceList = [];
                for (const key in jsObject){
                    let protoData = await this.setProtoBufData(jsObject[key], message);
                    protoInstanceList.push(protoData);
                }

                return protoInstanceList;
            }

            for (const key in jsObject) {
                let setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;

                if(jsObject[key] instanceof Array){
                    setterName += 'List';
                }
                
                if (protoInstance[setterName]) {
                    if(messageKeys.includes(messageType[key].type)){
                        let instance = await this.setProtoBufData(jsObject[key], messageType[key].type);
                        protoInstance[setterName](instance);
                        continue;
                    }
                    protoInstance[setterName](jsObject[key]);
                }
            }

            return protoInstance;
        }
        catch(err){
            console.error(err);
        }
    }

    async getBlobToObject(blobData) {
        try {
            const arrayBuffer = await blobData.arrayBuffer();

            const uint8Array = new Uint8Array(arrayBuffer);
            
            const userObject = this.#protobuf[this.#message].deserializeBinary(uint8Array);

            return userObject.toObject();
        } catch (err) {
            console.error("Error : Protobuf deserializeBinary failed", err);
        }
    }

    async getObjectToBlob(data) {
        try {
            data = JSON.parse(data);

            let protoMessage = await this.setProtoBufData(data, this.#message);

            const encodedBuffer = protoMessage.serializeBinary();

            const result = new Blob([encodedBuffer], { type: 'application/octet-stream' });

            return result;
        } catch (err) {
            console.error("Error : Protobuf serializeBinary failed", err);
        }
    }

    checkMessage(){
        if(!this.#message){
            throw new Error("Error : No appropriate message in ProtoBuffer");
        }
    }

    async requestInterceptor(request){
        this.checkMessage();

        if(request.body){
            request.body = await this.getObjectToBlob(request.body);
        }

        return request;
    }

    async responseInterceptor(response){
        this.checkMessage();

        if(response.data instanceof Blob) {
            let data = await this.getBlobToObject(response.data);
            response.data = data;
            response.text = JSON.stringify(data, null, 2);
        }

        return response;
    }

    set setMessage(messageName){
        this.#message = messageName;
    }
}