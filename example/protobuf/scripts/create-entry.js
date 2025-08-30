const fs = require('fs');
const path = require('path');

const generatedDir = path.resolve(__dirname, '../generated');

if (fs.readdirSync(generatedDir).length === 0) {
  console.log('`generated` 디렉터리가 비어있습니다. proto 파일을 먼저 컴파일해주세요.');
  process.exit(0);
}

const entryFilePath = path.resolve(__dirname, '../index.js');

const newIndexContent = `// 이 파일은 스크립트에 의해 자동으로 생성되었습니다.
const protoContext = require.context('./generated', false, /\.js$/);
const proto = protoContext.keys().reduce((acc, key) => {
  const module = protoContext(key);
  return { ...acc, ...module };
}, {});

const descriptorContext = require.context('./generated', false, /\.json$/);
const descriptor = descriptorContext.keys().reduce((acc, key) => {
  const name = key.replace(new RegExp('^\\.\\/(.*)\\.json$'), '$1');
  acc = JSON.parse(descriptorContext(key));
  return acc;
}, {});

module.exports = {
  proto,
  descriptor
};
`;

fs.writeFileSync(entryFilePath, newIndexContent.trim(), 'utf8');

console.log(`✅ 엔트리 파일(${path.basename(entryFilePath)})이 성공적으로 생성되었습니다.`);
