import React from 'react';
import { FaMapMarkerAlt, FaStar, FaParking, FaBaby, FaCoffee } from 'react-icons/fa';
import './PlaceCard.css';

function PlaceCard({ place, onClick, userProfile }) {
  const getAgeRecommendation = () => {
    const details = place.place_details;
    if (!details) return null;

    // 모든 연령대 평가
    const ageGroups = [
      { key: 'age_0_12_months', label: '0-12개월' },
      { key: 'age_12_24_months', label: '12-24개월' },
      { key: 'age_24_48_months', label: '2-4세' },
      { key: 'age_over_48_months', label: '4세 이상' },
      { key: 'age_elementary_low', label: '초등 저학년' },
      { key: 'age_elementary_high', label: '초등 고학년' }
    ];

    // 4점 이상인 연령대만 필터링
    const recommendedAges = ageGroups.filter(group => {
      const score = details[group.key] || 0;
      return score >= 4;
    });

    // 연령 순서대로 정렬 (오름차순)
    const ageOrder = [
      'age_0_12_months',
      'age_12_24_months', 
      'age_24_48_months',
      'age_over_48_months',
      'age_elementary_low',
      'age_elementary_high'
    ];
    
    recommendedAges.sort((a, b) => {
      return ageOrder.indexOf(a.key) - ageOrder.indexOf(b.key);
    });

    return recommendedAges;
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      '실내놀이터': '🏠',
      '박물관': '🏛️',
      '미술관': '🎨',
      '아쿠아리움': '🐠',
      '테마파크': '🎢',
      '도서관': '📚',
      '공원': '🌳',
      '체험시설': '🎨',
      '카페': '☕',
      '동물원': '🦁',
      '문화센터': '🎭'
    };
    return emojis[category] || '📍';
  };

  // 친근한 설명 생성
  const getFriendlyDescription = () => {
    // 데이터베이스의 description 필드 사용
    return place.description || '아이와 함께 즐거운 시간을 보낼 수 있는 곳이에요!';
  };

  // 활동 정보 생성 - undefined 제거
  const getActivities = () => {
    // place_tips에서 주요 팁들을 가져와서 표시
    if (place.place_tips && place.place_tips.length > 0) {
      const validTips = place.place_tips
        .filter(tip => tip.content && tip.content.trim() !== '' && 
                      !tip.content.includes('undefined') && 
                      tip.content !== 'undefined - undefined')
        .slice(0, 3)
        .map(tip => tip.content);
      
      if (validTips.length > 0) {
        return validTips;
      }
    }
    
    // highlights가 있으면 사용
    if (place.place_details?.highlights && Array.isArray(place.place_details.highlights)) {
      const validHighlights = place.place_details.highlights
        .filter(highlight => highlight.name && highlight.description && 
                           !highlight.name.includes('undefined') && 
                           !highlight.description.includes('undefined'))
        .map(highlight => `${highlight.name} - ${highlight.description}`);
      if (validHighlights.length > 0) {
        return validHighlights;
      }
    }
    
    // 카테고리별 기본 메시지
    const getDefaultMessages = (category) => {
      const messageMap = {
        '테마파크': [
          '다양한 놀이기구와 어트랙션을 즐길 수 있어요',
          '가족 단위 방문객들에게 인기가 많아요',
          '하루 종일 즐길 거리가 풍성해요'
        ],
        '아쿠아리움': [
          '다양한 바다 생물들을 관찰할 수 있어요',
          '실내에서 편안하게 관람 가능해요',
          '교육적 가치가 높은 체험을 제공해요'
        ],
        '미술관': [
          '다양한 전시를 통해 예술적 감성을 기를 수 어요',
          '조용하고 차분한 환경에서 관람할 수 있어요',
          '어린이 대상 특별 프로그램이 있어요'
        ],
        '박물관': [
          '교육적이고 흥미로운 전시물들이 많아요',
          '아이들의 호기심을 자극하는 체험 활동이 있어요',
          '역사와 문화를 배울 수 있는 좋은 기회예요'
        ]
      };
      
      return messageMap[category] || [
        '아이와 함께 즐거운 시간을 보낼 수 있어요',
        '가족 나들이에 적합한 장소입니다',
        '다양한 체험 활동이 준비되어 있어요'
      ];
    };
    
    return getDefaultMessages(place.category);
  };

  // 사용자 자녀 기준 예상 평점 계산 - Home.js에서 전달받은 값 사용
  const getExpectedRating = () => {
    // Home.js에서 전달받은 expectedRating이 있으면 사용
    if (place.expectedRating !== undefined) {
      return parseFloat(place.expectedRating.toFixed(1));
    }
    
    // 기존 로직 유지 (후보 호환성)
    return parseFloat(calculateExpectedRating().toFixed(1));
  };

  const calculateExpectedRating = () => {
    if (!place.place_details) {
      // place_details가 없으면 기본값 사용
      return 4.2;
    }
    
    // userProfile이 없거나 children이 없으면 기본 평점 계산
    if (!userProfile?.children || userProfile.children.length === 0) {
      // 전체 연령대 평균으로 계산
      const allRatings = [
        place.place_details.age_0_12_months,
        place.place_details.age_12_24_months,
        place.place_details.age_24_48_months,
        place.place_details.age_over_48_months,
        place.place_details.age_elementary_low,
        place.place_details.age_elementary_high
      ].filter(rating => rating && rating > 0);
      
      if (allRatings.length > 0) {
        const avgRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
        return parseFloat(avgRating.toFixed(1));
      }
      
      // 데이터가 없으면 기본값
      return 4.0;
    }
    
    let totalRating = 0;
    let count = 0;
    
    userProfile.children.forEach(child => {
      const age = calculateChildAge(child);
      let ageRating = 0;
      
      if (age <= 12) {
        ageRating = place.place_details.age_0_12_months || 0;
      } else if (age <= 24) {
        ageRating = place.place_details.age_12_24_months || 0;
      } else if (age <= 48) {
        ageRating = place.place_details.age_24_48_months || 0;
      } else if (age <= 72) {
        ageRating = place.place_details.age_over_48_months || 0;
      } else if (age <= 108) {
        ageRating = place.place_details.age_elementary_low || 0;
      } else {
        ageRating = place.place_details.age_elementary_high || 0;
      }
      
      if (ageRating > 0) {
        totalRating += ageRating;
        count++;
      }
    });
    
    return count > 0 ? parseFloat((totalRating / count).toFixed(1)) : 4.0;
  };

  const calculateChildAge = (child) => {
    const today = new Date();
    // 다중 아이 데이터 구조 (birthDate: "YYYY-MM")
    if (child.birthDate) {
      const [year, month] = child.birthDate.split('-').map(Number);
      const birthDate = new Date(year, month - 1);
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 
                    + (today.getMonth() - birthDate.getMonth());
      return months;
    }
    // 기존 데이터 구조 (birthYear, birthMonth)
    else if (child.birthYear && child.birthMonth) {
      const birthDate = new Date(child.birthYear, child.birthMonth - 1);
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 
                    + (today.getMonth() - birthDate.getMonth());
      return months;
    }
    return 24; // 기본값
  };

  const expectedRating = getExpectedRating();
  const amenities = place.place_amenities;
  const activities = getActivities();

  return (
    <div className="place-card" onClick={onClick}>
      <div className="place-card-header">
        <div className="place-category">
          <span className="category-emoji">{getCategoryEmoji(place.category)}</span>
          <span className="category-name">{place.category}</span>
        </div>
        <div className="expected-rating-corner">
          <FaStar className="rating-star" />
          <span>{expectedRating.toFixed(1)}</span>
        </div>
      </div>

      <h3 className="place-name">
        {place.name}
      </h3>
      
      <div className="place-location">
        <FaMapMarkerAlt />
        <span>{place.address ? place.address.split(' ').slice(0, 2).join(' ') : '대전'}</span>
      </div>

      {getAgeRecommendation() && getAgeRecommendation().length > 0 && (
        <div className="age-recommendation-inline">
          <span className="age-label">인기 연령대:</span>
          <div className="age-chips">
            {getAgeRecommendation().slice(0, 3).map((ageGroup, index) => (
              <span key={index} className="age-chip">
                {ageGroup.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="place-description">
        {getFriendlyDescription()}
      </div>

      {activities && activities.length > 0 && (
        <div className="place-activities">
          {activities.slice(0, 3).map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="bullet">•</span>
              <span>{activity}</span>
            </div>
          ))}
        </div>
      )}

      <div className="place-amenities">
        {amenities?.parking_available && (
          <span className="amenity-icon" title="주차 가능">
            <FaParking />
          </span>
        )}
        {amenities?.nursing_room && (
          <span className="amenity-icon" title="수유실">
            <FaBaby />
          </span>
        )}
        {amenities?.has_cafe && (
          <span className="amenity-icon" title="카페">
            <FaCoffee />
          </span>
        )}
      </div>
    </div>
  );
}

export default PlaceCard;
