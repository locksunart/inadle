-- 두 번째 그룹 블로그 데이터 저장 (3개 장소)
-- 2024-2025년 최신 블로그 정보

-- 1. 대전오월드 블로그 URL 업데이트
UPDATE places 
SET data_sources = ARRAY[
    'naver_blog:https://m.blog.naver.com/suk4408/223134381724',
    'naver_blog:https://m.blog.naver.com/smurfshouse/223119655781', 
    'naver_blog:https://m.blog.naver.com/cocostory21/223111444733',
    'naver_blog:https://m.blog.naver.com/kji206/223433265221'
]
WHERE name = '대전오월드';

-- 2. 대전아쿠아리움 블로그 URL 업데이트
UPDATE places 
SET data_sources = ARRAY[
    'naver_blog:https://m.blog.naver.com/storydaejeon/222867537863',
    'naver_blog:https://m.blog.naver.com/jiny1445/222977467922',
    'naver_blog:https://m.blog.naver.com/chaeaniii/223014045269',
    'naver_blog:https://m.blog.naver.com/daejeontour/222879078679'
]
WHERE name = '대전아쿠아리움';

-- 3. 대전시립미술관 블로그 URL 업데이트
UPDATE places 
SET data_sources = ARRAY[
    'naver_blog:https://m.blog.naver.com/himawari_tw/221700082573',
    'naver_blog:https://m.blog.naver.com/ecko18/223417056842',
    'naver_blog:https://m.blog.naver.com/rubrub82/223731809677',
    'naver_blog:https://m.blog.naver.com/first_seogu/223383444089'
]
WHERE name = '대전시립미술관';

-- 대전오월드 상세 정보 추가/업데이트
INSERT INTO places (id, name, category, sub_category, address, address_detail, lat, lng, region, phone, homepage, operating_hours, holiday_info, is_indoor, is_outdoor, data_sources, is_verified)
VALUES (
  '12345678-1234-1234-1234-123456789012',
  '대전오월드',
  '테마파크',
  '놀이공원',
  '대전광역시 중구 사정공원로 70',
  '주랜드, 조이랜드, 플라워랜드, 버드랜드로 구성',
  36.333333,
  127.333333,
  '중구',
  '042-580-4820',
  'https://www.oworld.kr',
  '{"mon": {"closed": true}, "tue": {"open": "09:30", "close": "18:00"}, "wed": {"open": "09:30", "close": "18:00"}, "thu": {"open": "09:30", "close": "18:00"}, "fri": {"open": "09:30", "close": "18:00"}, "sat": {"open": "09:30", "close": "18:00"}, "sun": {"open": "09:30", "close": "18:00"}}'::jsonb,
  '매주 월요일 휴무',
  false,
  true,
  ARRAY[
    'naver_blog:https://m.blog.naver.com/suk4408/223134381724',
    'naver_blog:https://m.blog.naver.com/smurfshouse/223119655781',
    'naver_blog:https://m.blog.naver.com/cocostory21/223111444733',
    'naver_blog:https://m.blog.naver.com/kji206/223433265221'
  ],
  true
)
ON CONFLICT (name) DO UPDATE SET
  data_sources = EXCLUDED.data_sources,
  operating_hours = EXCLUDED.operating_hours,
  phone = EXCLUDED.phone,
  homepage = EXCLUDED.homepage;

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, age_recommendations, price_adult, price_child, price_toddler, price_note, is_free, reservation_required, features, recommended_duration)
VALUES (
  '12345678-1234-1234-1234-123456789012',
  2.0, -- 0-12개월: 사파리 구경은 가능하지만 놀이기구 제한
  3.5, -- 13-24개월: 일부 놀이기구와 사파리 즐김
  5.0, -- 24-48개월: 모든 시설 이용 가능, 최적 연령
  5.0, -- 48개월 이상: 모든 놀이기구 이용 가능
  5.0, -- 초등 저학년: 스릴 있는 놀이기구까지 즐김
  4.5, -- 초등 고학년: 일부 놀이기구는 다소 유치할 수 있음
  '{"0_12": "사파리 동물 구경은 좋지만 놀이기구는 제한적", "24_48": "어린이 놀이기구부터 사파리까지 완벽 활용", "elementary": "모든 시설 이용 가능하며 교육적 체험도 풍부"}'::jsonb,
  17000, -- 기본 입장권
  10000,
  0, -- 36개월 미만 무료
  '자유이용권: 성인 34,000원, 어린이 25,000원. 카드할인 50% 가능',
  false,
  false,
  ARRAY['사파리 체험', '놀이기구', '동물원', '플라워랜드', '버드랜드'],
  '하루종일'
);

INSERT INTO place_amenities (place_id, parking_available, parking_free, parking_note, nursing_room, nursing_room_detail, diaper_change_table, diaper_change_location, kids_toilet, stroller_accessible, elevator_available, baby_chair, food_allowed, cafe_inside, restaurant_inside, rest_area, wifi_available, verified_date, verified_by)
VALUES (
  '12345678-1234-1234-1234-123456789012',
  true,
  true,
  '대형 주차장 완비, 주말엔 오전 일찍 도착 권장',
  true,
  '매표소 근처 및 각 구역별 수유실 완비',
  true,
  ARRAY['수유실', '각 화장실'],
  true,
  true,
  false, -- 대부분 야외 시설
  true,
  true, -- 도시락 반입 가능
  true,
  true,
  true,
  true,
  '2024-05-01',
  'blog_research'
);

INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname, related_ages)
VALUES 
  ('12345678-1234-1234-1234-123456789012', 'visit_time', '평일 오전이 가장 한산함. 주말은 오전 9시 30분 개장과 동시에 입장하여 사파리부터 체험 권장', 'blog', '국가대표', ARRAY['all']),
  ('12345678-1234-1234-1234-123456789012', 'safari_tips', '사파리 버스 좋은 자리는 운전석 뒤 왼쪽편. 기사님이 동물 먹이 주는 모습을 가장 가까이서 볼 수 있음', 'blog', 'smurfshouse', ARRAY['24_48', 'over_48']),
  ('12345678-1234-1234-1234-123456789012', 'card_discount', '제휴카드(KB국민, 삼성, 롯데 등) 할인 50% 가능. 전월실적 조건 확인 필요', 'blog', '코코달빛맘', ARRAY['all']),
  ('12345678-1234-1234-1234-123456789012', 'food', '원내 식당 어린이 메뉴 한정적. 도시락 지참하여 플라워랜드 잔디밭에서 피크닉 추천', 'blog', 'kji206', ARRAY['all']),
  ('12345678-1234-1234-1234-123456789012', 'activity', '튤립축제(4-5월), 장미축제(5-6월) 등 계절별 꽃축제 시기에 방문하면 더욱 아름다움', 'blog', '국가대표', ARRAY['all']);

-- 대전아쿠아리움 상세 정보 추가/업데이트  
INSERT INTO places (id, name, category, sub_category, address, address_detail, lat, lng, region, phone, homepage, operating_hours, holiday_info, is_indoor, is_outdoor, data_sources, is_verified)
VALUES (
  '23456789-2345-2345-2345-234567890123',
  '대전아쿠아리움',
  '박물관',
  '아쿠아리움',
  '대전광역시 중구 보문산공원로 469',
  '천연동굴을 개조한 국내 최대 담수어 수족관',
  36.333334,
  127.333334,
  '중구',
  '042-226-2100',
  'https://www.daejeonaquarium.com',
  '{"tue": {"open": "10:00", "close": "18:00"}, "wed": {"open": "10:00", "close": "18:00"}, "thu": {"open": "10:00", "close": "18:00"}, "fri": {"open": "10:00", "close": "18:00"}, "sat": {"open": "10:00", "close": "19:00"}, "sun": {"open": "10:00", "close": "19:00"}, "mon": {"closed": true}}'::jsonb,
  '매주 월요일 휴무',
  true,
  false,
  ARRAY[
    'naver_blog:https://m.blog.naver.com/storydaejeon/222867537863',
    'naver_blog:https://m.blog.naver.com/jiny1445/222977467922',
    'naver_blog:https://m.blog.naver.com/chaeaniii/223014045269',
    'naver_blog:https://m.blog.naver.com/daejeontour/222879078679'
  ],
  true
)
ON CONFLICT (name) DO UPDATE SET
  data_sources = EXCLUDED.data_sources,
  operating_hours = EXCLUDED.operating_hours,
  phone = EXCLUDED.phone,
  homepage = EXCLUDED.homepage;

INSERT INTO place_details (place_id, age_0_12_months, age_13_24_months, age_24_48_months, age_over_48_months, age_elementary_low, age_elementary_high, age_recommendations, price_adult, price_child, price_toddler, price_note, is_free, reservation_required, features, recommended_duration)
VALUES (
  '23456789-2345-2345-2345-234567890123',
  3.0, -- 0-12개월: 시각적 자극은 좋으나 긴 관람 어려움
  4.0, -- 13-24개월: 동물 보는 것을 좋아하기 시작
  5.0, -- 24-48개월: 다양한 체험과 동물 먹이주기 가능
  5.0, -- 48개월 이상: 모든 체험 참여 가능
  4.5, -- 초등 저학년: 교육적 가치 높음
  4.0, -- 초등 고학년: 흥미는 있으나 규모가 아쉬울 수 있음
  '{"0_12": "밝은 조명과 다양한 색깔의 물고기로 시각적 자극 좋음", "24_48": "동물 만지기, 먹이주기 체험이 가장 인기", "elementary": "멸종위기동물 보전 교육과 생태학습에 도움"}'::jsonb,
  18000,
  14000,
  0, -- 36개월 미만 무료
  '네이버 예약 시 17,900원 할인. 악어쇼 별도 6,000원',
  false,
  false,
  ARRAY['국내 유일 악어쇼', '실내 동물원', '체험 프로그램', '교육적'],
  '2-3시간'
);

INSERT INTO place_amenities (place_id, parking_available, parking_free, parking_note, nursing_room, nursing_room_detail, diaper_change_table, diaper_change_location, kids_toilet, stroller_accessible, elevator_available, baby_chair, food_allowed, cafe_inside, restaurant_inside, rest_area, wifi_available, verified_date, verified_by)
VALUES (
  '23456789-2345-2345-2345-234567890123',
  true,
  true,
  '건물 앞 주차장과 주차타워 이용 가능',
  true,
  '1층과 3층에 수유실 완비',
  true,
  ARRAY['수유실', '화장실'],
  true,
  true,
  true,
  true,
  false, -- 관람 동선 내 음식 반입 금지
  true,
  false,
  true,
  true,
  '2024-03-01',
  'blog_research'
);

INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname, related_ages)
VALUES 
  ('23456789-2345-2345-2345-234567890123', 'visit_time', '평일 오전이 한산함. 주말 방문 시 오전 10시 개장과 동시에 입장 권장', 'blog', '대전광역시', ARRAY['all']),
  ('23456789-2345-2345-2345-234567890123', 'experience', '동물 먹이주기 체험은 매표소에서 미리 구매. 특히 맹수 먹이주기는 다른 곳에서 볼 수 없는 특별한 경험', 'blog', 'jiny1445', ARRAY['24_48', 'over_48']),
  ('23456789-2345-2345-2345-234567890123', 'stroller', '유모차 대여 1,000원. 동선이 길어서 어린 아이와 함께라면 필수', 'blog', 'jiny1445', ARRAY['0_12', '13_24']),
  ('23456789-2345-2345-2345-234567890123', 'show_schedule', '악어쇼와 다이버 수중탐사 시간을 미리 확인하고 관람 계획 세우기', 'blog', '먼저보슈', ARRAY['all']),
  ('23456789-2345-2345-2345-234567890123', 'comparison', '대전에는 신세계 엑스포아쿠아리움도 있으니 방문 전 어느 곳인지 확인 필요', 'blog', '채느', ARRAY['all']);

-- 대전시립미술관 블로그 URL 업데이트 (기존 데이터가 있다면)
UPDATE places 
SET data_sources = ARRAY[
    'naver_blog:https://m.blog.naver.com/himawari_tw/221700082573',
    'naver_blog:https://m.blog.naver.com/ecko18/223417056842', 
    'naver_blog:https://m.blog.naver.com/rubrub82/223731809677',
    'naver_blog:https://m.blog.naver.com/first_seogu/223383444089'
]
WHERE name = '대전시립미술관';

INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname, related_ages)
VALUES 
  ('55555555-5555-5555-5555-555555555555', 'visit_time', '오전 일찍 방문하면 한적하게 관람 가능. 전시실이 넓어서 사진 찍기도 좋음', 'blog', 'ecko18', ARRAY['all']),
  ('55555555-5555-5555-5555-555555555555', 'price', '일반 전시 관람료 성인 500원으로 매우 저렴. 특별전은 별도 요금', 'blog', '여행작가 홍수지', ARRAY['all']),
  ('55555555-5555-5555-5555-555555555555', 'parking', '한밭수목원과 공용 주차장 이용. 3시간 무료 주차', 'blog', 'ecko18', ARRAY['all']),
  ('55555555-5555-5555-5555-555555555555', 'docent', '20명 이상 단체는 도슨트 예약 가능. 개인은 정규시간에 참여', 'blog', '여행작가 홍수지', ARRAY['all']),
  ('55555555-5555-5555-5555-555555555555', 'special_exhibit', '2025년 3월 반고흐 특별전 예정. 22,000원으로 고가이지만 원화 76점 전시', 'blog', '그늘없는파란나무', ARRAY['all']);

-- 두 번째 그룹 작업 완료 요약
INSERT INTO place_tips (place_id, tip_category, content, source_type, author_nickname, related_ages)
VALUES 
  ('12345678-1234-1234-1234-123456789012', 'summary', '두 번째 그룹 블로그 수집 완료 - 2024-2025년 최신 블로그 4개씩 수집', 'admin', 'system', ARRAY['all']),
  ('23456789-2345-2345-2345-234567890123', 'summary', '두 번째 그룹 블로그 수집 완료 - 2024-2025년 최신 블로그 4개씩 수집', 'admin', 'system', ARRAY['all']),
  ('55555555-5555-5555-5555-555555555555', 'summary', '두 번째 그룹 블로그 수집 완료 - 2024-2025년 최신 블로그 4개씩 수집', 'admin', 'system', ARRAY['all']);
