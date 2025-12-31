import React, { useState } from 'react';
import SpinningCircle from '../../icon/SpinningCircle';
import './JsonComp.css';

/**
 * JsonBoolComp - Boolean toggle component
 * Clicking toggles between true/false when editable
 */
const JsonBoolComp = ({
  value,
  path,
  isEditable,
  onChange
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    if (!isEditable || isSubmitting) return;

    const newValue = !value;
    setIsSubmitting(true);
    
    try {
      if (onChange) {
        const result = await onChange(path, String(newValue));
        
        if (result.code !== 0) {
          console.error('Failed to update value:', result.message);
        }
      }
    } catch (error) {
      console.error('Failed to update value:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <span className="json-value-wrapper">
      <span
        className={`json-value json-boolean ${isEditable ? 'editable clickable' : ''}`}
        onClick={handleClick}
        title={isEditable ? 'Click to toggle' : ''}
      >
        {String(value)}
      </span>
      {isSubmitting && (
        <span className="json-spinner">
          <SpinningCircle width={14} height={14} color="#666" />
        </span>
      )}
    </span>
  );
};

export default JsonBoolComp;

