// Edge Function을 통한 카카오맵 API 서비스
import { supabase } from './supabase';

class KakaoPlaceService {
  constructor() {
    this.functionUrl = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/kakao-places`;
  }

  // Edge Function 호출 헬퍼
  async callFunction(action, params = {}) {
    const url = new URL(this.functionUrl);
    url.searchParams.append('action', action);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString());
      }
    });

    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // POST 요청 헬퍼
  async callFunctionPost(action, body = {}) {
    const url = new URL(this.functionUrl);
    url.searchParams.append('action', action);

    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // 키워드로 장소 검색
  async searchPlaces(keyword, options = {}) {
    return await this.callFunction('search', {
      keyword,
      category: options.category,
      lat: options.latitude,
      lng: options.longitude,
      radius: options.radius,
      page: options.page,
      size: options.size
    });
  }

  // 카테고리별 장소 검색
  async searchByCategory(categoryCode, options = {}) {
    return await this.callFunction('category', {
      code: categoryCode,
      lat: options.latitude,
      lng: options.longitude,
      radius: options.radius,
      page: options.page,
      size: options.size
    });
  }

  // 대량 장소 생성 (대전 지역 유아 전용)
  async createBulkPlaces() {
    console.log('🏦 대전 지역 유아 전용 장소 100개 생성 시작...');
    
    // 대전 지역 영유아 나들이 장소 키워드 (교육기관 제외)
    const keywords = [
      '대전 어린이도서관',
      '대전 도서관',
      '대전 공원',
      '대전 어린이공원',
      '대전 어린이박물관',
      '대전 박물관',
      '대전 과학관',
      '대전 미술관',
      '대전 수목원',
      '대전 놀이터',
      '대전 키즈카페',
      '대전 실내놀이터',
      '대전 체험관',
      '대전 동물원',
      '대전 아쿠아리움',
      '대전 문화센터',
      '대전 유아놀이터',
      '대전 어린이회관',
      '대전 키즈파크',
      '대전 가족공원'
    ];

    // 나들이 관련 카테고리만 (교육기관 제외)
    const categories = [
      'CT1', // 문화시설 (박물관, 미술관, 도서관)
      'AT4'  // 관광명소 (공원, 체험시설)
    ];

    try {
      const result = await this.callFunctionPost('bulk-import', {
        keywords,
        categories
      });

      console.log('✅ 장소 생성 완료:', result);
      return result;
    } catch (error) {
      console.error('❌ 장소 생성 실패:', error);
      throw error;
    }
  }

  // 특정 지역의 장소들 가져오기
  async getPlacesByLocation(latitude = 37.5665, longitude = 126.9780, radius = 20000) {
    const keywords = ['키즈카페', '놀이터', '공원', '어린이박물관'];
    const allPlaces = [];

    for (const keyword of keywords) {
      try {
        const result = await this.searchPlaces(keyword, {
          latitude,
          longitude,
          radius,
          size: 15
        });
        
        allPlaces.push(...result.documents);
        
        // API 호출 제한 대응
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`키워드 ${keyword} 검색 실패:`, error);
      }
    }

    return allPlaces;
  }
}

export default new KakaoPlaceService();
