export default class SwaggerProtoMessage {
    reqMessage = "";
    resMessage = "";

    getPorotoMessageKey = (originalAction, system) => {
        return (request) => {
            this.reqMessage = "";
            this.resMessage = "";
            const spec = system.specSelectors.specJson().toJS();

            const pathName = request.pathName;
            const method = request.method;

            const pathItem = spec.paths[pathName];
            const operation = pathItem[method];
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
                        executeRequest : this.getPorotoMessageKey
                    }
                }
            }
        }
    }

    set reqMessage(message){
        this.reqMessage = message;
    }

    get reqMessage(){
        return this.reqMessage;
    }

    set resMessage(message){
        this.resMessage = message;
    }

    get resMessage(){
        return this.resMessage;
    }
}