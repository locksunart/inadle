-- 아이나들 데이터베이스 스키마 (개선버전)
-- 실제 엄마들의 경험을 담은 대전 육아 나들이 정보

-- 1. 장소 기본 정보
CREATE TABLE places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- '실내놀이터', '박물관', '도서관', '카페', '공원' 등
  sub_category TEXT, -- '과학관', '미술관' 등 세부 카테고리
  
  -- 위치 정보
  address TEXT NOT NULL,
  address_detail TEXT, -- "2층 안쪽", "정문 옆 건물" 같은 상세 위치
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  region TEXT DEFAULT '대전', -- 지역구 (서구, 중구, 동구, 유성구, 대덕구)
  
  -- 연락처 정보
  phone TEXT,
  homepage TEXT,
  instagram TEXT, -- 인스타그램 계정
  blog_url TEXT, -- 대표 블로그 URL
  
  -- 운영 정보
  operating_hours JSONB, -- {"mon": {"open": "09:00", "close": "18:00"}, "tue": {"closed": true}}
  holiday_info TEXT, -- "매주 월요일, 명절 연휴"
  
  -- 기본 특성
  is_indoor BOOLEAN DEFAULT false,
  is_outdoor BOOLEAN DEFAULT false,
  
  -- 메타 정보
  data_sources TEXT[], -- ['naver_map', 'instagram', 'blog', 'official']
  is_verified BOOLEAN DEFAULT false, -- 검증된 정보인지
  popularity_score INTEGER DEFAULT 0, -- 인기도 점수 (방문 횟수, 찜 수 등)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 장소 상세 정보 (엄마들의 실제 경험 정보)
CREATE TABLE place_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  
  -- 연령별 적합도 (1-5점) - 전문가/관리자 초기 설정값
  age_0_12_months DECIMAL(2,1) DEFAULT 0, -- 0~12개월
  age_13_24_months DECIMAL(2,1) DEFAULT 0, -- 13~24개월  
  age_24_48_months DECIMAL(2,1) DEFAULT 0, -- 24~48개월
  age_over_48_months DECIMAL(2,1) DEFAULT 0, -- 48개월 이상
  age_elementary_low DECIMAL(2,1) DEFAULT 0, -- 초등 저학년
  age_elementary_high DECIMAL(2,1) DEFAULT 0, -- 초등 고학년
  
  -- 연령별 추천 이유
  age_recommendations JSONB, -- {"0_12": "조용하고 수유실이 잘 되어있어요", "24_48": "안전한 놀이기구가 많아요"}
  
  -- 비용 정보
  price_adult INTEGER,
  price_child INTEGER,
  price_toddler INTEGER, -- 영유아
  price_note TEXT, -- "36개월 미만 무료, 대전시민 30% 할인"
  is_free BOOLEAN DEFAULT false,
  
  -- 예약 정보
  reservation_required BOOLEAN DEFAULT false,
  reservation_link TEXT,
  reservation_note TEXT, -- "주말은 예약 필수예요!"
  
  -- 특징 태그
  features TEXT[], -- ['넓은 공간', '깨끗함', '조용함', '교육적', '체험 위주']
  
  -- 주요 시설/프로그램
  highlights JSONB, -- [{"name": "아기 놀이방", "description": "18개월 미만 전용 공간", "age_group": "0_12"}]
  
  -- 추천 체류 시간
  recommended_duration TEXT, -- "1-2시간", "반나절"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 편의시설 정보 (엄마들이 가장 궁금해하는 정보!)
CREATE TABLE place_amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  
  -- 주차 정보
  parking_available BOOLEAN DEFAULT false,
  parking_free BOOLEAN DEFAULT false,
  parking_fee INTEGER, -- 시간당 요금
  parking_note TEXT, -- "건물 지하 2시간 무료, 주말엔 만차가 많아요"
  
  -- 아기 관련 필수 시설
  nursing_room BOOLEAN DEFAULT false, -- 수유실
  nursing_room_detail TEXT, -- "2층에 2개, 온수 제공"
  diaper_change_table BOOLEAN DEFAULT false, -- 기저귀 교환대
  diaper_change_location TEXT[], -- ['수유실', '여자화장실', '남자화장실']
  
  -- 화장실 정보
  kids_toilet BOOLEAN DEFAULT false, -- 유아 전용 화장실
  kids_toilet_detail TEXT, -- "1층에만 있어요"
  family_restroom BOOLEAN DEFAULT false, -- 가족 화장실
  
  -- 유모차/이동
  stroller_accessible BOOLEAN DEFAULT true, -- 유모차 이동 가능
  stroller_rental BOOLEAN DEFAULT false, -- 유모차 대여
  elevator_available BOOLEAN DEFAULT false, -- 엘리베이터
  
  -- 아이 의자/식사
  baby_chair BOOLEAN DEFAULT false, -- 아기 의자
  baby_chair_count INTEGER, -- 아기 의자 개수
  kids_menu BOOLEAN DEFAULT false, -- 키즈 메뉴
  food_allowed BOOLEAN DEFAULT false, -- 외부음식 허용
  microwave_available BOOLEAN DEFAULT false, -- 전자레인지
  hot_water BOOLEAN DEFAULT false, -- 온수 제공
  
  -- 편의 시설
  cafe_inside BOOLEAN DEFAULT false, -- 내부 카페
  restaurant_inside BOOLEAN DEFAULT false, -- 내부 식당
  playground_inside BOOLEAN DEFAULT false, -- 실내 놀이터
  playground_outside BOOLEAN DEFAULT false, -- 실외 놀이터
  rest_area BOOLEAN DEFAULT false, -- 휴게 공간
  
  -- 기타
  wifi_available BOOLEAN DEFAULT false,
  shoe_storage BOOLEAN DEFAULT false, -- 신발장
  locker_available BOOLEAN DEFAULT false, -- 사물함
  
  -- 검증 정보
  verified_date DATE, -- 정보 확인 날짜
  verified_by TEXT, -- 'instagram_post', 'blog_review', 'direct_visit'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 엄마들의 실제 팁 (인스타, 블로그, 직접 경험)
CREATE TABLE place_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  
  tip_category TEXT NOT NULL, -- 'visit_time', 'parking', 'food', 'activity', 'caution', 'etc'
  content TEXT NOT NULL,
  
  -- 팁 출처
  source_type TEXT, -- 'instagram', 'blog', 'user_review', 'admin'
  source_url TEXT,
  source_date DATE,
  author_nickname TEXT, -- "쌍둥이맘", "세아이맘" 등
  
  -- 관련 연령
  related_ages TEXT[], -- ['0_12', '13_24'] 
  
  likes_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false, -- 중요 팁 고정
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 행사/프로그램 정보
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL, -- 'exhibition', 'program', 'performance', 'workshop', 'festival'
  title TEXT NOT NULL,
  description TEXT,
  
  -- 기간
  start_date DATE NOT NULL,
  end_date DATE,
  is_permanent BOOLEAN DEFAULT false, -- 상설 전시/프로그램
  
  -- 시간 정보
  time_slots JSONB, -- [{"day": "토", "times": ["10:00", "14:00"], "duration": "50분"}]
  
  -- 대상 연령
  target_ages TEXT[], -- ['24_48', 'over_48', 'elementary_low']
  target_age_note TEXT, -- "보호자 동반 필수", "6세 이상 혼자 참여 가능"
  
  -- 비용 및 예약
  is_free BOOLEAN DEFAULT true,
  price_adult INTEGER,
  price_child INTEGER,
  price_note TEXT,
  
  reservation_required BOOLEAN DEFAULT false,
  reservation_method TEXT, -- '홈페이지', '전화', '현장접수'
  reservation_link TEXT,
  capacity INTEGER, -- 정원
  
  -- 추가 정보
  materials_provided BOOLEAN DEFAULT true, -- 재료 제공 여부
  parent_participation BOOLEAN DEFAULT false, -- 부모 참여 여부
  
  -- 이미지
  image_urls TEXT[],
  
  -- 메타 정보
  source_url TEXT, -- 출처 링크
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 복합 시설 관리 (예: 국립중앙과학관의 여러 관)
CREATE TABLE place_complexes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  child_place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  
  relation_type TEXT DEFAULT 'building', -- 'building', 'area', 'floor'
  description TEXT, -- "본관 2층", "별관"
  
  UNIQUE(parent_place_id, child_place_id)
);

-- 7. 사용자 관련 테이블
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 자녀 정보
  children JSONB NOT NULL, -- [{"nickname": "첫째", "birthYear": 2020, "birthMonth": 3}]
  
  -- 선호도
  preferred_categories TEXT[],
  preferred_regions TEXT[], -- ['유성구', '서구']
  
  -- 위치 정보
  home_address TEXT,
  home_lat DECIMAL(10, 8),
  home_lng DECIMAL(11, 8),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 찜한 장소
CREATE TABLE user_saved_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  
  note TEXT, -- 개인 메모 "다음주 토요일에 가기"
  priority INTEGER DEFAULT 0, -- 우선순위
  is_visited BOOLEAN DEFAULT false, -- 방문 완료 여부
  
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- 9. 방문 기록 (개선된 버전)
CREATE TABLE user_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  
  visited_at DATE NOT NULL,
  
  -- 부모 평가 (1-5점)
  parent_rating DECIMAL(2,1) CHECK (parent_rating >= 1 AND parent_rating <= 5),
  parent_comment TEXT, -- 부모 후기
  
  -- 재방문 의사
  would_revisit BOOLEAN,
  
  -- 함께 간 아이 정보 (자녀 중 누구와 갔는지)
  visited_with_children INTEGER[], -- children 배열의 인덱스
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, place_id, visited_at) -- 같은 날 중복 방문 기록 방지
);

-- 10. 아이별 평가 (새로 추가)
CREATE TABLE child_place_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_id UUID REFERENCES user_visits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  
  child_index INTEGER NOT NULL, -- user_profiles.children 배열의 인덱스
  child_age_months INTEGER NOT NULL, -- 방문 당시 아이 나이 (개월)
  
  -- 아이 평가 (1-5점)
  child_rating DECIMAL(2,1) CHECK (child_rating >= 1 AND child_rating <= 5),
  
  -- 아이 반응
  enjoyed BOOLEAN, -- 즐거워했는지
  engagement_level TEXT, -- 'very_engaged', 'somewhat_engaged', 'not_engaged'
  
  -- 아이 행동 관찰
  stayed_duration_minutes INTEGER, -- 실제 머문 시간 (분)
  wanted_to_leave_early BOOLEAN, -- 일찍 나가고 싶어했는지
  asked_to_come_again BOOLEAN, -- 다시 오고 싶다고 했는지
  
  -- 기타 관찰 사항
  notes TEXT, -- "처음엔 무서워했지만 나중엔 재밌어했어요"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 리뷰 이미지
CREATE TABLE review_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  visit_id UUID REFERENCES user_visits(id) ON DELETE CASCADE,
  
  image_url TEXT NOT NULL,
  caption TEXT,
  
  is_representative BOOLEAN DEFAULT false, -- 대표 이미지
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. 추천 점수 계산용 뷰 (실시간 계산)
CREATE OR REPLACE VIEW place_rating_summary AS
SELECT 
  p.id as place_id,
  p.name,
  pd.age_0_12_months as base_age_0_12,
  pd.age_13_24_months as base_age_13_24,
  pd.age_24_48_months as base_age_24_48,
  pd.age_over_48_months as base_age_over_48,
  pd.age_elementary_low as base_age_elementary_low,
  pd.age_elementary_high as base_age_elementary_high,
  
  -- 실제 방문 후 평가 평균 (아이별)
  COALESCE(AVG(CASE WHEN cpr.child_age_months <= 12 THEN cpr.child_rating END), pd.age_0_12_months) as real_age_0_12,
  COALESCE(AVG(CASE WHEN cpr.child_age_months BETWEEN 13 AND 24 THEN cpr.child_rating END), pd.age_13_24_months) as real_age_13_24,
  COALESCE(AVG(CASE WHEN cpr.child_age_months BETWEEN 25 AND 48 THEN cpr.child_rating END), pd.age_24_48_months) as real_age_24_48,
  COALESCE(AVG(CASE WHEN cpr.child_age_months > 48 AND cpr.child_age_months <= 72 THEN cpr.child_rating END), pd.age_over_48_months) as real_age_over_48,
  COALESCE(AVG(CASE WHEN cpr.child_age_months BETWEEN 73 AND 108 THEN cpr.child_rating END), pd.age_elementary_low) as real_age_elementary_low,
  COALESCE(AVG(CASE WHEN cpr.child_age_months > 108 THEN cpr.child_rating END), pd.age_elementary_high) as real_age_elementary_high,
  
  -- 부모 평가 평균
  AVG(uv.parent_rating) as avg_parent_rating,
  COUNT(uv.id) as total_visits,
  COUNT(DISTINCT uv.user_id) as unique_visitors,
  
  -- 인기도 지표
  (COUNT(uv.id) * 0.7 + COUNT(ups.id) * 0.3) as popularity_score
  
FROM places p
LEFT JOIN place_details pd ON p.id = pd.place_id
LEFT JOIN user_visits uv ON p.id = uv.place_id
LEFT JOIN child_place_ratings cpr ON uv.id = cpr.visit_id
LEFT JOIN user_saved_places ups ON p.id = ups.place_id
GROUP BY p.id, p.name, pd.age_0_12_months, pd.age_13_24_months, pd.age_24_48_months, 
         pd.age_over_48_months, pd.age_elementary_low, pd.age_elementary_high;

-- 인덱스 생성
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_location ON places(lat, lng);
CREATE INDEX idx_place_details_ages ON place_details(age_0_12_months, age_13_24_months, age_24_48_months);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_active ON events(is_active);
CREATE INDEX idx_user_visits_user_place ON user_visits(user_id, place_id);
CREATE INDEX idx_child_ratings_age ON child_place_ratings(child_age_months, child_rating);
CREATE INDEX idx_saved_places_user ON user_saved_places(user_id, is_visited);

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_place_details_updated_at BEFORE UPDATE ON place_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 트리거: 방문 기록 생성시 찜 목록 업데이트
CREATE OR REPLACE FUNCTION update_saved_place_visited()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_saved_places 
    SET is_visited = true 
    WHERE user_id = NEW.user_id AND place_id = NEW.place_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_place_on_visit AFTER INSERT ON user_visits
    FOR EACH ROW EXECUTE FUNCTION update_saved_place_visited();