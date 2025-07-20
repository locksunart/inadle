// 데모 계정 자동 생성 유틸리티
import { supabase } from '../services/supabase';

export const createDemoAccount = async () => {
  try {
    // 먼저 데모 계정으로 로그인 시도
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'demo@inadle.com',
      password: 'demo1234'
    });

    if (signInData?.user) {
      console.log('데모 계정이 이미 존재합니다.');
      return { success: true, user: signInData.user };
    }

    // 로그인 실패 시 계정 생성
    if (signInError?.message?.includes('Invalid login credentials')) {
      console.log('데모 계정 생성 중...');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'demo@inadle.com',
        password: 'demo1234',
        options: {
          data: {
            full_name: '데모 사용자'
          }
        }
      });

      if (signUpError) {
        console.error('데모 계정 생성 실패:', signUpError);
        return { success: false, error: signUpError };
      }

      // 이메일 확인 없이 바로 사용할 수 있도록 설정
      // (실제로는 Supabase 대시보드에서 설정해야 함)
      
      if (signUpData?.user) {
        // 데모 계정은 기본 프로필만 생성 (아이 정보 없이)
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: signUpData.user.id
            // child_name, child_birth_date 필드는 비워두어 모달 표시
          });

        if (profileError) {
          console.error('데모 프로필 생성 실패:', profileError);
        }

        return { success: true, user: signUpData.user };
      }
    }

    return { success: false, error: signInError };
  } catch (error) {
    console.error('데모 계정 처리 중 오류:', error);
    return { success: false, error };
  }
};

// 데모 계정인지 확인
export const isDemoAccount = (email) => {
  return email === 'demo@inadle.com';
};

// 데모 계정 데이터 초기화 (선택사항)
export const resetDemoData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && isDemoAccount(user.email)) {
      // 데모 계정의 데이터를 초기 상태로 리셋
      // 예: 저장한 장소, 방문 기록 등 삭제
      console.log('데모 계정 데이터 초기화');
    }
  } catch (error) {
    console.error('데모 데이터 초기화 오류:', error);
  }
};
