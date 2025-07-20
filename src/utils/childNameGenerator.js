import { supabase } from '../services/supabase';

// 기본 아이 이름 생성 함수
export const generateDefaultChildName = async () => {
  try {
    // 현재 데이터베이스에 있는 아이들의 수 세기
    const { data, error } = await supabase
      .from('user_profiles')
      .select('child_name')
      .not('child_name', 'is', null)
      .ilike('child_name', '아이%');
    
    if (error) {
      console.error('아이 수 세기 오류:', error);
      return '아이1'; // 기본값
    }
    
    // '아이' + 숫자 패턴의 이름들 추출
    const childNumbers = data
      .map(item => {
        const match = item.child_name.match(/^아이(\d+)$/); // 숫자 추출
        return match ? parseInt(match[1]) : null;
      })
      .filter(num => num !== null)
      .sort((a, b) => a - b);
    
    // 다음 번호 찾기
    let nextNumber = 1;
    for (const num of childNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }
    
    return `아이${nextNumber}`;
  } catch (error) {
    console.error('기본 이름 생성 오류:', error);
    return '아이1';
  }
};
