# swagger-protobuf-ui-bundle
swagger-ui-bundle communicating by protobuf

## 필수파일
google-protobuf.js - 프로토버퍼를 사용하기위한 라이브러리<br/>
swagger-ui-bundle.js - 스웨거를 사용하기위한 라이브러리

[google-protobuf] https://github.com/protocolbuffers/protobuf-javascript<br/>
[swagger-ui] https://github.com/swagger-api/swagger-ui/tree/master/dist

## 사용법

### Script Import
- proto.bundle.js
    - 프로토버퍼 번들 파일
- swagger-protobuf-ui-core.js
    - swagger-protobuf-ui-core 코어 파일
- swagger-initializer.js
    - SwaggerProtoBufUIBundle 초기화 파일

```
<body>
    <!-- ... -->
    <script src="./proto.bundle.js"></script>
    <script src="./swagger-protobuf-ui-core.js"> </script>
    <script src="./swagger-initializer.js" charset="UTF-8"> </script>
</body>
```

### SwaggerProtoBufUIBundle
SwaggerUIBundle를 대체하여 SwaggerUI를 생성해주는 함수
#### 매개변수
1. ProtoLibraryObject
    - 프로토버퍼로 생성된 js번들에서 사용되는 전역변수
2. Options
    - SwaggerUiBundle의 Options와 동일함
```
window.onload = function() {
	window.ui = SwaggerProtoBufUIBundle(ProtoLibraryObject,{
        url : "http://localhost/swagger-config.json",
        dom_id: '#swagger-ui',
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
    });
};
```

### Swagger/OpenApi 정의 사양 설정 방법
요청과 응답에 필요한 Proto.Message는 아래의 키로 설정해야함.
1. req_message
    - 요청에 사용되는 Message 키
    - Method안에 정의
2. res_message
    - 응답에 사용되는 Message 키
    - Method안에 정의
```
...
"/users": {
    "post": {
        "summary": "새로운 사용자 생성",
        "description": "JSON 형식으로 사용자 정보를 받아 새 사용자를 생성하고, 생성된 사용자 정보를 Protobuf 형식으로 반환합니다.",
        "tags": ["Users"],
        "req_message" : "User",
        "res_message" : "User",
        ...
    }
}
...
```

## Acknowledgements

This project uses the following open source software:

- Swagger UI (Apache License 2.0)
- Google Protocol Buffers (BSD 3-Clause License)