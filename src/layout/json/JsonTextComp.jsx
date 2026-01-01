import React, { useState, useRef, useEffect } from 'react';
import SpinningCircle from '../../icon/SpinningCircle';
import { useJsonContext } from './JsonContext';
import { getAvailableConversions } from './typeConvert';
import './JsonComp.css';

/**
 * JsonTextComp - Editable text component for string values
 */
const JsonTextComp = ({
  value,
  path,
  isEditable,
  onChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const valueRef = useRef(null);
  const originalValueRef = useRef('');
  const { showConversionMenu, queryParentInfo } = useJsonContext();
  
  // Render tracking
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Render] JsonTextComp: ${path} = "${value}"`);
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
    
    // Clear the "EMPTY" placeholder text when starting to edit
    if ((!value || value.trim() === '') && valueRef.current) {
      valueRef.current.textContent = value || '';
    }
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
        const changeData = {
          old: { type: 'string', value: originalValueRef.current },
          new: { type: 'string', value: newValue }
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
    e.stopPropagation(); // Prevent bubbling to parent elements

    if (showConversionMenu) {
      // Check if this is a direct array item (not a dict entry inside an array)
      // Array item path ends with `..{number}`, dict entry path has `.{key}` after the last `..{number}`
      const pathParts = path.split('..');
      const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.');
      const parentInfo = queryParentInfo ? queryParentInfo(path) : { isSingleEntryInParent: false };
      
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        currentValue: value,
        currentType: 'string',
        path,
        menuType: isArrayItem ? 'arrayItem' : 'value',
        value: value,
        availableConversions: getAvailableConversions(value, 'string', { includeArray: true, includeObject: true }),
        isSingleEntryInParent: parentInfo.isSingleEntryInParent,
        isFirstInParent: parentInfo.isFirstInParent,
        isLastInParent: parentInfo.isLastInParent
      });
    }
  };

  // Check if value is empty or whitespace-only
  const isEmpty = !value || value.trim() === '';
  const isWhitespaceOnly = value && value.trim() === '' && value.length > 0;
  
  return (
    <span className="json-value-wrapper">
      <span
        ref={valueRef}
        className={`json-value json-string ${isEditable ? 'editable' : ''} ${isEditing ? 'editing' : ''} ${isWhitespaceOnly ? 'whitespace-only' : ''} ${isEmpty ? 'empty-text' : ''}`}
        contentEditable={isEditing}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        suppressContentEditableWarning={true}
        style={isEditing && isEmpty ? { minWidth: '80px' } : {}}
      >
        {isEmpty && !isEditing ? 'EMPTY' : value}
      </span>
      {isSubmitting && (
        <span className="json-spinner">
          <SpinningCircle width={14} height={14} color="#666" />
        </span>
      )}
    </span>
  );
};

export default JsonTextComp;

