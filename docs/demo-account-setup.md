# 데모 계정 설정 가이드

## Supabase에서 데모 계정 생성하기

### 방법 1: Supabase Dashboard에서 직접 생성

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. **Authentication** → **Users** 탭으로 이동
4. **Add user** → **Create new user** 클릭
5. 다음 정보 입력:
   - Email: `demo@inadle.com`
   - Password: `demo1234`
   - Email confirmed: ✅ 체크
6. **Create user** 클릭

### 방법 2: SQL Editor에서 생성

1. Supabase Dashboard의 **SQL Editor**로 이동
2. 다음 쿼리 실행:

```sql
-- 데모 사용자 생성 (이미 존재하면 오류 발생)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@inadle.com',
  crypt('demo1234', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- 프로필 생성
INSERT INTO public.user_profiles (user_id, child_nickname, child_age)
SELECT id, '우리아이', '4-5'
FROM auth.users
WHERE email = 'demo@inadle.com';
```

### 방법 3: 초기화 스크립트 (추천)

`supabase/seed.sql` 파일에 추가:

```sql
-- 데모 계정이 없을 때만 생성
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@inadle.com') THEN
    -- 데모 사용자 생성
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'demo-user-id-1234',
      'authenticated',
      'authenticated',
      'demo@inadle.com',
      crypt('demo1234', gen_salt('bf')),
      now(),
      now(),
      now()
    );
    
    -- 데모 사용자 프로필 생성
    INSERT INTO public.user_profiles (user_id, child_nickname, child_age)
    VALUES ('demo-user-id-1234', '똘이', '4-5');
  END IF;
END $$;
```

## 주의사항

- 프로덕션 환경에서는 보안을 위해 더 복잡한 비밀번호 사용
- 데모 계정의 데이터는 주기적으로 초기화하는 것을 권장
- RLS(Row Level Security) 정책이 데모 계정에도 적용되는지 확인

## 테스트

1. 로그인 페이지에서 "데모 계정으로 시작하기" 버튼 클릭
2. 자동으로 로그인되어 홈 화면으로 이동하는지 확인
3. 프로필 페이지에서 데모 계정 정보 확인
