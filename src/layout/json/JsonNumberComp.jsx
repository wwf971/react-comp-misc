import React, { useState, useRef, useEffect } from 'react';
import SpinningCircle from '../../icon/SpinningCircle';
import './JsonComp.css';

/**
 * JsonNumberComp - Editable number component
 */
const JsonNumberComp = ({
  value,
  path,
  isEditable,
  onChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const valueRef = useRef(null);
  const originalValueRef = useRef('');

  useEffect(() => {
    if (isEditing && valueRef.current) {
      valueRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(valueRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isEditable || isSubmitting) return;
    originalValueRef.current = String(value);
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    if (!valueRef.current) return;
    
    const newValue = valueRef.current.textContent;
    
    // Don't submit if value hasn't changed
    if (newValue === originalValueRef.current) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onChange) {
        const result = await onChange(path, newValue);
        
        if (result.code !== 0) {
          console.error('Failed to update value:', result.message);
          if (valueRef.current) {
            valueRef.current.textContent = originalValueRef.current;
          }
        }
      }
    } catch (error) {
      console.error('Failed to update value:', error);
      if (valueRef.current) {
        valueRef.current.textContent = originalValueRef.current;
      }
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (!isSubmitting) {
      handleSubmit();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (valueRef.current) {
        valueRef.current.textContent = originalValueRef.current;
      }
      setIsEditing(false);
    }
  };

  return (
    <span className="json-value-wrapper">
      <span
        ref={valueRef}
        className={`json-value json-number ${isEditable ? 'editable' : ''} ${isEditing ? 'editing' : ''}`}
        contentEditable={isEditing}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        suppressContentEditableWarning={true}
      >
        {value}
      </span>
      {isSubmitting && (
        <span className="json-spinner">
          <SpinningCircle width={14} height={14} color="#666" />
        </span>
      )}
    </span>
  );
};

export default JsonNumberComp;

