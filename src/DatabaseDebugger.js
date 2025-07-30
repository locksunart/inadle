import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';

function DatabaseDebugger() {
  const [results, setResults] = useState({
    loading: true,
    connection: null,
    placesCount: null,
    placesData: null,
    error: null
  });

  useEffect(() => {
    const debugDatabase = async () => {
      console.log('🔍 데이터베이스 디버깅 시작...');
      
      try {
        // 1. 기본 연결 테스트
        console.log('1️⃣ 연결 테스트');
        const { data: testData, error: testError } = await supabase
          .from('places')
          .select('count')
          .limit(1);

        if (testError) {
          setResults(prev => ({
            ...prev,
            connection: false,
            error: testError.message,
            loading: false
          }));
          return;
        }

        setResults(prev => ({
          ...prev,
          connection: true
        }));

        // 2. 장소 수 확인
        console.log('2️⃣ 장소 수 확인');
        const { count, error: countError } = await supabase
          .from('places')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('카운트 조회 오류:', countError);
        } else {
          setResults(prev => ({
            ...prev,
            placesCount: count
          }));
          console.log(`총 장소 수: ${count}개`);
        }

        // 3. 실제 데이터 조회 (앱에서 사용하는 쿼리와 동일)
        console.log('3️⃣ 실제 데이터 조회');
        const { data: places, error: placesError } = await supabase
          .from('places')
          .select(`
            *,
            place_details(*),
            place_amenities(*),
            place_tips(*)
          `)
          .order('created_at', { ascending: false });

        if (placesError) {
          console.error('장소 데이터 조회 오류:', placesError);
          setResults(prev => ({
            ...prev,
            error: placesError.message,
            loading: false
          }));
          return;
        }

        console.log(`조회된 장소 수: ${places?.length || 0}개`);
        console.log('장소 목록:', places);

        setResults(prev => ({
          ...prev,
          placesData: places,
          loading: false
        }));

      } catch (error) {
        console.error('예상치 못한 오류:', error);
        setResults(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      }
    };

    debugDatabase();
  }, []);

  if (results.loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>🔍 데이터베이스 디버깅</h1>
        <p>검사 중...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 데이터베이스 디버깅 결과</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>연결 상태</h3>
        <p>
          {results.connection === true ? '✅ 연결 성공' : 
           results.connection === false ? '❌ 연결 실패' : '🔍 확인 중...'}
        </p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>장소 수</h3>
        <p>
          {results.placesCount !== null ? 
            `📊 총 ${results.placesCount}개의 장소가 데이터베이스에 있습니다` : 
            '🔍 확인 중...'}
        </p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>실제 조회 결과</h3>
        <p>
          {results.placesData ? 
            `✅ ${results.placesData.length}개의 장소가 조회되었습니다` :
            '🔍 확인 중...'}
        </p>
        
        {results.placesData && results.placesData.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <h4>조회된 장소 목록:</h4>
            <ul>
              {results.placesData.map((place, index) => (
                <li key={place.id} style={{ marginBottom: '5px' }}>
                  <strong>{place.name}</strong> ({place.category})
                  <br />
                  <small>
                    주소: {place.address}<br />
                    생성일: {new Date(place.created_at).toLocaleDateString()}<br />
                    상세정보: {place.place_details ? '✅' : '❌'} | 
                    편의시설: {place.place_amenities ? '✅' : '❌'} | 
                    팁: {place.place_tips?.length || 0}개
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {results.error && (
        <div style={{ padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px', color: '#d00' }}>
          <h3>❌ 오류</h3>
          <p>{results.error}</p>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e6f3ff', borderRadius: '8px' }}>
        <h3>💡 다음 단계</h3>
        {results.placesData && results.placesData.length === 4 ? (
          <p>앱에서 4개만 보이는 이유: 실제로 데이터베이스에 4개만 있습니다. 더 많은 장소 데이터를 추가해야 합니다.</p>
        ) : results.placesData && results.placesData.length > 4 ? (
          <p>데이터베이스에는 {results.placesData.length}개가 있는데 앱에서 4개만 보인다면, 프론트엔드의 필터링이나 정렬 로직에 문제가 있을 수 있습니다.</p>
        ) : (
          <p>데이터베이스 연결이나 데이터 조회에 문제가 있습니다.</p>
        )}
      </div>
    </div>
  );
}

export default DatabaseDebugger;