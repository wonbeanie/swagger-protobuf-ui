export interface ProtoMessage {
	serializeBinary(): BlobPart;
	toObject(): object;
	[setter: string]: (value: unknown) => void;
}

export interface ProtoMessageConstructor {
	new (): ProtoMessage;
	deserializeBinary(bytes: BlobPart): ProtoMessage;
}

export interface ProtoList {
	[key: string]: ProtoMessageConstructor;
}

export interface DescriptorNode {
	[key: string]: {
		fields?: DescriptorFields;
		nested?: { [key: string]: DescriptorNode };
	};
}

export interface Descriptor {
	nested: { [key: string]: DescriptorNode };
}

export interface DescriptorFields {
	[key: string]: FieldData;
}

export type FieldData = {
	type: string;
	id: number;
	rule?: string;
};

export interface ProtobufLibrary {
	proto: ProtoList;
	descriptor: Descriptor;
}
