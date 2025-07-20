import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">🌸</span>
          <span className="logo-text">아이나들</span>
        </Link>

        <nav className="header-nav">
          <Link to="/" className="nav-link">
            홈
          </Link>
          <Link to="/search" className="nav-link">
            검색
          </Link>
          <Link to="/events" className="nav-link">
            행사
          </Link>
          <Link to="/my-places" className="nav-link">
            내 장소
          </Link>
        </nav>

        <div className="header-actions">
          <button className="user-menu" onClick={handleProfileClick}>
            <FaUser />
            <span className="user-email">{user?.email}</span>
          </button>
          <button onClick={handleSignOut} className="signout-btn" title="로그아웃">
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
