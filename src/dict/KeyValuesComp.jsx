import React, { useState, useRef, useEffect } from 'react';
import './KeyValues.css';

/**
 * Default Text component for displaying text data
 */
const DefaultTextComp = ({ 
  data, 
  onChangeAttempt, 
  isEditable, 
  field,
  index 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef(null);
  const originalValueRef = useRef('');
  const clickPositionRef = useRef(null);

  // Helper function to find closest character index
  const getClosestCharIndex = (element, targetPageX) => {
    if (!element) return 0;
    
    const textLength = element.textContent?.length || 0;
    if (textLength === 0) return 0;
    
    const range = document.createRange();
    const textNode = element.firstChild;
    
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return 0;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    
    for (let pos = 0; pos <= textLength; pos++) {
      try {
        range.setStart(textNode, pos);
        range.collapse(true);
        
        const rect = range.getBoundingClientRect();
        const pageX = rect.left + window.scrollX;
        const distance = Math.abs(pageX - targetPageX);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = pos;
        }
        
        if (pageX > targetPageX) {
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    return closestIndex;
  };

  useEffect(() => {
    if (isEditing && editRef.current && clickPositionRef.current !== null) {
      const charIndex = getClosestCharIndex(editRef.current, clickPositionRef.current);
      
      const range = document.createRange();
      const selection = window.getSelection();
      const textNode = editRef.current.firstChild;
      
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        range.setStart(textNode, charIndex);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      clickPositionRef.current = null;
    }
  }, [isEditing]);

  const handleClick = (event) => {
    if (!isEditable) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    
    originalValueRef.current = String(data);
    clickPositionRef.current = event.pageX;
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (editRef.current) {
      const newValue = editRef.current.textContent;
      
      if (newValue !== originalValueRef.current) {
        if (onChangeAttempt) {
          onChangeAttempt(index, field, newValue);
        }
      }
    }
    
    setIsEditing(false);
    originalValueRef.current = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (editRef.current) {
        editRef.current.textContent = originalValueRef.current;
      }
      setIsEditing(false);
      originalValueRef.current = '';
    }
  };

  return (
    <span 
      ref={editRef}
      className={`keyvalues-text ${isEditing ? 'editing' : ''}`}
      contentEditable={isEditing}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      suppressContentEditableWarning={true}
    >
      {data}
    </span>
  );
};

/**
 * KeyValuesComp component for displaying key-value pairs with custom components
 * 
 * @param {Object} props
 * @param {Array<{key: any, keyComp: React.Component, value: any, valueComp: React.Component}>} props.data - Array of key-value pairs with optional custom components
 * @param {boolean} props.isEditable - Whether the data is editable (default: true)
 * @param {boolean} props.isKeyEditable - Whether keys are editable (default: false)
 * @param {boolean} props.isValueEditable - Whether values are editable (default: true)
 * @param {boolean} props.alignColumn - Whether to align key/value columns (default: true)
 * @param {string} props.keyColWidth - Width of key column: 'min' for auto-calculated, or fixed like '200px' (default: 'min')
 * @param {Function} props.onChangeAttempt - Callback when user attempts to change a key or value: (index, field, newValue) => void
 */
const KeyValuesComp = ({ 
  data = [], 
  isEditable = true, 
  isKeyEditable = false, 
  isValueEditable = true,
  alignColumn = true,
  keyColWidth = 'min',
  onChangeAttempt 
}) => {
  const [keyColWidthValue, setKeyColWidthValue] = useState(null);
  const keyRefs = useRef([]);

  // Determine if a field is actually editable
  const canEditKey = isEditable && isKeyEditable;
  const canEditValue = isEditable && isValueEditable;

  // Calculate minimum key column width when keyColWidth is 'min'
  useEffect(() => {
    if (alignColumn && keyColWidth === 'min' && keyRefs.current.length > 0) {
      let maxWidth = 0;
      
      keyRefs.current.forEach(ref => {
        if (ref) {
          const container = ref.closest('.keyvalues-cell');
          if (container) {
            const originalWidth = container.style.width;
            const originalFlexShrink = container.style.flexShrink;
            container.style.width = 'auto';
            container.style.flexShrink = '0';
            
            const rect = container.getBoundingClientRect();
            const width = Math.ceil(rect.width);
            
            if (width > maxWidth) {
              maxWidth = width;
            }
            
            container.style.width = originalWidth;
            container.style.flexShrink = originalFlexShrink;
          }
        }
      });
      
      setKeyColWidthValue(maxWidth > 0 ? `${maxWidth}px` : null);
    } else if (alignColumn && keyColWidth !== 'min') {
      setKeyColWidthValue(keyColWidth);
    } else {
      setKeyColWidthValue(null);
    }
  }, [data, alignColumn, keyColWidth]);

  return (
    <div className="keyvalues-container">
      {data.length === 0 ? (
        <div className="keyvalues-empty">No data</div>
      ) : (
        <div className="keyvalues-list">
          {data.map((item, index) => {
            // Use custom component or default
            const KeyComp = item.keyComp || DefaultTextComp;
            const ValueComp = item.valueComp || DefaultTextComp;

            return (
              <div 
                key={index} 
                className="keyvalues-row"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  ...(alignColumn && keyColWidthValue ? { '--key-col-width': keyColWidthValue } : {})
                }}
              >
                <div 
                  className={`keyvalues-cell key-cell ${canEditKey ? 'editable' : ''}`}
                  style={alignColumn && keyColWidthValue ? { width: keyColWidthValue, flexShrink: 0 } : {}}
                >
                  <div ref={(el) => { keyRefs.current[index] = el; }}>
                    <KeyComp 
                      data={item.key}
                      onChangeAttempt={onChangeAttempt}
                      isEditable={canEditKey}
                      field="key"
                      index={index}
                    />
                  </div>
                </div>
                <div 
                  className={`keyvalues-cell value-cell ${canEditValue ? 'editable' : ''}`}
                  style={alignColumn ? { flex: 1 } : {}}
                >
                  <ValueComp 
                    data={item.value}
                    onChangeAttempt={onChangeAttempt}
                    isEditable={canEditValue}
                    field="value"
                    index={index}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KeyValuesComp;
export { DefaultTextComp };

