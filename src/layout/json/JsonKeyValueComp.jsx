import React, { useState, useRef, useEffect } from 'react';
import SpinningCircle from '../../icon/SpinningCircle';
import JsonTextComp from './JsonTextComp';
import JsonNumberComp from './JsonNumberComp';
import JsonBoolComp from './JsonBoolComp';
import JsonNullComp from './JsonNullComp';
import './JsonComp.css';

/**
 * JsonKeyValueComp - Editable key-value pair component for JSON objects
 */
const JsonKeyValueComp = ({
  itemKey,
  value,
  path,
  isEditable,
  isKeyEditable,
  isValueEditable,
  onChange,
  children,
  depth
}) => {
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const keyRef = useRef(null);
  const originalValueRef = useRef('');

  const canEditKey = isEditable && isKeyEditable;
  const canEditValue = isEditable && isValueEditable;
  
  // Check if value is a primitive (can be edited inline)
  const isPrimitive = value === null || value === undefined || typeof value !== 'object';
  const valueType = value === null || value === undefined ? 'null' : typeof value;

  // Handle key edit
  useEffect(() => {
    if (isEditingKey && keyRef.current) {
      keyRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(keyRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [isEditingKey]);

  const handleKeyClick = () => {
    if (!canEditKey || isSubmitting) return;
    originalValueRef.current = itemKey;
    setIsEditingKey(true);
  };

  const handleKeySubmit = async () => {
    if (!keyRef.current) return;
    
    const newKey = keyRef.current.textContent.trim();
    
    // Don't submit if value hasn't changed or is empty
    if (newKey === originalValueRef.current || newKey === '') {
      setIsEditingKey(false);
      if (keyRef.current) {
        keyRef.current.textContent = originalValueRef.current;
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onChange) {
        // For key changes, we need to delete old key and create new key
        const pathParts = path.split('.');
        pathParts[pathParts.length - 1] = newKey;
        const newPath = pathParts.join('.');
        
        const result = await onChange(path, { _renameKey: newKey });
        
        if (result.code !== 0) {
          console.error('Failed to update key:', result.message);
          if (keyRef.current) {
            keyRef.current.textContent = originalValueRef.current;
          }
        }
      }
    } catch (error) {
      console.error('Failed to update key:', error);
      if (keyRef.current) {
        keyRef.current.textContent = originalValueRef.current;
      }
    } finally {
      setIsSubmitting(false);
      setIsEditingKey(false);
    }
  };

  const handleKeyBlur = () => {
    if (!isSubmitting) {
      handleKeySubmit();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleKeySubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (keyRef.current) {
        keyRef.current.textContent = originalValueRef.current;
      }
      setIsEditingKey(false);
    }
  };

  // Render appropriate value component based on type
  const renderValueComponent = () => {
    if (!isPrimitive) {
      return <span className="json-value-complex">{children}</span>;
    }

    if (valueType === 'null') {
      return <JsonNullComp />;
    } else if (valueType === 'boolean') {
      return (
        <JsonBoolComp
          value={value}
          path={path}
          isEditable={canEditValue}
          onChange={onChange}
        />
      );
    } else if (valueType === 'number') {
      return (
        <JsonNumberComp
          value={value}
          path={path}
          isEditable={canEditValue}
          onChange={onChange}
        />
      );
    } else {
      // string or other
      return (
        <JsonTextComp
          value={value}
          path={path}
          isEditable={canEditValue}
          onChange={onChange}
        />
      );
    }
  };

  return (
    <div className={`json-keyvalue ${!isPrimitive ? 'has-complex-value' : ''}`}>
      <div className="json-key-and-colon">
        <span className="json-key-wrapper">
          <span
            ref={keyRef}
            className={`json-key ${canEditKey ? 'editable' : ''} ${isEditingKey ? 'editing' : ''}`}
            contentEditable={isEditingKey}
            onBlur={handleKeyBlur}
            onKeyDown={handleKeyDown}
            onClick={handleKeyClick}
            suppressContentEditableWarning={true}
          >
            {itemKey}
          </span>
          {isSubmitting && isEditingKey && (
            <span className="json-spinner">
              <SpinningCircle width={14} height={14} color="#666" />
            </span>
          )}
        </span>
        
        <span className="json-colon">:</span>
      </div>
      
      {renderValueComponent()}
    </div>
  );
};

export default React.memo(JsonKeyValueComp, (prev, next) => {
  return prev.value === next.value && 
         prev.itemKey === next.itemKey &&
         prev.isEditable === next.isEditable &&
         prev.isKeyEditable === next.isKeyEditable &&
         prev.isValueEditable === next.isValueEditable &&
         prev.onChange === next.onChange; // Include onChange - if it changes, child needs new callback
});
