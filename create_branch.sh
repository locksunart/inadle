#!/bin/bash
cd /Users/user/Desktop/Personal/inadle-app

# 현재 변경사항이 있다면 커밋
git add .
git commit -m "WIP: Save current work before creating new branch" || echo "No changes to commit"

# main 브랜치로 이동
git checkout main

# 최신 변경사항 가져오기
git pull origin main || echo "Already up to date"

# 새 브랜치 생성 및 이동
git checkout -b feature/external-events-integration

echo "Created and switched to branch: feature/external-events-integration"
