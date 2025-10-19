# swagger-protobuf-ui-bundle
swagger-ui-bundle communicating by protobuf


## 개발
### 의존성 설치
```bash
npm install
```

### 주요 스크립트
-   `npm run start`
    -   개발용 웹팩 서버를 실행합니다.
-   `npm run build`
    -   프로덕션용으로 번들링합니다.
-   `npm run build:lite`
    -   프로덕션용(lite버전)으로 번들링합니다.
-   `npm run test`
    -   Jest를 사용하여 단위 테스트를 실행합니다.
-   `npm run lint`
    -   ESLint로 코드 스타일을 검사합니다.
-   `npm run prettier:check`
    -   Prettier로 코드 포맷팅을 검사합니다.
-   `npm run e2e`
    -   Playwright로 E2E 테스트를 실행합니다.

### 빌드 파일
- 기본 버전
    - swagger-protobuf-core.js
    - swagger-ui-bundle.js이 포함된 파일
- Lite 버전
    - swagger-protobuf-lite.js
    - swagger-ui-bundle.js를 포함하지 않은 경량화 파일

## 예시
### Swagger 웹 예시

#### 예시폴더
[./example/web](./example/web)

#### 필수 import 파일
[index.html](./example/web/index.html)

- proto.bundle.js
    - 프로토버퍼 번들 파일 (데이터 파일 + descriptor 파일)
    - [예시 번들 파일 번들링 방법](./example/protobuf/README.md)
- [swagger-initializer.js](./example/web/swagger-initializer.js)
    - SwaggerProtoBufUIBundle 초기화 파일

```
<body>
    <!-- ... -->
    <script src="./proto/proto.bundle.js"></script>
    <script src="./swagger-initializer.js" charset="UTF-8"> </script>
</body>
```

### SwaggerProtoBufUIBundle
SwaggerUIBundle를 대체하여 SwaggerUI를 생성해주는 함수

#### 예시파일
[swagger-initializer.js](./example/web/swagger-initializer.js)

#### 매개변수
1. [ProtoLibraryObject](./example/protobuf/webpack.config.js#L12)
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

#### 예시파일
[server.json](./example/web/server.json)

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

### 프로토버퍼 컴파일 예시
프로토버퍼(.proto)를 사용하여 JavaScript(bundle.js)를 만든 예제<br/>
[example/protobuf](./example/protobuf)에 예제가 있습니다.

### 서버 예시
프로토버퍼를 컴파일한 bundle.js를 사용하여 만든 api서버 예제<br/>
[example/server](./example/server)에 예제가 있습니다.

## Acknowledgements

This project uses the following open source software:

- Swagger UI (Apache License 2.0)
- Google Protocol Buffers (BSD 3-Clause License)