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

// Memoize to prevent re-renders when data unchanged
const MemoizedDefaultTextComp = React.memo(DefaultTextComp, (prev, next) => {
  return prev.data === next.data && 
         prev.isEditable === next.isEditable &&
         prev.onChangeAttempt === next.onChangeAttempt;
});

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
    if (!alignColumn) {
      setKeyColWidthValue(null);
      return;
    }
    
    if (keyColWidth !== 'min') {
      setKeyColWidthValue(keyColWidth);
      return;
    }
    
    if (data.length === 0) {
      setKeyColWidthValue(null);
      return;
    }

    // Measure the natural width of each key cell and find the maximum
    const measureMaxWidth = () => {
      let maxWidth = 0;
      
      keyRefs.current.forEach(ref => {
        if (ref) {
          const cell = ref.closest('.keyvalues-cell');
          if (cell) {
            // Temporarily remove width constraint to measure natural size
            const originalWidth = cell.style.width;
            const originalFlexShrink = cell.style.flexShrink;
            cell.style.width = 'auto';
            cell.style.flexShrink = '0';
            
            // Measure the natural width of the cell
            const cellWidth = cell.offsetWidth;
            
            // Restore original styles
            cell.style.width = originalWidth;
            cell.style.flexShrink = originalFlexShrink;
            
            if (cellWidth > maxWidth) {
              maxWidth = cellWidth;
            }
          }
        }
      });
      
      if (maxWidth > 0) {
        setKeyColWidthValue(`${maxWidth}px`);
      }
    };

    // Use ResizeObserver to re-measure when content changes
    const resizeObserver = new ResizeObserver(measureMaxWidth);
    
    keyRefs.current.forEach(ref => {
      if (ref) {
        resizeObserver.observe(ref);
      }
    });

    // Initial measurement
    measureMaxWidth();

    return () => resizeObserver.disconnect();
  }, [data, alignColumn, keyColWidth, isKeyEditable, isValueEditable]);

  return (
    <div className="keyvalues-container">
      {data.length === 0 ? (
        <div className="keyvalues-empty">No data</div>
      ) : (
        <div className="keyvalues-list">
          {data.map((item, index) => {
            // Use custom component or default (use memoized version)
            const KeyComp = item.keyComp || MemoizedDefaultTextComp;
            const ValueComp = item.valueComp || MemoizedDefaultTextComp;

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
                  <span ref={(el) => { keyRefs.current[index] = el; }}>
                    <KeyComp 
                      data={item.key}
                      onChangeAttempt={onChangeAttempt}
                      isEditable={canEditKey}
                      field="key"
                      index={index}
                    />
                  </span>
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

export default React.memo(KeyValuesComp, (prev, next) => {
  // Compare all props that affect rendering
  return prev.data === next.data && 
         prev.isEditable === next.isEditable &&
         prev.isKeyEditable === next.isKeyEditable &&
         prev.isValueEditable === next.isValueEditable &&
         prev.alignColumn === next.alignColumn &&
         prev.keyColWidth === next.keyColWidth &&
         prev.onChangeAttempt === next.onChangeAttempt;
});

export { DefaultTextComp, MemoizedDefaultTextComp };

