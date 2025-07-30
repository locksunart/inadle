import React, { useState } from 'react';
import kakaoPlaceService from '../services/kakaoPlaceService';
import { supabase } from '../services/supabase';

const PlaceGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [places, setPlaces] = useState([]);

  // 장소 100개 생성
  const handleBulkCreate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const result = await kakaoPlaceService.createBulkPlaces();
      setResult(result);
      console.log('생성 결과:', result);
    } catch (err) {
      setError(err.message);
      console.error('생성 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 현재 DB의 장소들 조회
  const handleLoadPlaces = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setPlaces(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 단일 키워드 테스트
  const handleTestSearch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await kakaoPlaceService.searchPlaces('대전 도서관', {
        latitude: 36.3504, // 대전시 중구
        longitude: 127.3845,
        size: 5
      });
      
      console.log('검색 테스트 결과:', result);
      setResult({
        test_search: true,
        total_found: result.documents?.length || 0,
        places: result.documents || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🏦 대전 지역 유아 전용 장소 생성기</h2>
      
      {/* 버튼들 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleTestSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '테스트 중...' : '🧪 API 테스트'}
        </button>
        
        <button
          onClick={handleBulkCreate}
          disabled={isLoading}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? '생성 중...' : '🏦 대전 유아장소 100개 생성'}
        </button>
        
        <button
          onClick={handleLoadPlaces}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {isLoading ? '로딩 중...' : '📋 DB 장소 조회'}
        </button>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center gap-2 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>처리 중...</span>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* 결과 표시 */}
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {result.test_search ? (
            <>
              <h3 className="font-bold mb-2">🧪 API 테스트 성공!</h3>
              <ul className="text-sm">
                <li>검색 결과: {result.total_found}개</li>
                <li>키워드: 대전 도서관</li>
                <li>지역: 대전시 중구</li>
              </ul>
              {result.places && result.places.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium mb-2">검색된 장소들:</h4>
                  <div className="space-y-1 text-xs">
                    {result.places.slice(0, 3).map((place, idx) => (
                      <div key={idx} className="bg-white bg-opacity-50 p-2 rounded">
                        <div className="font-medium">{place.place_name}</div>
                        <div className="text-gray-600">{place.address_name}</div>
                      </div>
                    ))}
                    {result.places.length > 3 && (
                      <div className="text-gray-500">...외 {result.places.length - 3}개</div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="font-bold mb-2">✅ 장소 생성 완료!</h3>
              <ul className="text-sm">
                <li>총 발견: {result.total_found || 0}개</li>
                <li>중복 제거 후: {result.unique_places || 0}개</li>
                <li>DB 저장: {result.saved_places || 0}개</li>
              </ul>
            </>
          )}
        </div>
      )}

      {/* 장소 목록 */}
      {places.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">📍 저장된 장소들 (최근 50개)</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {places.map((place, index) => (
              <div key={place.id} className="border rounded-lg p-4 bg-white shadow">
                <div className="font-medium text-blue-600">{place.name}</div>
                <div className="text-sm text-gray-600 mt-1">{place.category}</div>
                <div className="text-xs text-gray-500 mt-2">{place.address}</div>
                {place.phone && (
                  <div className="text-xs text-gray-400 mt-1">📞 {place.phone}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 사용법 */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h4 className="font-semibold mb-2">📖 사용법</h4>
        <ol className="text-sm space-y-1">
          <li>1. 먼저 <strong>API 테스트</strong>로 연결 확인</li>
          <li>2. <strong>대전 유아장소 100개 생성</strong>으로 대량 생성</li>
          <li>3. <strong>DB 장소 조회</strong>로 결과 확인</li>
        </ol>
        <div className="text-xs text-gray-600 mt-2">
          ⚠️ 대전 지역의 도서관, 공원, 박물관, 체험시설 등 유아 전용 장소를 생성합니다.
        </div>
      </div>
    </div>
  );
};

export default PlaceGenerator;
