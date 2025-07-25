import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 필요해요! .env 파일을 확인해주세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 데이터베이스 헬퍼 함수들
export const dbHelpers = {
  // 장소 관련
  places: {
    // 모든 장소 가져오기
    async getAll() {
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          place_details(*),
          place_amenities(*),
          place_tips(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // 특정 장소 상세 정보
    async getById(id) {
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          place_details(*),
          place_amenities(*),
          place_tips(*),
          events(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    // 카테고리별 장소
    async getByCategory(category) {
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          place_details(*),
          place_amenities(*)
        `)
        .eq('category', category);
      
      if (error) throw error;
      return data;
    },

    // 연령별 추천 장소
    async getByAge(ageGroup) {
      const ageColumn = `age_${ageGroup}`;
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          place_details(*),
          place_amenities(*)
        `)
        .gte(`place_details.${ageColumn}`, 4) // 4점 이상만
        .order(`place_details.${ageColumn}`, { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // 검색
    async search(query) {
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          place_details(*),
          place_amenities(*)
        `)
        .or(`name.ilike.%${query}%,address.ilike.%${query}%,category.ilike.%${query}%`);
      
      if (error) throw error;
      return data;
    }
  },

  // 행사/프로그램 관련
  events: {
    // 진행 중인 행사
    async getActive() {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          places(name, address, lat, lng),
          external_data_sources(source_name, source_type)
        `)
        .eq('is_active', true)
        .gte('end_date', today)
        .lte('start_date', today)
        .order('start_date');
      
      if (error) {
        console.error('getActive 오류:', error);
        throw error;
      }
      return data || [];
    },

    // 예정된 행사
    async getUpcoming() {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          places(name, address, lat, lng),
          external_data_sources(source_name, source_type)
        `)
        .eq('is_active', true)
        .gt('start_date', today)
        .order('start_date')
        .limit(10);
      
      if (error) {
        console.error('getUpcoming 오류:', error);
        throw error;
      }
      return data || [];
    }
  },

  // 사용자 관련
  users: {
    // 프로필 생성/업데이트
    async upsertProfile(userId, profileData) {
      console.log('Updating profile with data:', profileData);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id' // user_id 충돌 시 업데이트
        })
        .select()
        .single();
      
      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
      
      console.log('Profile updated successfully:', data);
      return data;
    },

    // 프로필 가져오기
    async getProfile(userId) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // 데이터 없음은 에러 아님
      return data;
    },

    // 방문 기록 저장
    async createVisit(visitData) {
      // ID를 명시적으로 생성
      const dataWithId = {
        id: crypto.randomUUID ? crypto.randomUUID() : undefined,
        ...visitData
      };
      
      const { data, error } = await supabase
        .from('user_visits')
        .insert(dataWithId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // 아이별 평가 저장
    async createChildRating(ratingData) {
      const { data, error } = await supabase
        .from('child_place_ratings')
        .insert(ratingData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // 찜하기
    async toggleSavedPlace(userId, placeId) {
      try {
        // 먼저 찜 여부 확인
        const { data: existing, error: checkError } = await supabase
          .from('user_saved_places')
          .select('id')
          .eq('user_id', userId)
          .eq('place_id', placeId)
          .limit(1);
        
        if (checkError) {
          console.error('찜 상태 확인 오류:', checkError);
          throw checkError;
        }
        
        if (existing && existing.length > 0) {
          // 이미 찜한 경우 삭제
          const { error: deleteError } = await supabase
            .from('user_saved_places')
            .delete()
            .eq('user_id', userId)
            .eq('place_id', placeId);
          
          if (deleteError) {
            console.error('찜 삭제 오류:', deleteError);
            throw deleteError;
          }
          
          return false; // 찜 해제됨
        } else {
          // 찜하지 않은 경우 추가
          const { error: insertError } = await supabase
            .from('user_saved_places')
            .insert({
              user_id: userId,
              place_id: placeId,
              saved_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('찜 추가 오류:', insertError);
            throw insertError;
          }
          
          return true; // 찜함
        }
      } catch (error) {
        console.error('찜하기 처리 오류:', error);
        throw new Error('찜하기 처리 중 오류가 발생했어요.');
      }
    },

    // 찜한 장소 목록
    async getSavedPlaces(userId) {
      const { data, error } = await supabase
        .from('user_saved_places')
        .select(`
          id,
          place_id,
          saved_at,
          note,
          places(
            *,
            place_details(*),
            place_amenities(*)
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });
      
      if (error) throw error;
      
      // 혹시 모를 중복 제거 (place_id 기준)
      const uniquePlaces = data.reduce((acc, current) => {
        const existingIndex = acc.findIndex(item => item.place_id === current.place_id);
        if (existingIndex === -1) {
          acc.push(current);
        } else {
          // 더 최근 것을 유지
          if (new Date(current.saved_at) > new Date(acc[existingIndex].saved_at)) {
            acc[existingIndex] = current;
          }
        }
        return acc;
      }, []);
      
      return uniquePlaces;
    },

    // 방문 기록
    async getVisits(userId) {
      const { data, error } = await supabase
        .from('user_visits')
        .select(`
          *,
          places(
            *,
            place_details(*),
            place_amenities(*)
          )
        `)
        .eq('user_id', userId)
        .order('visited_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  },

  // 팁 좋아요
  tips: {
    async like(tipId) {
      const { error } = await supabase
        .rpc('increment_tip_likes', { tip_id: tipId });
      
      if (error) throw error;
    }
  }
};

// 인증 헬퍼 함수
export const authHelpers = {
  // 회원가입
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // 로그인
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // 로그아웃
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 현재 사용자
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // 세션 확인
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // 비밀번호 재설정 이메일
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  // 비밀번호 업데이트
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }
};
