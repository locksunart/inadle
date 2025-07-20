import React from 'react';

function App() {
  console.log('환경변수 확인:', {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY ? '설정됨' : '없음'
  });

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🌸 아이나들 앱 테스트</h1>
      <p>이 화면이 보이면 성공!</p>
      
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#f5f5f5',
        borderRadius: '10px'
      }}>
        <h3>환경변수 상태:</h3>
        <p>Supabase URL: {process.env.REACT_APP_SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}</p>
        <p>Supabase Key: {process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 없음'}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>만약 이 화면이 보인다면 React 앱이 정상 작동하는 것입니다!</p>
      </div>
    </div>
  );
}

export default App;