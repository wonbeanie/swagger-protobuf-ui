export interface ProtoMessage {
    serializeBinary(): Uint8Array;
    toObject(): object;
    [key: string]: any;
}

export interface ProtoMessageConstructor {
    new(): ProtoMessage;
    deserializeBinary(bytes: Uint8Array): ProtoMessage;
}

export interface ProtoList {
    [key: string]: ProtoMessageConstructor;
}

export interface Descriptor {
    nested?: {
        [key: string]: any;
    };
}

export interface ProtobufLibrary {
    proto: ProtoList;
    descriptor: Descriptor;
}