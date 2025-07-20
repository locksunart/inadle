// 지도 서비스 - 카카오맵 기준
export const mapService = {
  // 카카오맵 초기화
  initMap(containerId, options = {}) {
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 API가 로드되지 않았어요. API 키를 확인해주세요.');
      return null;
    }

    const container = document.getElementById(containerId);
    const defaultOptions = {
      center: new window.kakao.maps.LatLng(36.3504, 127.3845), // 대전 중심
      level: 4, // 확대 레벨
      ...options
    };

    return new window.kakao.maps.Map(container, defaultOptions);
  },

  // 마커 생성
  createMarker(map, position, options = {}) {
    if (!window.kakao || !window.kakao.maps) return null;

    const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng);
    
    return new window.kakao.maps.Marker({
      position: markerPosition,
      map: map,
      ...options
    });
  },

  // 인포윈도우 생성
  createInfoWindow(content) {
    if (!window.kakao || !window.kakao.maps) return null;

    return new window.kakao.maps.InfoWindow({
      content: content
    });
  },

  // 현재 위치 가져오기
  getCurrentPosition(map) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const locPosition = new window.kakao.maps.LatLng(lat, lng);
        
        // 지도 중심 이동
        map.setCenter(locPosition);
        
        // 현재 위치 마커
        this.createMarker(map, { lat, lng }, {
          image: new window.kakao.maps.MarkerImage(
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
            new window.kakao.maps.Size(24, 35)
          )
        });
      });
    }
  },

  // 거리 계산 (km)
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

// 네이버맵을 사용하고 싶다면 아래 주석 해제
/*
export const naverMapService = {
  initMap(containerId, options = {}) {
    if (!window.naver || !window.naver.maps) {
      console.error('네이버맵 API가 로드되지 않았어요');
      return null;
    }

    const defaultOptions = {
      center: new window.naver.maps.LatLng(36.3504, 127.3845),
      zoom: 12,
      ...options
    };

    return new window.naver.maps.Map(containerId, defaultOptions);
  }
  // ... 나머지 메서드들
};
*/

export default mapService;
