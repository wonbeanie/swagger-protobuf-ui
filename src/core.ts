import type { SwaggerRequest, SwaggerResponse } from "swagger-ui-dist";
import type { DescriptorFields, DescriptorNode, ProtobufLibrary, ProtoList, ProtoMessage } from "./types/protobuf";
import { DeserializationError, NotFoundError, SerializationError } from "./custom-error";

export default class SwaggerProtoBuf {
    #protobuf : ProtoList;
    #descriptor : DescriptorNode;
    #message = "";

    constructor({proto, descriptor} : ProtobufLibrary){
        this.#protobuf = proto;
        this.#descriptor = descriptor.nested;
    }

    getDescriptorFields(messageName : string, namespace : DescriptorNode) : DescriptorFields | null {
        if(namespace[messageName] && namespace[messageName].fields){
            return namespace[messageName].fields;
        }

        for (const node of Object.values(namespace)){
            if (node && node.nested){
                const found = this.getDescriptorFields(messageName, node.nested);
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
            throw new NotFoundError(`Could not find message type "${messageKey}" in ProtoBuffer`);
        }

        const protoInstance = new message;

        const messageType = this.getDescriptorFields(messageKey, this.#descriptor);

        if(!messageType){
            throw new NotFoundError(`Could not find descriptor for message type "${messageKey}"`);
        }

        const messageKeys = Object.keys(this.#protobuf);

        for (const key in jsObject) {
            if(!messageType[key]){
                throw new NotFoundError(`Could not find descriptor for field "${key}" in message "${messageKey}"`);
            }

            let setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;

            const type = messageType[key].type;

            if(jsObject[key] instanceof Array){
                if(!messageKeys.includes(type)){
                    throw new NotFoundError(`Could not find message type "${type}" in ProtoBuffer`);
                }

                setterName += "List";
                const protoInstanceList = await Promise.all(
                    jsObject[key].map((arr)=>{
                        return this.setProtoBufData(arr, type);
                    })
                );
                protoInstance[setterName](protoInstanceList);
                continue;
            }

            if(jsObject[key] instanceof Object){
                let instance = await this.setProtoBufData(jsObject[key], type);
                protoInstance[setterName](instance);
                continue;
            }

            protoInstance[setterName](jsObject[key]);
        }

        return protoInstance;
    }

    async getBlobToObject(blobData : Blob) {
        try {
            const arrayBuffer = await blobData.arrayBuffer();

            const uint8Array = new Uint8Array(arrayBuffer);

            const message = this.#protobuf[this.#message];
            
            if(!message){
                throw new NotFoundError("No appropriate message in ProtoBuffer");
            }

            const userObject = message.deserializeBinary(uint8Array);

            return userObject.toObject();
        } catch (err) {
            throw new DeserializationError("Protobuf deserializeBinary failed", { cause: err });
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
            throw new SerializationError("Protobuf serializeBinary failed", { cause: err });
        }
    }

    checkMessage(){
        if(!this.#message){
            throw new NotFoundError("No appropriate message in ProtoBuffer");
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