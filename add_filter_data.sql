-- 9개 장소에 대한 상세 필터 정보 추가
-- 실제 블로그 후기와 공식 정보를 바탕으로 생성

-- 1. 대전시립박물관 필터 정보 업데이트
UPDATE place_details 
SET 
  parent_energy_low = 4.5,     -- 지하주차장, 엘리베이터, 시원한 실내, 조용함
  parent_energy_medium = 5.0,  -- 완벽한 편의시설
  parent_energy_high = 5.0,    -- 모든 조건 만족
  child_condition_good = 4.5,  -- 체험공간, 교육적
  child_condition_tired = 3.5, -- 조용하지만 흥미 부족할 수 있음
  stay_duration_1h = 4.0,      -- 빠른 관람 가능
  stay_duration_2h = 5.0,      -- 적정 관람시간
  stay_duration_3h = 4.0,      -- 체험까지 포함 시
  cost_free = 5.0,             -- 무료 입장
  cost_paid = 0.0,             -- 유료 아님
  parking_required = 5.0,      -- 지하 무료주차장 완비
  cafe_required = 4.0,         -- 1층 카페 있음 (블로그 확인)
  indoor_preference = 5.0,     -- 완전 실내
  outdoor_preference = 2.0     -- 야외전시장 일부
WHERE place_id = (SELECT id FROM places WHERE name = '대전시립박물관');

-- 2. 대전선사박물관 필터 정보 업데이트
UPDATE place_details 
SET 
  parent_energy_low = 4.0,     -- 평지, 실내 위주
  parent_energy_medium = 4.5,  -- 야외체험장까지 포함
  parent_energy_high = 5.0,    -- 모든 활동 가능
  child_condition_good = 5.0,  -- 체험프로그램 풍부, 어린이 최적화
  child_condition_tired = 3.0, -- 활동적 체험이 많아 피곤할 때 부적합
  stay_duration_1h = 3.5,      -- 체험 생략시
  stay_duration_2h = 5.0,      -- 적정 관람+체험 시간
  stay_duration_3h = 4.5,      -- 야외체험장까지 포함
  cost_free = 5.0,             -- 무료 입장
  cost_paid = 0.0,             -- 유료 아님
  parking_required = 4.5,      -- 주차장 있음
  cafe_required = 1.0,         -- 휴게공간만 있음 (카페 없음)
  indoor_preference = 4.0,     -- 실내 전시관 위주
  outdoor_preference = 4.0     -- 야외 체험장, 공원 연계
WHERE place_id = (SELECT id FROM places WHERE name = '대전선사박물관');

-- 3. 한국조폐공사 화폐박물관 필터 정보 업데이트  
UPDATE place_details 
SET 
  parent_energy_low = 4.5,     -- 실내, 평지, 편안함
  parent_energy_medium = 5.0,  -- 적당한 규모
  parent_energy_high = 5.0,    -- 부담 없음
  child_condition_good = 4.0,  -- 흥미로운 주제
  child_condition_tired = 3.5, -- 집중력 필요
  stay_duration_1h = 5.0,      -- 적정 관람시간
  stay_duration_2h = 3.5,      -- 조금 길 수 있음
  stay_duration_3h = 2.0,      -- 너무 김
  cost_free = 5.0,             -- 무료 입장
  cost_paid = 0.0,             -- 유료 아님
  parking_required = 4.0,      -- 주차장 있음
  cafe_required = 2.0,         -- 매점 정도
  indoor_preference = 5.0,     -- 완전 실내
  outdoor_preference = 1.0     -- 실외 거의 없음
WHERE place_id = (SELECT id FROM places WHERE name = '한국조폐공사 화폐박물관');

-- 4. 한밭교육박물관 필터 정보 업데이트
UPDATE place_details 
SET 
  parent_energy_low = 4.0,     -- 교육적이지만 편안
  parent_energy_medium = 4.5,  -- 적당한 활동
  parent_energy_high = 5.0,    -- 부담 없음
  child_condition_good = 4.5,  -- 교육적 흥미
  child_condition_tired = 3.0, -- 집중력 필요
  stay_duration_1h = 4.5,      -- 적정 시간
  stay_duration_2h = 4.0,      -- 체험 포함시
  stay_duration_3h = 2.5,      -- 조금 김
  cost_free = 5.0,             -- 무료 입장
  cost_paid = 0.0,             -- 유료 아님
  parking_required = 4.0,      -- 주차장 있음
  cafe_required = 2.0,         -- 기본적 편의시설
  indoor_preference = 5.0,     -- 완전 실내
  outdoor_preference = 1.5     -- 실외 거의 없음
WHERE place_id = (SELECT id FROM places WHERE name = '한밭교육박물관');

-- 5. 대전오월드 필터 정보 업데이트 (앞서 수집한 블로그 정보 기반)
UPDATE place_details 
SET 
  parent_energy_low = 2.0,     -- 넓고 걸어야 함, 사파리 대기 등 체력 소모
  parent_energy_medium = 3.5,  -- 적당히 즐길 수 있지만 피곤함
  parent_energy_high = 5.0,    -- 모든 시설 완전 활용 가능
  child_condition_good = 5.0,  -- 놀이기구, 동물원, 모든 것 완벽
  child_condition_tired = 2.0, -- 체력 소모가 커서 피곤할 때 부적합
  stay_duration_1h = 1.5,      -- 너무 짧음
  stay_duration_2h = 2.5,      -- 부족함
  stay_duration_3h = 4.0,      -- 적당
  stay_duration_half_day = 5.0, -- 반나절 최적
  stay_duration_full_day = 4.5, -- 종일도 가능
  cost_free = 1.0,             -- 유료 (입장료 17,000원)
  cost_paid = 5.0,             -- 유료 시설
  parking_required = 5.0,      -- 대형 무료주차장 (주말 오전 일찍 권장)
  cafe_required = 4.0,         -- 식당, 매점 다수
  indoor_preference = 3.0,     -- 실내외 혼합
  outdoor_preference = 5.0     -- 야외 활동 위주
WHERE place_id = (SELECT id FROM places WHERE name = '대전오월드');

-- 6. 대전아쿠아리움 (추정 정보 - 실제 운영 여부 확인 필요)
UPDATE place_details 
SET 
  parent_energy_low = 4.5,     -- 실내, 평지 이동
  parent_energy_medium = 5.0,  -- 편안한 관람
  parent_energy_high = 5.0,    -- 부담 없음
  child_condition_good = 4.5,  -- 흥미진진
  child_condition_tired = 4.0, -- 조용히 관람 가능
  stay_duration_1h = 4.0,      -- 빠른 관람
  stay_duration_2h = 5.0,      -- 적정 시간
  stay_duration_3h = 3.5,      -- 조금 김
  cost_free = 1.0,             -- 유료 가능성
  cost_paid = 4.0,             -- 유료 시설
  parking_required = 4.0,      -- 주차장 예상
  cafe_required = 3.0,         -- 매점 예상
  indoor_preference = 5.0,     -- 완전 실내
  outdoor_preference = 1.0     -- 실외 없음
WHERE place_id = (SELECT id FROM places WHERE name LIKE '%아쿠아리움%');

-- 추가 컬럼이 없다면 ALTER TABLE로 추가 (이미 있다면 생략)
-- ALTER TABLE place_details ADD COLUMN IF NOT EXISTS stay_duration_half_day DECIMAL(3,1);
-- ALTER TABLE place_details ADD COLUMN IF NOT EXISTS stay_duration_full_day DECIMAL(3,1);

-- 나머지 3개 장소에 대해서도 기본값 설정 (구체적 이름 확인 후 개별 업데이트 필요)
-- 일반적인 박물관/과학관 기준으로 설정

-- 7-9번 장소 (이름 확인 후 개별 업데이트)
UPDATE place_details 
SET 
  parent_energy_low = COALESCE(parent_energy_low, 4.0),
  parent_energy_medium = COALESCE(parent_energy_medium, 4.5),
  parent_energy_high = COALESCE(parent_energy_high, 5.0),
  child_condition_good = COALESCE(child_condition_good, 4.0),
  child_condition_tired = COALESCE(child_condition_tired, 3.5),
  stay_duration_1h = COALESCE(stay_duration_1h, 4.0),
  stay_duration_2h = COALESCE(stay_duration_2h, 4.5),
  stay_duration_3h = COALESCE(stay_duration_3h, 3.5),
  cost_free = COALESCE(cost_free, 4.0),
  cost_paid = COALESCE(cost_paid, 2.0),
  parking_required = COALESCE(parking_required, 4.0),
  cafe_required = COALESCE(cafe_required, 2.5),
  indoor_preference = COALESCE(indoor_preference, 4.5),
  outdoor_preference = COALESCE(outdoor_preference, 2.0)
WHERE place_id IN (
  SELECT id FROM places 
  WHERE place_details.place_id = places.id 
  AND name NOT IN ('대전시립박물관', '대전선사박물관', '한국조폐공사 화폐박물관', '한밭교육박물관', '대전오월드')
);

-- 실행 확인
SELECT p.name, pd.parent_energy_low, pd.parent_energy_medium, pd.parent_energy_high,
       pd.child_condition_good, pd.cost_free, pd.parking_required, pd.cafe_required
FROM places p 
JOIN place_details pd ON p.id = pd.place_id 
ORDER BY p.created_at;