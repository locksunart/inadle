import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createDemoAccount } from '../utils/demoAccount';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 리다이렉트할 경로 결정
  const from = location.state?.from?.pathname || '/';

  // 사용자가 이미 로그인되어 있으면 리다이렉트
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User logged in, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Login attempt for:', email);
      const { user, error } = await signIn(email, password);
      if (error) {
        console.error('Login error:', error.message);
        setError(error.message);
        setLoading(false);
      } else if (user) {
        console.log('Login successful, user:', user.id);
        // 로그인 성공 시 즉시 리다이렉트
        navigate(from, { replace: true });
      } else {
        console.warn('No user or error returned from signIn');
        setLoading(false);
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했어요. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  // 데모 계정으로 로그인
  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      // 먼저 로그인 시도
      const { user, error } = await signIn('demo@inadle.com', 'demo1234');
      
      if (error) {
        console.error('Demo login error:', error.message);
        // 로그인 실패 시 계정 생성 시도
        if (error.message.includes('Invalid login credentials')) {
          console.log('데모 계정 생성 시도 중...');
          const result = await createDemoAccount();
          
          if (result.success) {
            // 계정 생성 성공 후 다시 로그인
            const { user: retryUser, error: retryError } = await signIn('demo@inadle.com', 'demo1234');
            
            if (!retryError && retryUser) {
              console.log('Demo account created and logged in successfully');
              navigate(from, { replace: true });
              return;
            }
          }
          
          setError('데모 계정 생성에 실패했습니다. Supabase 대시보드에서 직접 생성해주세요.');
        } else {
          setError(error.message);
        }
        setLoading(false);
      } else if (user) {
        console.log('Demo login successful, user:', user.id);
        // 로그인 성공
        navigate(from, { replace: true });
      } else {
        console.warn('No user or error returned from demo signIn');
        setLoading(false);
      }
    } catch (err) {
      console.error('데모 로그인 오류:', err);
      setError('데모 로그인 중 오류가 발생했어요.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <h1 className="login-title">
            아이나들 🌸
          </h1>
          <p className="login-subtitle">
            부모와 아이가 모두 행복한 나들이
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" className="link">
              회원가입
            </Link>
          </p>
        </div>

        <div className="demo-info">
          <p className="demo-title">🎈 체험해보세요!</p>
          <button 
            type="button" 
            className="demo-login-button"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            데모 계정으로 시작하기
          </button>
          <p className="demo-note">
            회원가입 없이 서비스를 둘러보실 수 있어요
          </p>
        </div>
      </div>

      <div className="login-decoration">
        <div className="bubble bubble-1">👶</div>
        <div className="bubble bubble-2">🧸</div>
        <div className="bubble bubble-3">🎈</div>
        <div className="bubble bubble-4">🌈</div>
      </div>
    </div>
  );
}

export default Login;
