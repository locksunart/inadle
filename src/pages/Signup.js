import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Signup.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSignupSuccess(true);
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="signup-container">
        <div className="signup-wrapper">
          <div className="success-message">
            <h2>🎉 회원가입이 완료되었어요!</h2>
            <p>
              입력하신 이메일로 확인 메일을 보냈어요.<br />
              이메일을 확인하고 인증을 완료해주세요.
            </p>
            <Link to="/login" className="login-link-button">
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <div className="signup-header">
          <h1 className="signup-title">
            아이나들 가입하기 🌸
          </h1>
          <p className="signup-subtitle">
            우리 아이와 함께하는 특별한 나들이를 시작해요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
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
              placeholder="비밀번호 (6자 이상)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              placeholder="비밀번호를 다시 입력하세요"
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
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="link">
              로그인
            </Link>
          </p>
        </div>
      </div>

      <div className="signup-decoration">
        <div className="bubble bubble-1">🍼</div>
        <div className="bubble bubble-2">👶</div>
        <div className="bubble bubble-3">🎈</div>
        <div className="bubble bubble-4">🧸</div>
      </div>
    </div>
  );
}

export default Signup;
