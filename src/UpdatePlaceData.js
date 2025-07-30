import React, { useState } from 'react';
import { supabase } from './services/supabase';

function UpdatePlaceData() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const updateData = async () => {
    setLoading(true);
    setStatus('업데이트 중...');
    
    try {
      // 1. 대전시립박물관 업데이트
      const { error: detailsError } = await supabase
        .from('place_details')
        .update({
          age_0_12_months: 2.5,
          age_13_24_months: 3.0,
          age_24_48_months: 4.0,
          age_over_48_months: 4.5,
          age_elementary_low: 5.0,
          age_elementary_high: 4.5,
          price_adult: 0,
          price_child: 0,
          price_toddler: 0,
          is_free: true,
          reservation_required: false,
          recommended_duration: '1-2시간',
          features: ['교육적', '조용함', '깨끗함', '에어컨', '지하주차장']
        })
        .eq('place_id', (await supabase.from('places').select('id').eq('name', '대전시립박물관').single()).data?.id);

      if (detailsError) throw detailsError;

      // place_amenities도 업데이트
      const { error: amenitiesError } = await supabase
        .from('place_amenities')
        .upsert({
          place_id: (await supabase.from('places').select('id').eq('name', '대전시립박물관').single()).data?.id,
          parking_available: true,
          parking_free: true,
          parking_note: '지하 무료주차장, 시원하고 넉넉함',
          nursing_room: false,
          diaper_change_table: true,
          diaper_change_location: ['화장실'],
          stroller_accessible: true,
          elevator_available: true,
          cafe_inside: true,
          rest_area: true,
          wifi_available: true
        });

      if (amenitiesError) throw amenitiesError;

      // 2. 대전선사박물관도 비슷하게 업데이트...
      // (간단하게 하나만 테스트)

      setStatus('✅ 대전시립박물관 데이터 업데이트 완료!');
      
    } catch (error) {
      console.error('업데이트 오류:', error);
      setStatus(`❌ 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🔧 장소 데이터 업데이트</h2>
      
      <button 
        onClick={updateData} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '업데이트 중...' : '필터 데이터 업데이트 시작'}
      </button>
      
      {status && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
          color: status.includes('✅') ? '#155724' : '#721c24',
          borderRadius: '5px'
        }}>
          {status}
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>업데이트 내용:</h4>
        <ul>
          <li>연령별 적합도 점수 (실제 블로그 후기 기반)</li>
          <li>가격 정보 (무료/유료)</li>
          <li>편의시설 정보 (주차장, 카페, 수유실 등)</li>
          <li>추천 체류시간</li>
          <li>특징 태그</li>
        </ul>
      </div>
    </div>
  );
}

export default UpdatePlaceData;