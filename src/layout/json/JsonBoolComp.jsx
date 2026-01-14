import React, { useState } from 'react';
import SpinningCircle from '../../icon/SpinningCircle';
import { useJsonContext } from './JsonContext';
import { getAvailableConversions } from './typeConvert';
import './JsonComp.css';

/**
 * JsonBoolComp - Boolean toggle component
 * Clicking toggles between true/false when editable
 */
const JsonBoolComp = ({
  value,
  path,
  isEditable,
  onChange
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShowingError, setIsShowingError] = useState(null);
  const { showConversionMenu, queryParentInfo } = useJsonContext();
  
  // Render tracking
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Render] JsonBoolComp: ${path} = ${value}`);
  }

  const handleClick = async () => {
    if (!isEditable || isSubmitting || isShowingError) return;

    const newValue = !value;
    setIsSubmitting(true);
    setIsShowingError(null);
    
    try {
      if (onChange) {
        const changeData = {
          old: { type: 'boolean', value: value },
          new: { type: 'boolean', value: newValue }
        };
        const result = await onChange(path, changeData);
        
        if (result.code !== 0) {
          console.error('Failed to update value:', result.message);
          setIsShowingError(result.message || 'Update failed');
          // Clear error after 3 seconds
          setTimeout(() => setIsShowingError(null), 3000);
        }
      }
    } catch (error) {
      console.error('Failed to update value:', error);
      setIsShowingError(error.message || 'Network error');
      // Clear error after 3 seconds
      setTimeout(() => setIsShowingError(null), 3000);
    } finally {
      setIsSubmitting(false);
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
        currentType: 'boolean',
        path,
        menuType: isArrayItem ? 'arrayItem' : 'value',
        value: value,
        availableConversions: getAvailableConversions(value, 'boolean'),
        isSingleEntryInParent: parentInfo.isSingleEntryInParent,
        isFirstInParent: parentInfo.isFirstInParent,
        isLastInParent: parentInfo.isLastInParent
      });
    }
  };

  return (
    <span className="json-value-wrapper">
      <span
        className={`json-value json-boolean ${isEditable && !isShowingError ? 'editable clickable' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        title={isEditable && !isShowingError ? 'Click to toggle' : ''}
      >
        {String(value)}
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

export default JsonBoolComp;

