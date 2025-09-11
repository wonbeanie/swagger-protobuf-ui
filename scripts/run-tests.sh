#!/bin/bash

# -e: 명령어 실행 중 오류가 나면 즉시 스크립트를 중단시킵니다.
# -x: 실행되는 명령어를 터미널에 보여줍니다.
set -ex

# --- 🚀 1. Git Clone 및 'develop' 브랜치로 변경 ---
REPO_URL="https://github.com/wonbeanie/swagger-protobuf-ui-bundle.git" # 👈 이 부분을 실제 레포지토리 주소로 변경하세요!
PROJECT_DIR="temp_test_protject"     # 클론받을 임시 폴더 이름

echo "✅ (1/8) 레포지토리를 클론하고 'develop' 브랜치로 변경합니다..."

# 만약 이전에 테스트했던 폴더가 남아있다면 삭제
if [ -d "$PROJECT_DIR" ]; then
  rm -rf $PROJECT_DIR
  echo "🧹 이전 테스트 폴더 삭제"
fi

# Git Clone 실행
git clone $REPO_URL $PROJECT_DIR

# 생성된 프로젝트 폴더로 이동
cd $PROJECT_DIR

# 'develop' 브랜치로 변경
git checkout develop
# ----------------------------------------------------

cleanup() {
  echo "🧹 스크립트를 종료하며 백그라운드 프로세스를 정리합니다..."

  # WEB_SERVER_PID 변수가 설정되어 있을 때만 실행
  if [ ! -z "$WEB_SERVER_PID" ]; then
    echo "-> 웹 서버(PID: $WEB_SERVER_PID)를 종료합니다."
    # kill 명령어 앞에 '-'를 붙이면 프로세스 그룹 전체를 종료시켜 더 확실합니다.
    kill -9 -$WEB_SERVER_PID 2>/dev/null || true
    # 변수를 초기화(unset)하여 중복 실행을 방지합니다.
    unset WEB_SERVER_PID
  fi

  # API_SERVER_PID 변수가 설정되어 있을 때만 실행
  if [ ! -z "$API_SERVER_PID" ]; then
    echo "-> API 서버(PID: $API_SERVER_PID)를 종료합니다."
    kill -9 -$API_SERVER_PID 2>/dev/null || true
    unset API_SERVER_PID
  fi
  
  # SERVE_PID 변수가 설정되어 있을 때만 실행
  if [ ! -z "$SERVE_PID" ]; then
    echo "-> 정적 파일 서버(PID: $SERVE_PID)를 종료합니다."
    kill -9 -$SERVE_PID 2>/dev/null || true
    unset SERVE_PID
  fi
}

# --- trap 설정 ---
# 스크립트가 EXIT (종료) 신호를 받으면 cleanup 함수를 실행하도록 예약합니다.
trap cleanup EXIT

echo "✅ (2/8) 전체 임시 테스트를 시작합니다..."

# --- 2. Protobuf 예시 빌드 ---
echo "✅ (3/8) Protobuf 예제를 빌드합니다..."
cd example/protobuf
npm install
npm run build
# 빌드 결과 확인 (파일/폴더가 존재하는지 검사)
ls -l ./dist
cd ../../

# --- 3. Server 예시 테스트 ---
echo "✅ (4/8) Server 예제를 테스트합니다..."
# 3-1. Protobuf 빌드 결과물을 server/proto 폴더로 복사
mkdir -p example/server/proto
cp -r example/protobuf/dist/* example/server/proto/

cd example/server
# 3-2. 서버 의존성 설치
npm install
# 3-3. API 서버를 백그라운드에서 실행
# PID 저장
set -m
npm run start &
API_SERVER_PID=$!
set +m
# 서버가 켜질 때까지 대기
sleep 10
cd ../../ # 다시 최상단으로 이동
# 3-4. API 테스트
curl -f http://localhost:3000/users/1/info | grep "id"

# --- 4. Web 예시 (개발 모드) 테스트 ---
echo "✅ (5/8) Web 예제를 개발 모드로 테스트합니다..."
# 4-1 Protobuf 빌드 결과물을 web/proto 폴더로 복사
mkdir -p example/web/proto
cp -r example/protobuf/dist/* example/web/proto

# 4-2. 최상단 의존성 설치
npm install

# 4-3. webpack dev 서버를 백그라운드에서 실행
# PID 저장
set -m
npm run start &
WEB_SERVER_PID=$!
set +m
# 서버가 완전히 켜질 때까지 잠시 대기
sleep 30
# 4-4. 웹이 잘 나오는지 확인
curl -f http://localhost:8080 | grep '<div id="swagger-ui"></div>'

# 실행했던 모든 백그라운드 서버 프로세스 종료
cleanup

# --- 6. 최상단 프로젝트 빌드 ---
echo "✅ (6/8) 메인 프로젝트를 빌드합니다..."
npm run build
# 빌드 결과 확인
ls -l ./build 

# --- 7. Web 예시 (프로덕션 빌드) 테스트 ---
echo "✅ (7/8) Web 예제를 프로덕션 빌드로 테스트합니다..."
# 7-1. 최상단 빌드 결과물을 web 폴더로 복사
cp -r build/* example/web/

# 7-2. npx serve로 정적 파일 서버 실행
# 백그라운드에서 serve 실행
set -m
npx serve -s example/web/ -l 8080 &
SERVE_PID=$!
set +m

# 서버가 켜질 때까지 대기
sleep 10
# 웹이 잘 나오는지 확인
curl -f http://localhost:8080 | grep '<div id="swagger-ui"></div>'

echo "✅ serve를 이용한 상용 빌드 파일 테스트 완료"

echo "🎉 (8/8) 모든 임시 테스트를 성공적으로 통과했습니다!"