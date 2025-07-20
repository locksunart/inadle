import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaGlobe, FaInstagram, FaClock, FaWonSign, FaHeart, FaShare, FaParking, FaBaby, FaCoffee, FaWheelchair, FaToilet, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { dbHelpers } from '../services/supabase';
import { calculateMonths } from '../utils/ageCalculator';
import Header from '../components/Header';
import './PlaceDetail.css';

function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    loadPlaceDetail();
    checkIfSaved();
  }, [id, user]);

  const loadPlaceDetail = async () => {
    try {
      setLoading(true);
      const data = await dbHelpers.places.getById(id);
      setPlace(data);
    } catch (error) {
      console.error('장소 정보 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!user) return;
    
    try {
      const savedPlaces = await dbHelpers.users.getSavedPlaces(user.id);
      setIsSaved(savedPlaces.some(item => item.place_id === id));
    } catch (error) {
      console.error('찜 상태 확인 오류:', error);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 중복 클릭 방지
    if (isSaving) return;
    setIsSaving(true);

    try {
      const newSavedState = await dbHelpers.users.toggleSavedPlace(user.id, id);
      setIsSaved(newSavedState);
      
      // 간단한 피드백만 제공
      if (newSavedState) {
        // 찜하기 성공 시 짧은 피드백
        console.log('찜 목록에 추가됨');
      } else {
        // 찜 해제 시 짧은 피드백
        console.log('찜 목록에서 제거됨');
      }
    } catch (error) {
      console.error('찜하기 오류:', error);
      alert('오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: `${place.name} - 아이나들 추천 장소`,
        url: window.location.href,
      });
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었어요! 📋');
    }
  };

  const handleAddressClick = () => {
    const address = encodeURIComponent(place.address);
    const name = encodeURIComponent(place.name);
    
    // 모바일 디바이스 감지
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 모바일에서는 카카오맵 우선 시도
      const kakaoMapUrl = `kakaomap://search?q=${address}`;
      const naverMapUrl = `nmap://search?query=${address}`;
      const googleMapUrl = `https://maps.google.com/maps?q=${address}`;
      
      // 사용자에게 선택권 제공
      const userChoice = window.confirm('어떤 지도 앱으로 열까요?\n\n확인: 카카오맵\n취소: 네이버맵');
      
      if (userChoice) {
        // 카카오맵 시도
        try {
          window.location.href = kakaoMapUrl;
        } catch (error) {
          // 실패하면 구글맵
          window.open(googleMapUrl, '_blank');
        }
      } else {
        // 네이버맵 시도
        try {
          window.location.href = naverMapUrl;
        } catch (error) {
          // 실패하면 구글맵
          window.open(googleMapUrl, '_blank');
        }
      }
    } else {
      // 데스크톱에서는 구글맵으로
      const googleMapUrl = `https://maps.google.com/maps?q=${address}`;
      window.open(googleMapUrl, '_blank');
    }
  };

  const getAgeGroupLabel = (key) => {
    const labels = {
      'age_0_12_months': '0~12개월',
      'age_12_24_months': '12~24개월',
      'age_24_48_months': '2~4세',
      'age_over_48_months': '4세 이상',
      'age_elementary_low': '초등 저학년',
      'age_elementary_high': '초등 고학년'
    };
    return labels[key] || '';
  };

  // 사용자 아이의 연령대에 해당하는 적합도만 가져오기
  const getUserChildrenAgeGroups = () => {
    let allAgeGroups = [];
    
    // 다중 아이 지원
    if (userProfile?.children && Array.isArray(userProfile.children)) {
      userProfile.children.forEach(child => {
        const months = calculateMonthsFromBirthDate(child.birthDate);
        let ageKey = getAgeKeyFromMonths(months);
        
        allAgeGroups.push({
          key: ageKey,
          label: getAgeGroupLabel(ageKey),
          childName: child.name,
          months: months
        });
      });
    }
    // 기존 단일 아이 데이터 지원 (호환성)
    else if (userProfile?.child_birth_date) {
      const months = calculateMonths(userProfile.child_birth_date);
      let ageKey = getAgeKeyFromMonths(months);
      let childName = userProfile.child_name || '우리 아이';
      
      allAgeGroups.push({
        key: ageKey,
        label: getAgeGroupLabel(ageKey),
        childName: childName,
        months: months
      });
    }

    return allAgeGroups;
  };

  // 생년월 문자열에서 월 수 계산
  const calculateMonthsFromBirthDate = (birthDateString) => {
    const today = new Date();
    const [year, month] = birthDateString.split('-').map(Number);
    const birthDate = new Date(year, month - 1);
    return (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
  };

  // 월 수에서 연령대 키 결정
  const getAgeKeyFromMonths = (months) => {
    if (months <= 12) return 'age_0_12_months';
    else if (months <= 24) return 'age_12_24_months';
    else if (months <= 48) return 'age_24_48_months';
    else if (months <= 72) return 'age_over_48_months';
    else if (months <= 108) return 'age_elementary_low';
    else return 'age_elementary_high';
  };

  // 상세 설명 생성 (간결하게)
  const getDetailedDescription = () => {
    // 데이터베이스의 description 필드 사용
    return place.description || '아이와 함께 좋은 시간을 보낼 수 있는 가족 친화적인 공간입니다.';
  };

  // 연령별 태그 개선
  const getAgeSpecificTags = (ageKey) => {
    const tagsByPlace = {
      '국립중앙과학관': {
        'age_24_48_months': ['과학 체험', '물놀이 시설'],
        'age_12_24_months': ['안전 놀이공간', '수유실 완비']
      },
      '대전어린이회관': {
        'age_24_48_months': ['역할놀이 체험', '창의력 발달'],
        'age_12_24_months': ['안전한 실내놀이', '부모동반 가능']
      },
      '한밭수목원': {
        'age_24_48_months': ['자연 학습', '넓은 활동 공간'],
        'age_12_24_months': ['유모차 산챙', '자연 친화적']
      }
    };
    
    const defaultTags = {
      'age_24_48_months': ['대형 놀이시설', '안전한 놀이기구'],
      'age_12_24_months': ['안전 시설', '편의시설 완비']
    };
    
    return tagsByPlace[place.name]?.[ageKey] || defaultTags[ageKey] || ['연령 적합', '가족 친화적'];
  };

  if (loading) {
    return (
      <div className="place-detail-container">
        <Header />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>장소 정보를 불러오고 있어요...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="place-detail-container">
        <Header />
        <div className="error-state">
          <p>장소를 찾을 수 없어요 😢</p>
          <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
        </div>
      </div>
    );
  }

  const details = place.place_details;
  const amenities = place.place_amenities;

  return (
    <div className="place-detail-container">
      <Header />
      
      <div className="place-detail-content">
        {/* 헤더 섹션 */}
        <section className="detail-header">
          <div className="header-info">
            <span className="category-badge">{place.category}</span>
            <h1>{place.name}</h1>
            <div className="location-info" onClick={handleAddressClick}>
              <FaMapMarkerAlt />
              <span className="address-link">{place.address}</span>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className={`action-btn save-btn ${isSaved ? 'saved' : ''} ${isSaving ? 'saving' : ''}`}
              onClick={handleSaveToggle}
              disabled={isSaving}
            >
              <FaHeart className={isSaved ? 'heart-filled' : 'heart-empty'} />
              <span>{isSaving ? '처리중...' : (isSaved ? '찜했어요' : '찜하기')}</span>
            </button>
            <button className="action-btn share-btn" onClick={handleShare}>
              <FaShare />
              <span>공유</span>
            </button>
          </div>
        </section>

        {/* 탭 네비게이션 */}
        <nav className="detail-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            기본 정보
          </button>
          <button 
            className={`tab-btn ${activeTab === 'amenities' ? 'active' : ''}`}
            onClick={() => setActiveTab('amenities')}
          >
            편의시설
          </button>
          <button 
          className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`}
          onClick={() => setActiveTab('tips')}
          >
          맘팁
          </button>
          <button 
            className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            행사/프로그램
          </button>
        </nav>

        {/* 탭 컨텐츠 */}
        <div className="tab-content">
          {activeTab === 'info' && (
            <div className="info-content">
              {/* 기본 소개 */}
              <div className="info-section">
                <h3>어떤 곳인가요?</h3>
                <div className="place-intro">
                  {getDetailedDescription()}
                </div>
              </div>

              {/* 연령별 적합도 */}
              <div className="info-section">
                <h3>연령 적합도</h3>
                {getUserChildrenAgeGroups().length > 0 ? (
                  <div className="age-suitability">
                    {getUserChildrenAgeGroups().map(({ key, label, childName }) => {
                      const rating = details?.[key] || 0;
                      return (
                        <div key={key} className="age-suitability-item">
                          <div className="age-info">
                            <span className="age-label">{childName} ({label})</span>
                            <div className="rating-info">
                              <div className="rating-stars">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <span 
                                    key={i} 
                                    className={`star ${i < Math.floor(rating) ? 'filled' : i < rating ? 'half' : 'empty'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="rating-number">{rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="suitability-tags">
                            {getAgeSpecificTags(key).map((tag, index) => (
                              <span key={index} className={`tag ${index === 0 ? 'primary' : 'secondary'}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-child-age-info">
                    <p>아이 정보를 등록하시면 연령 적합도를 확인할 수 있어요!</p>
                    <button 
                      onClick={() => navigate('/profile')} 
                      className="go-to-profile-btn"
                    >
                      내 정보에서 아이 정보 등록하기
                    </button>
                  </div>
                )}
              </div>

              {/* 운영 정보 */}
              <div className="info-section">
                <h3>운영 정보</h3>
                <div className="info-list">
                  {place.operating_hours && (
                    <div className="info-item">
                      <FaClock />
                      <div>
                        <strong>운영시간</strong>
                        <p>평일: 09:30 - 17:50</p>
                        {place.holiday_info && <p className="holiday-info">휴무: {place.holiday_info}</p>}
                      </div>
                    </div>
                  )}
                  
                  {place.phone && (
                    <div className="info-item">
                      <FaPhone />
                      <div>
                        <strong>전화번호</strong>
                        <p>{place.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {place.homepage && (
                    <div className="info-item">
                      <FaGlobe />
                      <div>
                        <strong>홈페이지</strong>
                        <a href={place.homepage} target="_blank" rel="noopener noreferrer">
                          바로가기
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 이용 요금 */}
              <div className="info-section">
                <h3>이용 요금</h3>
                {details?.is_free ? (
                  <div className="free-notice">
                    <span className="free-badge">무료</span>
                    <p>무료로 이용할 수 있어요!</p>
                  </div>
                ) : (
                  <div className="price-info">
                    {details?.price_adult && <p>어른: {details.price_adult.toLocaleString()}원</p>}
                    {details?.price_child && <p>어린이: {details.price_child.toLocaleString()}원</p>}
                    {details?.price_toddler !== undefined && <p>영유아: {details.price_toddler === 0 ? '무료' : `${details.price_toddler.toLocaleString()}원`}</p>}
                    {details?.price_note && <p className="price-note">💡 {details.price_note}</p>}
                  </div>
                )}
              </div>

              {/* 주요 특징 */}
              {details?.highlights && details.highlights.length > 0 && (
                <div className="info-section">
                  <h3>주요 시설</h3>
                  <div className="highlights-list">
                    {details.highlights.map((highlight, index) => (
                      <div key={index} className="highlight-item">
                        <h4>{highlight.name}</h4>
                        <p>{highlight.description}</p>
                        {highlight.age_group && (
                          <div className="age-tags">
                            {highlight.age_group.map(age => (
                              <span key={age} className="age-tag">
                                {getAgeGroupLabel(`age_${age}`)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'amenities' && (
            <div className="amenities-content">
              <div className="amenities-grid">
                {/* 주차 정보 */}
                <div className="amenity-card">
                  <div className="amenity-header">
                    <FaParking />
                    <h3>주차</h3>
                  </div>
                  <div className="amenity-status">
                    {amenities?.parking_available ? (
                      <>
                        <span className="status-yes">가능</span>
                        {amenities.parking_free ? (
                          <span className="free-badge">무료</span>
                        ) : amenities.parking_fee && (
                          <span>시간당 {amenities.parking_fee.toLocaleString()}원</span>
                        )}
                      </>
                    ) : (
                      <span className="status-no">불가</span>
                    )}
                  </div>
                  {amenities?.parking_note && (
                    <p className="amenity-note">{amenities.parking_note}</p>
                  )}
                </div>

                {/* 수유실 */}
                <div className="amenity-card">
                  <div className="amenity-header">
                    <FaBaby />
                    <h3>수유실</h3>
                  </div>
                  <div className="amenity-status">
                    {amenities?.nursing_room ? (
                      <span className="status-yes">있음</span>
                    ) : (
                      <span className="status-no">없음</span>
                    )}
                  </div>
                  {amenities?.nursing_room_detail && (
                    <p className="amenity-note">{amenities.nursing_room_detail}</p>
                  )}
                </div>

                {/* 유아 변기 */}
                <div className="amenity-card">
                  <div className="amenity-header">
                    <FaToilet />
                    <h3>유아 변기</h3>
                  </div>
                  <div className="amenity-status">
                    {amenities?.kids_toilet ? (
                      <span className="status-yes">있음</span>
                    ) : (
                      <span className="status-no">없음</span>
                    )}
                  </div>
                  {amenities?.kids_toilet_detail && (
                    <p className="amenity-note">{amenities.kids_toilet_detail}</p>
                  )}
                </div>

                {/* 카페/식당 */}
                <div className="amenity-card">
                  <div className="amenity-header">
                    <FaCoffee />
                    <h3>카페/식당</h3>
                  </div>
                  <div className="amenity-status">
                    {amenities?.cafe_inside ? (
                      <span className="status-yes">있음</span>
                    ) : (
                      <span className="status-no">없음</span>
                    )}
                  </div>
                  {amenities?.cafe_detail && (
                    <p className="amenity-note">{amenities.cafe_detail}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="tips-content">
              {place.place_tips && place.place_tips.length > 0 ? (
                <div className="tips-list">
                  {/* 팁 헤더 */}
                  <div className="tips-header">
                    <h3>엄마들의 솔직한 후기 & 팁 💡</h3>
                    <p>진짜 가신 분들의 소중한 경험담을 확인해보세요!</p>
                  </div>

                  {/* 필터 칩스 */}
                  <div className="tip-categories">
                    <button className="category-chip active">#개꿔해요</button>
                    <button className="category-chip">#안전해요</button>
                    <button className="category-chip">#다양해요</button>
                    <button className="category-chip">#가성비</button>
                  </div>

                  {/* 팁 카드들 */}
                  {place.place_tips.map((tip) => (
                    <div key={tip.id} className="tip-card-new">
                      <div className="tip-meta">
                        <span className="tip-category-label">{getTipCategoryLabel(tip.tip_category)}</span>
                        <span className="tip-date">어제</span>
                      </div>
                      <p className="tip-content">{tip.content}</p>
                      <div className="tip-actions">
                        <button className="tip-like-btn">
                          👍 도움돼요 ({tip.likes_count || 0})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-tips">
                  <div className="empty-icon">😢</div>
                  <h4>아직 등록된 맘팁이 없어요</h4>
                  <p>첫 번째 맘팁을 남겨주세요!</p>
                  <button className="add-tip-btn">팁 남기기</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="events-content">
              {place.events && place.events.length > 0 ? (
                <div className="events-list">
                  {place.events.map((event) => (
                    <div key={event.id} className="event-card">
                      <div className="event-header">
                        <h4>{event.title}</h4>
                        <span className={`event-type ${event.event_type}`}>
                          {getEventTypeLabel(event.event_type)}
                        </span>
                      </div>
                      <p className="event-description">{event.description}</p>
                      <div className="event-info">
                        <p>📅 {formatEventDate(event.start_date, event.end_date)}</p>
                        {event.target_age_note && <p>👶 {event.target_age_note}</p>}
                        {event.is_free ? (
                          <p className="free-badge">무료</p>
                        ) : event.price && (
                          <p>💰 {event.price.toLocaleString()}원</p>
                        )}
                        {event.reservation_required && (
                          <p>📝 사전예약 필수</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-events">
                  <p>현재 진행 중인 행사가 없어요</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 헬퍼 함수들
function getTipHashtag(category) {
  const hashtags = {
    'visit_time': '방문시간',
    'parking': '주차팁',
    'food': '음식',
    'activity': '액티비티',
    'caution': '주의사항',
    'etc': '기타팁'
  };
  return hashtags[category] || '팁';
}

function getTipCategoryLabel(category) {
  const labels = {
    'visit_time': '⏰ 방문 시간',
    'parking': '🚗 주차',
    'food': '🍽️ 음식',
    'activity': '🎈 활동',
    'caution': '⚠️ 주의사항',
    'etc': '💡 기타'
  };
  return labels[category] || '💡 팁';
}

function getEventTypeLabel(type) {
  const labels = {
    'exhibition': '전시',
    'program': '프로그램',
    'performance': '공연',
    'workshop': '워크숍',
    'festival': '축제'
  };
  return labels[type] || '행사';
}

function formatEventDate(startDate, endDate) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  const formatDate = (date) => {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };
  
  if (!end || start.getTime() === end.getTime()) {
    return formatDate(start);
  }
  
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}

export default PlaceDetail;
