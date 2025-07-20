// 네이버 지도 API 서비스
import axios from 'axios';

const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.REACT_APP_NAVER_CLIENT_SECRET;

// CORS 이슈로 인해 프록시 서버나 백엔드를 통해 호출해야 합니다
// 프로토타입에서는 Supabase Edge Functions 사용을 권장합니다

export const naverMapService = {
  // 장소 검색
  async searchPlaces(query, options = {}) {
    try {
      // 실제 구현시에는 백엔드 API를 통해 호출
      console.log('네이버 장소 검색:', query, options);
      
      // 프로토타입용 더미 데이터
      return {
        items: [],
        total: 0
      };
    } catch (error) {
      console.error('네이버 장소 검색 오류:', error);
      throw error;
    }
  },

  // 주소를 좌표로 변환 (지오코딩)
  async geocode(address) {
    try {
      // 실제 구현시에는 백엔드 API를 통해 호출
      console.log('주소 -> 좌표 변환:', address);
      
      // 프로토타입용 더미 데이터
      return {
        lat: 36.3504,
        lng: 127.3845
      };
    } catch (error) {
      console.error('지오코딩 오류:', error);
      throw error;
    }
  },

  // 좌표를 주소로 변환 (역지오코딩)
  async reverseGeocode(lat, lng) {
    try {
      // 실제 구현시에는 백엔드 API를 통해 호출
      console.log('좌표 -> 주소 변환:', lat, lng);
      
      // 프로토타입용 더미 데이터
      return {
        address: '대전광역시 유성구',
        region: '유성구'
      };
    } catch (error) {
      console.error('역지오코딩 오류:', error);
      throw error;
    }
  },

  // 거리 계산 (km)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 지구 반경 (km)
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRad(deg) {
    return deg * (Math.PI / 180);
  }
};

// 네이버 지도 초기화 헬퍼
export const initNaverMap = (containerId, options = {}) => {
  const defaultOptions = {
    center: new window.naver.maps.LatLng(36.3504, 127.3845), // 대전 중심
    zoom: 12,
    mapTypeControl: true,
    scaleControl: true,
    logoControl: true,
    mapDataControl: true,
    ...options
  };

  return new window.naver.maps.Map(containerId, defaultOptions);
};

// 마커 생성 헬퍼
export const createMarker = (map, position, options = {}) => {
  const markerOptions = {
    position: new window.naver.maps.LatLng(position.lat, position.lng),
    map: map,
    ...options
  };

  return new window.naver.maps.Marker(markerOptions);
};

// 정보창 생성 헬퍼
export const createInfoWindow = (content, options = {}) => {
  const infoWindowOptions = {
    content: content,
    maxWidth: 300,
    backgroundColor: "#fff",
    borderColor: "#FFB6C1",
    borderWidth: 2,
    anchorSize: new window.naver.maps.Size(30, 30),
    anchorSkew: true,
    anchorColor: "#fff",
    pixelOffset: new window.naver.maps.Point(0, -10),
    ...options
  };

  return new window.naver.maps.InfoWindow(infoWindowOptions);
};

export default naverMapService;
