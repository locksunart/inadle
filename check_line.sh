#!/bin/bash
cd /Users/user/Desktop/inadle-app

# 535번째 줄 주변을 확인
sed -n '530,540p' src/pages/Home.js | cat -n

# })} 패턴을 찾아보기
grep -n "})}$" src/pages/Home.js | tail -5
