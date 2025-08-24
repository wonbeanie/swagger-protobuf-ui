const fs = require('fs');
const path = require('path');

// 컴파일된 .js 파일이 있는 디렉터리
const generatedDir = path.resolve(__dirname, '../generated');
// 생성할 엔트리 파일 경로
const entryFilePath = path.resolve(__dirname, '../index.js');

// generated 디렉터리가 없으면 중단
if (fs.readdirSync(generatedDir).length === 0) {
  console.log('`generated` 디렉터리가 비어있습니다. proto 파일을 먼저 컴파일해주세요.');
  process.exit(0);
}

// 디렉터리 내의 모든 파일을 읽음
const files = fs.readdirSync(generatedDir);

// .js 파일만 필터링 (grpc_pb.js와 _pb.js 파일 모두 포함)
const jsFiles = files.filter(file => file.endsWith('.js'));

// index.js에 쓸 내용을 생성
const exportStatements = jsFiles
  .map(file => {
    const moduleName = path.basename(file, '.js');
    // `require` 경로를 상대 경로로 만듦
    return `...require('./generated/${file}')`;
  })
  .join(',\n  ');

const fileContent = `// 이 파일은 스크립트에 의해 자동으로 생성되었습니다.
module.exports = {
  ${exportStatements}
};
`;

// 파일 쓰기
fs.writeFileSync(entryFilePath, fileContent, 'utf8');

console.log(`✅ 엔트리 파일(${path.basename(entryFilePath)})이 성공적으로 생성되었습니다.`);