// Gemini API를 활용한 스마트 검색 서비스

export const geminiSearchService = {
  async searchPlaces(query, places) {
    try {
      // Supabase Edge Function을 통해 Gemini API 호출
      const response = await fetch('/api/gemini-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          places: places
        })
      });

      if (!response.ok) {
        throw new Error('검색 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      return result.recommendedPlaces || [];
    } catch (error) {
      console.error('Gemini 검색 오류:', error);
      
      // 폴백: 기본 키워드 검색
      return this.fallbackSearch(query, places);
    }
  },

  // 폴백 검색 (Gemini API 실패 시)
  fallbackSearch(query, places) {
    const keywords = query.toLowerCase().split(' ');
    
    // 키워드 매칭 로직
    const keywordMapping = {
      // 날씨 관련
      '비': ['실내놀이터', '박물관', '도서관', '문화센터', '카페'],
      '비오는날': ['실내놀이터', '박물관', '도서관', '문화센터'],
      '추운날': ['실내놀이터', '박물관', '문화센터', '카페'],
      '더운날': ['실내놀이터', '수영장', '도서관', '박물관'],
      '맑은날': ['공원', '놀이터', '체험시설', '동물원'],
      
      // 연령 관련
      '아기': ['0_12_months', '13_24_months'],
      '영아': ['0_12_months', '13_24_months'],
      '유아': ['13_24_months', '24_48_months'],
      '돌': ['13_24_months'],
      '두돌': ['24_48_months'],
      '3세': ['24_48_months'],
      '4세': ['over_48_months'],
      '5세': ['over_48_months'],
      '초등학생': ['elementary_low', 'elementary_high'],
      
      // 활동 관련
      '편한': ['도서관', '카페', '공원'],
      '활동적': ['놀이터', '체험시설', '공원'],
      '교육적': ['박물관', '문화센터', '도서관'],
      '체험': ['체험시설', '박물관', '문화센터'],
      '놀이': ['놀이터', '실내놀이터', '공원'],
      '산책': ['공원', '수목원'],
      '학습': ['박물관', '도서관', '문화센터'],
      
      // 편의시설 관련
      '주차': ['parking_available'],
      '수유': ['nursing_room'],
      '카페': ['cafe_inside'],
      '무료': ['is_free']
    };

    let filteredPlaces = [...places];
    
    // 키워드별 필터링
    keywords.forEach(keyword => {
      if (keywordMapping[keyword]) {
        keywordMapping[keyword].forEach(condition => {
          // 카테고리 필터링
          if (['실내놀이터', '박물관', '도서관', '공원', '체험시설', '카페', '동물원', '문화센터', '수목원'].includes(condition)) {
            filteredPlaces = filteredPlaces.filter(place => 
              place.category.includes(condition)
            );
          }
          // 연령대 필터링
          else if (condition.includes('months') || condition.includes('elementary')) {
            filteredPlaces = filteredPlaces.filter(place => 
              place.place_details?.[`age_${condition}`] >= 4
            );
          }
          // 편의시설 필터링
          else if (['parking_available', 'nursing_room', 'cafe_inside'].includes(condition)) {
            filteredPlaces = filteredPlaces.filter(place => 
              place.place_amenities?.[condition] === true
            );
          }
          // 무료 필터링
          else if (condition === 'is_free') {
            filteredPlaces = filteredPlaces.filter(place => 
              place.place_details?.is_free === true
            );
          }
        });
      }
    });

    // 평점 기준으로 정렬
    return filteredPlaces.sort((a, b) => {
      const aAvgRating = this.getAverageRating(a);
      const bAvgRating = this.getAverageRating(b);
      return bAvgRating - aAvgRating;
    }).slice(0, 10); // 상위 10개만
  },

  // 평균 평점 계산
  getAverageRating(place) {
    const details = place.place_details;
    if (!details) return 0;
    
    const ratings = [
      details.age_0_12_months,
      details.age_13_24_months,
      details.age_24_48_months,
      details.age_over_48_months,
      details.age_elementary_low,
      details.age_elementary_high
    ].filter(rating => rating > 0);
    
    return ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
  },

  // 검색 제안어
  getSuggestions() {
    return [
      '비오는날 5살 아이랑 편한 나들이',
      '2세 아기와 처음 가기 좋은 곳',
      '주차 편한 실내 놀이시설',
      '무료로 갈 수 있는 교육적인 곳',
      '3세 아이 체험활동 할 수 있는 곳',
      '수유실 있는 문화시설',
      '형제가 함께 놀기 좋은 곳',
      '더운 여름날 시원한 실내 나들이'
    ];
  }
};
