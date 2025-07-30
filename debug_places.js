// 장소 데이터 디버깅 스크립트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function debugPlaces() {
  console.log('🔍 장소 데이터 디버깅 시작...\n');

  try {
    // 1. 전체 장소 수 확인
    const { count, error: countError } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 카운트 조회 실패:', countError);
      return;
    }

    console.log(`📊 총 장소 수: ${count}개\n`);

    // 2. 실제 장소 데이터 확인 (앱에서 사용하는 쿼리와 동일)
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
      console.error('❌ 장소 데이터 조회 실패:', placesError);
      return;
    }

    console.log(`✅ 실제 조회된 장소 수: ${places?.length || 0}개\n`);

    if (places && places.length > 0) {
      console.log('📋 장소 목록:');
      places.forEach((place, index) => {
        console.log(`${index + 1}. ${place.name} (${place.category})`);
        console.log(`   주소: ${place.address}`);
        console.log(`   생성일: ${place.created_at}`);
        console.log(`   place_details: ${place.place_details ? '✅' : '❌'}`);
        console.log(`   place_amenities: ${place.place_amenities ? '✅' : '❌'}`);
        console.log('');
      });
    } else {
      console.log('❌ 장소 데이터가 없습니다.');
    }

    // 3. 카테고리별 분포 확인
    console.log('📈 카테고리별 분포:');
    const categoryCount = {};
    places?.forEach(place => {
      categoryCount[place.category] = (categoryCount[place.category] || 0) + 1;
    });
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}개`);
    });

  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error);
  }
}

debugPlaces();