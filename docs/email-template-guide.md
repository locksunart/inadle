# 아이나들 이메일 템플릿 설정 가이드

## Supabase Dashboard에서 이메일 템플릿 수정하기

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Authentication** → **Email Templates** 클릭

## 회원가입 확인 이메일 템플릿

### Confirm signup 템플릿 수정:

**Subject:**
```
아이나들 회원가입을 완료해주세요 🌸
```

**Email Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #F472B6; margin: 0;">아이나들 🌸</h1>
    <p style="color: #6B7280; margin-top: 10px;">우리 아이와 함께하는 행복한 나들이</p>
  </div>
  
  <div style="background-color: #FFF0F6; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #1F2937; margin-top: 0;">안녕하세요! 👋</h2>
    <p style="color: #4B5563; line-height: 1.6;">
      아이나들에 가입해 주셔서 감사합니다.<br>
      아래 버튼을 클릭하여 이메일 주소를 확인하고<br>
      회원가입을 완료해주세요.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #F472B6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        이메일 확인하기
      </a>
    </div>
    
    <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
      이 링크는 24시간 동안 유효합니다.<br>
      만약 버튼이 작동하지 않으면 아래 링크를 복사해서 사용해주세요:
    </p>
    <p style="color: #9CA3AF; font-size: 12px; word-break: break-all;">
      {{ .ConfirmationURL }}
    </p>
  </div>
  
  <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
    <p>이 메일은 아이나들 회원가입 과정에서 발송되었습니다.</p>
    <p>만약 회원가입을 요청하지 않으셨다면 이 메일을 무시해주세요.</p>
  </div>
</div>
```

## 기타 이메일 템플릿도 수정하기

### Magic Link 템플릿:
**Subject:** `아이나들 로그인 링크가 도착했어요 🔑`

### Reset Password 템플릿:
**Subject:** `아이나들 비밀번호 재설정 안내 🔐`

## 발신자 정보 수정

1. **Authentication** → **Settings**로 이동
2. **Email Settings** 섹션에서:
   - **Sender email**: `no-reply@inadle.com` (커스텀 도메인 설정 필요)
   - **Sender name**: `아이나들`

## 참고사항

- 커스텀 도메인 설정 없이는 `no-reply@mail.app.supabase.io` 형태로 발송됩니다
- 스팸 방지를 위해 DKIM, SPF 설정을 권장합니다
- 템플릿의 `{{ .ConfirmationURL }}` 등의 변수는 그대로 유지해야 합니다
