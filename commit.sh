#!/bin/bash
cd /Users/user/Desktop/inadle-app
git add .
git commit -m "Fix: 방문 기록 저장 오류 수정 및 UI 버그 수정
- user_visits 테이블 ID 자동 생성
- 날짜 형식 수정
- 디버깅 로그 추가
- 정렬 버튼 옆 잘못된 중괄호 제거"
git push origin main
