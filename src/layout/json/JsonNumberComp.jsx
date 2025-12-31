import React, { useState, useRef, useEffect } from 'react';
import SpinningCircle from '../../icon/SpinningCircle';
import { useJsonContext } from './JsonContext';
import { getAvailableConversions } from './typeConvert';
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
  const { showConversionMenu } = useJsonContext();
  
  // Render tracking
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Render] JsonNumberComp: ${path} = ${value}`);
  }

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
        // Check if input is a valid number
        const isValidNumber = newValue.trim() !== '' && !isNaN(newValue);
        
        const changeData = {
          old: { type: 'number', value: value },
          new: isValidNumber 
            ? { type: 'number', value: newValue }
            : { type: 'string', value: newValue } // Invalid number -> convert to string
        };
        const result = await onChange(path, changeData);
        
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

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (showConversionMenu) {
      // Check if this is an array item by looking for ".." in path
      const isArrayItem = path.includes('..');
      
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        currentValue: value,
        currentType: 'number',
        path,
        menuType: isArrayItem ? 'arrayItem' : 'value',
        value: value,
        availableConversions: getAvailableConversions(value, 'number')
      });
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
        onContextMenu={handleContextMenu}
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

