# protobuf-compile-example
Example of compiling protobuf into js

## 사용법

### 사용전 필수 작업
꼭 generated 폴더를 생성해야됩니다.

### 이유
아래와 같이 protoc를 실행하기 때문에 --js_out이 ./generated으로 지정되어 있습니다.
```
    npx protoc --js_out=import_style=commonjs,binary:./generated -I ./proto proto/*.proto
```

### 사용 순서
1. /proto 폴더에 .proto파일(들)을 넣는다.
2. npm i
3. npm run build
4. dist에 번들링된 파일이 생성된다.

## 설정 변경
[webpack.config.js](./webpack.config.js)에서 수정하면됩니다.