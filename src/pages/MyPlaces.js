import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaCheckCircle, FaCalendarAlt, FaStar, FaPlus } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { dbHelpers } from '../services/supabase';
import { getAgeFromBirthDate } from '../utils/ageCalculator';
import Header from '../components/Header';
import PlaceCard from '../components/PlaceCard';
import './MyPlaces.css';

function MyPlaces() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('saved');
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [visitedPlaces, setVisitedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 평가 폼 상태
  const [ratingForm, setRatingForm] = useState({
    parentRating: 0,
    childRatings: []
  });

  useEffect(() => {
    if (user) {
      loadMyPlaces();
    }
  }, [user]);

  const loadMyPlaces = async () => {
    setLoading(true);
    try {
      const saved = await dbHelpers.users.getSavedPlaces(user.id);
      setSavedPlaces(saved);

      const visited = await dbHelpers.users.getVisits(user.id);
      setVisitedPlaces(visited);
    } catch (error) {
      console.error('내 장소 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (placeId) => {
    try {
      await dbHelpers.users.toggleSavedPlace(user.id, placeId);
      setSavedPlaces(savedPlaces.filter(item => item.place_id !== placeId));
      alert('찜 목록에서 제거했어요.');
    } catch (error) {
      console.error('찜 제거 오류:', error);
      alert('오류가 발생했어요. 다시 시도해주세요.');
    }
  };

  const handleMarkAsVisited = (place) => {
    setSelectedPlace(place);
    
    let childRatings = [];
    
    if (userProfile?.children && Array.isArray(userProfile.children)) {
      childRatings = userProfile.children.map((child, index) => ({
        childIndex: index,
        childNickname: child.name,
        childAgeMonths: calculateChildAgeFromBirthDate(child.birthDate),
        rating: 0
      }));
    } else if (userProfile?.child_birth_date && userProfile?.child_name) {
      const childAgeMonths = calculateChildAgeFromBirthDate(userProfile.child_birth_date);
      childRatings = [{
        childIndex: 0,
        childNickname: userProfile.child_name,
        childAgeMonths: childAgeMonths,
        rating: 0
      }];
    }
    
    setRatingForm({
      parentRating: 0,
      childRatings
    });
    
    setShowRatingModal(true);
  };

  const calculateChildAge = (child) => {
    const today = new Date();
    const birthDate = new Date(child.birthYear, child.birthMonth - 1);
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 
                  + (today.getMonth() - birthDate.getMonth());
    return months;
  };

  const calculateChildAgeFromBirthDate = (birthDateString) => {
    const today = new Date();
    const [year, month] = birthDateString.split('-').map(Number);
    const birthDate = new Date(year, month - 1);
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 
                  + (today.getMonth() - birthDate.getMonth());
    return months;
  };

  const getChildBirthDate = (childIndex) => {
    if (userProfile?.children && userProfile.children[childIndex]) {
      return userProfile.children[childIndex].birthDate;
    }
    else if (userProfile?.child_birth_date && childIndex === 0) {
      return userProfile.child_birth_date;
    }
    
    return null;
  };

  const handleSubmitRating = async () => {
    try {
      if (!ratingForm.parentRating || ratingForm.parentRating < 1) {
        alert('부모 만족도를 선택해주세요.');
        return;
      }

      // 현재 날짜를 YYYY-MM-DD 형식으로
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const visitDate = `${year}-${month}-${day}`;

      const visitData = {
        user_id: user.id,
        place_id: selectedPlace.place_id,
        visited_at: visitDate,
        rating: ratingForm.parentRating,
        comment: '',
        would_revisit: null,
        visited_with_children: ratingForm.childRatings.map(cr => cr.childIndex),
        created_at: new Date().toISOString()
      };

      console.log('방문 기록 저장:', visitData);

      const visitResult = await dbHelpers.users.createVisit(visitData);
      console.log('방문 기록 결과:', visitResult);

      // 찜 목록에서 제거
      await dbHelpers.users.toggleSavedPlace(user.id, selectedPlace.place_id);

      alert('방문 기록이 저장되었어요! 💕');
      setShowRatingModal(false);
      loadMyPlaces();
    } catch (error) {
      console.error('평가 저장 오류:', error);
      alert('오류가 발생했어요. 다시 시도해주세요.');
    }
  };

  const updateChildRating = (childIndex, field, value) => {
    setRatingForm(prev => ({
      ...prev,
      childRatings: prev.childRatings.map(cr =>
        cr.childIndex === childIndex ? { ...cr, [field]: value } : cr
      )
    }));
  };

  const formatVisitDate = (date) => {
    const visitDate = new Date(date);
    const today = new Date();
    const diffTime = today - visitDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
  };

  const getRatingStars = (rating, onRate = null, size = 'normal') => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar 
        key={i} 
        className={`star ${i < rating ? 'star-filled' : 'star-empty'} ${size} ${onRate ? 'clickable' : ''}`}
        onClick={() => onRate && onRate(i + 1)}
      />
    ));
  };

  if (loading) {
    return (
      <div className="my-places-container">
        <Header />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>내 장소를 불러오고 있어요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-places-container">
      <Header />
      
      <div className="my-places-content">
        <section className="my-places-header">
          <h1>내 나들이 기록 📚</h1>
          <p>찜한 장소와 다녀온 곳들을 한눈에 보세요</p>
        </section>

        <nav className="places-tabs">
          <button
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <FaHeart />
            <span>찜한 장소 ({savedPlaces.length})</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'visited' ? 'active' : ''}`}
            onClick={() => setActiveTab('visited')}
          >
            <FaCheckCircle />
            <span>다녀온 곳 ({visitedPlaces.length})</span>
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'saved' && (
            <div className="saved-places">
              {savedPlaces.length > 0 ? (
                <div className="places-grid">
                  {savedPlaces.map(item => (
                    <div key={item.id} className="saved-place-wrapper">
                      <PlaceCard
                        place={item.places}
                        onClick={() => navigate(`/place/${item.place_id}`)}
                      />
                      <div className="saved-actions">
                        {item.note && (
                          <p className="saved-note">📝 {item.note}</p>
                        )}
                        <div className="action-buttons">
                          {!item.is_visited && (
                            <button
                              onClick={() => handleMarkAsVisited(item)}
                              className="visited-btn"
                            >
                              <FaCheckCircle />
                              방문했어요
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveSaved(item.place_id)}
                            className="remove-btn"
                          >
                            찜 해제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaHeart className="empty-icon" />
                  <h3>아직 찜한 장소가 없어요</h3>
                  <p>마음에 드는 장소를 찜해보세요!</p>
                  <button
                    onClick={() => navigate('/')}
                    className="explore-btn"
                  >
                    장소 둘러보기
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'visited' && (
            <div className="visited-places">
              {visitedPlaces.length > 0 ? (
                <div className="visited-list">
                  {visitedPlaces.map(visit => (
                    <div key={visit.id} className="visit-card">
                      <div className="visit-header">
                        <div className="visit-place-info">
                          <h3>{visit.places.name}</h3>
                          <p className="visit-category">{visit.places.category}</p>
                        </div>
                        <div className="visit-date">
                          <FaCalendarAlt />
                          <span>{formatVisitDate(visit.visited_at)}</span>
                        </div>
                      </div>
                      
                      <div className="visit-details">
                        {visit.rating && (
                          <div className="visit-rating">
                            <span className="rating-label">부모 만족도:</span>
                            {getRatingStars(visit.rating)}
                            <span className="rating-value">({visit.rating}/5)</span>
                          </div>
                        )}
                        
                        {visit.visited_with_children && visit.visited_with_children.length > 0 && (
                          <div className="child-ratings">
                            <span className="rating-label">방문한 아이:</span>
                            {visit.visited_with_children.map(childIndex => {
                              if (userProfile?.children && userProfile.children[childIndex]) {
                                const child = userProfile.children[childIndex];
                                const ageText = getAgeFromBirthDate(child.birthDate);
                                
                                return (
                                  <span key={childIndex} className="child-name">
                                    {child.name} ({ageText})
                                  </span>
                                );
                              }
                              else if (userProfile?.child_birth_date && userProfile?.child_name && childIndex === 0) {
                                const ageText = getAgeFromBirthDate(userProfile.child_birth_date);
                                
                                return (
                                  <span key={childIndex} className="child-name">
                                    {userProfile.child_name} ({ageText})
                                  </span>
                                );
                              }
                              
                              return null;
                            })}
                          </div>
                        )}
                        
                        <div className="visit-meta">
                          {visit.would_revisit === true && (
                            <span className="meta-badge revisit">🔄 재방문 의사 있음</span>
                          )}
                          {visit.would_revisit === false && (
                            <span className="meta-badge no-revisit">❌ 재방문 안함</span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/place/${visit.place_id}`)}
                        className="view-place-btn"
                      >
                        장소 상세보기
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaCheckCircle className="empty-icon" />
                  <h3>아직 방문 기록이 없어요</h3>
                  <p>다녀온 곳을 기록하고 추억을 남겨보세요!</p>
                  <button
                    onClick={() => navigate('/')}
                    className="explore-btn"
                  >
                    장소 둘러보기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showRatingModal && (
        <div className="rating-modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>방문 후기 작성</h2>
              <p>{selectedPlace?.places?.name}</p>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>부모 만족도</label>
                <div className="rating-input">
                  {getRatingStars(ratingForm.parentRating, (rating) => 
                    setRatingForm({...ratingForm, parentRating: rating}), 'large'
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>아이 만족도</label>
                <div className="children-ratings">
                  {ratingForm.childRatings.map((childRating, index) => {
                    const birthDate = getChildBirthDate(childRating.childIndex);
                    const ageText = birthDate ? getAgeFromBirthDate(birthDate) : '알 수 없음';
                    
                    return (
                      <div key={index} className="child-rating-row">
                        <span className="child-name">
                          {childRating.childNickname} ({ageText})
                        </span>
                        <div className="child-rating-stars">
                          {getRatingStars(childRating.rating, (rating) => 
                            updateChildRating(index, 'rating', rating)
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {ratingForm.childRatings.length === 0 && (
                    <p className="no-children-message">
                      등록된 아이 정보가 없어요. 내 정보에서 아이를 추가해주세요.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowRatingModal(false)} className="cancel-btn">
                취소
              </button>
              <button onClick={handleSubmitRating} className="submit-btn">
                후기 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPlaces;
