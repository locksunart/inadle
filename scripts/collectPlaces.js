// 장소 데이터 수집 스크립트
// 네이버 지도 API와 공공 데이터를 활용한 대전 육아 나들이 장소 수집

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// 환경 변수 설정
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // 서비스 키 필요
const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.REACT_APP_NAVER_CLIENT_SECRET;

// Supabase 클라이언트 초기화
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 수집할 카테고리와 검색어
const SEARCH_QUERIES = [
  // 실내 놀이터
  { category: '실내놀이터', queries: ['대전 키즈카페', '대전 실내놀이터', '대전 어린이카페'] },
  
  // 박물관/과학관
  { category: '박물관', queries: ['대전 박물관', '대전 과학관', '대전 미술관'] },
  
  // 도서관
  { category: '도서관', queries: ['대전 어린이도서관', '대전 유아도서관'] },
  
  // 공원
  { category: '공원', queries: ['대전 어린이공원', '대전 놀이터', '대전 수목원'] },
  
  // 체험시설
  { category: '체험시설', queries: ['대전 어린이체험', '대전 키즈체험', '대전 어린이회관'] },
  
  // 동물원/수족관
  { category: '동물원', queries: ['대전 동물원', '대전 아쿠아리움'] }
];

// 네이버 지도 API로 장소 검색
async function searchNaverPlaces(query) {
  try {
    const response = await axios.get('https://openapi.naver.com/v1/search/local.json', {
      params: {
        query: query,
        display: 30,
        start: 1,
        sort: 'random'
      },
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
      }
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error(`네이버 검색 오류 (${query}):`, error.message);
    return [];
  }
}

// 좌표 변환 (카텍 -> WGS84)
function convertCoordinates(mapx, mapy) {
  // 네이버 지도 API의 좌표는 카텍 좌표계
  // 실제 변환 로직이 필요하지만, 프로토타입에서는 간단히 처리
  const lng = parseInt(mapx) / 10000000;
  const lat = parseInt(mapy) / 10000000;
  return { lat, lng };
}

// 지역구 추출
function extractRegion(address) {
  const regions = ['서구', '중구', '동구', '유성구', '대덕구'];
  for (const region of regions) {
    if (address.includes(region)) {
      return region;
    }
  }
  return '대전';
}

// 장소 데이터 정제 및 저장
async function processAndSavePlace(item, category) {
  try {
    // HTML 태그 제거
    const cleanTitle = item.title.replace(/<[^>]*>/g, '');
    const cleanAddress = item.address.replace(/<[^>]*>/g, '');
    
    // 좌표 변환
    const { lat, lng } = convertCoordinates(item.mapx, item.mapy);
    
    // 지역구 추출
    const region = extractRegion(cleanAddress);
    
    // 장소 기본 정보
    const placeData = {
      name: cleanTitle,
      category: category,
      address: cleanAddress,
      lat: lat,
      lng: lng,
      region: region,
      phone: item.telephone || null,
      homepage: item.link || null,
      is_indoor: ['실내놀이터', '박물관', '도서관', '체험시설'].includes(category),
      is_outdoor: ['공원', '동물원'].includes(category),
      data_sources: ['naver_map'],
      is_verified: false,
      popularity_score: Math.floor(Math.random() * 50) + 30 // 임시 점수
    };
    
    // 중복 확인
    const { data: existing } = await supabase
      .from('places')
      .select('id')
      .eq('name', cleanTitle)
      .single();
    
    if (existing) {
      console.log(`이미 존재하는 장소: ${cleanTitle}`);
      return;
    }
    
    // 장소 저장
    const { data: place, error } = await supabase
      .from('places')
      .insert(placeData)
      .select()
      .single();
    
    if (error) {
      console.error(`장소 저장 오류: ${cleanTitle}`, error);
      return;
    }
    
    console.log(`✅ 저장 완료: ${cleanTitle}`);
    
    // 상세 정보 생성 (기본값)
    await createPlaceDetails(place.id, category);
    
    // 편의시설 정보 생성 (기본값)
    await createPlaceAmenities(place.id, category);
    
  } catch (error) {
    console.error('장소 처리 오류:', error);
  }
}

// 장소 상세 정보 생성
async function createPlaceDetails(placeId, category) {
  const details = {
    place_id: placeId,
    // 카테고리별 기본 연령 점수
    age_0_12_months: category === '도서관' ? 3 : 2,
    age_13_24_months: ['실내놀이터', '공원'].includes(category) ? 4 : 3,
    age_24_48_months: 4,
    age_over_48_months: ['박물관', '체험시설'].includes(category) ? 5 : 4,
    age_elementary_low: ['박물관', '체험시설', '도서관'].includes(category) ? 5 : 3,
    age_elementary_high: ['박물관', '체험시설'].includes(category) ? 4 : 2,
    features: getDefaultFeatures(category),
    recommended_duration: getDefaultDuration(category)
  };
  
  await supabase.from('place_details').insert(details);
}

// 편의시설 정보 생성
async function createPlaceAmenities(placeId, category) {
  const amenities = {
    place_id: placeId,
    // 카테고리별 기본 편의시설
    parking_available: true, // 대부분 주차 가능
    stroller_accessible: !['공원'].includes(category),
    nursing_room: ['박물관', '도서관', '체험시설'].includes(category),
    kids_toilet: ['박물관', '도서관', '체험시설'].includes(category),
    cafe_inside: ['박물관', '실내놀이터'].includes(category)
  };
  
  await supabase.from('place_amenities').insert(amenities);
}

// 카테고리별 기본 특징
function getDefaultFeatures(category) {
  const features = {
    '실내놀이터': ['실내 활동', '날씨 무관', '안전한 놀이'],
    '박물관': ['교육적', '전시 관람', '체험 프로그램'],
    '도서관': ['독서 공간', '조용한 환경', '무료 이용'],
    '공원': ['야외 활동', '자연 친화', '넓은 공간'],
    '체험시설': ['체험 위주', '교육적', '다양한 프로그램'],
    '동물원': ['동물 관람', '야외 활동', '교육적']
  };
  
  return features[category] || ['가족 친화적'];
}

// 카테고리별 추천 체류 시간
function getDefaultDuration(category) {
  const durations = {
    '실내놀이터': '2-3시간',
    '박물관': '2-3시간',
    '도서관': '1-2시간',
    '공원': '2시간 이상',
    '체험시설': '2-3시간',
    '동물원': '반나절'
  };
  
  return durations[category] || '2시간';
}

// 메인 실행 함수
async function collectPlaces() {
  console.log('🚀 대전 육아 나들이 장소 수집 시작...\n');
  
  for (const searchCategory of SEARCH_QUERIES) {
    console.log(`\n📍 ${searchCategory.category} 카테고리 수집 중...`);
    
    for (const query of searchCategory.queries) {
      console.log(`   검색어: ${query}`);
      
      const places = await searchNaverPlaces(query);
      console.log(`   검색 결과: ${places.length}개`);
      
      for (const place of places) {
        await processAndSavePlace(place, searchCategory.category);
        
        // API 제한을 위한 대기
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  console.log('\n✨ 장소 수집 완료!');
}

// 스크립트 실행
if (require.main === module) {
  collectPlaces().catch(console.error);
}

module.exports = { collectPlaces };
