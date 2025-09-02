# protobuf-compile-example
Example of compiling protobuf into js

## 사용법
### 사용 순서
1. /proto 폴더에 .proto파일(들)을 넣는다.
2. npm i
3. npm run build
4. dist에 번들링된 파일이 생성된다.

### 결과물
아래와 같이 [webpack.config.js](./webpack.config.js)에 설정한 [library](./webpack.config.js#L12)의 변수명으로 반환하게 됩니다.
반환되는 결과물을 변경하고 싶다면 [create-entry.js](./scripts/create-entry.js)에서 수정하시면 됩니다.
기본 변수명 : MyProto
```
{
    proto,
    descriptor
}
```

## 설정 변경
[webpack.config.js](./webpack.config.js)에서 수정하면됩니다.