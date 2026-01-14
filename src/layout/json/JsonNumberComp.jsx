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
  const [isShowingError, setIsShowingError] = useState(null);
  
  const valueRef = useRef(null);
  const originalValueRef = useRef('');
  const { showConversionMenu, queryParentInfo } = useJsonContext();
  
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
    if (!isEditable || isSubmitting || isShowingError) return;
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
    setIsShowingError(null);
    
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
          setIsShowingError(result.message || 'Update failed');
          if (valueRef.current) {
            valueRef.current.textContent = originalValueRef.current;
          }
          // Clear error after 3 seconds
          setTimeout(() => setIsShowingError(null), 3000);
        }
      }
    } catch (error) {
      console.error('Failed to update value:', error);
      setIsShowingError(error.message || 'Network error');
      if (valueRef.current) {
        valueRef.current.textContent = originalValueRef.current;
      }
      // Clear error after 3 seconds
      setTimeout(() => setIsShowingError(null), 3000);
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
      // Check if this is a direct array item (not a dict entry inside an array)
      const pathParts = path.split('..');
      const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.');
      
      const parentInfo = queryParentInfo ? queryParentInfo(path) : { isSingleEntryInParent: false };
      
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        currentValue: value,
        currentType: 'number',
        path,
        menuType: isArrayItem ? 'arrayItem' : 'value',
        value: value,
        availableConversions: getAvailableConversions(value, 'number'),
        isSingleEntryInParent: parentInfo.isSingleEntryInParent,
        isFirstInParent: parentInfo.isFirstInParent,
        isLastInParent: parentInfo.isLastInParent
      });
    }
  };

  return (
    <span className="json-value-wrapper">
      <span
        ref={valueRef}
        className={`json-value json-number ${isEditable && !isShowingError ? 'editable' : ''} ${isEditing ? 'editing' : ''}`}
        contentEditable={isEditing}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        suppressContentEditableWarning={true}
      >
        {value}
      </span>
      {isSubmitting && !isShowingError && (
        <span className="json-spinner">
          <SpinningCircle width={14} height={14} color="#666" />
        </span>
      )}
      {isShowingError && (
        <span className="json-error" style={{ color: '#f44336', fontSize: '11px', marginLeft: '6px' }}>
          {isShowingError}
        </span>
      )}
    </span>
  );
};

export default JsonNumberComp;

