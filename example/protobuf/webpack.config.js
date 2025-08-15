const path = require('path');

module.exports = {
	mode: 'production',
	entry: './index.js', // 번들링 시작점
	output: {
		path: path.resolve(__dirname, 'dist'), // 결과물 폴더
		filename: 'proto.bundle.js', // 결과물 파일 이름

		// --- 이 부분이 핵심 ---
		// 생성된 번들을 'MyProto' 라는 이름의 전역 변수로 노출시킵니다.
		library: 'MyProto',
		// 다양한 모듈 시스템(UMD, CommonJS, 브라우저 전역 변수)에서 호환되도록 합니다.
		libraryTarget: 'umd',
		globalObject: 'this',
	},
};