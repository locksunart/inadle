import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authHelpers, dbHelpers } from '../services/supabase';
import { generateRandomNickname } from '../utils/nicknameGenerator';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용해야 합니다.');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // 초기 세션 확인
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await loadUserProfile(session.user.id);
          }
          
          setInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('인증 초기화 오류:', error);
        if (mounted) {
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          if (initialized) {
            await loadUserProfile(session.user.id);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        if (initialized) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadUserProfile(userId) {
    try {
      let profile = await dbHelpers.users.getProfile(userId);
      
      console.log('Loaded user profile:', profile);
      
      // 프로필이 없으면 생성
      if (!profile) {
        const nickname = generateRandomNickname();
        console.log('새 프로필 생성 - 닉네임:', nickname);
        profile = await dbHelpers.users.upsertProfile(userId, { nickname });
      }
      // 프로필은 있지만 닉네임이 없으면 추가 (한 번만 실행)
      else if (!profile.nickname || profile.nickname.trim() === '') {
        // 닉네임 생성 로직이 여러 번 실행되지 않도록 체크
        if (!profile._nicknameGenerating) {
          const nickname = generateRandomNickname();
          console.log('닉네임 추가 - 닉네임:', nickname);
          // 임시로 플래그 설정하여 중복 방지
          profile._nicknameGenerating = true;
          profile = await dbHelpers.users.upsertProfile(userId, { ...profile, nickname, _nicknameGenerating: undefined });
        }
      }
      
      setUserProfile(profile);
    } catch (error) {
      console.error('프로필 로드 오류:', error);
      setUserProfile(null);
    }
  }

  const signUp = async (email, password) => {
    try {
      setLoading(true);
      const result = await authHelpers.signUp(email, password);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const result = await authHelpers.signIn(email, password);
      
      // 로그인 성공 시 즉시 상태 업데이트
      if (result.user) {
        setUser(result.user);
        await loadUserProfile(result.user.id);
        setForceUpdate(prev => prev + 1); // 강제 리렌더링
      }
      
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authHelpers.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) return { profile: null, error: new Error('로그인이 필요합니다') };
    
    console.log('updateProfile called with:', profileData);
    
    try {
      const updatedProfile = await dbHelpers.users.upsertProfile(user.id, profileData);
      console.log('Profile updated successfully in auth:', updatedProfile);
      
      setUserProfile(updatedProfile);
      
      // 아이 정보가 성공적으로 저장되었다면 모달을 다시 보여주지 않음
      if (profileData.children?.length > 0 || profileData.child_birth_date) {
        setHasSkippedChildInfo(true);
      }
      
      return { profile: updatedProfile, error: null };
    } catch (error) {
      console.error('updateProfile error:', error);
      return { profile: null, error };
    }
  };

  // 아이 정보 입력 필요 여부 확인 (생년월만 체크)
  const [needsChildInfo, setNeedsChildInfo] = useState(false);
  const [hasSkippedChildInfo, setHasSkippedChildInfo] = useState(false);
  
  useEffect(() => {
    // 아이 정보를 건너뛰었거나, 이미 아이 정보가 있으면 모달을 보여주지 않음
    const hasChildInfo = userProfile?.children?.length > 0 || userProfile?.child_birth_date;
    
    if (!hasSkippedChildInfo && user && userProfile && !hasChildInfo) {
      setNeedsChildInfo(true);
    } else {
      setNeedsChildInfo(false);
    }
  }, [user, userProfile, hasSkippedChildInfo]);
  
  const skipChildInfo = () => {
    setNeedsChildInfo(false);
    setHasSkippedChildInfo(true);
  };

  const value = {
    user,
    userProfile,
    loading,
    needsChildInfo,
    skipChildInfo,
    signUp,
    signIn,
    signOut,
    updateProfile,
    forceUpdate, // 디버깅용
  };

  if (!initialized) {
    return (
      <AuthContext.Provider value={{ ...value, loading: true }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
