import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { InfoIcon } from '../icon/Icon.jsx';

/**
 * Editable Value Component with Info Icon
 * Displays text with an info icon that shows a tooltip on hover
 * Supports inline editing with click-to-edit functionality
 * 
 * @param {Object} props
 * @param {any} props.data - The text data to display
 * @param {Function} props.onChangeAttempt - Callback when user attempts to change: (index, field, newValue) => void
 * @param {boolean} props.isEditable - Whether the text is editable
 * @param {string} props.field - The field name (key or value)
 * @param {number} props.index - The index of the item in the list
 * @param {string} props.tooltipText - Custom tooltip text (optional)
 */
const EditableValueWithInfo = ({ 
  data, 
  onChangeAttempt, 
  isEditable, 
  field, 
  index,
  tooltipText = 'Additional information about this field.'
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const editRef = useRef(null);
  const originalValueRef = useRef('');
  const clickPositionRef = useRef(null);
  const infoIconRef = useRef(null);

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

  const handleTextClick = (e) => {
    if (!isEditable) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    
    originalValueRef.current = String(data);
    clickPositionRef.current = e.pageX;
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

  const handleMouseEnter = () => {
    if (infoIconRef.current) {
      const rect = infoIconRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX - 60
      });
    }
    setShowPopup(true);
  };

  const handleMouseLeave = () => {
    setShowPopup(false);
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <span 
        ref={editRef}
        className={`keyvalues-text ${isEditing ? 'editing' : ''}`}
        contentEditable={isEditing}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleTextClick}
        suppressContentEditableWarning={true}
        style={{ display: 'inline' }}
      >
        {data}
      </span>
      <span 
        ref={infoIconRef}
        style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'help',
          color: '#999'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <InfoIcon width={14} height={14} />
      </span>
      {showPopup && createPortal(
        <div 
          style={{
            position: 'absolute',
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            width: '180px',
            padding: '8px 10px',
            background: '#333',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '11px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 10000,
            pointerEvents: 'none'
          }}
        >
          {tooltipText}
          <div 
            style={{
              position: 'absolute',
              top: '-6px',
              left: '65px',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid #333'
            }}
          />
        </div>,
        document.body
      )}
    </span>
  );
};

export default EditableValueWithInfo;

