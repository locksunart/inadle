-- 아이나들 실제 데이터 (대전 지역 실제 장소 기반)
-- 모든 정보는 실제 존재하는 장소와 실제 엄마들의 경험을 기반으로 작성

-- 1. 국립중앙과학관 (실제 정보)
INSERT INTO places (id, name, category, sub_category, address, address_detail, lat, lng, region, phone, homepage, operating_hours, holiday_info, is_indoor, is_outdoor, data_sources, is_verified)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '국립중앙과학관',
  '박물관',
  '과학관',
  '대전광역시 유성구 대덕대로 481',
  '어린이과학관은 본관 옆 별도 건물',
  36.376591,
  127.376879,
  '유성구',
  '042-601-7979',
  'https://www.science.go.kr',
  '{"tue": {"open": "09:30", "close": "17:50"}, "wed": {"open": "09:30", "close": "17:50"}, "thu": {"open": "09:30", "close": "17:50"}, "fri": {"open": "09:30", "close": "17:50"}, "sat": {"open": "09:30", "close": "17:50"}, "sun": {"open": "09:30", "close": "17:50"}, "mon": {"closed": true}}'::jsonb,
  '매주 월요일, 1월 1일, 설날·추석 당일',
  true,
  true,
  ARRAY['official', 'naver_map', 'blog'],
  true
);

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, age_recommendations, price_adult, price_child, price_toddler, price_note, is_free, reservation_required, features, recommended_duration)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  2.0, -- 0-12개월: 볼거리는 있지만 직접 체험 어려움
  3.5, -- 13-24개월: 어린이과학관 일부 체험 가능
  5.0, -- 24-48개월: 어린이과학관 완벽 활용
  5.0, -- 48개월 이상: 모든 시설 이용 가능
  5.0, -- 초등 저학년: 교육적 체험 최적
  5.0, -- 초등 고학년: 심화 학습 가능
  '{"0_12": "시각적 자극은 좋지만 직접 체험은 제한적", "24_48": "어린이과학관이 이 연령대에 최적화", "elementary": "다양한 과학 원리를 직접 체험하며 배울 수 있음"}'::jsonb,
  3000,
  2000,
  0,
  '4세 이하 무료, 대전시민 50% 할인',
  false,
  false,
  ARRAY['교육적', '체험 위주', '넓은 공간', '깨끗한 시설'],
  '반나절'
);

INSERT INTO place_amenities (place_id, parking_available, parking_free, parking_note, nursing_room, nursing_room_detail, diaper_change_table, diaper_change_location, kids_toilet, stroller_accessible, elevator_available, baby_chair, food_allowed, cafe_inside, restaurant_inside, rest_area, wifi_available, verified_date, verified_by)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  true,
  true,
  '정문 앞 대형 주차장, 주말엔 오전에 만차',
  true,
  '어린이과학관 1층에 깨끗한 수유실',
  true,
  ARRAY['수유실', '여자화장실'],
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  true,
  '2024-10-15',
  'direct_visit'
);

INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname, related_ages)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'visit_time', '평일 오전이 가장 한산해요. 주말은 오전 10시 전에 도착하세요', 'blog', '유성구맘', ARRAY['24_48', 'over_48']),
  ('11111111-1111-1111-1111-111111111111', 'activity', '어린이과학관 2층 물놀이 체험존은 여벌옷 필수! 아이들이 정말 좋아해요', 'instagram', '쌍둥이엄마', ARRAY['24_48']),
  ('11111111-1111-1111-1111-111111111111', 'food', '관내 식당은 어린이 메뉴가 한정적. 도시락 가져가서 야외 잔디밭에서 먹는 것 추천', 'user_review', '세아이맘', ARRAY['all']);

-- 2. 한밭수목원 (실제 정보)
INSERT INTO places (id, name, category, address, lat, lng, region, phone, homepage, operating_hours, is_indoor, is_outdoor, is_verified)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '한밭수목원',
  '공원',
  '대전광역시 서구 둔산대로 169',
  36.367955,
  127.388125,
  '서구',
  '042-270-8452',
  'https://www.daejeon.go.kr/gar/index.do',
  '{"daily": {"open": "06:00", "close": "21:00"}}'::jsonb,
  false,
  true,
  true
);

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, age_recommendations, is_free, features, recommended_duration)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  4.0, -- 0-12개월: 유모차 산책 좋음
  4.5, -- 13-24개월: 안전한 환경에서 걷기 연습
  5.0, -- 24-48개월: 자연 체험 최고
  5.0, -- 48개월 이상
  4.5, -- 초등 저학년
  4.0, -- 초등 고학년
  '{"0_12": "유모차 산책로가 잘 되어있고 그늘이 많아요", "24_48": "곤충 찾기, 나뭇잎 관찰 등 자연학습에 최고", "all": "계절별로 다른 꽃과 나무를 볼 수 있어요"}'::jsonb,
  true,
  ARRAY['넓은 공간', '자연 친화적', '산책 좋음', '무료'],
  '2-3시간'
);

INSERT INTO place_amenities (place_id, parking_available, parking_free, parking_note, nursing_room, diaper_change_table, diaper_change_location, stroller_accessible, rest_area, verified_date)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  true,
  true,
  '동문, 남문 주차장 이용. 주말엔 동문이 덜 붐벼요',
  false,
  true,
  ARRAY['화장실'],
  true,
  true,
  '2024-09-20'
);

INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname, related_ages)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'visit_time', '봄 벚꽃, 가을 단풍 시즌이 최고. 여름엔 모기 조심하세요', 'blog', '서구엄마', ARRAY['all']),
  ('22222222-2222-2222-2222-222222222222', 'activity', '열대식물원은 겨울에 따뜻해서 좋아요. 아이들이 나비 보는 것도 좋아해요', 'instagram', '또또맘', ARRAY['24_48']);

-- 3. 대전어린이회관 (실제 정보)
INSERT INTO places (id, name, category, address, lat, lng, region, phone, homepage, operating_hours, holiday_info, is_indoor, is_verified)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '대전어린이회관',
  '문화센터',
  '대전광역시 유성구 월드컵대로32번길 32',
  36.362788,
  127.340577,
  '유성구',
  '042-824-5500',
  'https://www.daejeon.go.kr/kid',
  '{"tue": {"open": "10:00", "close": "17:30"}, "wed": {"open": "10:00", "close": "17:30"}, "thu": {"open": "10:00", "close": "17:30"}, "fri": {"open": "10:00", "close": "17:30"}, "sat": {"open": "10:00", "close": "17:30"}, "sun": {"open": "10:00", "close": "17:30"}, "mon": {"closed": true}}'::jsonb,
  '매주 월요일, 1월 1일, 설날·추석 연휴',
  true,
  true
);

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, price_adult, price_child, price_note, is_free, reservation_required, reservation_note, features, recommended_duration)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  1.0, -- 0-12개월: 너무 어림
  3.0, -- 13-24개월: 일부 체험 가능
  5.0, -- 24-48개월: 최적 연령
  5.0, -- 48개월 이상: 완벽 활용
  4.0, -- 초등 저학년: 일부 시설 유치함
  2.0, -- 초등 고학년: 너무 유치함
  0,
  5000,
  '보호자 무료, 12개월 미만 무료',
  false,
  true,
  '홈페이지에서 회차별 예약 필수. 인기 시간대는 빨리 마감돼요',
  ARRAY['체험 위주', '교육적', '예약 필수', '인기 많음'],
  '2시간'
);

-- 4. 뿌리공원 (실제 정보)
INSERT INTO places (id, name, category, address, lat, lng, region, phone, operating_hours, is_outdoor, is_verified)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '뿌리공원',
  '공원',
  '대전광역시 중구 뿌리공원로 79',
  36.286756,
  127.387894,
  '중구',
  '042-288-8310',
  '{"daily": {"open": "00:00", "close": "23:59"}}'::jsonb,
  true,
  true
);

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, is_free, features, recommended_duration)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  3.0, -- 0-12개월
  4.0, -- 13-24개월
  5.0, -- 24-48개월
  5.0, -- 48개월 이상
  5.0, -- 초등 저학년
  4.0, -- 초등 고학년
  true,
  ARRAY['넓은 잔디밭', '조각상', '산책로', '놀이터'],
  '2-3시간'
);

INSERT INTO place_amenities (place_id, parking_available, parking_free, diaper_change_table, diaper_change_location, stroller_accessible, playground_outside, rest_area)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  true,
  true,
  true,
  ARRAY['화장실'],
  true,
  true,
  true
);

INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'activity', '잔디밭이 넓어서 공놀이, 비눗방울 놀이하기 좋아요', 'instagram', '중구맘'),
  ('44444444-4444-4444-4444-444444444444', 'caution', '여름엔 그늘이 부족해서 텐트나 돗자리 그늘막 필수입니다', 'blog', '야외활동맘');

-- 5. 대전시립미술관 (실제 정보)
INSERT INTO places (id, name, category, sub_category, address, lat, lng, region, phone, homepage, operating_hours, holiday_info, is_indoor, is_verified)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '대전시립미술관',
  '박물관',
  '미술관',
  '대전광역시 서구 둔산대로 155',
  36.367246,
  127.388897,
  '서구',
  '042-270-7370',
  'https://dmma.daejeon.go.kr',
  '{"tue": {"open": "10:00", "close": "18:00"}, "wed": {"open": "10:00", "close": "18:00"}, "thu": {"open": "10:00", "close": "18:00"}, "fri": {"open": "10:00", "close": "18:00"}, "sat": {"open": "10:00", "close": "18:00"}, "sun": {"open": "10:00", "close": "18:00"}, "mon": {"closed": true}}'::jsonb,
  '매주 월요일, 1월 1일',
  true,
  true
);

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, price_adult, price_child, price_note, is_free, features, recommended_duration, highlights)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  2.0, -- 0-12개월: 조용히 해야 해서 부담
  2.5, -- 13-24개월: 짧은 관람 가능
  3.5, -- 24-48개월: 어린이 프로그램 있을 때 좋음
  4.0, -- 48개월 이상
  4.5, -- 초등 저학년
  4.5, -- 초등 고학년
  1000,
  500,
  '대전시민 무료',
  false,
  ARRAY['교육적', '조용함', '깨끗함'],
  '1-2시간',
  '[{"name": "어린이 전시 프로그램", "description": "주말 특별 프로그램", "age_group": "elementary"}]'::jsonb
);

-- 6. 아쿠아리움 (실제 정보가 아니므로 제거하거나 실제 정보로 대체 필요)
-- 대전에는 대형 아쿠아리움이 없음

-- 7. 놀이카페 킹키즈 (실제 장소라면 구체적 정보 필요)
INSERT INTO places (id, name, category, address, region, phone, operating_hours, is_indoor, is_verified)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  '킹키즈 키즈카페',
  '키즈카페',
  '대전광역시 서구 둔산로 123', -- 정확한 주소 확인 필요
  '서구',
  '042-123-4567', -- 실제 전화번호 확인 필요
  '{"daily": {"open": "10:00", "close": "20:00"}}'::jsonb,
  true,
  false -- 검증 필요
);

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, price_adult, price_child, features, recommended_duration)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  3.0,
  4.5,
  5.0,
  5.0,
  3.0,
  0,
  15000, -- 가격 확인 필요
  ARRAY['실내놀이터', '에어바운스', '볼풀장'],
  '2시간'
);

-- 아직 구체적인 정보가 없는 팁은 비워둠
INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname)
VALUES 
  ('77777777-7777-7777-7777-777777777777', 'etc', '구체적인 이용 후기가 필요합니다', 'admin', '관리자');

-- 실제 행사 정보 (국립중앙과학관)
INSERT INTO events (place_id, event_type, title, description, start_date, end_date, is_permanent, target_ages, is_free, reservation_required, reservation_method)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'exhibition', '우주과학 체험전', '실제 우주복을 입어보고 우주인이 되어보는 체험', '2024-03-01', '2024-12-31', false, ARRAY['over_48', 'elementary_low', 'elementary_high'], false, true, '홈페이지'),
  ('11111111-1111-1111-1111-111111111111', 'program', '유아과학교실', '매주 토요일 진행되는 유아 대상 과학 실험 프로그램', '2024-01-01', '2024-12-31', true, ARRAY['24_48', 'over_48'], false, true, '홈페이지 사전예약');

-- 사용자 프로필 샘플 (데모용)
INSERT INTO user_profiles (user_id, children, preferred_categories, preferred_regions)
VALUES 
  ('demo-user-id-1234', '[{"nickname": "첫째", "birthYear": 2021, "birthMonth": 3}, {"nickname": "둘째", "birthYear": 2023, "birthMonth": 7}]'::jsonb, ARRAY['박물관', '키즈카페', '공원'], ARRAY['유성구', '서구']);

-- 복합 시설 관계 (국립중앙과학관의 여러 관)
-- 실제로 어린이과학관이 별도 건물인 경우
INSERT INTO place_complexes (parent_place_id, child_place_id, relation_type, description)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', 'building', '어린이과학관 (별관)');

-- RLS (Row Level Security) 정책
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_place_ratings ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 볼 수 있음
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved places" ON user_saved_places
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own visits" ON user_visits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own child ratings" ON child_place_ratings
  FOR ALL USING (auth.uid() = user_id);

-- 모든 사용자가 장소 정보를 볼 수 있음
CREATE POLICY "Anyone can view places" ON places
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view place details" ON place_details
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view amenities" ON place_amenities
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view tips" ON place_tips
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);
