# 🔄 아이나들 Supabase 프로젝트 이전 가이드

## 📋 이전 체크리스트

### 1️⃣ 새 Supabase 프로젝트 생성
- [ ] 새 계정으로 [supabase.com](https://supabase.com) 접속
- [ ] "New Project" 생성
- [ ] 프로젝트 이름: `inadle-app` (또는 원하는 이름)
- [ ] 리전: `Northeast Asia (ap-northeast-1)` 권장
- [ ] 데이터베이스 비밀번호 설정 및 기록

### 2️⃣ 데이터베이스 스키마 이전
```bash
# SQL Editor에서 다음 파일들을 순서대로 실행:
```

1. **`complete_backup.sql`** 실행
   - 모든 테이블, 인덱스, 함수, 트리거, RLS 정책 생성
   - 새 프로젝트의 SQL Editor에서 전체 내용 복사 후 실행

2. **`seed.sql`** 실행 (선택사항)
   - 테스트용 기본 데이터
   
3. **`real_data.sql`** 실행 (권장)
   - 실제 대전 지역 장소 데이터

### 3️⃣ 환경 변수 업데이트

#### `.env` 파일 수정
```bash
# 새 프로젝트 정보로 업데이트
REACT_APP_SUPABASE_URL=https://새프로젝트ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=새로운_anon_key

# 기존 설정 유지
REACT_APP_KAKAO_MAP_KEY=d854e1541d53912d00ea8e3f18c90017
REACT_APP_DEMO_EMAIL=demo@inadle.app
```

**새 프로젝트 정보 확인 방법:**
1. 새 Supabase 프로젝트 → Settings → API
2. Project URL과 anon public key 복사

### 4️⃣ Edge Functions 환경변수 설정

새 프로젝트에서 **Settings → Edge Functions → Secrets**:

```bash
NAVER_CLIENT_ID=네이버_검색_API_ID
NAVER_CLIENT_SECRET=네이버_검색_API_SECRET
GEMINI_API_KEY=구글_제미나이_API_키
```

### 5️⃣ Auth 설정 보안 강화

**Authentication → Emails**:
- [ ] Email OTP Expiration: `3600` (1시간) 이하로 설정

**Authentication → Sign In / Providers → Email**:
- [ ] "Prevent use of leaked passwords" 활성화

### 6️⃣ 테스트 및 검증

#### 기본 기능 테스트
```bash
# 개발 서버 실행
npm start

# 테스트 항목:
```
- [ ] 회원가입/로그인 작동
- [ ] 장소 목록 로드
- [ ] 행사 목록 로드  
- [ ] 찜하기 기능
- [ ] 아이 정보 등록
- [ ] 검색 기능 (Gemini API)

#### 데모 계정 테스트
```bash
# demo@inadle.app 계정으로 테스트:
```
- [ ] 로그인 후 데이터 입력
- [ ] 로그아웃 시 데이터 초기화 확인

## 🚨 주의사항

### 1. 기존 프로젝트 보존
- 이전 완료 전까지 기존 프로젝트 삭제 금지
- 모든 기능이 정상 작동하는지 확인 후 이전 프로젝트 정리

### 2. API 키 보안
- Edge Functions 환경변수는 Supabase Dashboard에서만 설정
- `.env` 파일에 민감한 키 저장 금지

### 3. 데이터 백업
- 사용자 데이터가 있다면 별도 백업 필요
- 현재는 주로 장소/행사 데이터이므로 SQL 파일로 충분

## 🔧 문제 해결

### 스키마 실행 오류
```sql
-- 오류 발생 시 테이블별로 개별 실행
-- 1. 기본 테이블들 먼저
CREATE TABLE places (...);
CREATE TABLE place_details (...);
-- ...

-- 2. 외래키 제약조건 나중에
ALTER TABLE events ADD CONSTRAINT ...;
```

### RLS 정책 오류  
```sql
-- RLS 정책은 테이블 생성 후 개별 실행
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "places_select_policy" ON places FOR SELECT USING (true);
```

### Auth 연동 문제
- Supabase 프로젝트 URL과 Key 재확인
- 브라우저 캐시 클리어
- 개발자 도구에서 네트워크 오류 확인

## 📞 완료 후 확인사항

✅ **성공적인 이전의 지표:**
- 모든 페이지가 오류 없이 로드됨
- 사용자 인증이 정상 작동함  
- 장소 및 행사 데이터가 표시됨
- 검색 기능이 작동함 (AI 검색 포함)
- 사용자별 기능들이 작동함 (찜하기, 후기 등)
- 데모 계정 데이터 초기화가 작동함

---

**💡 도움이 필요하시면 언제든 말씀해 주세요!**
