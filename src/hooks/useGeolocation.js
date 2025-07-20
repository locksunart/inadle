import { useState, useEffect } from 'react';
import { distanceUtils } from '../utils/helpers';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('브라우저가 위치 서비스를 지원하지 않아요');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = '위치를 가져올 수 없어요';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = '위치 권한을 허용해주세요';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없어요';
            break;
          case err.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과했어요';
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // 위치 감시 (실시간 추적)
  const watchLocation = () => {
    if (!navigator.geolocation) {
      setError('브라우저가 위치 서비스를 지원하지 않아요');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (err) => {
        setError('위치 추적 중 오류가 발생했어요');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return watchId;
  };

  // 두 지점 간 거리 계산
  const calculateDistance = (targetLat, targetLng) => {
    if (!location) return null;
    
    return distanceUtils.calculate(
      location.lat,
      location.lng,
      targetLat,
      targetLng
    );
  };

  // 거리순 정렬
  const sortByDistance = (places) => {
    if (!location || !places) return places;
    
    return places.map(place => ({
      ...place,
      distance: calculateDistance(place.lat, place.lng)
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  };

  return {
    location,
    error,
    loading,
    getCurrentLocation,
    watchLocation,
    calculateDistance,
    sortByDistance
  };
};

// 주소 검색 훅
export const useAddressSearch = () => {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const searchAddress = async (query) => {
    if (!query) return;

    setSearching(true);
    setError(null);

    try {
      // 여기서는 Kakao 주소 검색 API를 사용할 수 있습니다
      // 프로토타입에서는 더미 데이터 반환
      const dummyResults = [
        {
          address: '대전광역시 유성구 대덕대로 480',
          lat: 36.3755,
          lng: 127.3788
        },
        {
          address: '대전광역시 서구 둔산대로 169',
          lat: 36.3674,
          lng: 127.3884
        }
      ];
      
      setResults(dummyResults);
    } catch (err) {
      setError('주소 검색 중 오류가 발생했어요');
    } finally {
      setSearching(false);
    }
  };

  return {
    searching,
    results,
    error,
    searchAddress
  };
};

// 지역별 필터링 훅
export const useRegionFilter = (places) => {
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  const regions = [
    { value: 'all', label: '전체' },
    { value: '서구', label: '서구' },
    { value: '중구', label: '중구' },
    { value: '동구', label: '동구' },
    { value: '유성구', label: '유성구' },
    { value: '대덕구', label: '대덕구' }
  ];

  const filteredPlaces = selectedRegion === 'all' 
    ? places 
    : places.filter(place => place.region === selectedRegion);

  return {
    regions,
    selectedRegion,
    setSelectedRegion,
    filteredPlaces
  };
};
