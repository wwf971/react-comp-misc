import React, { useState, useRef, useEffect } from 'react';
import './KeyValues.css';

/**
 * Helper function to find closest character index to a click position
 */
const getClosestCharIndex = (element, targetPageX) => {
  if (!element) return 0;
  
  const textLength = element.textContent?.length || 0;
  if (textLength === 0) return 0;
  
  const range = document.createRange();
  const textNode = element.firstChild;
  
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return 0;
  
  let closestIndex = 0;
  let minDistance = Infinity;
  
  // Check each character position
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
      
      // Early stop if we've passed the target
      if (pageX > targetPageX) {
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  return closestIndex;
};

/**
 * KeyValues component for displaying and editing key-value pairs
 * 
 * @param {Object} props
 * @param {Array<{key: string, value: any}>} props.data - Array of key-value pairs
 * @param {boolean} props.isEditable - Whether the data is editable (default: true)
 * @param {boolean} props.isKeyEditable - Whether keys are editable (default: false)
 * @param {boolean} props.isValueEditable - Whether values are editable (default: true)
 * @param {boolean} props.alignColumn - Whether to align key/value columns (default: true)
 * @param {string} props.keyColWidth - Width of key column: 'min' for auto-calculated, or fixed like '200px' (default: 'min')
 * @param {Function} props.onChangeAttempt - Callback when user attempts to change a key or value: (index, field, newValue) => void
 */
const KeyValues = ({ 
  data = [], 
  isEditable = true, 
  isKeyEditable = false, 
  isValueEditable = true,
  alignColumn = true,
  keyColWidth = 'min',
  onChangeAttempt 
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingField, setEditingField] = useState(null); // 'key' or 'value'
  const [keyColWidthValue, setKeyColWidthValue] = useState(null);
  const editRef = useRef(null);
  const originalValueRef = useRef('');
  const clickPositionRef = useRef(null);
  const keyRefs = useRef([]);

  // Determine if a field is actually editable
  const canEditKey = isEditable && isKeyEditable;
  const canEditValue = isEditable && isValueEditable;

  // Calculate minimum key column width when keyColWidth is 'min'
  useEffect(() => {
    if (alignColumn && keyColWidth === 'min' && keyRefs.current.length > 0) {
      // First pass: measure natural widths without constraints
      // We need to temporarily remove width constraints to get accurate measurements
      let maxWidth = 0;
      
      keyRefs.current.forEach(ref => {
        if (ref) {
          // Get the parent container to measure
          const container = ref.closest('.keyvalues-cell');
          if (container) {
            const originalWidth = container.style.width;
            const originalFlexShrink = container.style.flexShrink;
            // Temporarily remove width constraint
            container.style.width = 'auto';
            container.style.flexShrink = '0';
            
            // Measure the cell's actual width including padding
            // Use getBoundingClientRect for accurate measurement
            const rect = container.getBoundingClientRect();
            const width = Math.ceil(rect.width);
            
            if (width > maxWidth) {
              maxWidth = width;
            }
            
            // Restore original styles
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

  useEffect(() => {
    if (editingIndex !== null && editingField !== null && editRef.current && clickPositionRef.current !== null) {
      // Place cursor at click position
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
  }, [editingIndex, editingField]);

  const handleCellClick = (index, field, event) => {
    if (field === 'key' && !canEditKey) return;
    if (field === 'value' && !canEditValue) return;
    
    // Click event might fire, when drag-select ends.
      // in this case, we should not enter edit mode.
    // Check if there's an active text selection (from dragging)
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      // User has selected text, don't enter edit mode
      return;
    }
    
    // No selection, this is a regular click - enter edit mode
    const currentValue = field === 'key' ? data[index].key : data[index].value;
    originalValueRef.current = String(currentValue);
    clickPositionRef.current = event.pageX;
    setEditingIndex(index);
    setEditingField(field);
  };

  const handleEditBlur = () => {
    if (editingIndex !== null && editingField !== null && editRef.current) {
      const newValue = editRef.current.textContent;
      
      // Only call callback if value actually changed
      if (newValue !== originalValueRef.current) {
        if (onChangeAttempt) {
          onChangeAttempt(editingIndex, editingField, newValue);
        }
      }
    }
    
    setEditingIndex(null);
    setEditingField(null);
    originalValueRef.current = '';
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Restore original value
      if (editRef.current) {
        editRef.current.textContent = originalValueRef.current;
      }
      setEditingIndex(null);
      setEditingField(null);
      originalValueRef.current = '';
    }
  };

  return (
    <div className="keyvalues-container">
      {data.length === 0 ? (
        <div className="keyvalues-empty">No data</div>
      ) : (
        <div className="keyvalues-list">
          {data.map((item, index) => (
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
                onClick={(e) => handleCellClick(index, 'key', e)}
              >
                <span 
                  ref={(el) => {
                    keyRefs.current[index] = el;
                    if (editingIndex === index && editingField === 'key') {
                      editRef.current = el;
                    }
                  }}
                  className={`keyvalues-text ${editingIndex === index && editingField === 'key' ? 'editing' : ''}`}
                  contentEditable={editingIndex === index && editingField === 'key'}
                  onBlur={handleEditBlur}
                  onKeyDown={handleEditKeyDown}
                  suppressContentEditableWarning={true}
                >
                  {item.key}
                </span>
              </div>
              <div 
                className={`keyvalues-cell value-cell ${canEditValue ? 'editable' : ''}`}
                style={alignColumn ? { flex: 1 } : {}}
                onClick={(e) => handleCellClick(index, 'value', e)}
              >
                <span 
                  ref={editingIndex === index && editingField === 'value' ? editRef : null}
                  className={`keyvalues-text ${editingIndex === index && editingField === 'value' ? 'editing' : ''}`}
                  contentEditable={editingIndex === index && editingField === 'value'}
                  onBlur={handleEditBlur}
                  onKeyDown={handleEditKeyDown}
                  suppressContentEditableWarning={true}
                >
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeyValues;

