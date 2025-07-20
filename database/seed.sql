-- 아이나들 초기 데이터
-- 실제 엄마들이 추천하는 대전 나들이 장소들

-- 1. 국립중앙과학관
INSERT INTO places (id, name, category, sub_category, address, address_detail, lat, lng, region, phone, homepage, operating_hours, holiday_info, is_indoor, is_outdoor, data_sources, is_verified, popularity_score)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '국립중앙과학관',
  '박물관',
  '과학관',
  '대전광역시 유성구 대덕대로 481',
  '정문 매표소에서 입장권 구매',
  36.3763,
  127.3760,
  '유성구',
  '042-601-7979',
  'https://www.science.go.kr',
  '{"tue": {"open": "09:30", "close": "17:50"}, "wed": {"open": "09:30", "close": "17:50"}, "thu": {"open": "09:30", "close": "17:50"}, "fri": {"open": "09:30", "close": "17:50"}, "sat": {"open": "09:30", "close": "17:50"}, "sun": {"open": "09:30", "close": "17:50"}, "mon": {"closed": true}}',
  '매주 월요일, 1월 1일, 설날 및 추석 당일',
  true,
  true,
  ARRAY['naver_map', 'instagram', 'official'],
  true,
  95
);

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, age_recommendations, price_adult, price_child, price_toddler, price_note, is_free, reservation_required, features, highlights, recommended_duration)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  2, -- 0-12개월: 조용한 공간 있지만 볼거리 제한적
  3, -- 13-24개월: 유아 놀이실 있음
  5, -- 24-48개월: 다양한 체험 가능
  5, -- 48개월 이상: 최적
  5, -- 초등 저학년: 매우 좋음
  5, -- 초등 고학년: 매우 좋음
  '{
    "0_12": "과학놀이터 내 36개월 미만 전용 공간이 있어요. 수유실도 깨끗해요!",
    "13_24": "천체관은 어두워서 무서워할 수 있어요. 자연사박물관 공룡이 인기예요.",
    "24_48": "어린이과학관이 딱 맞아요! 물놀이 체험은 여벌옷 필수!",
    "over_48": "모든 전시관을 즐길 수 있어요. 특히 기초과학관 체험이 재밌어요.",
    "elementary_low": "창의나래관 메이커 스페이스에서 만들기 체험 추천!",
    "elementary_high": "생물탐구관, 천체관 프로그램이 교육적이에요."
  }'::jsonb,
  3000,
  2000,
  0,
  '6세 이하 무료, 대전시민 50% 할인 (신분증 지참)',
  false,
  false,
  ARRAY['교육적', '넓은 공간', '다양한 체험', '깨끗한 시설'],
  '[
    {"name": "과학놀이터", "description": "영유아 전용 과학 체험 공간. 36개월 미만 전용존 별도 운영", "age_group": ["0_12", "13_24", "24_48"]},
    {"name": "자연사박물관", "description": "실물 크기 공룡 전시. 아이들이 가장 좋아하는 곳!", "age_group": ["24_48", "over_48", "elementary_low"]},
    {"name": "천체관", "description": "돔 영상관에서 별자리 관람. 4세 이상 추천", "age_group": ["over_48", "elementary_low", "elementary_high"]},
    {"name": "어린이과학관", "description": "물, 빛, 소리 등 오감 체험. 여벌옷 필수!", "age_group": ["24_48", "over_48"]}
  ]'::jsonb,
  '반나절 이상'
);

INSERT INTO place_amenities (place_id, parking_available, parking_free, parking_note, nursing_room, nursing_room_detail, diaper_change_table, diaper_change_location, kids_toilet, kids_toilet_detail, family_restroom, stroller_accessible, elevator_available, baby_chair, food_allowed, hot_water, playground_inside, rest_area, wifi_available)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  true,
  true,
  '주차장 넓지만 주말엔 만차 많아요. 제2주차장도 이용 가능해요.',
  true,
  '각 전시관마다 수유실 있어요. 과학놀이터 수유실이 가장 깨끗하고 넓어요!',
  true,
  ARRAY['수유실', '여자화장실', '남자화장실', '가족화장실'],
  true,
  '어린이과학관 1층에 유아 전용 화장실 있어요. 변기 높이가 낮아서 좋아요.',
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true
);

INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname, related_ages)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'visit_time', '평일 오전 10시쯤 가면 한적해서 여유롭게 관람할 수 있어요. 단체 관람이 오후에 많아요.', 'instagram', '유성구맘', ARRAY['0_12', '13_24']),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'parking', '정문 주차장 만차시 제2주차장(도보 5분)을 이용하세요. 유모차 끌고 가기 괜찮아요.', 'blog', '세아이맘', NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'food', '관내 카페테리아 있지만 도시락 싸가는 것도 좋아요. 야외 잔디밭에서 피크닉 가능!', 'user_review', '쌍둥이엄마', NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'activity', '어린이과학관 물놀이 체험은 꼭 여벌옷 챙기세요! 앞치마 제공하지만 다 젖어요.', 'instagram', '초보맘', ARRAY['24_48', 'over_48']),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'caution', '천체관은 어두워서 어린 아기들이 무서워할 수 있어요. 3세 이하는 패스 추천!', 'blog', '돌쟁이맘', ARRAY['0_12', '13_24']);

-- 2. 대전어린이회관
INSERT INTO places (id, name, category, sub_category, address, address_detail, lat, lng, region, phone, homepage, operating_hours, holiday_info, is_indoor, is_outdoor, data_sources, is_verified, popularity_score)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  '대전어린이회관',
  '체험시설',
  '어린이전용시설',
  '대전광역시 유성구 월드컵대로 32',
  '월드컵경기장 동문 주차장 이용',
  36.3669,
  127.3196,
  '유성구',
  '042-824-5500',
  'https://www.daejeon.go.kr/chd',
  '{"tue": {"open": "09:30", "close": "17:30"}, "wed": {"open": "09:30", "close": "17:30"}, "thu": {"open": "09:30", "close": "17:30"}, "fri": {"open": "09:30", "close": "17:30"}, "sat": {"open": "09:30", "close": "17:30"}, "sun": {"open": "09:30", "close": "17:30"}, "mon": {"closed": true}}',
  '매주 월요일, 법정공휴일',
  true,
  true,
  ARRAY['naver_map', 'instagram', 'official'],
  true,
  90
);

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, age_recommendations, price_adult, price_child, price_toddler, price_note, is_free, reservation_required, features, highlights, recommended_duration)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  3,
  4,
  5,
  5,
  4,
  2,
  '{
    "0_12": "아기쉼터가 있어서 수유하기 좋아요. 하지만 체험활동은 제한적이에요.",
    "13_24": "뚜벅이 놀이터가 안전하고 좋아요! 공도 많고 미끄럼틀도 낮아요.",
    "24_48": "이 연령대에 최적화! 모든 체험 시설을 즐길 수 있어요.",
    "over_48": "역할놀이, 과학놀이 등 다양한 체험이 가능해요.",
    "elementary_low": "방과 후에도 이용 가능한 프로그램이 많아요.",
    "elementary_high": "너무 유아 중심이라 시시해할 수 있어요."
  }'::jsonb,
  0,
  0,
  0,
  '대전시민 무료 (신분증 지참 필수!)',
  true,
  true,
  ARRAY['무료', '안전한 시설', '연령별 공간', '체험 중심'],
  '[
    {"name": "뚜벅이놀이터", "description": "36개월 이하 전용 놀이공간. 부모님도 함께 들어가서 놀 수 있어요.", "age_group": ["0_12", "13_24"]},
    {"name": "상상놀이터", "description": "역할놀이, 블록놀이 등 창의력 발달 공간", "age_group": ["24_48", "over_48"]},
    {"name": "과학놀이터", "description": "간단한 과학 실험과 체험", "age_group": ["over_48", "elementary_low"]},
    {"name": "야외놀이터", "description": "모래놀이터와 물놀이 시설 (여름 한정)", "age_group": ["24_48", "over_48"]}
  ]'::jsonb,
  '2-3시간'
);

INSERT INTO place_amenities (place_id, parking_available, parking_free, parking_fee, parking_note, nursing_room, nursing_room_detail, diaper_change_table, kids_toilet, kids_toilet_detail, family_restroom, stroller_accessible, baby_chair, food_allowed, microwave_available, hot_water, playground_inside, playground_outside, wifi_available, shoe_storage)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  true,
  false,
  1000,
  '월드컵경기장 동문 주차장 이용. 2시간 이후 시간당 1000원. 토요일은 무료!',
  true,
  '1층과 2층에 수유실 있어요. 1층이 더 넓고 쾌적해요.',
  true,
  true,
  '각 층마다 유아 화장실 있어요. 아이 높이에 맞춰져 있어 혼자서도 잘해요.',
  true,
  true,
  false,
  false,
  true,
  true,
  true,
  true,
  true,
  true
);

INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname, related_ages)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'visit_time', '오전 시간대가 덜 붐벼요. 특히 평일 오전은 거의 전세 느낌!', 'instagram', '유성맘', NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'activity', '홈페이지에서 사전 예약 필수! 현장 접수는 거의 불가능해요.', 'blog', '대전육아', NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'food', '내부 매점이 없어서 간식 챙겨가세요. 1층 휴게실에서 먹을 수 있어요.', 'user_review', '두아이맘', NULL);

-- 3. 한밭수목원
INSERT INTO places (id, name, category, sub_category, address, address_detail, lat, lng, region, phone, homepage, operating_hours, is_indoor, is_outdoor, data_sources, is_verified, popularity_score)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  '한밭수목원',
  '공원',
  '수목원',
  '대전광역시 서구 둔산대로 169',
  '정문, 동문, 남문 모두 이용 가능',
  36.3674,
  127.3884,
  '서구',
  '042-270-8452',
  'https://www.daejeon.go.kr/gar',
  '{"daily": {"open": "06:00", "close": "21:00"}}',
  false,
  true,
  ARRAY['naver_map', 'instagram', 'blog'],
  true,
  88
);

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, age_recommendations, is_free, reservation_required, features, highlights, recommended_duration)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  5,
  5,
  5,
  5,
  4,
  3,
  '{
    "0_12": "유모차 산책하기 최고! 나무 그늘이 많아 여름에도 시원해요.",
    "13_24": "넓은 잔디밭에서 걸음마 연습하기 좋아요. 안전해요!",
    "24_48": "곤충생태관, 열대식물원 등 볼거리가 많아요.",
    "over_48": "자전거 타기, 배드민턴 등 활동적인 놀이 가능!",
    "elementary_low": "계절별 식물 관찰하며 자연 학습하기 좋아요.",
    "elementary_high": "친구들과 피크닉하기 좋은 장소예요."
  }'::jsonb,
  true,
  false,
  ARRAY['무료', '넓은 공간', '자연 친화적', '산책하기 좋음', '사계절 이용'],
  '[
    {"name": "열대식물원", "description": "따뜻한 온실에 다양한 열대 식물. 겨울에 인기!", "age_group": ["all"]},
    {"name": "곤충생태관", "description": "살아있는 곤충 관찰. 나비 보기 좋아요.", "age_group": ["24_48", "over_48", "elementary_low"]},
    {"name": "장미원", "description": "5-6월 장미 축제. 사진 찍기 좋아요.", "age_group": ["all"]},
    {"name": "잔디광장", "description": "돗자리 펴고 피크닉하기 최고의 장소", "age_group": ["all"]}
  ]'::jsonb,
  '2시간 이상'
);

INSERT INTO place_amenities (place_id, parking_available, parking_free, parking_note, nursing_room, kids_toilet, stroller_accessible, food_allowed, playground_outside, rest_area, wifi_available)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  true,
  true,
  '주말엔 주차가 어려워요. 대중교통 이용 추천!',
  false,
  false,
  true,
  true,
  true,
  true,
  false
);

INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'visit_time', '봄 벚꽃, 가을 단풍 시즌이 최고! 하지만 사람도 많아요.', 'instagram', '서구맘'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'parking', '남문 주차장이 그나마 여유있어요. 동문은 항상 만차!', 'blog', '대전아빠'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'activity', '자전거, 킥보드 가져가면 더 재밌어요. 길이 잘 되어있어요.', 'user_review', '활동맘'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'caution', '수유실이 없어서 아기띠나 수유케이프 필수예요!', 'instagram', '모유수유맘');

-- 4. 대전시립미술관
INSERT INTO places (id, name, category, sub_category, address, address_detail, lat, lng, region, phone, homepage, operating_hours, holiday_info, is_indoor, data_sources, is_verified, popularity_score)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  '대전시립미술관',
  '박물관',
  '미술관',
  '대전광역시 서구 둔산대로 155',
  '한밭수목원 옆',
  36.3671,
  127.3901,
  '서구',
  '042-602-3200',
  'https://dmma.daejeon.go.kr',
  '{"tue": {"open": "10:00", "close": "18:00"}, "wed": {"open": "10:00", "close": "18:00"}, "thu": {"open": "10:00", "close": "18:00"}, "fri": {"open": "10:00", "close": "18:00"}, "sat": {"open": "10:00", "close": "18:00"}, "sun": {"open": "10:00", "close": "18:00"}, "mon": {"closed": true}}',
  '매주 월요일, 1월 1일, 설날, 추석',
  true,
  ARRAY['naver_map', 'instagram', 'official'],
  true,
  75
);

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, age_recommendations, price_adult, price_child, is_free, features, highlights, recommended_duration)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  2,
  2,
  3,
  4,
  5,
  5,
  '{
    "0_12": "조용한 환경이지만 유모차 이동은 가능해요.",
    "13_24": "아이가 뛰어다니면 안 되는 곳이라 힘들 수 있어요.",
    "24_48": "어린이 전시나 체험 프로그램이 있을 때 방문 추천!",
    "over_48": "미술 감상과 간단한 체험 활동 가능해요.",
    "elementary_low": "어린이 도슨트 프로그램이 재밌어요!",
    "elementary_high": "미술 수업과 연계해서 방문하면 좋아요."
  }'::jsonb,
  500,
  0,
  false,
  ARRAY['교육적', '조용한 환경', '깨끗한 시설'],
  '[
    {"name": "어린이미술관", "description": "어린이 눈높이 전시와 체험 프로그램", "age_group": ["24_48", "over_48", "elementary_low"]},
    {"name": "창작센터", "description": "주말 가족 미술 체험 프로그램 운영", "age_group": ["over_48", "elementary_low", "elementary_high"]}
  ]'::jsonb,
  '1-2시간'
);

-- 5. 엑스포 시민광장
INSERT INTO places (id, name, category, sub_category, address, address_detail, lat, lng, region, phone, operating_hours, is_indoor, is_outdoor, data_sources, is_verified, popularity_score)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
  '엑스포 시민광장',
  '공원',
  '광장',
  '대전광역시 유성구 대덕대로 480',
  '엑스포다리 아래 한빛탑 광장',
  36.3755,
  127.3788,
  '유성구',
  '042-250-1214',
  '{"daily": {"open": "00:00", "close": "24:00"}}',
  false,
  true,
  ARRAY['naver_map', 'instagram'],
  true,
  85
);

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, age_recommendations, is_free, features, highlights, recommended_duration)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
  4,
  5,
  5,
  5,
  5,
  4,
  '{
    "0_12": "유모차 타고 산책하기 좋아요. 저녁에는 한빛탑 조명이 예뻐요.",
    "13_24": "넓은 광장에서 마음껏 걷기 연습! 비둘기 구경도 재밌어해요.",
    "24_48": "자전거, 킥보드 타기 최고! 버블건 가져가면 더 신나요.",
    "over_48": "인라인, 자전거 등 바퀴 달린 것은 다 탈 수 있어요!",
    "elementary_low": "친구들과 공놀이, 배드민턴 하기 좋아요.",
    "elementary_high": "저녁에 농구, 스케이트보드 타는 사람들 많아요."
  }'::jsonb,
  true,
  ARRAY['무료', '넓은 공간', '야외 활동', '접근성 좋음'],
  '[
    {"name": "음악분수", "description": "여름 저녁 음악에 맞춰 분수쇼 (4-10월 운영)", "age_group": ["all"]},
    {"name": "한빛탑", "description": "대전의 랜드마크. 야간 조명이 아름다워요", "age_group": ["all"]},
    {"name": "갑천 산책로", "description": "광장에서 이어지는 갑천변 자전거길", "age_group": ["over_48", "elementary_low", "elementary_high"]}
  ]'::jsonb,
  '1-3시간'
);

INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'visit_time', '여름 저녁 7-8시 음악분수 시간에 맞춰 가면 최고예요!', 'instagram', '유성동맘'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'activity', '그늘이 없어서 낮에는 텐트나 돗자리, 선크림 필수!', 'blog', '야외활동맘'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'etc', '주변에 편의점, 카페가 많아서 간식 사기 편해요.', 'user_review', '편의맘');

-- 행사 정보 예시
INSERT INTO events (place_id, event_type, title, description, start_date, end_date, is_permanent, target_ages, is_free, reservation_required)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'program', '토요 과학 교실', '매주 토요일 진행되는 과학 실험 프로그램', '2024-01-01', '2024-12-31', false, ARRAY['elementary_low', 'elementary_high'], true, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'workshop', '엄마랑 아기랑 오감놀이', '18개월 이하 영아 대상 오감발달 프로그램', '2024-01-01', '2024-12-31', false, ARRAY['0_12', '13_24'], true, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'program', '어린이 도슨트', '어린이 눈높이로 설명하는 미술관 투어', '2024-01-01', '2024-12-31', false, ARRAY['over_48', 'elementary_low'], false, true);

-- 더 많은 장소들 추가 가능...
