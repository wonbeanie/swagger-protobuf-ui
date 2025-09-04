export interface ProtoMessage {
    serializeBinary(): BlobPart;
    toObject(): object;
    [key: string]: any;
}

export interface ProtoMessageConstructor {
    new(): ProtoMessage;
    deserializeBinary(bytes: BlobPart): ProtoMessage;
}

export interface ProtoList {
    [key: string]: ProtoMessageConstructor;
}

export interface Descriptor {
    nested: DescriptorNested;
}

export interface DescriptorNested {
    [pacakge: string]: DescriptorPackage;
}

export interface DescriptorPackage {
    nested : DescriptorPackageNested;
};

export interface DescriptorPackageNested {
    [message: string]: DescriptorMessage;
}

export interface DescriptorMessage {
    fields : DescriptorFields;
};

export interface DescriptorFields {
    [key : string] : FieldData
}

export type FieldData = {
    type : string;
    id : number;
    rule : string;
}

export interface ProtobufLibrary {
    proto: ProtoList;
    descriptor: Descriptor;
}