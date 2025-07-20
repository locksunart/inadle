import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAgeFromBirthDate, getCurrentYearMonth, getMinBirthYearMonth, isValidBirthDate } from '../utils/ageCalculator';
import { generateDefaultChildName } from '../utils/childNameGenerator';
import { generateRandomNickname } from '../utils/nicknameGenerator';
import { supabase } from '../services/supabase';
import './Profile.css';

function Profile() {
  const { user, userProfile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingChildIndex, setEditingChildIndex] = useState(-1); // -1: 새 아이, 0+: 기존 아이 수정
  
  const [formData, setFormData] = useState({
    nickname: '',
    childName: '',
    childBirthDate: ''
  });

  const [children, setChildren] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (userProfile) {
      setFormData({
        nickname: userProfile.nickname || '',
        childName: '',
        childBirthDate: ''
      });
      
      // 다중 아이 정보 처리 - children 배열이 있으면 사용, 없으면 기존 데이터에서 변환
      if (userProfile.children && Array.isArray(userProfile.children)) {
        setChildren(userProfile.children);
      } else if (userProfile.child_birth_date) {
        // 기존 단일 아이 데이터를 배열로 변환
        const legacyChild = {
          id: Date.now(),
          name: userProfile.child_name || '아이1',
          birthDate: userProfile.child_birth_date
        };
        setChildren([legacyChild]);
      } else {
        setChildren([]);
      }
      
      // 닉네임이 없으면 자동 생성
      if (!userProfile.nickname) {
        handleGenerateNickname();
      }
    }
  }, [user, userProfile, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateNickname = async () => {
    try {
      const newNickname = generateRandomNickname();
      const { error } = await updateProfile({
        nickname: newNickname
      });
      
      if (!error) {
        setFormData(prev => ({
          ...prev,
          nickname: newNickname
        }));
        setMessage('닉네임이 자동으로 생성되었어요!');
      }
    } catch (err) {
      console.error('닉네임 생성 오류:', err);
    }
  };

  const handleNicknameSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.nickname.trim()) {
      setMessage('닉네임을 입력해주세요.');
      setLoading(false);
      return;
    }

    if (formData.nickname.length > 20) {
      setMessage('닉네임은 20자 이내로 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await updateProfile({
        nickname: formData.nickname.trim()
      });

      if (error) {
        setMessage('닉네임 업데이트에 실패했습니다.');
      } else {
        setMessage('닉네임이 성공적으로 업데이트되었습니다!');
        setIsEditingNickname(false);
      }
    } catch (err) {
      setMessage('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 유효성 검사
    if (!formData.childBirthDate) {
      setMessage('아이의 생년월을 입력해주세요.');
      setLoading(false);
      return;
    }

    if (!isValidBirthDate(formData.childBirthDate)) {
      setMessage('올바른 생년월을 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      let newChildren = [...children];
      const childData = {
        id: editingChildIndex === -1 ? Date.now() : children[editingChildIndex]?.id || Date.now(),
        name: formData.childName.trim() || '아이' + (children.length + 1),
        birthDate: formData.childBirthDate
      };

      if (editingChildIndex === -1) {
        // 새 아이 추가
        newChildren.push(childData);
      } else {
        // 기존 아이 수정
        newChildren[editingChildIndex] = childData;
      }

      // 데이터베이스 업데이트
      const { error } = await updateProfile({
        children: newChildren
      });

      if (error) {
        setMessage('아이 정보 업데이트에 실패했습니다.');
      } else {
        setChildren(newChildren);
        setMessage(editingChildIndex === -1 ? '새 아이 정보가 추가되었습니다!' : '아이 정보가 수정되었습니다!');
        setIsEditing(false);
        setEditingChildIndex(-1);
      }
    } catch (err) {
      setMessage('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const handleAddChild = async () => {
    const defaultName = await generateDefaultChildName();
    setFormData({
      nickname: userProfile?.nickname || '',
      childName: defaultName,
      childBirthDate: ''
    });
    setEditingChildIndex(-1); // 새 아이 추가
    setIsEditing(true);
    setMessage('');
  };

  const handleEditChild = (index) => {
    const child = children[index];
    setFormData({
      nickname: userProfile?.nickname || '',
      childName: child.name,
      childBirthDate: child.birthDate
    });
    setEditingChildIndex(index);
    setIsEditing(true);
    setMessage('');
  };

  const handleDeleteChild = async (index) => {
    if (!window.confirm('아이 정보를 삭제하시겠습니까?')) {
      return;
    }

    setLoading(true);
    try {
      const newChildren = children.filter((_, i) => i !== index);
      setChildren(newChildren);
      
      const { error } = await updateProfile({
        children: newChildren
      });

      if (error) {
        setMessage('아이 정보 삭제에 실패했습니다.');
        // 에러 시 되돌리기
        setChildren(children);
      } else {
        setMessage('아이 정보가 삭제되었습니다.');
      }
    } catch (err) {
      setMessage('오류가 발생했습니다. 다시 시도해주세요.');
      setChildren(children); // 에러 시 되돌리기
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 회원탈퇴를 하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      return;
    }

    setLoading(true);
    try {
      // 사용자 프로필 삭제
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        console.error('프로필 삭제 오류:', profileError);
      }

      // 로그아웃
      await signOut();
      navigate('/login');
      
      alert('회원탈퇴가 완료되었습니다.');
    } catch (error) {
      console.error('회원탈퇴 오류:', error);
      setMessage('회원탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>내 정보</h1>
        <button onClick={() => navigate('/')} className="back-button">
          ← 돌아가기
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>계정 정보</h2>
          <div className="info-group">
            <div className="info-content">
              <div>
                <label>닉네임</label>
                {isEditingNickname ? (
                  <form onSubmit={handleNicknameSubmit} className="nickname-edit-form">
                    <input
                      name="nickname"
                      type="text"
                      value={formData.nickname}
                      onChange={handleChange}
                      className="nickname-input"
                      maxLength={20}
                      autoFocus
                    />
                    <div className="nickname-buttons">
                      <button type="submit" className="save-nickname-btn" disabled={loading}>
                        {loading ? '저장 중...' : '저장'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsEditingNickname(false);
                          setFormData(prev => ({
                            ...prev,
                            nickname: userProfile?.nickname || ''
                          }));
                          setMessage('');
                        }}
                        className="cancel-nickname-btn"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="nickname-display">
                    <p className="info-value">{userProfile?.nickname || '설정되지 않음'}</p>
                    <div className="nickname-actions">
                      <button 
                        onClick={() => setIsEditingNickname(true)}
                        className="edit-button"
                      >
                        수정
                      </button>
                      {!userProfile?.nickname && (
                        <button 
                          onClick={handleGenerateNickname}
                          className="generate-button"
                          disabled={loading}
                        >
                          닉네임 생성
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="info-group">
            <label>이메일</label>
            <p className="info-value">{user.email}</p>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2>아이 정보</h2>
            {/* 다중 아이 지원 - 제한 없이 추가 가능 */}
            <button 
              onClick={handleAddChild} 
              className="add-child-button"
            >
              + 아이 추가
            </button>
          </div>

          {/* 다중 아이 정보 리스트 */}
          {children.length > 0 || isEditing ? (
            <div className="children-list">
              {/* 기존 아이들 표시 */}
              {children.map((child, index) => (
                <div key={child.id} className="child-card">
                  <div className="child-card-header">
                    <h3>{child.name} ({getAgeFromBirthDate(child.birthDate)})</h3>
                    <div className="child-action-buttons">
                      <button 
                        onClick={() => handleEditChild(index)} 
                        className="edit-button"
                        disabled={isEditing}
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleDeleteChild(index)} 
                        className="delete-child-button"
                        disabled={loading || isEditing}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <div className="child-info-display">
                    <div className="info-group">
                      <label>아이 별명</label>
                      <p className="info-value">{child.name}</p>
                    </div>
                    <div className="info-group">
                      <label>생년월</label>
                      <p className="info-value">{child.birthDate}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 아이 추가/수정 폼 */}
              {isEditing && (
                <div className="child-card editing">
                  <div className="child-card-header">
                    <h3>{editingChildIndex === -1 ? '새 아이 추가' : '아이 정보 수정'}</h3>
                  </div>
                  <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                      <label htmlFor="childName">아이 별명</label>
                      <input
                        id="childName"
                        name="childName"
                        type="text"
                        value={formData.childName}
                        onChange={handleChange}
                        placeholder={formData.childName || '아이' + (children.length + 1)}
                        className="form-input"
                        maxLength={10}
                      />
                      <small className="input-help">선택</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="childBirthDate">생년월</label>
                      <input
                        id="childBirthDate"
                        name="childBirthDate"
                        type="month"
                        value={formData.childBirthDate}
                        onChange={handleChange}
                        className="form-input"
                        max={getCurrentYearMonth()}
                        min={getMinBirthYearMonth()}
                      />
                      {formData.childBirthDate && (
                        <small className="age-preview">
                          현재 {getAgeFromBirthDate(formData.childBirthDate)}
                        </small>
                      )}
                      <small className="input-help">필수</small>
                    </div>

                    {message && (
                      <div className={`message ${message.includes('성공') || message.includes('추가') || message.includes('수정') ? 'success' : 'error'}`}>
                        {message}
                      </div>
                    )}

                    <div className="button-group">
                      <button 
                        type="submit" 
                        className="save-button"
                        disabled={loading}
                      >
                        {loading ? '저장 중...' : (editingChildIndex === -1 ? '아이 추가' : '수정 완료')}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditingChildIndex(-1);
                          setFormData({
                            nickname: userProfile?.nickname || '',
                            childName: '',
                            childBirthDate: ''
                          });
                          setMessage('');
                        }} 
                        className="cancel-button"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="no-child-info">
              <p>아직 등록된 아이 정보가 없어요.</p>
              <p>위의 '아이 추가' 버튼을 눌러 아이 정보를 등록해주세요.</p>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button onClick={handleSignOut} className="signout-button">
            로그아웃
          </button>
        </div>

        <div className="danger-zone">
          <button onClick={handleDeleteAccount} className="delete-account-button" disabled={loading}>
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
