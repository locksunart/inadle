-- 외부 행사/프로그램 데이터 확장 스키마
-- 도서관, 문화센터 등의 프로그램 정보를 통합 관리

-- 1. 외부 데이터 소스 관리
CREATE TABLE IF NOT EXISTS external_data_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type TEXT NOT NULL, -- 'library', 'culture_center', 'kids_cafe', 'government'
  source_name TEXT NOT NULL, -- '유성구립도서관', '대전광역시 육아종합지원센터' 등
  base_url TEXT NOT NULL,
  
  -- 크롤링 설정
  crawl_config JSONB, -- 크롤링 규칙, 선택자 등
  crawl_frequency INTERVAL DEFAULT '1 day', -- 크롤링 주기
  last_crawled_at TIMESTAMP WITH TIME ZONE,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 크롤링된 프로그램/행사 정보 (events 테이블 확장)
ALTER TABLE events ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES external_data_sources(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_id TEXT; -- 외부 시스템의 ID
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_status TEXT; -- 'upcoming', 'open', 'closed', 'full'
ALTER TABLE events ADD COLUMN IF NOT EXISTS current_participants INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS waiting_count INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS instructor_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS program_type TEXT; -- '강좌', '행사', '공연', '체험'
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB; -- 반복 패턴 정보

-- 3. 프로그램 카테고리 매핑 (도서관/문화센터 카테고리를 우리 카테고리로 매핑)
CREATE TABLE IF NOT EXISTS program_category_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES external_data_sources(id),
  source_category TEXT NOT NULL, -- 원본 카테고리명
  mapped_category TEXT NOT NULL, -- 우리 카테고리
  mapped_age_groups TEXT[], -- 매핑된 연령 그룹
  
  UNIQUE(source_id, source_category)
);

-- 4. 크롤링 로그
CREATE TABLE IF NOT EXISTS crawl_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES external_data_sources(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL, -- 'running', 'success', 'failed'
  items_found INTEGER,
  items_created INTEGER,
  items_updated INTEGER,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 사용자 프로그램 관심사/알림 설정
CREATE TABLE IF NOT EXISTS user_program_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 관심 카테고리
  interested_categories TEXT[],
  interested_sources UUID[], -- 관심 도서관/문화센터
  
  -- 알림 설정
  notify_new_programs BOOLEAN DEFAULT true,
  notify_registration_open BOOLEAN DEFAULT true,
  notify_days_before INTEGER DEFAULT 3, -- 등록 시작 며칠 전 알림
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 6. 프로그램 추천 점수 (ML용)
CREATE TABLE IF NOT EXISTS program_recommendation_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- 추천 점수 요소들
  age_match_score DECIMAL(3,2), -- 연령 매칭 점수 (0~1)
  category_match_score DECIMAL(3,2), -- 카테고리 선호도 점수
  location_score DECIMAL(3,2), -- 거리/위치 점수
  time_match_score DECIMAL(3,2), -- 시간대 매칭 점수
  popularity_score DECIMAL(3,2), -- 인기도 점수
  
  -- 최종 추천 점수
  total_score DECIMAL(3,2), -- 가중 평균
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, event_id)
);

-- 7. 자연어 검색 쿼리 로그
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  query_text TEXT NOT NULL,
  query_type TEXT NOT NULL, -- 'natural_language', 'filter'
  
  -- 파싱된 의도
  parsed_intents JSONB, -- {ages: [], dates: [], locations: [], categories: []}
  
  -- 결과
  results_count INTEGER,
  clicked_results UUID[], -- 클릭한 결과 ID들
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 검색 결과 피드백
CREATE TABLE IF NOT EXISTS search_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_id UUID REFERENCES search_queries(id),
  user_id UUID REFERENCES auth.users(id),
  
  feedback_type TEXT NOT NULL, -- 'helpful', 'not_helpful', 'wrong_results'
  feedback_text TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 예시 데이터: 유성구립도서관
INSERT INTO external_data_sources (source_type, source_name, base_url, crawl_config) VALUES 
(
  'library', 
  '유성구립도서관', 
  'https://lib.yuseong.go.kr',
  '{
    "lecture_list_url": "/web/menu/10095/program/30010/lectureList.do",
    "event_calendar_url": "/web/menu/10097/program/30011/eventCalendar.do",
    "selectors": {
      "title": ".program_title",
      "date": ".program_date",
      "target": ".program_target",
      "capacity": ".program_capacity"
    }
  }'::jsonb
);

-- 인덱스 추가
CREATE INDEX idx_events_source_external ON events(source_id, external_id);
CREATE INDEX idx_events_registration_dates ON events(registration_start_date, registration_end_date);
CREATE INDEX idx_recommendation_scores_user ON program_recommendation_scores(user_id, total_score DESC);
CREATE INDEX idx_search_queries_user_date ON search_queries(user_id, created_at DESC);

-- 뷰: 사용자별 추천 프로그램
CREATE OR REPLACE VIEW user_recommended_programs AS
WITH user_child_ages AS (
  -- 사용자 자녀들의 현재 나이 계산
  SELECT 
    up.user_id,
    jsonb_array_elements(up.children) ->> 'nickname' as child_nickname,
    EXTRACT(YEAR FROM AGE(
      NOW(), 
      TO_DATE(
        (jsonb_array_elements(up.children) ->> 'birthYear') || '-' || 
        LPAD(jsonb_array_elements(up.children) ->> 'birthMonth', 2, '0') || '-01',
        'YYYY-MM-DD'
      )
    )) * 12 + 
    EXTRACT(MONTH FROM AGE(
      NOW(), 
      TO_DATE(
        (jsonb_array_elements(up.children) ->> 'birthYear') || '-' || 
        LPAD(jsonb_array_elements(up.children) ->> 'birthMonth', 2, '0') || '-01',
        'YYYY-MM-DD'
      )
    )) as age_months
  FROM user_profiles up
)
SELECT 
  e.*,
  uca.user_id,
  uca.child_nickname,
  uca.age_months,
  prs.total_score as recommendation_score,
  CASE 
    WHEN uca.age_months <= 12 AND '0_12' = ANY(e.target_ages) THEN true
    WHEN uca.age_months BETWEEN 13 AND 24 AND '13_24' = ANY(e.target_ages) THEN true
    WHEN uca.age_months BETWEEN 25 AND 48 AND '24_48' = ANY(e.target_ages) THEN true
    WHEN uca.age_months BETWEEN 49 AND 72 AND 'over_48' = ANY(e.target_ages) THEN true
    WHEN uca.age_months BETWEEN 73 AND 108 AND 'elementary_low' = ANY(e.target_ages) THEN true
    WHEN uca.age_months > 108 AND 'elementary_high' = ANY(e.target_ages) THEN true
    ELSE false
  END as age_appropriate
FROM events e
CROSS JOIN user_child_ages uca
LEFT JOIN program_recommendation_scores prs ON prs.event_id = e.id AND prs.user_id = uca.user_id
WHERE e.is_active = true
  AND (e.end_date IS NULL OR e.end_date >= CURRENT_DATE)
ORDER BY 
  uca.user_id, 
  age_appropriate DESC, 
  prs.total_score DESC NULLS LAST;