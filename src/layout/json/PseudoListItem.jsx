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
  const valueRef = useRef(null);

  useEffect(() => {
    // Focus on value input when component mounts
    if (valueRef.current) {
      valueRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
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
        // Failed - keep editing
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Failed to create item:', error);
      setIsSubmitting(false);
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
    // Submit on blur (clicking outside)
    handleSubmit();
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
          disabled={isSubmitting}
          style={{ width: '100px', border: 'none', outline: 'none', background: 'transparent' }}
        />
        {isSubmitting && (
          <span className="json-spinner">
            <SpinningCircle width={14} height={14} color="#666" />
          </span>
        )}
      </span>
    </div>
  );
};

export default PseudoListItem;

