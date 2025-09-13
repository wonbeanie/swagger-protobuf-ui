import type { OriginalAction, Request, System } from "./types/plugin";

export default class SwaggerProtoMessage {
    reqMessage = "";
    resMessage = "";

    getProtoMessageKey = (originalAction : OriginalAction, system : System) => {
        return (request : Request) => {
            this.reqMessage = "";
            this.resMessage = "";
            const spec = system.specSelectors.specJson().toJS();

            const pathName = request.pathName;
            const method = request.method;

            const pathItem = spec.paths[pathName] || {};
            const operation = pathItem[method] || {};
            if (operation.req_message) {
                this.reqMessage = operation.req_message;
            }
            if (operation.res_message) {
                this.resMessage = operation.res_message;
            }

            return originalAction(request);
        }
    }

    get swaggerPlugin() {
        return {
            statePlugins: {
                spec: {
                    wrapActions: {
                        executeRequest : this.getProtoMessageKey
                    }
                }
            }
        }
    }
}