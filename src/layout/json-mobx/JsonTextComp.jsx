import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { useJsonContext } from './JsonContext';
import { getAvailableConversions } from './typeConvert';
import { useRenderCount } from './renderCountStore';
import './JsonComp.css';

/**
 * JsonTextComp - MobX-based editable text component
 */
const JsonTextComp = observer(({
  data,
  objKey,
  value: propValue,
  path,
  getPath,
  isEditable,
  onChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const valueRef = useRef(null);
  const originalValueRef = useRef('');
  const { showConversionMenu, queryParentInfo, isDebug } = useJsonContext();
  
  // Get persistent render count
  const renderCount = useRenderCount(data, objKey);
  
  // Use propValue if provided (for avoiding array access), otherwise access data[objKey]
  const value = propValue !== undefined ? propValue : data[objKey];

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

  const resolvePath = () => (getPath ? getPath() : path);

  const handleClick = () => {
    if (!isEditable || isSubmitting || error) return;
    originalValueRef.current = String(value);
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    if (!valueRef.current) return;
    
    const newValue = valueRef.current.textContent;
    
    if (newValue === originalValueRef.current) {
      setIsEditing(false);
      return;
    }

    // Exit edit mode immediately to reduce re-renders
    setIsEditing(false);
    
    try {
      if (onChange) {
        const changeData = {
          old: { type: 'string', value: originalValueRef.current },
          new: { type: 'string', value: newValue }
        };
        const result = await onChange(resolvePath(), changeData);
        
        if (result && result.code !== 0) {
          setError(result.message || 'Update failed');
          if (valueRef.current) {
            valueRef.current.textContent = originalValueRef.current;
          }
          setTimeout(() => setError(null), 3000);
          return;
        }
      }
      
      runInAction(() => {
        data[objKey] = newValue;
      });
    } catch (err) {
      setError(err.message || 'Error');
      if (valueRef.current) {
        valueRef.current.textContent = originalValueRef.current;
      }
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleBlur = () => {
    handleSubmit();
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
      // Check if this is a direct array item
      const currentPath = resolvePath();
      const pathParts = currentPath.split('..');
      const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.');
      const parentInfo = queryParentInfo ? queryParentInfo(currentPath) : { isSingleEntryInParent: false };
      
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        currentValue: value,
        currentType: 'string',
        path: currentPath,
        menuType: isArrayItem ? 'arrayItem' : 'value',
        value: value,
        itemKey: objKey,
        availableConversions: getAvailableConversions(value, 'string', { includeArray: true, includeObject: true }),
        isSingleEntryInParent: parentInfo.isSingleEntryInParent,
        isFirstInParent: parentInfo.isFirstInParent,
        isLastInParent: parentInfo.isLastInParent
      });
    }
  };

  const isEmpty = !value || value.trim() === '';
  const isWhitespaceOnly = value && value.trim() === '' && value.length > 0;
  
  return (
    <span className="json-value-wrapper">
      <span
        ref={valueRef}
        className={`json-value json-string ${isEditable && !error ? 'editable' : ''} ${isEditing ? 'editing' : ''} ${isWhitespaceOnly ? 'whitespace-only' : ''} ${isEmpty ? 'empty-text' : ''}`}
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
      {isDebug && (
        <span style={{ color: '#999', fontSize: '11px', marginLeft: '6px' }}>
          #{renderCount}
        </span>
      )}
      {error && (
        <span className="json-error" style={{ color: '#f44336', fontSize: '11px', marginLeft: '6px' }}>
          {error}
        </span>
      )}
    </span>
  );
});

JsonTextComp.displayName = 'JsonTextComp';

export default JsonTextComp;
