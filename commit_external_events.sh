#!/bin/bash
cd /Users/user/Desktop/Personal/inadle-app

# Git 상태 확인
echo "=== Git Status ==="
git status

# 변경사항 추가
echo -e "\n=== Adding changes ==="
git add .

# 커밋
echo -e "\n=== Committing ==="
git commit -m "feat: 외부 프로그램 통합 및 AI 기반 개인화 추천 시스템 구현

- 도서관/문화센터 프로그램 자동 크롤링 시스템 추가
- 사용자 자녀 연령 기반 맞춤 프로그램 추천
- Events 페이지 UI/UX 개선 (맞춤 추천 탭, 다중 필터)
- 데이터베이스 스키마 확장 (외부 데이터 통합, 추천 점수)
- Edge Functions 추가 (크롤링, 스케줄러)

관련 테이블:
- external_data_sources: 외부 데이터 소스 관리
- program_recommendation_scores: ML 추천 점수
- crawl_logs: 크롤링 로그
- search_queries: 검색 쿼리 분석"

# 현재 브랜치 확인
echo -e "\n=== Current Branch ==="
git branch --show-current

echo -e "\n=== 작업 완료 ==="
echo "브랜치를 푸시하려면 다음 명령어를 실행하세요:"
echo "git push -u origin feature/external-events-integration"
