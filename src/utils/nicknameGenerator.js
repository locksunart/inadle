// 앱 느낌에 어울리는 랜덤 닉네임 생성기

const ADJECTIVES = [
  '사랑스러운', '귀여운', '깜찍한', '포근한', '따뜻한', 
  '밝은', '활발한', '즐거운', '행복한', '웃는',
  '달콤한', '부드러운', '예쁜', '소중한', '특별한',
  '반짝이는', '상냥한', '친근한', '온화한', '평화로운'
];

const NOUNS = [
  '엄마', '아빠', '가족', '별님', '햇님',
  '꽃님', '나비', '새싹', '하늘', '무지개',
  '천사', '요정', '공주', '왕자', '보물',
  '꿈나무', '희망', '사랑', '기쁨', '웃음'
];

/**
 * 앱 느낌에 어울리는 랜덤 닉네임 생성
 * @returns {string} 생성된 닉네임
 */
export const generateRandomNickname = () => {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adjective}${noun}${number}`;
};

/**
 * 닉네임 유효성 검사
 * @param {string} nickname - 검사할 닉네임
 * @returns {boolean} 유효한지 여부
 */
export const isValidNickname = (nickname) => {
  if (!nickname || typeof nickname !== 'string') {
    return false;
  }
  
  // 길이 체크 (2-20자)
  if (nickname.length < 2 || nickname.length > 20) {
    return false;
  }
  
  // 특수문자 제한 (한글, 영문, 숫자만 허용)
  const validPattern = /^[가-힣a-zA-Z0-9]+$/;
  return validPattern.test(nickname);
};

/**
 * 닉네임 중복 체크
 * @param {string} nickname - 체크할 닉네임
 * @param {string} currentUserId - 현재 사용자 ID (수정 시 자신 제외)
 * @returns {Promise<boolean>} 중복 여부
 */
export const checkNicknameDuplicate = async (nickname, currentUserId = null) => {
  try {
    const { supabase } = await import('../services/supabase');
    
    let query = supabase
      .from('user_profiles')
      .select('user_id')
      .eq('nickname', nickname);
    
    // 현재 사용자는 제외
    if (currentUserId) {
      query = query.neq('user_id', currentUserId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('닉네임 중복 체크 오류:', error);
      return false; // 오류 시 중복 없음으로 처리
    }
    
    return data && data.length > 0; // true면 중복
  } catch (error) {
    console.error('닉네임 중복 체크 오류:', error);
    return false;
  }
};
