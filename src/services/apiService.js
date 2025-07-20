// 안전한 API 서비스 - 민감한 키는 서버에서만 사용
import { supabase } from './supabase';

export const apiService = {
  // 네이버 장소 검색 (Edge Function 경유)
  async searchNaverPlaces(query) {
    try {
      const { data, error } = await supabase.functions.invoke('search-places-naver', {
        body: { query }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('네이버 검색 오류:', error);
      throw error;
    }
  },

  // AI 기반 자연어 검색 (Edge Function 경유)
  async searchWithAI(query, userProfile = null) {
    try {
      const { data, error } = await supabase.functions.invoke('search-places-ai', {
        body: { query, userProfile }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('AI 검색 오류:', error);
      throw error;
    }
  },

  // 공공 데이터 수집 (향후 구현)
  async fetchPublicData(type) {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-public-data', {
        body: { type }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('공공 데이터 수집 오류:', error);
      throw error;
    }
  }
};

// 지도 서비스 (클라이언트 사이드용)
export const mapService = {
  // 네이버 지도 초기화 (도메인 제한으로 보호)
  initMap(containerId, options = {}) {
    if (!window.naver || !window.naver.maps) {
      console.error('네이버 지도 API가 로드되지 않았어요');
      return null;
    }

    const defaultOptions = {
      center: new window.naver.maps.LatLng(36.3504, 127.3845), // 대전 중심
      zoom: 12,
      mapTypeControl: true,
      ...options
    };

    return new window.naver.maps.Map(containerId, defaultOptions);
  },

  // 마커 생성
  createMarker(map, position, options = {}) {
    if (!window.naver || !window.naver.maps) return null;

    return new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(position.lat, position.lng),
      map: map,
      ...options
    });
  },

  // 거리 계산 (클라이언트에서 직접 계산)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 지구 반경 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
};

export default apiService;
