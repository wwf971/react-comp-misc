import React, { useState, useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import './KeyValues.css';

/**
 * Default Text component for displaying text data
 */
const DefaultTextComp = ({ 
  data, 
  onChangeAttempt, 
  isEditable, 
  field,
  index,
  itemRef
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
        } else if (itemRef && field) {
          runInAction(() => {
            itemRef[field] = newValue;
          });
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
         prev.onChangeAttempt === next.onChangeAttempt &&
         prev.itemRef === next.itemRef;
});

/**
 * KeyValuesComp component for displaying key-value pairs with custom components
 * 
 * MobX Support:
 * - Use observable([...]) from mobx to enable in-place mutations on arrays
 * - Component will auto-track accessed properties and re-render only affected rows
 * - Backward compatible: works with plain arrays and onChangeAttempt callback
 * 
 * @param {Object} props
 * @param {Array<{key: any, keyCompName?: string, value: any, valueCompName?: string}>} props.data - Array of key-value pairs with optional custom component names (can be observable)
 * @param {boolean} props.isEditable - Whether the data is editable (default: true)
 * @param {boolean} props.isKeyEditable - Whether keys are editable (default: false)
 * @param {boolean} props.isValueEditable - Whether values are editable (default: true)
 * @param {boolean} props.alignColumn - Whether to align key/value columns (default: true)
 * @param {string} props.keyColWidth - Width of key column: 'min' for auto-calculated, or fixed like '200px' (default: 'min')
 * @param {Function} props.onChangeAttempt - Callback when user attempts to change a key or value: (index, field, newValue) => void
 * @param {Function} props.getComp - Resolve component by name: (name, context) => React.Component | null
 * @param {boolean} props.isDividerDraggable - Whether the key/value divider line can be dragged to resize columns (default: false)
 * @param {boolean} props.isWrap - Whether cell content wraps to the next line when it overflows; false clips with ellipsis (default: false)
 */
const KeyValuesCompInner = ({ 
  data = [], 
  isEditable = true, 
  isKeyEditable = false, 
  isValueEditable = true,
  isDividerDraggable = false,
  isWrap = false,
  alignColumn = true,
  keyColWidth = 'min',
  onChangeAttempt,
  getComp,
}) => {
  const [keyColWidthValue, setKeyColWidthValue] = useState(null);
  const [isDividerDragging, setIsDividerDragging] = useState(false);
  const keyRefs = useRef([]);
  const listRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const measureTimeoutRef = useRef(null);
  const lastMeasuredWidthRef = useRef(0);
  const measureAttemptsRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragHandlersRef = useRef({ onMove: null, onUp: null });

  const canEditKey = isEditable && isKeyEditable;
  const canEditValue = isEditable && isValueEditable;
  const cellOverflowClass = isWrap ? 'cell-wrap' : 'cell-clip';
  const startDividerDrag = useCallback((event) => {
    event.preventDefault();
    const list = listRef.current;
    if (!list) return;
    isDraggingRef.current = true;
    setIsDividerDragging(true);

    const onMove = (moveEvent) => {
      const rect = list.getBoundingClientRect();
      const newWidth = moveEvent.clientX - rect.left;
      const clamped = Math.max(40, Math.min(rect.width - 40, newWidth));
      setKeyColWidthValue(`${Math.round(clamped)}px`);
    };

    const onUp = () => {
      isDraggingRef.current = false;
      setIsDividerDragging(false);
      window.removeEventListener('mousemove', dragHandlersRef.current.onMove);
      window.removeEventListener('mouseup', dragHandlersRef.current.onUp);
      dragHandlersRef.current = { onMove: null, onUp: null };
    };

    dragHandlersRef.current = { onMove, onUp };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  useEffect(() => {
    return () => {
      const { onMove, onUp } = dragHandlersRef.current;
      if (onMove) window.removeEventListener('mousemove', onMove);
      if (onUp) window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const resolveComp = useCallback((compName, context) => {
    if (!compName || !getComp) {
      return MemoizedDefaultTextComp;
    }
    const resolvedComp = getComp(compName, context);
    return resolvedComp || MemoizedDefaultTextComp;
  }, [getComp]);

  // Measure the natural width of each key cell and find the maximum
  // Keeps measuring until width stabilizes (for custom components that take time to render)
  const measureMaxWidth = useCallback((isRetry = false) => {
    // Check if refs are populated
    const validRefs = keyRefs.current.filter(ref => ref && ref.closest('.keyvalues-cell'));
    
    // If refs aren't ready yet and we're in retry mode, retry
    if (validRefs.length === 0 && isRetry && measureAttemptsRef.current < 20) {
      measureAttemptsRef.current++;
      measureTimeoutRef.current = setTimeout(() => {
        measureMaxWidth(true);
      }, 150);
      return;
    }
    
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
      // Check if width has stabilized
      const hasWidthChanged = Math.abs(maxWidth - lastMeasuredWidthRef.current) > 1;
      lastMeasuredWidthRef.current = maxWidth;
      
      setKeyColWidthValue(`${maxWidth}px`);
      
      // If this is initial measurement and width is changing, keep measuring
      if (isRetry && hasWidthChanged && measureAttemptsRef.current < 20) {
        measureAttemptsRef.current++;
        measureTimeoutRef.current = setTimeout(() => {
          measureMaxWidth(true);
        }, 150);
      } else {
        measureAttemptsRef.current = 0;
      }
    } else if (isRetry && measureAttemptsRef.current < 20) {
      // Width is still 0 but we're in retry mode, keep trying
      measureAttemptsRef.current++;
      measureTimeoutRef.current = setTimeout(() => {
        measureMaxWidth(true);
      }, 150);
    }
  }, []);

  // Calculate minimum key column width when keyColWidth is 'min'
  useEffect(() => {
    // Clean up any pending measurements
    if (measureTimeoutRef.current) {
      clearTimeout(measureTimeoutRef.current);
      measureTimeoutRef.current = null;
    }
    
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

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

    // Set an initial estimated width immediately to avoid layout shift
    // This will be refined by the measurement below
    setKeyColWidthValue('150px');

    resizeObserverRef.current = new ResizeObserver(() => {
      if (isDraggingRef.current) return;
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
      measureTimeoutRef.current = setTimeout(() => measureMaxWidth(false), 50);
    });
    
    keyRefs.current.forEach(ref => {
      if (ref && resizeObserverRef.current) {
        resizeObserverRef.current.observe(ref);
      }
    });

    // Initial measurement with delay to ensure custom components are fully rendered
    // Use multiple animation frames to ensure all rendering is complete
    // Then start adaptive measurement that retries until width stabilizes
    lastMeasuredWidthRef.current = 0;
    measureAttemptsRef.current = 0;
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          measureTimeoutRef.current = setTimeout(() => {
            measureMaxWidth(true); // Enable retry mode for initial measurement
          }, 50); // Short initial delay before starting adaptive measurement
        });
      });
    });

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
        measureTimeoutRef.current = null;
      }
      measureAttemptsRef.current = 0;
      lastMeasuredWidthRef.current = 0;
    };
  }, [data, alignColumn, keyColWidth, measureMaxWidth]); // Watch data directly, not just data.length

  return (
    <div className="keyvalues-container">
      {data.length === 0 ? (
        <div className="keyvalues-empty">No data</div>
      ) : (
        <div
          className={`keyvalues-list${isDividerDragging ? ' divider-dragging' : ''}`}
          ref={listRef}
        >
          {isDividerDraggable && alignColumn && keyColWidthValue && (
            <div
              className={`keyvalues-divider-handle${isDividerDragging ? ' dragging' : ''}`}
              style={{ left: keyColWidthValue }}
              onMouseDown={startDividerDrag}
            />
          )}
          {data.map((item, index) => {
            const keyContext = { item, index, field: 'key' };
            const valueContext = { item, index, field: 'value' };
            const KeyComp = resolveComp(item.keyCompName, keyContext);
            const ValueComp = resolveComp(item.valueCompName, valueContext);

            return (
              <div 
                key={index} 
                className={`keyvalues-row ${String(item?.rowClassName || '')}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  ...(alignColumn && keyColWidthValue ? { '--key-col-width': keyColWidthValue } : {})
                }}
              >
                <div 
                  className={`keyvalues-cell key-cell ${cellOverflowClass} ${canEditKey ? 'editable' : ''}`}
                  style={alignColumn && keyColWidthValue ? { width: keyColWidthValue, flexShrink: 0 } : {}}
                >
                  <span ref={(el) => { keyRefs.current[index] = el; }}>
                    <KeyComp 
                      data={item.key}
                      onChangeAttempt={onChangeAttempt}
                      isEditable={canEditKey}
                      field="key"
                      index={index}
                      itemRef={item}
                    />
                  </span>
                </div>
                <div 
                  className={`keyvalues-cell value-cell ${cellOverflowClass} ${canEditValue ? 'editable' : ''}`}
                  style={alignColumn ? { flex: 1 } : {}}
                >
                  <ValueComp 
                    data={item.value}
                    onChangeAttempt={onChangeAttempt}
                    isEditable={canEditValue}
                    field="value"
                    index={index}
                    itemRef={item}
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

const KeyValuesComp = observer(KeyValuesCompInner);

export default KeyValuesComp;
export { DefaultTextComp, MemoizedDefaultTextComp };

