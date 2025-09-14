import type { SwaggerRequest } from "swagger-ui-dist";
import SwaggerProtoBuf, * as core from "../core";
import type { Descriptor } from "../types/protobuf";

const mockProto = {
    User: jest.fn().mockImplementation(() => ({
        setName: jest.fn(),
        setId: jest.fn(),
        setTagsList: jest.fn(),
        setAddress: jest.fn(),
        serializeBinary: jest.fn(),
        toObject: jest.fn(),
    })),
    Address: jest.fn().mockImplementation(() => ({
        setStreet: jest.fn(),
        setCity: jest.fn(),
        serializeBinary: jest.fn(),
        toObject: jest.fn(),
    })),
    Tag: jest.fn().mockImplementation(() => ({
        setName: jest.fn(),
        serializeBinary: jest.fn(),
        toObject: jest.fn(),
    })),
};

const mockDescriptor = {
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

const mockBodyData = {
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

const mockSwaggerRequest = {
   url : "http://localhost:8080/users",
   method : "post",
   credentials : "application/protobuf",
   body: JSON.stringify(mockBodyData)
} as SwaggerRequest;

describe('core.ts 테스트', () => {
   const swaggerProtoBuf = new SwaggerProtoBuf({
      proto: mockProto as any,
      descriptor: mockDescriptor,
   });

   describe('Request 테스트', () => {
      describe("setProtoBufData 테스트", ()=>{
         test("body를 정상적으로 보낼을때를 검증한다.", async () => {
            const message = "User";
         
            const protoInstance = await swaggerProtoBuf.setProtoBufData(mockBodyData, message);

            expect(mockProto.User).toHaveBeenCalledTimes(1);
            expect(protoInstance.setName).toHaveBeenCalledWith('user');
            expect(protoInstance.setId).toHaveBeenCalledWith(1);

            expect(mockProto.Tag).toHaveBeenCalledTimes(2);
            expect(protoInstance.setTagsList).toHaveBeenCalledTimes(1);

            expect(mockProto.Address).toHaveBeenCalledTimes(1);
            expect(protoInstance.setAddress).toHaveBeenCalledTimes(1);
         })
      });

      test("getObjectToBlob 테스트",async ()=>{
         swaggerProtoBuf.setMessage = "User";

         const blob = await swaggerProtoBuf.getObjectToBlob(JSON.stringify(mockBodyData));

         expect(blob).toBeInstanceOf(Blob);
      });

      test("requestInterceptor 테스트", async () => {
         swaggerProtoBuf.setMessage = "User";
         const request = await swaggerProtoBuf.requestInterceptor(mockSwaggerRequest);

         expect(request).toBeInstanceOf(Object);
         expect(request.body).toBeInstanceOf(Blob);
      });
   });

   describe('responseInterceptor 테스트', () => {
      test("",()=>{
         
      })
   });
});