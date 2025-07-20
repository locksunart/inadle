import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';

function TestConnection() {
  const [status, setStatus] = useState('테스트 중...');
  const [details, setDetails] = useState({});

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔍 Supabase 연결 테스트 시작');
        
        // 1. 환경변수 확인
        const url = process.env.REACT_APP_SUPABASE_URL;
        const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
        
        setDetails(prev => ({
          ...prev,
          url: url ? '✅ 설정됨' : '❌ 없음',
          key: key ? '✅ 설정됨' : '❌ 없음'
        }));

        if (!url || !key) {
          setStatus('❌ 환경변수 누락');
          return;
        }

        // 2. 기본 연결 테스트
        console.log('📡 기본 연결 테스트');
        const { data: testData, error: testError } = await supabase
          .from('places')
          .select('count')
          .limit(1);

        if (testError) {
          console.error('연결 에러:', testError);
          setStatus(`❌ 연결 실패: ${testError.message}`);
          setDetails(prev => ({
            ...prev,
            connectionError: testError.message
          }));
          return;
        }

        console.log('✅ 기본 연결 성공');

        // 3. 데이터 존재 확인
        console.log('📊 데이터 확인');
        const { data: places, error: placesError } = await supabase
          .from('places')
          .select('id, name')
          .limit(5);

        if (placesError) {
          console.error('데이터 조회 에러:', placesError);
          setStatus(`❌ 데이터 조회 실패: ${placesError.message}`);
          return;
        }

        setDetails(prev => ({
          ...prev,
          dataCount: places?.length || 0,
          sampleData: places
        }));

        setStatus('✅ 모든 테스트 통과!');
        console.log('🎉 연결 테스트 완료');

      } catch (error) {
        console.error('예상치 못한 에러:', error);
        setStatus(`❌ 예상치 못한 에러: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>🔧 아이나들 앱 진단</h1>
      
      <div style={{ 
        padding: '20px', 
        background: '#f5f5f5', 
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h3>연결 상태:</h3>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{status}</p>
      </div>

      <div style={{ 
        padding: '20px', 
        background: '#fff', 
        border: '1px solid #ddd',
        borderRadius: '10px'
      }}>
        <h3>상세 정보:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><strong>Supabase URL:</strong> {details.url}</li>
          <li><strong>API Key:</strong> {details.key}</li>
          <li><strong>데이터 개수:</strong> {details.dataCount || '확인 중...'}</li>
          {details.connectionError && (
            <li style={{ color: 'red' }}>
              <strong>에러:</strong> {details.connectionError}
            </li>
          )}
        </ul>

        {details.sampleData && details.sampleData.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <strong>샘플 데이터:</strong>
            <ul>
              {details.sampleData.map(place => (
                <li key={place.id}>{place.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestConnection;