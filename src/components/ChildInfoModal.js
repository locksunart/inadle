import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isValidBirthDate, getAgeFromBirthDate, getCurrentYearMonth, getMinBirthYearMonth } from '../utils/ageCalculator';
import { generateDefaultChildName } from '../utils/childNameGenerator';
import './ChildInfoModal.css';

function ChildInfoModal({ isOpen, onClose }) {
  const [children, setChildren] = useState([]);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [currentChild, setCurrentChild] = useState({
    name: '',
    birthDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { updateProfile, user, userProfile } = useAuth();

  // 모달이 열릴 때 기존 아이 정보 로드
  useEffect(() => {
    if (isOpen && userProfile) {
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
    }
  }, [isOpen, userProfile]);

  const handleAddChild = async () => {
    const defaultName = await generateDefaultChildName();
    setCurrentChild({
      name: defaultName,
      birthDate: ''
    });
    setIsAddingChild(true);
    setError('');
  };

  const handleSaveChild = async () => {
    setError('');

    // 생년월 유효성 검사
    if (!currentChild.birthDate) {
      setError('아이의 생년월을 입력해주세요.');
      return;
    }

    if (!isValidBirthDate(currentChild.birthDate)) {
      setError('올바른 생년월을 입력해주세요.');
      return;
    }

    const newChild = {
      id: Date.now(),
      name: currentChild.name.trim() || await generateDefaultChildName(),
      birthDate: currentChild.birthDate
    };

    const newChildren = [...children, newChild];
    setChildren(newChildren);
    setCurrentChild({ name: '', birthDate: '' });
    setIsAddingChild(false);
  };

  const handleDeleteChild = (childId) => {
    setChildren(children.filter(child => child.id !== childId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (children.length === 0) {
      setError('최소 1명의 아이 정보를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateProfile({
        children: children
      });

      if (error) {
        setError('정보 저장 중 오류가 발생했어요. 다시 시도해주세요.');
      } else {
        onClose();
      }
    } catch (err) {
      console.error('아이 정보 저장 오류:', err);
      setError('정보 저장 중 오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // 건너뛰기 시에도 기존에 있던 아이 정보는 저장
    if (children.length > 0) {
      handleSubmit({ preventDefault: () => {} });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="child-info-modal-overlay">
      <div className="child-info-modal large">
        <div className="modal-header">
          <h2>👶 아이 정보를 알려주세요</h2>
          <p>연령별 맞춤 장소를 찾아드릴게요! (여러 명 등록 가능)</p>
        </div>

        <div className="child-info-content">
          {/* 등록된 아이들 목록 */}
          <div className="children-list">
            {children.map((child) => (
              <div key={child.id} className="child-item">
                <div className="child-info">
                  <span className="child-name">{child.name}</span>
                  <span className="child-age">({getAgeFromBirthDate(child.birthDate)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteChild(child.id)}
                  className="delete-child-btn"
                  disabled={loading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* 아이 추가 폼 */}
          {isAddingChild ? (
            <div className="add-child-form">
              <div className="form-group">
                <label htmlFor="childName" className="form-label">
                  아이 별명
                </label>
                <input
                  id="childName"
                  type="text"
                  value={currentChild.name}
                  onChange={(e) => setCurrentChild({...currentChild, name: e.target.value})}
                  className="form-input"
                  placeholder="아이1, 아이2..."
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label htmlFor="childBirthDate" className="form-label">
                  생년월 <span className="required">*</span>
                </label>
                <input
                  id="childBirthDate"
                  type="month"
                  value={currentChild.birthDate}
                  onChange={(e) => setCurrentChild({...currentChild, birthDate: e.target.value})}
                  className="form-input"
                  required
                  max={getCurrentYearMonth()}
                  min={getMinBirthYearMonth()}
                />
                {currentChild.birthDate && (
                  <small className="age-preview">
                    현재 {getAgeFromBirthDate(currentChild.birthDate)}
                  </small>
                )}
              </div>

              <div className="add-child-actions">
                <button
                  type="button"
                  onClick={handleSaveChild}
                  className="save-child-btn"
                >
                  아이 추가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingChild(false);
                    setCurrentChild({ name: '', birthDate: '' });
                    setError('');
                  }}
                  className="cancel-child-btn"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddChild}
              className="add-child-trigger"
              disabled={loading}
            >
              + 아이 추가하기
            </button>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button
            onClick={handleSubmit}
            className="submit-button"
            disabled={loading || children.length === 0}
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
          <button
            type="button"
            className="skip-button"
            onClick={handleSkip}
            disabled={loading}
          >
            {children.length > 0 ? '완료' : '나중에 입력할게요'}
          </button>
        </div>

        <div className="modal-footer">
          <p className="privacy-note">
            💝 입력하신 정보는 안전하게 보관되며, 언제든 프로필에서 수정할 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChildInfoModal;
