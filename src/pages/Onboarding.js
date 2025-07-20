import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Onboarding.css';

function Onboarding() {
  const [step, setStep] = useState(1);
  const [children, setChildren] = useState([{ nickname: '', birthYear: '', birthMonth: '' }]);
  const [homeRegion, setHomeRegion] = useState('');
  const [preferredCategories, setPreferredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const regions = ['서구', '중구', '동구', '유성구', '대덕구'];
  const categories = [
    { id: '실내놀이터', label: '실내놀이터', emoji: '🏠' },
    { id: '박물관', label: '박물관/과학관', emoji: '🏛️' },
    { id: '도서관', label: '도서관', emoji: '📚' },
    { id: '공원', label: '공원/놀이터', emoji: '🌳' },
    { id: '체험시설', label: '체험시설', emoji: '🎨' },
    { id: '카페', label: '키즈카페', emoji: '☕' },
    { id: '동물원', label: '동물원/수족관', emoji: '🦁' },
    { id: '문화센터', label: '문화센터', emoji: '🎭' }
  ];

  const addChild = () => {
    setChildren([...children, { nickname: '', birthYear: '', birthMonth: '' }]);
  };

  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const toggleCategory = (categoryId) => {
    if (preferredCategories.includes(categoryId)) {
      setPreferredCategories(preferredCategories.filter(c => c !== categoryId));
    } else {
      setPreferredCategories([...preferredCategories, categoryId]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      // 자녀 정보 검증
      const isValid = children.every(child => 
        child.nickname && child.birthYear && child.birthMonth
      );
      if (!isValid) {
        alert('모든 자녀 정보를 입력해주세요!');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      const profileData = {
        children,
        preferred_regions: [homeRegion],
        preferred_categories: preferredCategories
      };
      
      const { error } = await updateProfile(profileData);
      
      if (error) {
        alert('프로필 저장 중 오류가 발생했어요. 다시 시도해주세요.');
      } else {
        navigate('/');
      }
    } catch (err) {
      alert('오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="onboarding-container">
      <div className="onboarding-wrapper">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="step-content">
            <h2 className="step-title">우리 아이를 소개해주세요 👶</h2>
            <p className="step-subtitle">
              아이의 연령에 맞는 장소를 추천해드릴게요
            </p>

            <div className="children-form">
              {children.map((child, index) => (
                <div key={index} className="child-card">
                  <div className="child-header">
                    <h3>
                      {child.nickname || `${index + 1}번째 아이`}
                    </h3>
                    {children.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="remove-btn"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>애칭</label>
                      <input
                        type="text"
                        value={child.nickname}
                        onChange={(e) => updateChild(index, 'nickname', e.target.value)}
                        placeholder="예: 첫째, 둘째, 공주님"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>출생년도</label>
                      <select
                        value={child.birthYear}
                        onChange={(e) => updateChild(index, 'birthYear', e.target.value)}
                        className="form-input"
                      >
                        <option value="">선택</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}년</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>출생월</label>
                      <select
                        value={child.birthMonth}
                        onChange={(e) => updateChild(index, 'birthMonth', e.target.value)}
                        className="form-input"
                      >
                        <option value="">선택</option>
                        {months.map(month => (
                          <option key={month} value={month}>{month}월</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addChild}
                className="add-child-btn"
              >
                + 아이 추가하기
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2 className="step-title">어디에 사시나요? 🏠</h2>
            <p className="step-subtitle">
              가까운 곳부터 추천해드릴게요
            </p>

            <div className="region-grid">
              {regions.map(region => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setHomeRegion(region)}
                  className={`region-btn ${homeRegion === region ? 'active' : ''}`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2 className="step-title">어떤 곳을 좋아하세요? 🎈</h2>
            <p className="step-subtitle">
              관심있는 카테고리를 모두 선택해주세요
            </p>

            <div className="category-grid">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`category-btn ${preferredCategories.includes(category.id) ? 'active' : ''}`}
                >
                  <span className="category-emoji">{category.emoji}</span>
                  <span className="category-label">{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="step-actions">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn-secondary"
            >
              이전
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="btn-primary"
              disabled={loading || preferredCategories.length === 0}
            >
              {loading ? '저장 중...' : '시작하기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
