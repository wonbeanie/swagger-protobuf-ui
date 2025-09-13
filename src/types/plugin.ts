export type OriginalAction = (request : Request) => unknown;

export type OpenAPISpec = {
    paths : {
        [pathName : string] : {
            [method : string] : {
                req_message ?: string,
                res_message ?: string
            }
        }
    }
}

export type System = {
    specSelectors : {
        specJson : () => {
            toJS : () => OpenAPISpec
        }
    }
}

export type Request = {
    pathName : string,
    method : string
}