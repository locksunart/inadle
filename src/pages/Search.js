import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaSlidersH } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth'; // 🔒 인증 시스템 임시 비활성화
import { dbHelpers } from '../services/supabase';
import PlaceCard from '../components/PlaceCard';
import './Search.css';

function Search({ userProfile }) {
  // const { userProfile } = useAuth(); // 🔒 인증 시스템 임시 비활성화
  const navigate = useNavigate();
  
  const [searchMode, setSearchMode] = useState('filter');
  const [searchQuery, setSearchQuery] = useState('');
  const [allPlaces, setAllPlaces] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    parentEnergy: '',
    childCondition: '',
    environment: '',
    parking: '',
    cafe: '',
    duration: ''
  });

  // 연령 계산 함수들
  const calculateChildAge = useCallback((child) => {
    const today = new Date();
    const birthDate = new Date(child.birthYear, child.birthMonth - 1);
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 
                  + (today.getMonth() - birthDate.getMonth());
    return months;
  }, []);

  const getAgeGroup = useCallback((months) => {
    if (months <= 12) return '0_12_months';
    if (months <= 24) return '13_24_months';
    if (months <= 48) return '24_48_months';
    if (months <= 72) return 'over_48_months';
    if (months <= 108) return 'elementary_low';
    return 'elementary_high';
  }, []);

  // 필터 옵션들
  const filterOptions = {
    parentEnergy: [
      { id: 'tired', label: '낮음', emoji: '🥱' },
      { id: 'normal', label: '보통', emoji: '😊' },
      { id: 'energetic', label: '높음', emoji: '💪' }
    ],
    childCondition: [
      { id: 'normal', label: '보통', emoji: '😊' },
      { id: 'fussy', label: '예민', emoji: '😤' }
    ],
    environment: [
      { id: 'indoor', label: '실내', emoji: '🏠' },
      { id: 'outdoor', label: '실외', emoji: '🌳' },
      { id: 'both', label: '모두', emoji: '🌈' }
    ],
    parking: [
      { id: 'required', label: '필수', emoji: '🚗' },
      { id: 'ok', label: '대중교통 OK', emoji: '🚌' },
      { id: 'none', label: '상관없음', emoji: '🚶' }
    ],
    cafe: [
      { id: 'required', label: '필수', emoji: '☕' },
      { id: 'nice', label: '있으면 좋음', emoji: '🧋' },
      { id: 'none', label: '상관없음', emoji: '🥤' }
    ],
    duration: [
      { id: '15min', label: '15분 이내', emoji: '⏱️' },
      { id: '30min', label: '30분 이내', emoji: '⏰' },
      { id: '1hour', label: '1시간 이내', emoji: '🕐' }
    ]
  };

  // 헬퍼 함수들 먼저 정의
  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(filter => filter !== '');
  }, [filters]);

  const handleFilterChange = useCallback((category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? '' : value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      parentEnergy: '',
      childCondition: '',
      environment: '',
      parking: '',
      cafe: '',
      duration: ''
    });
  }, []);

  // 데이터 로드
  useEffect(() => {
    const loadAllPlaces = async () => {
      try {
        setInitialLoading(true);
        const data = await dbHelpers.places.getAll();
        setAllPlaces(data);
      } catch (error) {
        console.error('장소 로드 오류:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadAllPlaces();
  }, []);

  // 필터링된 결과
  const searchResults = useMemo(() => {
    if (searchMode === 'ai') {
      if (!searchQuery.trim()) return [];
      return allPlaces.filter(place => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 필터 모드
    if (!hasActiveFilters()) return [];

    return allPlaces.filter(place => {
      // 부모 에너지 필터
      if (filters.parentEnergy) {
        if (filters.parentEnergy === 'tired' && !place.is_indoor) return false;
        if (filters.parentEnergy === 'energetic' && !place.is_outdoor) return false;
      }
      
      // 아이 컨디션 필터
      if (filters.childCondition === 'fussy') {
        const hasQuietFeature = place.place_details?.features?.includes('조용함') || 
                               place.place_details?.features?.includes('넓은 공간');
        if (!hasQuietFeature) return false;
      }
      
      // 환경 필터
      if (filters.environment) {
        if (filters.environment === 'indoor' && !place.is_indoor) return false;
        if (filters.environment === 'outdoor' && !place.is_outdoor) return false;
      }
      
      // 주차 필터
      if (filters.parking === 'required') {
        if (!place.place_amenities?.parking_available) return false;
      }
      
      // 카페 필터
      if (filters.cafe === 'required') {
        const hasCafe = place.category === '카페' || place.place_amenities?.kids_menu;
        if (!hasCafe) return false;
      }
      
      return true;
    });
  }, [allPlaces, filters, searchQuery, searchMode, hasActiveFilters]);

  // 초기 로딩 상태
  if (initialLoading) {
    return (
      <div className="search-container">
        <div className="search-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <h1>나들이 찾기</h1>
        </div>
        <div className="loading-state">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>장소 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-container">
      {/* 헤더 */}
      <div className="search-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1>나들이 찾기</h1>
      </div>

      {/* 검색 모드 선택 */}
      <div className="search-mode-tabs">
        <button 
          className={`mode-tab ${searchMode === 'filter' ? 'active' : ''}`}
          onClick={() => setSearchMode('filter')}
        >
          <FaSlidersH />
          필터 검색
        </button>
        <button 
          className={`mode-tab ${searchMode === 'ai' ? 'active' : ''}`}
          onClick={() => setSearchMode('ai')}
        >
          <FaSearch />
          검색어 검색
        </button>
      </div>

      {/* 검색 입력 */}
      {searchMode === 'ai' && (
        <div className="ai-search-section">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="장소명, 주소, 카테고리로 검색하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button">
              <FaSearch />
            </button>
          </div>
        </div>
      )}

      {/* 필터 검색 */}
      {searchMode === 'filter' && (
        <div className="filter-search-section">
          {/* 부모 에너지 */}
          <div className="filter-group">
            <h3>부모 에너지</h3>
            <div className="filter-options">
              {filterOptions.parentEnergy.map(option => (
                <button
                  key={option.id}
                  className={`filter-option ${filters.parentEnergy === option.id ? 'selected' : ''}`}
                  onClick={() => handleFilterChange('parentEnergy', option.id)}
                >
                  <span className="option-emoji">{option.emoji}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 아이 컨디션 */}
          <div className="filter-group">
            <h3>아이 컨디션</h3>
            <div className="filter-options">
              {filterOptions.childCondition.map(option => (
                <button
                  key={option.id}
                  className={`filter-option ${filters.childCondition === option.id ? 'selected' : ''}`}
                  onClick={() => handleFilterChange('childCondition', option.id)}
                >
                  <span className="option-emoji">{option.emoji}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 환경 */}
          <div className="filter-group">
            <h3>환경</h3>
            <div className="filter-options">
              {filterOptions.environment.map(option => (
                <button
                  key={option.id}
                  className={`filter-option ${filters.environment === option.id ? 'selected' : ''}`}
                  onClick={() => handleFilterChange('environment', option.id)}
                >
                  <span className="option-emoji">{option.emoji}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 주차 */}
          <div className="filter-group">
            <h3>주차</h3>
            <div className="filter-options">
              {filterOptions.parking.map(option => (
                <button
                  key={option.id}
                  className={`filter-option ${filters.parking === option.id ? 'selected' : ''}`}
                  onClick={() => handleFilterChange('parking', option.id)}
                >
                  <span className="option-emoji">{option.emoji}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 카페 */}
          <div className="filter-group">
            <h3>카페</h3>
            <div className="filter-options">
              {filterOptions.cafe.map(option => (
                <button
                  key={option.id}
                  className={`filter-option ${filters.cafe === option.id ? 'selected' : ''}`}
                  onClick={() => handleFilterChange('cafe', option.id)}
                >
                  <span className="option-emoji">{option.emoji}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 필터 초기화 버튼 */}
          {hasActiveFilters() && (
            <button className="reset-filters-btn" onClick={resetFilters}>
              필터 초기화
            </button>
          )}
        </div>
      )}

      {/* 검색 결과 */}
      <div className="search-results">
        {searchResults.length > 0 && (
          <>
            <div className="results-header">
              <h3>총 {searchResults.length}개의 장소</h3>
            </div>
            <div className="results-grid">
              {searchResults.map(place => (
                <PlaceCard 
                  key={place.id} 
                  place={place}
                  onClick={() => navigate(`/place/${place.id}`)}
                />
              ))}
            </div>
          </>
        )}

        {searchResults.length === 0 && (searchMode === 'ai' ? searchQuery : hasActiveFilters()) && (
          <div className="empty-results">
            <p>조건에 맞는 장소를 찾지 못했어요 😢</p>
            <p>다른 조건으로 검색해보세요!</p>
          </div>
        )}

        {searchResults.length === 0 && searchMode === 'filter' && !hasActiveFilters() && (
          <div className="filter-prompt">
            <h3>🔍 원하는 조건을 선택해주세요!</h3>
            <p>부모님의 에너지와 아이 컨디션부터 시작해보세요</p>
          </div>
        )}

        {searchMode === 'ai' && !searchQuery && (
          <div className="filter-prompt">
            <h3>🔍 검색어를 입력해주세요!</h3>
            <p>장소명, 주소, 카테고리로 검색할 수 있어요</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;