import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTicketAlt, FaChild } from 'react-icons/fa';
import { dbHelpers } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import './Events.css';

function Events() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [activeEvents, setActiveEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [filterType, setFilterType] = useState('all');

  const eventTypes = [
    { value: 'all', label: '전체' },
    { value: 'exhibition', label: '전시' },
    { value: 'program', label: '프로그램' },
    { value: 'performance', label: '공연' },
    { value: 'workshop', label: '워크숍' },
    { value: 'festival', label: '축제' }
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [active, upcoming] = await Promise.all([
        dbHelpers.events.getActive(),
        dbHelpers.events.getUpcoming()
      ]);
      
      setActiveEvents(active);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('행사 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = (events) => {
    if (filterType === 'all') return events;
    return events.filter(event => event.event_type === filterType);
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
          <FaMapMarkerAlt />
          <span>{event.places.name}</span>
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
        </div>
        
        {event.reservation_required && (
          <div className="reservation-notice">
            📝 사전 예약 필수
          </div>
        )}
        
        <div className="event-actions">
          <button 
            onClick={() => navigate(`/place/${event.place_id}`)}
            className="place-link-btn"
          >
            장소 정보 보기
          </button>
          {event.reservation_link && (
            <a 
              href={event.reservation_link}
              target="_blank"
              rel="noopener noreferrer"
              className="reservation-btn"
            >
              예약하기
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

  const currentEvents = activeTab === 'current' ? activeEvents : upcomingEvents;
  const filteredEvents = filterEvents(currentEvents);

  return (
    <div className="events-container">
      <Header />
      
      <div className="events-content">
        <section className="events-header">
          <h1>이번 주 뭐하지? 🎪</h1>
          <p>우리 아이와 함께 즐길 수 있는 행사와 프로그램</p>
        </section>

        {/* 탭 네비게이션 */}
        <nav className="events-tabs">
          <button
            className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            진행 중인 행사 ({activeEvents.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            예정된 행사 ({upcomingEvents.length})
          </button>
        </nav>

        {/* 필터 */}
        <div className="event-filters">
          {eventTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`filter-chip ${filterType === type.value ? 'active' : ''}`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* 행사 목록 */}
        <div className="events-list">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => renderEventCard(event))
          ) : (
            <div className="no-events">
              <p>현재 {activeTab === 'current' ? '진행 중인' : '예정된'} {filterType !== 'all' && getEventTypeLabel(filterType)} 행사가 없어요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Events;
