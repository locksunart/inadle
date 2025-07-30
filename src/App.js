import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import Events from './pages/Events';
import MyPlaces from './pages/MyPlaces';
import PlaceDetail from './pages/PlaceDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MobileNav from './components/MobileNav';
import ChildInfoModal from './components/ChildInfoModal';
import PlaceGenerator from './components/PlaceGenerator';
import DatabaseDebugger from './DatabaseDebugger';
import './App.css';

// 보호된 라우트 컴포넌트
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// 메인 앱 컴포넌트
function AppContent() {
  const { user, userProfile, needsChildInfo, skipChildInfo } = useAuth();
  
  return (
    <Router>
      <Routes>
        {/* 공개 라우트 */}
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route 
          path="/signup" 
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Signup />
            )
          } 
        />
        
        {/* 보호된 라우트 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="app">
                <Home userProfile={userProfile} />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <div className="app">
                <Events userProfile={userProfile} />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-places"
          element={
            <ProtectedRoute>
              <div className="app">
                <MyPlaces user={user} />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/place/:id"
          element={
            <ProtectedRoute>
              <div className="app">
                <PlaceDetail />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* 관리자 전용: 장소 생성기 */}
        <Route
          path="/admin/place-generator"
          element={
            <ProtectedRoute>
              <PlaceGenerator />
            </ProtectedRoute>
          }
        />
        
        {/* 디버깅 전용: 데이터베이스 상태 확인 */}
        <Route
          path="/debug/database"
          element={
            <ProtectedRoute>
              <DatabaseDebugger />
            </ProtectedRoute>
          }
        />
      </Routes>
      
      {/* 아이 정보 입력 모달 */}
      <ChildInfoModal 
        isOpen={needsChildInfo} 
        onClose={skipChildInfo}
      />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
