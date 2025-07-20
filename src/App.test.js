// 간단한 테스트용 App 컴포넌트
import React from 'react';

function SimpleApp() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🌸 아이나들 앱 테스트</h1>
      <p>Supabase 연결이 정상적으로 되면 이 화면이 보입니다!</p>
      <div style={{ marginTop: '20px' }}>
        <h3>환경변수 확인:</h3>
        <p>Supabase URL: {process.env.REACT_APP_SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}</p>
        <p>Supabase Key: {process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 없음'}</p>
      </div>
    </div>
  );
}

export default SimpleApp;