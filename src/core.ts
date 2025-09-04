import type { SwaggerRequest, SwaggerResponse } from "swagger-ui-dist";
import type { DescriptorFields, DescriptorNested, FieldData, ProtobufLibrary, ProtoList, ProtoMessage } from "./types/protobuf";

export default class SwaggerProtoBuf {
    #protobuf : ProtoList;
    #descriptor : DescriptorNested;
    #message = "";

    constructor({proto, descriptor} : ProtobufLibrary){
        this.#protobuf = proto;
        this.#descriptor = descriptor.nested;

        console.log(this.#descriptor);
    }

    // 리펙터링 필요
    // typescript로써는 맞지 않는 구조임
    getDescriptorFields(messageName : string, namespace : any) : any {
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

    async setProtoBufData(jsObject : JsonObject, messageKey : string) : Promise<ProtoMessage>{
        const message = this.#protobuf[messageKey];

        if(!message){
            throw new Error("Error : No appropriate message in ProtoBuffer");
        }

        const protoInstance = new message;

        try{
            const messageType = this.getDescriptorFields(messageKey, this.#descriptor);
            const messageKeys = Object.keys(this.#protobuf);

            for (const key in jsObject) {
                let setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;

                if(jsObject[key] instanceof Array){
                    setterName += 'List';
                }
                
                if (protoInstance[setterName]) {
                    if(messageKeys.includes(messageType[key].type)){
                        if(jsObject[key] instanceof Array){
                            let protoInstanceList = [];
                            for (const arr of jsObject[key]){
                                let protoData = await this.setProtoBufData(arr, messageType[key].type);
                                protoInstanceList.push(protoData);
                            }

                            protoInstance[setterName](protoInstanceList);
                            continue;
                        }

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
            throw err;
        }
    }

    async getBlobToObject(blobData : Blob) {
        try {
            const arrayBuffer = await blobData.arrayBuffer();

            const uint8Array = new Uint8Array(arrayBuffer);

            const message = this.#protobuf[this.#message];
            
            if(!message){
                throw new Error("Error : No appropriate message in ProtoBuffer");
            }

            const userObject = message.deserializeBinary(uint8Array);

            return userObject.toObject();
        } catch (err) {
            throw new Error("Protobuf deserializeBinary failed", { cause: err });
        }
    }

    async getObjectToBlob(data : string) {
        try {
            const requestData = JSON.parse(data);

            let protoMessage = await this.setProtoBufData(requestData, this.#message);

            const encodedBuffer = protoMessage.serializeBinary();

            const result = new Blob([encodedBuffer], { type: 'application/octet-stream' });

            return result;
        } catch (err) {
            throw new Error("Protobuf serializeBinary failed", { cause: err });
        }
    }

    checkMessage(){
        if(!this.#message){
            throw new Error("Error : No appropriate message in ProtoBuffer");
        }
    }

    async requestInterceptor(request : SwaggerRequest){
        this.checkMessage();

        if(request.body){
            request.body = await this.getObjectToBlob(request.body);
        }

        return request;
    }

    async responseInterceptor(response : SwaggerResponse){
        this.checkMessage();

        if(response.data instanceof Blob) {
            let data = await this.getBlobToObject(response.data);
            response.data = data;
            response.text = JSON.stringify(data, null, 2);
        }

        return response;
    }

    set setMessage(messageName : string){
        this.#message = messageName;
    }
}

type JsonObject = {
    [key : string] : any;
};