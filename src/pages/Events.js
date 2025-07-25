import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTicketAlt, FaChild, FaBook, FaTheaterMasks, FaGraduationCap, FaStar, FaUniversity, FaPalette, FaFlask, FaUsers, FaBaby, FaTree, FaRunning, FaCheck } from 'react-icons/fa';
import { dbHelpers } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import './Events.css';

function Events() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [activeEvents, setActiveEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current'); // 기본 탭을 '진행 중'으로 변경
  const [selectedThemes, setSelectedThemes] = useState(['all']); // 테마 선택 (복수)
  const [selectedInstitutions, setSelectedInstitutions] = useState(['all']); // 주최 기관 (복수)
  const [selectedChildren, setSelectedChildren] = useState([]); // 선택된 아이들

  // 테마 카테고리
  const themeCategories = [
    { value: 'all', label: '전체' },
    { value: '교육', label: '교육' },
    { value: '문화', label: '문화' },
    { value: '활동', label: '활동' }
  ];

  // 기관 유형 (기타기관 추가)
  const institutionTypes = [
    { value: 'library', label: '도서관', icon: <FaBook /> },
    { value: 'museum', label: '박물관', icon: <FaUniversity /> },
    { value: 'art_gallery', label: '미술관', icon: <FaPalette /> },
    { value: 'science_center', label: '과학관', icon: <FaFlask /> },
    { value: 'park', label: '공원/수목원', icon: <FaTree /> },
    { value: 'sports_center', label: '체육시설', icon: <FaRunning /> },
    { value: 'other', label: '기타기관', icon: <FaUsers /> }
  ];

  const toggleInstitution = (value) => {
    if (value === 'all') {
      // 전체 선택 시 다른 선택 모두 해제
      setSelectedInstitutions(['all']);
    } else {
      // 개별 항목 선택 시
      setSelectedInstitutions(prev => {
        // 전체가 선택되어 있었다면 해제
        const filtered = prev.filter(v => v !== 'all');
        
        if (filtered.includes(value)) {
          // 이미 선택된 항목이면 제거
          const newSelection = filtered.filter(v => v !== value);
          // 아무것도 선택되지 않으면 전체 선택
          return newSelection.length === 0 ? ['all'] : newSelection;
        } else {
          // 새로 선택
          return [...filtered, value];
        }
      });
    }
  };

  // 테마 토글 (복수 선택)
  const toggleTheme = (value) => {
    if (value === 'all') {
      // 전체 선택 시 다른 선택 모두 해제
      setSelectedThemes(['all']);
    } else {
      // 개별 항목 선택 시
      setSelectedThemes(prev => {
        // 전체가 선택되어 있었다면 해제
        const filtered = prev.filter(v => v !== 'all');
        
        if (filtered.includes(value)) {
          // 이미 선택된 항목이면 제거
          const newSelection = filtered.filter(v => v !== value);
          // 아무것도 선택되지 않으면 전체 선택
          return newSelection.length === 0 ? ['all'] : newSelection;
        } else {
          // 새로 선택
          return [...filtered, value];
        }
      });
    }
  };

  // 아이 선택 토글
  const toggleChild = (index) => {
    setSelectedChildren(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // getAgeGroup 함수를 먼저 정의
  const getAgeGroup = (months) => {
    if (months <= 12) return '0_12';
    if (months <= 24) return '13_24';
    if (months <= 48) return '24_48';
    if (months <= 72) return 'over_48';
    if (months <= 108) return 'elementary_low';
    return 'elementary_high';
  };

  // 자녀 연령 계산
  const childrenAges = useMemo(() => {
    if (!userProfile?.children) return [];
    
    return userProfile.children.map((child) => {
      // birthDate는 'YYYY-MM' 형식
      const [year, month] = child.birthDate ? child.birthDate.split('-') : [null, null];
      const birthYear = parseInt(year);
      const birthMonth = parseInt(month);
      
      // 유효성 검사
      if (isNaN(birthYear) || isNaN(birthMonth)) {
        return {
          nickname: child.name || '아이',
          ageMonths: 0,
          ageGroup: '0_12'
        };
      }
      
      const birthDate = new Date(birthYear, birthMonth - 1);
      const now = new Date();
      const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 
                      + (now.getMonth() - birthDate.getMonth());
      
      return {
        nickname: child.name || '아이',
        ageMonths: Math.max(0, ageMonths),
        ageGroup: getAgeGroup(Math.max(0, ageMonths))
      };
    });
  }, [userProfile]);

  useEffect(() => {
    loadEvents();
  }, [userProfile]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      console.log('행사 로드 시작...');
      
      // 모든 행사 로드
      const [active, upcoming] = await Promise.all([
        dbHelpers.events.getActive(),
        dbHelpers.events.getUpcoming()
      ]);
      
      console.log('진행 중인 행사:', active);
      console.log('예정된 행사:', upcoming);
      
      setActiveEvents(active);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('행사 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = (events) => {
    let filtered = events;
    
    // 아이 필터 (선택된 아이가 있을 때만)
    if (selectedChildren.length > 0) {
      filtered = filtered.filter(event => {
        if (!event.target_ages || event.target_ages.length === 0) return false;
        
        // 선택된 아이들 중 하나라도 해당하면 표시
        return selectedChildren.some(childIndex => {
          const child = childrenAges[childIndex];
          return child && event.target_ages.includes(child.ageGroup);
        });
      });
    }
    
    // 테마 필터 (전체가 아닐 때만)
    if (!selectedThemes.includes('all') && selectedThemes.length > 0) {
      filtered = filtered.filter(event => 
        selectedThemes.includes(event.main_category)
      );
    }
    
    // 기관 필터 (전체가 아닐 때만)
    if (!selectedInstitutions.includes('all') && selectedInstitutions.length > 0) {
      filtered = filtered.filter(event => {
        if (event.external_data_sources) {
          const sourceType = event.external_data_sources.source_type;
          // culture_center, learning_center, youth_center, childcare_center를 other로 통합
          if (['culture_center', 'learning_center', 'youth_center', 'childcare_center'].includes(sourceType)) {
            return selectedInstitutions.includes('other');
          }
          return selectedInstitutions.includes(sourceType);
        }
        return false;
      });
    }
    
    return filtered;
  };

  const formatEventDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    const options = { month: 'long', day: 'numeric' };
    const startStr = start.toLocaleDateString('ko-KR', options);
    
    if (!end || start.getTime() === end.getTime()) {
      return startStr;
    }
    
    const endStr = end.toLocaleDateString('ko-KR', options);
    return `${startStr} ~ ${endStr}`;
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      'exhibition': '전시',
      'program': '프로그램',
      'performance': '공연',
      'workshop': '워크숍',
      'festival': '축제'
    };
    return labels[type] || '행사';
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'exhibition': '#FF7F50',
      'program': '#4682B4',
      'performance': '#9370DB',
      'workshop': '#32CD32',
      'festival': '#FF69B4'
    };
    return colors[type] || '#808080';
  };

  const renderEventCard = (event) => (
    <div key={event.id} className="event-card">
      <div className="event-type-badge" style={{ backgroundColor: getEventTypeColor(event.event_type) }}>
        {getEventTypeLabel(event.event_type)}
      </div>
      
      <div className="event-content">
        <h3 className="event-title">{event.title}</h3>
        
        <div className="event-place">
          {event.external_data_sources ? (
            <>
              {event.external_data_sources.source_type === 'library' ? <FaBook /> : <FaTheaterMasks />}
              <span>{event.external_data_sources.source_name}</span>
            </>
          ) : (
            <>
              <FaMapMarkerAlt />
              <span>{event.places?.name}</span>
            </>
          )}
        </div>
        
        <p className="event-description">{event.description}</p>
        
        <div className="event-info-grid">
          <div className="event-info-item">
            <FaCalendarAlt />
            <span>{formatEventDate(event.start_date, event.end_date)}</span>
          </div>
          
          {event.time_slots && event.time_slots.length > 0 && (
            <div className="event-info-item">
              <FaClock />
              <span>{event.time_slots[0].times?.[0] || '시간 문의'}</span>
            </div>
          )}
          
          <div className="event-info-item">
            <FaTicketAlt />
            <span>{event.is_free ? '무료' : `${event.price?.toLocaleString() || '가격 문의'}원`}</span>
          </div>
          
          {event.target_ages && event.target_ages.length > 0 && (
            <div className="event-info-item">
              <FaChild />
              <span>{getAgeLabels(event.target_ages).join(', ')}</span>
            </div>
          )}
          
          {/* 등록 상태 표시 */}
          {event.registration_status && (
            <div className="event-info-item">
              <FaGraduationCap />
              <span className={`registration-status ${event.registration_status}`}>
                {getRegistrationStatusLabel(event.registration_status)}
              </span>
            </div>
          )}
        </div>
        
        {event.reservation_required && (
          <div className="reservation-notice">
            📝 사전 예약 필수
            {event.registration_start_date && (
              <span className="registration-date">
                {' '}(접수: {new Date(event.registration_start_date).toLocaleDateString('ko-KR')})
              </span>
            )}
          </div>
        )}
        
        <div className="event-actions">
          {event.place_id && (
            <button 
              onClick={() => navigate(`/place/${event.place_id}`)}
              className="place-link-btn"
            >
              장소 정보 보기
            </button>
          )}
          {(event.reservation_link || event.source_url) && (
            <a 
              href={event.reservation_link || event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="reservation-btn"
            >
              {event.source_url ? '자세히 보기' : '예약하기'}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const getAgeLabels = (ages) => {
    const labels = {
      '0_12': '0~12개월',
      '13_24': '13~24개월',
      '24_48': '2~4세',
      'over_48': '4세 이상',
      'elementary_low': '초등 저학년',
      'elementary_high': '초등 고학년'
    };
    return ages.map(age => labels[age] || age);
  };

  const getRegistrationStatusLabel = (status) => {
    const labels = {
      'upcoming': '접수 예정',
      'open': '접수 중',
      'closed': '접수 마감',
      'full': '정원 마감'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="events-container">
        <Header />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>행사 정보를 불러오고 있어요...</p>
        </div>
      </div>
    );
  }

  // 현재 탭에 따른 이벤트 선택
  let currentEvents;
  if (activeTab === 'current') {
    currentEvents = activeEvents;
  } else {
    currentEvents = upcomingEvents;
  }
  
  console.log('현재 탭:', activeTab);
  console.log('현재 이벤트:', currentEvents);
  console.log('선택된 테마:', selectedThemes);
  console.log('선택된 기관:', selectedInstitutions);
  console.log('선택된 아이들:', selectedChildren);
  
  const filteredEvents = filterEvents(currentEvents);
  console.log('필터링된 이벤트:', filteredEvents);

  return (
    <div className="events-container">
      <Header />
      
      <div className="events-content">
        <section className="events-header">
          <h1>이번 주 뭐하지? 🎪</h1>
          <p>우리 아이와 함께 즐길 수 있는 행사와 프로그램</p>
        </section>

        {/* 필터 */}
        <div className="event-filters-container">
          {/* 아이 선택 필터 */}
          {childrenAges.length > 0 && (
            <div className="filter-group">
              <label>아이 선택</label>
              <div className="filter-chips">
                {childrenAges.map((child, index) => {
                  const years = Math.floor(child.ageMonths / 12);
                  const months = child.ageMonths % 12;
                  const ageText = years > 0 ? `${years}세` : `${months}개월`;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => toggleChild(index)}
                      className={`filter-chip ${selectedChildren.includes(index) ? 'active' : ''}`}
                    >
                      {selectedChildren.includes(index) && <FaCheck />}
                      <FaChild />
                      {child.nickname} ({ageText})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* 주최 기관 필터 */}
          <div className="filter-group">
            <label>
              주최 기관
              {!selectedInstitutions.includes('all') && selectedInstitutions.length > 0 && (
                <span className="selected-count">{selectedInstitutions.length}개 선택</span>
              )}
            </label>
            <div className="filter-chips">
              {/* 전체 버튼 */}
              <button
                onClick={() => toggleInstitution('all')}
                className={`filter-chip ${selectedInstitutions.includes('all') ? 'active' : ''}`}
              >
                전체
              </button>
              
              {/* 기관 표시 */}
              {institutionTypes.map(institution => (
                <button
                  key={institution.value}
                  onClick={() => toggleInstitution(institution.value)}
                  className={`filter-chip ${selectedInstitutions.includes(institution.value) ? 'active' : ''}`}
                >
                  {selectedInstitutions.includes(institution.value) && !selectedInstitutions.includes('all') && <FaCheck />}
                  {institution.icon}
                  {institution.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 테마 선택 */}
          <div className="filter-group">
            <label>
              테마
              {!selectedThemes.includes('all') && selectedThemes.length > 0 && (
                <span className="selected-count">{selectedThemes.length}개 선택</span>
              )}
            </label>
            <div className="filter-chips">
              {themeCategories.map(theme => (
                <button
                  key={theme.value}
                  onClick={() => toggleTheme(theme.value)}
                  className={`filter-chip ${selectedThemes.includes(theme.value) ? 'active' : ''}`}
                >
                  {selectedThemes.includes(theme.value) && !selectedThemes.includes('all') && <FaCheck />}
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 - 필터와 목록 사이에 배치 */}
        <nav className="events-tabs">
          <button
            className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            진행 중 ({activeEvents.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            예정 ({upcomingEvents.length})
          </button>
        </nav>

        {/* 행사 목록 */}
        <div className="events-section">
          <div className="events-list-header">
            <h2>행사 목록 <span className="event-count">({filteredEvents.length})</span></h2>
          </div>
          <div className="events-list">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => renderEventCard(event))
            ) : (
              <div className="no-events">
                <p>조건에 맞는 행사가 없어요</p>
                {selectedChildren.length > 0 && (
                  <p className="no-events-hint">선택한 연령대에 맞는 행사가 없어요. 다른 필터를 조정해보세요.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Events;