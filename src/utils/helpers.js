// 날짜 관련 유틸리티 함수들

export const dateUtils = {
  // 상대적 시간 표시 (예: 3일 전, 2주 전)
  getRelativeTime(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    if (weeks < 4) return `${weeks}주 전`;
    if (months < 12) return `${months}개월 전`;
    return `${years}년 전`;
  },
  
  // 날짜 포맷팅
  formatDate(date, format = 'YYYY.MM.DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  },
  
  // 요일 구하기
  getDayOfWeek(date) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[new Date(date).getDay()];
  }
};

// 나이 계산 유틸리티
export const ageUtils = {
  // 생년월일로 개월수 계산
  calculateMonths(birthYear, birthMonth) {
    const today = new Date();
    const birthDate = new Date(birthYear, birthMonth - 1);
    
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    
    return years * 12 + months;
  },
  
  // 개월수를 읽기 좋은 형태로 변환
  formatAge(months) {
    if (months < 12) {
      return `${months}개월`;
    } else if (months < 24) {
      return `${months}개월`;
    } else if (months < 72) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years}세 ${remainingMonths}개월` : `${years}세`;
    } else {
      const years = Math.floor(months / 12);
      return `${years}세`;
    }
  },
  
  // 연령 그룹 판별
  getAgeGroup(months) {
    if (months <= 12) return '0_12_months';
    if (months <= 24) return '12_24_months';
    if (months <= 48) return '24_48_months';
    if (months <= 72) return 'over_48_months';
    if (months <= 108) return 'elementary_low';
    return 'elementary_high';
  },
  
  // 연령 그룹 라벨
  getAgeGroupLabel(ageGroup) {
    const labels = {
      '0_12_months': '0~12개월',
      '12_24_months': '12~24개월',
      '24_48_months': '2~4세',
      'over_48_months': '4세 이상',
      'elementary_low': '초등 저학년',
      'elementary_high': '초등 고학년'
    };
    return labels[ageGroup] || '';
  }
};

// 거리 계산 유틸리티
export const distanceUtils = {
  // 두 지점 간 거리 계산 (km)
  calculate(lat1, lng1, lat2, lng2) {
    const R = 6371; // 지구 반경 (km)
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
  
  toRad(deg) {
    return deg * (Math.PI / 180);
  },
  
  // 거리를 읽기 좋은 형태로 변환
  format(km) {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  },
  
  // 이동 시간 추정 (자동차 기준)
  estimateDriveTime(km) {
    // 시내 평균 속도 30km/h 가정
    const minutes = Math.round((km / 30) * 60);
    if (minutes < 60) {
      return `약 ${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `약 ${hours}시간 ${remainingMinutes}분` : `약 ${hours}시간`;
  }
};

// 검증 유틸리티
export const validationUtils = {
  // 이메일 검증
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  // 비밀번호 강도 체크
  checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    const levels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
    return {
      score: strength,
      level: levels[strength]
    };
  }
};

// 로컬 스토리지 유틸리티
export const storageUtils = {
  // 안전한 JSON 파싱
  getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`로컬 스토리지 읽기 오류 (${key}):`, error);
      return null;
    }
  },
  
  // 안전한 JSON 저장
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`로컬 스토리지 저장 오류 (${key}):`, error);
      return false;
    }
  },
  
  // 삭제
  removeItem(key) {
    localStorage.removeItem(key);
  },
  
  // 모두 삭제
  clear() {
    localStorage.clear();
  }
};

// 문자열 유틸리티
export const stringUtils = {
  // HTML 태그 제거
  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },
  
  // 문자열 자르기 (말줄임표 추가)
  truncate(str, length = 50) {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  },
  
  // 전화번호 포맷팅
  formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2,3})(\d{3,4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return phone;
  }
};

export default {
  dateUtils,
  ageUtils,
  distanceUtils,
  validationUtils,
  storageUtils,
  stringUtils
};
