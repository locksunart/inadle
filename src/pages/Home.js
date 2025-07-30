import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaSearch, FaStar, FaEye, FaFire } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { dbHelpers, supabase } from '../services/supabase';
import { geminiSearchService } from '../services/geminiSearch';
import { getAgeFromBirthDate, calculateMonths } from '../utils/ageCalculator';
import PlaceCard from '../components/PlaceCard';
import './Home.css';

function Home() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnergy, setSelectedEnergy] = useState('보통'); // 부모 에너지
  const [selectedCondition, setSelectedCondition] = useState('보통'); // 아이 컨디션
  const [sortBy, setSortBy] = useState('인기순'); // 정렬 조건 - 기본을 인기순으로 변경
  const [searchMode, setSearchMode] = useState('filter'); // 'filter' 또는 'keyword'
  const [showDetailFilter, setShowDetailFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
  
  // 상세 필터 상태
  const [filters, setFilters] = useState({
    environment: '모두', // 실내/실외/모두
    theme: '모두', // 테마
    parking: '상관없음', // 주차
    cafe: '상관없음', // 카페
    travelTime: '1시간 이내', // 이동 시간
    stayTime: '1시간 내외', // 체류 시간
    cost: '상관없음', // 비용
    hideRecent: false // 최근 30일 이내 방문한 곳 숨기기
  });

  // 연령 계산이 이미 유틸리티에 있으므로 삭제

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setLoading(true);
        console.log('📊 장소 데이터 로딩 시작...');
        
        // 임시: 조건 없이 모든 places 가져오기
        const { data, error } = await supabase
          .from('places')
          .select(`
            *,
            place_details(*),
            place_amenities(*),
            place_tips(*)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase 쿼리 오류:', error);
          throw error;
        }
        
        console.log('Raw data from Supabase:', data);
        console.log('✅ 장소 데이터 로딩 완료:', data?.length || 0, '개');
        
        if (data && data.length > 0) {
          console.log('📋 첫 번째 장소 샘플:', data[0]);
        }
        
        // 추천 점수 계산
        const placesWithScore = data.map(place => {
          let score = place.popularity_score || 0;
          
          // 아이 연령 기반 추천 점수 추가
          // 다중 아이 지원
          if (userProfile?.children && userProfile.children.length > 0) {
            let totalScore = 0;
            let count = 0;
            
            userProfile.children.forEach(child => {
              const [year, month] = child.birthDate.split('-').map(Number);
              const birthDate = new Date(year, month - 1);
              const today = new Date();
              const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
              
              let ageField = '';
              
              // 연령대별 평점 필드 결정
              if (months <= 12) ageField = 'age_0_12_months';
              else if (months <= 24) ageField = 'age_12_24_months';
              else if (months <= 48) ageField = 'age_24_48_months';
              else if (months <= 72) ageField = 'age_over_48_months';
              else if (months <= 108) ageField = 'age_elementary_low';
              else ageField = 'age_elementary_high';
              
              const ageScore = place.place_details?.[ageField] || 0;
              if (ageScore > 0) {
                totalScore += ageScore;
                count++;
              }
            });
            
            if (count > 0) {
              score += (totalScore / count) * 10;
            }
          }
          // 기존 단일 아이 데이터 지원
          else if (userProfile?.child_birth_date) {
            const months = calculateMonths(userProfile.child_birth_date);
            let ageField = '';
            
            if (months <= 12) ageField = 'age_0_12_months';
            else if (months <= 24) ageField = 'age_12_24_months';
            else if (months <= 48) ageField = 'age_24_48_months';
            else if (months <= 72) ageField = 'age_over_48_months';
            else if (months <= 108) ageField = 'age_elementary_low';
            else ageField = 'age_elementary_high';
            
            const ageScore = place.place_details?.[ageField] || 0;
            score += ageScore * 10;
          }
          
          return { ...place, recommendScore: score };
        });
        
        setPlaces(placesWithScore);
      } catch (error) {
        console.error('장소 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlaces();
  }, [userProfile]);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // 검색 함수 - Gemini API 활용
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    
    try {
      const results = await geminiSearchService.searchPlaces(searchQuery, places);
      setSearchResults(results);
      
      if (results.length === 0) {
        window.alert('조건에 맞는 장소를 찾을 수 없어요. 다른 키워드로 시도해보세요.');
        return;
      }
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchError('검색 중 오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 초기화
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
  };

  // 필터링 및 정렬된 결과
  const filteredAndSortedPlaces = useMemo(() => {
    // 검색 결과가 있으면 검색 결과 사용
    if (searchResults.length > 0) {
      return searchResults;
    }
    
    let filtered = [...places];
    
    // 1. 환경 필터 (실내/실외)
    if (filters.environment !== '모두') {
      filtered = filtered.filter(place => {
        if (filters.environment === '실내') {
          return place.is_indoor === true;
        } else if (filters.environment === '실외') {
          return place.is_indoor === false;
        }
        return true;
      });
    }
    
    // 2. 주차 필터
    if (filters.parking === '필수') {
      filtered = filtered.filter(place => 
        place.place_amenities?.parking_available === true
      );
    }
    
    // 3. 카페 필터
    if (filters.cafe === '필수') {
      filtered = filtered.filter(place => 
        place.place_amenities?.has_cafe === true
      );
    }
    
    // 4. 비용 필터
    if (filters.cost === '무료') {
      filtered = filtered.filter(place => 
        place.place_details?.is_free === true
      );
    }
    
    // 5. 체류 시간 필터
    if (filters.stayTime !== '1시간 내외') {
      filtered = filtered.filter(place => {
        const duration = place.place_details?.recommended_duration;
        if (!duration) return true;
        
        switch(filters.stayTime) {
          case '2~3시간':
            return duration.includes('2') || duration.includes('3시간');
          case '반나절':
            return duration.includes('4시간') || duration.includes('5시간');
          case '종일':
            return duration.includes('종일') || duration.includes('6시간');
          default:
            return true;
        }
      });
    }
    
    // 6. 부모 에너지 필터 활성화
    if (selectedEnergy) {
      filtered = filtered.filter(place => {
        const energyMap = {
          '낮음': 'parent_energy_low',
          '보통': 'parent_energy_medium', 
          '높음': 'parent_energy_high'
        };
        const energyField = energyMap[selectedEnergy];
        const energyScore = place.place_details?.[energyField] || 0;
        
        // 부모 에너지에 따른 임계값 적용
        if (selectedEnergy === '높음') {
          return energyScore >= 2; // 2점 이상 (체력 좋을 때는 웬만한 곳 다 가능)
        } else if (selectedEnergy === '보통') {
          return energyScore >= 3; // 3점 이상 (적당히 편한 곳)
        } else { // '낮음'
          return energyScore >= 4; // 4점 이상 (정말 편한 곳만)
        }
      });
    }
    
    console.log('🔍 부모 에너지 필터 후:', filtered.length, '개 남음');
    
    // 7. 아이 컨디션 필터 활성화
    if (selectedCondition) {
      filtered = filtered.filter(place => {
        const conditionMap = {
          '보통': 'child_condition_good',
          '저조함': 'child_condition_tired'
        };
        const conditionField = conditionMap[selectedCondition];
        const conditionScore = place.place_details?.[conditionField] || 0;
        return conditionScore >= 4; // 4점 이상만
      });
    }
    
    console.log('🔍 아이 컨디션 필터 후:', filtered.length, '개 남음');
    
    // 각 장소에 대해 예상 평점 계산 (5점 만점)
    filtered = filtered.map(place => {
      let expectedRating = 0;
      
      // 다중 아이 지원
      if (userProfile?.children && userProfile.children.length > 0) {
        let totalRating = 0;
        let count = 0;
        
        userProfile.children.forEach(child => {
          const [year, month] = child.birthDate.split('-').map(Number);
          const birthDate = new Date(year, month - 1);
          const today = new Date();
          const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
          
          let ageField = '';
          
          // 연령대별 평점 필드 결정
          if (months <= 12) ageField = 'age_0_12_months';
          else if (months <= 24) ageField = 'age_12_24_months';
          else if (months <= 48) ageField = 'age_24_48_months';
          else if (months <= 72) ageField = 'age_over_48_months';
          else if (months <= 108) ageField = 'age_elementary_low';
          else ageField = 'age_elementary_high';
          
          const ageRating = place.place_details?.[ageField] || 0;
          if (ageRating > 0) {
            totalRating += ageRating;
            count++;
          }
        });
        
        expectedRating = count > 0 ? totalRating / count : 0;
        
        // 디버깅: 첫 번째 장소의 정보 출력 (다중 아이)
        if (place.id === filtered[0]?.id) {
          console.log('예상평점 계산 디버깅 (다중 아이):', {
            placeName: place.name,
            children: userProfile.children,
            totalRating,
            count,
            expectedRating
          });
        }
      }
      // 기존 단일 아이 데이터 지원
      else if (userProfile?.child_birth_date) {
        const months = calculateMonths(userProfile.child_birth_date);
        let ageField = '';
        
        // 연령대별 평점 필드 결정
        if (months <= 12) ageField = 'age_0_12_months';
        else if (months <= 24) ageField = 'age_12_24_months';
        else if (months <= 48) ageField = 'age_24_48_months';
        else if (months <= 72) ageField = 'age_over_48_months';
        else if (months <= 108) ageField = 'age_elementary_low';
        else ageField = 'age_elementary_high';
        
        expectedRating = place.place_details?.[ageField] || 0;
        
        // 디버깅: 첫 번째 장소의 정보 출력
        if (place.id === filtered[0]?.id) {
          console.log('예상평점 계산 디버깅:', {
            placeName: place.name,
            months,
            ageField,
            place_details: place.place_details,
            expectedRating
          });
        }
      } else {
        // 아이 정보가 없으면 기본값 사용 (만 2-4세 기준)
        expectedRating = place.place_details?.age_24_48_months || 0;
      }
      
      return {
        ...place,
        expectedRating: parseFloat(expectedRating.toFixed(1)) // 소수점 첫째 자리까지
      };
    });
    
    // 정렬
    console.log('정렬 전 첫 3개 장소:', filtered.slice(0, 3).map(p => ({
      name: p.name,
      expectedRating: p.expectedRating
    })));
    
    switch (sortBy) {
      case '연령맞춤순':
        filtered.sort((a, b) => (b.expectedRating || 0) - (a.expectedRating || 0));
        // 디버깅: 정렬 후 첫 5개 장소 확인
        console.log('연령맞춤순 정렬 결과 (Top 5):', filtered.slice(0, 5).map(p => ({
          name: p.name,
          expectedRating: p.expectedRating
        })));
        break;
      case '거리순':
        // 실제로는 사용자 위치 기반 거리 계산 필요
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case '인기순':
        // 인기도 = 방문 횟수 + 째 수 + 최근 리뷰 수
        filtered.sort((a, b) => {
          const aPopularity = (a.visit_count || 0) * 0.5 + (a.saved_count || 0) * 0.3 + (a.recent_reviews || 0) * 0.2;
          const bPopularity = (b.visit_count || 0) * 0.5 + (b.saved_count || 0) * 0.3 + (b.recent_reviews || 0) * 0.2;
          return bPopularity - aPopularity;
        });
        break;
      default:
        break;
    }
    
    // 디버깅: 필터링 결과 로그
    console.log('🔍 필터링 디버깅:', {
      originalCount: places.length,
      filteredCount: filtered.length,
      selectedEnergy,
      selectedCondition,
      sortBy,
      filters
    });
    
    return filtered; // 모든 장소 표시
  }, [places, selectedEnergy, selectedCondition, sortBy, userProfile, searchResults, filters]);

  const handleFilterApply = () => {
    setShowDetailFilter(false);
    // 필터가 이미 filteredAndSortedPlaces에서 적용되므로 모달만 닫으면 됨
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '좋은 밤이에요';
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    if (hour < 22) return '좋은 저녁이에요';
    return '좋은 밤이에요';
  };

  const getChildrenInfo = () => {
    // 다중 아이 지원
    if (userProfile?.children && userProfile.children.length > 0) {
      if (userProfile.children.length === 1) {
        const child = userProfile.children[0];
        const age = getAgeFromBirthDate(child.birthDate);
        return `${age} 아이와 함께`;
      } else {
        const ages = userProfile.children.map(child => getAgeFromBirthDate(child.birthDate));
        const ageText = ages.join(', ');
        return `${ageText}의 아이와 함께`;
      }
    }
    // 기존 단일 아이 데이터 지원
    else if (userProfile?.child_birth_date) {
      const age = getAgeFromBirthDate(userProfile.child_birth_date);
      return `${age} 아이와 함께`;
    }
    
    return ''; // 아이 정보가 없으면 빈 문자열 반환
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-state">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>멋진 나들이 장소를 찾고 있어요...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* 상단 헤더 영역 */}
      <div className="home-header">
        <div className="home-logo">
          <span className="logo-icon">🌸</span>
          <span className="logo-text">아이나들</span>
        </div>
        <button 
          className="user-email-chip" 
          onClick={() => navigate('/profile')}
        >
          {user?.email}
        </button>
      </div>
      
      {/* 기존 홈 스타일 인사말 섹션 */}
      <div className="greeting-section">
        <h1>{getGreeting()}, 엄마! 👋</h1>
        <p>
          {getChildrenInfo() ? 
            `${getChildrenInfo()} 어디로 나들이 갈까요?` : 
            '어디로 나들이 갈까요?'
          }
        </p>
      </div>

      <div className="home-content">
        {/* 내 위치 */}
        <div className="location-section">
          <div className="location-display">
            <FaMapMarkerAlt className="location-icon" />
            <span>내 위치</span>
          </div>
        </div>

        {/* 위치 설정하기 버튼 */}
        <button className="location-set-btn">
          위치 설정하기
        </button>

        {/* 부모 에너지 & 아이 컨디션 */}
        <div className="condition-section">
          <div className="condition-group">
            <h3>부모 에너지</h3>
            <div className="condition-options">
              {['😴 낮음', '😊 보통', '💪 높음'].map((energy) => (
                <button
                  key={energy}
                  className={`condition-btn ${selectedEnergy === energy.split(' ')[1] ? 'active' : ''}`}
                  onClick={() => setSelectedEnergy(energy.split(' ')[1])}
                >
                  {energy}
                </button>
              ))}
            </div>
          </div>

          <div className="condition-group">
            <h3>아이 컨디션</h3>
            <div className="condition-options">
              {['😊 보통', '😴 저조함'].map((condition) => (
                <button
                  key={condition}
                  className={`condition-btn ${selectedCondition === condition.split(' ')[1] ? 'active' : ''}`}
                  onClick={() => setSelectedCondition(condition.split(' ')[1])}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 빠른 검색 버튼들 */}
        <div className="quick-search-section">
          <div className="quick-search-row">
            <button className="quick-search-btn parent-energy" onClick={() => setShowDetailFilter(true)}>
              <span className="emoji">⚙️</span>
              <span>필터 검색</span>
            </button>
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="비오는날 5살 아이랑 편한 나들이"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              {isSearching ? (
                <div className="search-loading">검색 중...</div>
              ) : searchQuery && (
                <button className="clear-search" onClick={clearSearch}>
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 검색 오류 메시지 */}
        {searchError && (
          <div className="search-error">
            <p>{searchError}</p>
          </div>
        )}

        {/* 총 장소 수 & 정렬 */}
        <div className="results-header">
          <span className="total-count">총 {filteredAndSortedPlaces.length}개의 장소</span>
          <div className="sort-options">
            {[
              { label: '⭐ 연령맞춤순', value: '연령맞춤순', requiresChild: true },
              { label: '📍 거리순', value: '거리순', requiresChild: false },
              { label: '🔥 인기순', value: '인기순', requiresChild: false }
            ].map((sort) => {
              // 다중 아이 또는 단일 아이 정보 체크
              const hasChildInfo = (userProfile?.children && userProfile.children.length > 0) || userProfile?.child_birth_date;
              const isDisabled = sort.requiresChild && !hasChildInfo;
              return (
                <button
                  key={sort.value}
                  className={`sort-btn ${sortBy === sort.value ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => !isDisabled && setSortBy(sort.value)}
                  disabled={isDisabled}
                >
                  {sort.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 장소 목록 */}
        <div className="places-list">
          {filteredAndSortedPlaces.length === 0 ? (
            <div className="empty-state">
              <p>조건에 맞는 장소가 없어요 😢</p>
              <p>다른 조건으로 검색해보세요!</p>
            </div>
          ) : (
            filteredAndSortedPlaces.map(place => (
              <PlaceCard 
                key={place.id} 
                place={place}
                userProfile={userProfile}
                onClick={() => navigate(`/place/${place.id}`)}
              />
            ))
          )}
        </div>
      </div>

      {/* 상세 필터 모달 */}
      {showDetailFilter && (
        <div className="filter-modal-overlay" onClick={() => setShowDetailFilter(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="filter-header">
              <button onClick={() => setShowDetailFilter(false)}>←</button>
              <h2>상세 필터</h2>
              <button className="filter-reset" onClick={() => setFilters({
                environment: '모두',
                theme: '모두', 
                parking: '상관없음',
                cafe: '상관없음',
                travelTime: '1시간 이내',
                stayTime: '1시간 내외',
                cost: '상관없음',
                hideRecent: false
              })}>초기화</button>
            </div>

            <div className="filter-content">
              {/* 부모 에너지 */}
              <div className="filter-group">
                <h3>부모 에너지</h3>
                <div className="filter-options">
                  {['😴 낮음', '😊 보통', '💪 높음'].map((energy) => (
                    <button 
                      key={energy} 
                      className={`filter-option ${selectedEnergy === energy.split(' ')[1] ? 'active' : ''}`}
                      onClick={() => setSelectedEnergy(energy.split(' ')[1])}
                    >
                      {energy}
                    </button>
                  ))}
                </div>
              </div>

              {/* 아이 컨디션 */}
              <div className="filter-group">
                <h3>아이 컨디션</h3>
                <div className="filter-options">
                  {['😊 보통', '😴 저조함'].map((condition) => (
                    <button 
                      key={condition} 
                      className={`filter-option ${selectedCondition === condition.split(' ')[1] ? 'active' : ''}`}
                      onClick={() => setSelectedCondition(condition.split(' ')[1])}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              {/* 환경 */}
              <div className="filter-group">
                <h3>환경</h3>
                <div className="filter-options">
                  {['실내', '실외', '모두'].map((env) => (
                    <button 
                      key={env} 
                      className={`filter-option ${filters.environment === env ? 'active' : ''}`}
                      onClick={() => setFilters({...filters, environment: env})}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* 주차 */}
              <div className="filter-group">
                <h3>주차</h3>
                <div className="filter-options">
                  {['필수', '상관없음'].map((parking) => (
                    <button 
                      key={parking} 
                      className={`filter-option ${filters.parking === parking ? 'active' : ''}`}
                      onClick={() => setFilters({...filters, parking: parking})}
                    >
                      {parking}
                    </button>
                  ))}
                </div>
              </div>

              {/* 카페 */}
              <div className="filter-group">
                <h3>카페</h3>
                <div className="filter-options">
                  {['필수', '상관없음'].map((cafe) => (
                    <button 
                      key={cafe} 
                      className={`filter-option ${filters.cafe === cafe ? 'active' : ''}`}
                      onClick={() => setFilters({...filters, cafe: cafe})}
                    >
                      {cafe}
                    </button>
                  ))}
                </div>
              </div>

              {/* 이동 시간 */}
              <div className="filter-group">
                <h3>이동 시간</h3>
                <div className="filter-options">
                  {['15분 이내', '30분 이내', '1시간 이내', '1시간 이상'].map((time) => (
                    <button 
                      key={time} 
                      className={`filter-option ${filters.travelTime === time ? 'active' : ''}`}
                      onClick={() => setFilters({...filters, travelTime: time})}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* 예상 체류 시간 */}
              <div className="filter-group">
                <h3>예상 체류 시간</h3>
                <div className="filter-options">
                  {['1시간 내외', '2~3시간', '반나절', '종일'].map((stay) => (
                    <button 
                      key={stay} 
                      className={`filter-option ${filters.stayTime === stay ? 'active' : ''}`}
                      onClick={() => setFilters({...filters, stayTime: stay})}
                    >
                      {stay}
                    </button>
                  ))}
                </div>
              </div>

              {/* 비용 */}
              <div className="filter-group">
                <h3>비용</h3>
                <div className="filter-options">
                  {['무료', '상관없음'].map((cost) => (
                    <button 
                      key={cost} 
                      className={`filter-option ${filters.cost === cost ? 'active' : ''}`}
                      onClick={() => setFilters({...filters, cost: cost})}
                    >
                      {cost}
                    </button>
                  ))}
                </div>
              </div>

              {/* 최근 방문 숨기기 */}
              <div className="filter-group">
                <label className="checkbox-option">
                  <input 
                    type="checkbox" 
                    checked={filters.hideRecent}
                    onChange={(e) => setFilters({...filters, hideRecent: e.target.checked})}
                  />
                  최근 30일 이내 방문한 곳 숨기기 (30일 이내)
                </label>
              </div>
            </div>

            <button className="apply-filter-btn" onClick={handleFilterApply}>
              필터 적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
