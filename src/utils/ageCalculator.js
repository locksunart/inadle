/**
 * 생년월을 기준으로 개월 수와 연령을 계산하는 유틸리티
 * 매월 1일생으로 가정하여 계산
 */

/**
 * 생년월로부터 현재까지의 개월 수 계산 (매월 1일생 가정)
 * @param {string} birthYearMonth - 생년월 (YYYY-MM 형식)
 * @returns {number} - 개월 수
 */
export const calculateMonths = (birthYearMonth) => {
  if (!birthYearMonth) return 0;
  
  // YYYY-MM 형식에서 연도와 월 추출
  const [birthYear, birthMonth] = birthYearMonth.split('-').map(Number);
  
  if (!birthYear || !birthMonth) return 0;
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // getMonth()는 0부터 시작
  
  // 연도와 월 차이 계산 (매월 1일생 가정)
  const yearDiff = currentYear - birthYear;
  const monthDiff = currentMonth - birthMonth;
  
  const totalMonths = yearDiff * 12 + monthDiff;
  
  return Math.max(0, totalMonths); // 음수 방지
};

/**
 * 개월 수를 기준으로 연령 표시 문자열 생성
 * @param {number} months - 개월 수
 * @returns {string} - 연령 표시 문자열
 */
export const getAgeDisplay = (months) => {
  if (months < 24) {
    return `${months}개월`;
  } else {
    const years = Math.floor(months / 12);
    return `만 ${years}세`;
  }
};

/**
 * 생년월을 기준으로 연령 표시 문자열 생성
 * @param {string} birthYearMonth - 생년월 (YYYY-MM 형식)
 * @returns {string} - 연령 표시 문자열
 */
export const getAgeFromBirthDate = (birthYearMonth) => {
  if (!birthYearMonth) return '';
  
  const months = calculateMonths(birthYearMonth);
  return getAgeDisplay(months);
};

/**
 * 생년월 유효성 검사
 * @param {string} birthYearMonth - 생년월 (YYYY-MM 형식)
 * @returns {boolean} - 유효한 년월인지 여부
 */
export const isValidBirthDate = (birthYearMonth) => {
  if (!birthYearMonth) return false;
  
  // YYYY-MM 형식 검사
  const yearMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!yearMonthRegex.test(birthYearMonth)) {
    return false;
  }
  
  const [year, month] = birthYearMonth.split('-').map(Number);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // 미래 년월인지 확인
  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    return false;
  }
  
  // 너무 오래된 년월인지 확인 (20년 전까지만)
  const twentyYearsAgo = currentYear - 20;
  if (year < twentyYearsAgo) {
    return false;
  }
  
  return true;
};

/**
 * 개월 수로 연령대 그룹 반환 (장소 추천 등에 활용)
 * @param {number} months - 개월 수
 * @returns {string} - 연령대 그룹
 */
export const getAgeGroup = (months) => {
  if (months < 12) return 'infant'; // 영아 (0-11개월)
  if (months < 24) return 'toddler_early'; // 걸음마 초기 (12-23개월)
  if (months < 36) return 'toddler_late'; // 걸음마 후기 (24-35개월)
  if (months < 60) return 'preschool'; // 유아 (36-59개월)
  return 'school_age'; // 취학 전후 (60개월+)
};

/**
 * 현재 년월을 YYYY-MM 형식으로 반환
 * @returns {string} - 현재 년월 (YYYY-MM)
 */
export const getCurrentYearMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * 최소 가능한 생년월 반환 (20년 전)
 * @returns {string} - 최소 생년월 (YYYY-MM)
 */
export const getMinBirthYearMonth = () => {
  const today = new Date();
  const minYear = today.getFullYear() - 20;
  return `${minYear}-01`;
};
