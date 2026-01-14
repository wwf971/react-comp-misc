import React, { useState, useRef, useEffect } from 'react';
import SpinningCircle from '../../icon/SpinningCircle';
import './JsonComp.css';

/**
 * PseudoListItem - Temporary component for creating a new array item
 * Shows editable value field before confirmation
 */
const PseudoListItem = ({ path, onChange, onCancel, depth }) => {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShowingError, setIsShowingError] = useState('');
  const valueRef = useRef(null);

  useEffect(() => {
    // Focus on value input when component mounts
    if (valueRef.current) {
      valueRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsShowingError('');
    try {
      const changeData = {
        old: { type: 'pseudo' },
        new: { type: 'string', value: value },
        _action: 'createItem'
      };
      
      const result = await onChange(path, changeData);
      
      if (result && result.code === 0) {
        // Success - parent will remove isPseudo flag and re-render with normal component
      } else {
        // Failed - show error briefly then remove via onCancel
        const errMsg = result?.message || 'Failed to create item';
        setIsShowingError(errMsg);
        setIsSubmitting(false);
        
        // Auto-remove after showing error for 2 seconds
        setTimeout(() => {
          onCancel();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create item:', error);
      setIsShowingError(error.message || 'Network error');
      setIsSubmitting(false);
      
      // Auto-remove after showing error for 2 seconds
      setTimeout(() => {
        onCancel();
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    // If value is empty, cancel instead of submitting
    if (!value.trim()) {
      onCancel();
    } else {
      // Submit on blur (clicking outside)
      handleSubmit();
    }
  };

  return (
    <div className="json-list-item json-pseudo">
      <span className="json-value-wrapper">
        <input
          ref={valueRef}
          type="text"
          className="json-value json-string editing"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="value"
          disabled={isSubmitting || isShowingError}
          style={{ width: '100px', border: 'none', outline: 'none', background: 'transparent' }}
        />
        {isSubmitting && !isShowingError && (
          <span className="json-spinner">
            <SpinningCircle width={14} height={14} color="#666" />
          </span>
        )}
        {isShowingError && (
          <span style={{ marginLeft: '8px', fontSize: '12px', color: '#d32f2f' }}>
            ✗ {isShowingError}
          </span>
        )}
      </span>
    </div>
  );
};

export default PseudoListItem;

