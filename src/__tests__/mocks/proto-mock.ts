import type { SwaggerRequest, SwaggerResponse } from "swagger-ui-dist";
import type { Descriptor } from "../../types/protobuf";

export const mockBodyData = {
   name: "user",
   id: 1,
   tags : [
      {name : "tag1"},
      {name : "tag2"}
   ],
   address : {
      street : "street",
      city : "city"
   }
};

export const mockSerializedPayload = JSON.stringify(mockBodyData);

export const mockBlob = new Blob([mockSerializedPayload], { type: 'application/octet-stream' });

export const mockUserInstance = {
   setName: jest.fn(),
   setId: jest.fn(),
   setTagsList: jest.fn(),
   setAddress: jest.fn(),
   serializeBinary: jest.fn().mockReturnValue(mockSerializedPayload),
   toObject: jest.fn().mockReturnValue(mockBodyData)
};

export const UserMock = Object.assign(
   jest.fn().mockImplementation(() => mockUserInstance),
   {
      deserializeBinary: jest.fn().mockReturnValue(mockUserInstance)
   }
);

export const mockAddressInstance = {
   setStreet: jest.fn(),
   setCity: jest.fn(),
   serializeBinary: jest.fn(),
   toObject: jest.fn().mockReturnValue(mockBodyData.address),
};
export const AddressMock = Object.assign(
   jest.fn().mockImplementation(() => mockAddressInstance),
   {
      deserializeBinary: jest.fn().mockReturnValue(mockAddressInstance)
   }
)

export const mockTagInstance = {
   setName: jest.fn(),
   serializeBinary: jest.fn(),
   toObject: jest.fn().mockReturnValue(mockBodyData.tags),
};
export const TagMock = Object.assign(
   jest.fn().mockImplementation(() => mockTagInstance),
   {
      deserializeBinary: jest.fn().mockReturnValue(mockTagInstance)
   }
);

export const mockProto = {
   User: UserMock,
   Address: AddressMock,
   Tag: TagMock,
};

export const mockDescriptor = {
   nested: {
      User: {
         fields: {
               name: { type: 'string' },
               id: { type: 'int32' },
               tags: { "rule": "repeated", "type": "Tag" },
               address: { type: 'Address' },
         },
      },
      Address: {
         fields: {
            street: { type: 'string' },
            city: { type: 'string' },
         },
      },
      Tag: {
         fields: {
            name: { type: 'string' },
         },
      },
   },
} as Descriptor;

export const mockSwaggerRequest = {
   url : "http://localhost:8080/users",
   method : "post",
   credentials : "application/protobuf",
   body: JSON.stringify(mockBodyData)
} as SwaggerRequest;

export const mockSwaggerResponse = {
   url : "http://localhost:8080/users",
   method : "post",
   credentials : "application/protobuf",
   data: mockBlob,
   text : JSON.stringify(mockBlob)
} as SwaggerResponse;


export const mockOptions = {
   dom_id: '#swagger-ui',
   url: 'https://localhost/segger.json',
   requestInterceptor: jest.fn(req => req),
   responseInterceptor: jest.fn(res => res),
   plugins: [{ someOtherPlugin: 'foo' }],
};