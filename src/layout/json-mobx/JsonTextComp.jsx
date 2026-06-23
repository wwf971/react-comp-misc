import React, { useState, useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction, runInAction } from 'mobx';
import { useJsonContext } from './JsonContext';
import { getAvailableConversions } from './typeConvert.js';
import { useRenderCount } from './renderCountStore';
import './JsonComp.css';

export const clearBrowserTextSelection = () => {
  requestAnimationFrame(() => {
    window.getSelection?.()?.removeAllRanges();
  });
};

/**
 * JsonTextComp - MobX-based editable text component
 */
const JsonTextComp = observer(({ data: dataProp }) => {
  const { container, itemKey, path, renderCountKey } = dataProp;
  const { config, store, emitEvent, pathQueryParentInfo } = useJsonContext();
  const { selection, openMenu } = store;
  const { isEditable, isValueEditable, isDebug } = config;
  const canEditValue = isEditable && isValueEditable;
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const valueRef = useRef(null);
  const originalValueRef = useRef('');
  
  const renderCount = useRenderCount(container, renderCountKey ?? itemKey, isDebug);
  
  const value = container[itemKey];

  useEffect(() => {
    if (isEditing && valueRef.current) {
      valueRef.current.focus();
      const range = document.createRange();
      const selectionWindow = window.getSelection();
      range.selectNodeContents(valueRef.current);
      selectionWindow.removeAllRanges();
      selectionWindow.addRange(range);
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!canEditValue || isSubmitting || error) return;
    originalValueRef.current = String(value);
    setIsEditing(true);
  };

  const handleSubmit = useCallback(async () => {
    if (!valueRef.current) return;
    
    const newValue = valueRef.current.textContent;
    
    if (newValue === originalValueRef.current) {
      setIsEditing(false);
      clearBrowserTextSelection();
      return;
    }

    setIsEditing(false);
    clearBrowserTextSelection();
    
    try {
      const changeData = {
        old: { type: 'string', value: originalValueRef.current },
        new: { type: 'string', value: newValue }
      };
      const result = await emitEvent(path, changeData);
      
      if (result && result.code !== 0) {
        setError(result.message || 'Update failed');
        if (valueRef.current) {
          valueRef.current.textContent = originalValueRef.current;
        }
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      runInAction(() => {
        container[itemKey] = newValue;
      });
    } catch (err) {
      setError(err.message || 'Error');
      if (valueRef.current) {
        valueRef.current.textContent = originalValueRef.current;
      }
      setTimeout(() => setError(null), 3000);
    }
  }, [container, emitEvent, itemKey, path]);

  useEffect(() => {
    if (!isEditing || !selection) return undefined;
    return reaction(
      () => selection.revisionSelection,
      () => {
        handleSubmit();
      }
    );
  }, [handleSubmit, isEditing, selection]);

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
      clearBrowserTextSelection();
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const pathParts = path.split('..');
    const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.');
    const parentInfo = pathQueryParentInfo ? pathQueryParentInfo(path) : { isSingleEntryInParent: false };
    
    openMenu({
      position: { x: e.clientX, y: e.clientY },
      currentValue: value,
      currentType: 'string',
      path,
      menuType: isArrayItem ? 'arrayItem' : 'value',
      value,
      itemKey,
      availableConversions: getAvailableConversions(value, 'string', { includeArray: true, includeObject: true }),
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    });
  };

  const isEmpty = !value || value.trim() === '';
  const isWhitespaceOnly = value && value.trim() === '' && value.length > 0;
  
  return (
    <span className="json-value-wrapper">
      <span
        ref={valueRef}
        className={`json-value json-string ${canEditValue && !error ? 'editable' : ''} ${isEditing ? 'editing' : ''} ${isWhitespaceOnly ? 'whitespace-only' : ''} ${isEmpty ? 'empty-text' : ''}`}
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
        <span className="json-render-count">
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
