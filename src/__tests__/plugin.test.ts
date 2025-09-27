import SwaggerProtoMessage from "../plugin";
import type { OpenAPISpec, OriginalAction, Request, System } from "../types/plugin";

describe('plugin.ts 테스트', () => {
    
    describe('getProtoMessageKey 테스트', () => {
        it('spec에서 resMessage만 존재할때의 테스트', () => {
            executeRequest({pathName: "/users/{id}", method: "get"});

            expect(getMessages()).toEqual({
                "reqMessage" : "",
                "resMessage" : "User"
            });
        });

        it('spec에서 message가 둘다 존재하지 않을때 테스트',() => {
            executeRequest({pathName: "/users/1/info", method: "get"});

            expect(getMessages()).toEqual({
                reqMessage : "",
                resMessage : ""
            });
        })

        it('spec에서 두개다 존재할때 테스트', () => {
            executeRequest({pathName: "/users", method: "post"});

            expect(getMessages()).toEqual({
                resMessage : "User",
                reqMessage : "User"
            });
        });
    });

    const mockOriginalAction : OriginalAction = jest.fn((request: Request) : unknown => {
        return request;
    });

    const mockToJS = jest.fn(() : OpenAPISpec => {
        return {
            paths : {
                "/users/{id}": {
                    "get": {
                        "res_message" : "User",
                    }
                },
                "/users/{id}/info": {
                    "get": {

                    }
                },
                "/users": {
                    "post": {
                        "req_message" : "User",
                        "res_message" : "User",
                    }
                }
            }
        }
    });

    const mockSystem : System = {
        specSelectors: {
            specJson: () => {
                return {
                    toJS: mockToJS
                };
            }
        }
    };

    const plugin = new SwaggerProtoMessage();

    const executeRequest = plugin.getProtoMessageKey(mockOriginalAction, mockSystem);

    function getMessages(){
        return {
            "reqMessage" : plugin.reqMessage,
            "resMessage" : plugin.resMessage
        }
    }
});