const fs = require('fs');
const path = require('path');

// 번들링된 proto.js 파일이 있는 디렉터리
const distDir = path.resolve(__dirname, '../dist');
// 컴파일된 .js 파일이 있는 디렉터리
const generatedDir = path.resolve(__dirname, '../generated');
// 엔트리 파일 경로
const indexFile = path.resolve(__dirname, '../index.js');

const prepareDirectory = (dir) => {
  const dirName = path.basename(dir);
  // 디렉터리가 없으면 생성
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`+ ${dirName} 디렉터리를 생성했습니다.`);
    return;
  }

  // 디렉터리가 있으면 내용만 삭제
  const entries = fs.readdirSync(dir);
  if (entries.length > 0) {
    console.log(`- ${dirName} 디렉터리의 내용을 삭제합니다...`);
    for (const entry of entries) {
      const entryPath = path.join(dir, entry);
      fs.rmSync(entryPath, { recursive: true, force: true });
    }
    console.log(`- ${dirName} 디렉터리의 내용이 모두 삭제되었습니다.`);
  } else {
    console.log(`- ${dirName} 디렉터리는 이미 비어있습니다.`);
  }
};


// --- 스크립트 시작 ---
console.log('프로젝트 정리 및 초기화를 시작합니다...');

// 1. 디렉터리 정리
prepareDirectory(distDir);
prepareDirectory(generatedDir);

// 2. index.js 파일 삭제
if (fs.existsSync(indexFile)) {
  fs.unlinkSync(indexFile);
  console.log(`- ${path.basename(indexFile)} 파일을 삭제했습니다.`);
} else {
  console.log(`- ${path.basename(indexFile)} 파일이 이미 존재하지 않습니다.`);
}

console.log('\n✅ 초기화가 완료되었습니다.');