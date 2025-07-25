# 아이나들 (INADLE) 🌸

> 우리 아이와 함께하는 대전 나들이, 엄마들이 직접 알려드려요!

## 🎈 앱 소개

아이나들은 대전 지역 부모님들을 위한 육아 나들이 추천 서비스예요. 실제 엄마들의 경험을 바탕으로 우리 아이 연령과 상황에 딱 맞는 장소를 추천해드립니다.

### 주요 특징
- 👶 연령별 맞춤 추천 (0개월부터 초등학생까지)
- 💝 실제 엄마들의 생생한 팁과 후기
- 🏠 편의시설 정보 (수유실, 유아화장실, 주차장 등)
- 📅 실시간 행사 및 프로그램 정보
- 🌟 엄마들이 검증한 신뢰할 수 있는 정보
- 👨‍👩‍👧‍👦 다중 아이 지원 (형제자매 각각의 연령에 맞는 추천)

## 🚀 시작하기

### 1. 환경 설정
```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 Supabase URL과 Anon Key만 입력
```

### 2. Supabase 설정

#### 데이터베이스 설정
1. Supabase 프로젝트에서 SQL Editor로 이동
2. `database/schema.sql` 파일의 내용 실행
3. `database/seed.sql` 파일로 초기 데이터 입력
4. `database/real_data.sql` 파일로 실제 장소 데이터 입력

#### Edge Functions 설정 (민감한 API 키 보호)
1. Supabase 대시보드에서 Edge Functions 탭 이동
2. 환경변수 설정:
   - `NAVER_CLIENT_ID`: 네이버 검색 API ID
   - `NAVER_CLIENT_SECRET`: 네이버 검색 API Secret
   - `GEMINI_API_KEY`: Google Gemini API 키

### 3. 개발 서버 실행
```bash
npm start
```

## 📱 주요 기능

### 연령별 구분
- 👶 0~12개월: 영아를 위한 조용하고 안전한 공간
- 🚼 13~24개월: 걸음마 시기 아이들을 위한 장소  
- 👦 24~48개월: 활동적인 유아를 위한 체험 공간
- 👧 48개월 이상: 다양한 학습과 놀이가 가능한 곳
- 🎒 초등 저학년: 호기심 많은 아이들을 위한 교육 시설
- 📚 초등 고학년: 더 깊이 있는 체험과 학습 공간

### 필터 기능
- 실내/실외 구분
- 주차 가능 여부
- 수유실/유아화장실 유무
- 유모차 접근성
- 카페/식당 여부
- 무료/유료 구분

### 엄마들의 꿀팁
- "오전 10시쯤 가면 한적해요"
- "2층 수유실이 더 깨끗하고 조용해요"
- "주차는 뒷문 쪽이 더 여유로워요"

### 나의 장소 관리
- 💖 찜한 장소: 가고 싶은 곳 저장
- 📝 방문 기록: 다녀온 곳 평가 및 후기
- 👶 아이별 평가: 각 아이의 반응 별도 기록

## 🛠 기술 스택
- **Frontend**: React 18
- **Backend**: Supabase (PostgreSQL)
- **Map**: Naver Maps API
- **AI**: Google Gemini API (자연어 검색)
- **Styling**: CSS Modules + 따뜻한 파스텔 톤 테마

## 📂 프로젝트 구조
```
inadle-app/
├── src/
│   ├── components/     # 재사용 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── services/      # API 서비스
│   ├── hooks/         # 커스텀 훅
│   └── utils/         # 유틸리티 함수
├── database/          # DB 스키마 및 시드 데이터
│   ├── schema.sql     # 데이터베이스 구조
│   ├── seed.sql       # 초기 테스트 데이터
│   └── real_data.sql  # 실제 장소 데이터
└── public/           # 정적 파일
```

## 🗄 데이터베이스 구조

### 주요 테이블
- **places**: 장소 기본 정보
- **place_details**: 연령별 적합도, 가격 정보
- **place_amenities**: 편의시설 정보
- **place_tips**: 엄마들의 팁
- **events**: 행사/프로그램 정보
- **user_profiles**: 사용자 및 아이 정보
- **user_saved_places**: 찜한 장소
- **user_visits**: 방문 기록
- **child_place_ratings**: 아이별 평가

## 🔒 보안 설계

아이나들은 보안을 중요하게 생각합니다:
- **프론트엔드**: 공개 키만 사용 (Supabase Anon Key)
- **Edge Functions**: 민감한 API 키 보호 (Naver, Gemini)
- **RLS 정책**: 사용자별 데이터 접근 제어
- **개인정보**: 최소한의 정보만 수집 (이메일, 아이 생년월)

## 🌟 향후 계획
- 📱 PWA 지원 (모바일 앱처럼 사용)
- 🗺 더 많은 지역으로 확대
- 👥 커뮤니티 기능 추가
- 📊 연령별 발달 정보 제공

## 🆕 최근 업데이트 (v1.2)

### UI/UX 개선
- 🎪 **행사 탭 개선**

### 외부 프로그램 통합 기반 구축
- 🏛️ **도서관 프로그램 연동**: Edge Functions를 통한 도서관 프로그램 크롤링 시스템 구축
- 🤖 **자동 데이터 수집**: 외부 사이트의 행사 정보를 자동으로 수집하는 인프라 구축
- 📅 **실시간 업데이트**: 지역 기관의 최신 프로그램 정보 자동 동기화

## 💕 함께 만들어가요
아이나들은 엄마들의 경험으로 만들어집니다. 더 좋은 정보가 있다면 언제든 제안해주세요!

### 기여 방법
1. 이 저장소를 Fork 하세요
2. 새로운 기능 브랜치를 만드세요 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push 하세요 (`git push origin feature/AmazingFeature`)
5. Pull Request를 열어주세요

## 📞 문의
- Email: inadle.app@gmail.com
- Instagram: @inadle_app

## 📄 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다.

---
Made with ❤️ by 대전 엄마들