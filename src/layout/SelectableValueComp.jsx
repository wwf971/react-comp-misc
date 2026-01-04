import React, { useState, useRef, useEffect } from 'react';
import { SpinningCircle, EditIcon } from '@wwf971/react-comp-misc';

/**
 * Selectable value component for config editing with dropdown selection
 * User can only select values from a predefined list
 * 
 * @param {Function} onUpdate - Callback function (configKey, newValue) => Promise<{code: number}>
 * @param {Array} options - Array of {value, label, description?} objects
 */
const SelectableValueComp = ({ 
  data, 
  index, 
  field, 
  category, 
  isNotSet = false, 
  configKey,
  onUpdate,
  options = []
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const selectRef = useRef(null);
  const originalValueRef = useRef('');

  const handleEditClick = () => {
    if (isSubmitting) return;
    originalValueRef.current = isNotSet ? '' : String(data);
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
      // Automatically expand the dropdown
      try {
        if (selectRef.current.showPicker) {
          selectRef.current.showPicker();
        } else {
          // Fallback for browsers that don't support showPicker
          selectRef.current.click();
        }
      } catch (e) {
        // Silently fail if showPicker is not supported
      }
    }
  }, [isEditing]);

  const handleSelectChange = async (e) => {
    const newValue = e.target.value;
    
    if (newValue === originalValueRef.current) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!configKey) {
        console.error('configKey prop is required');
        setIsSubmitting(false);
        setIsEditing(false);
        return;
      }

      if (!onUpdate) {
        console.error('onUpdate callback is required');
        setIsSubmitting(false);
        setIsEditing(false);
        return;
      }

      // Call the provided update callback
      const result = await onUpdate(configKey, newValue);
      
      if (result.code !== 0) {
        console.error('Failed to update config:', result.message);
        // Show error message temporarily
        setErrorMessage(result.message || 'Update failed');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      // Show error message temporarily
      setErrorMessage(error.message || 'Network error');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (!isSubmitting) {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  // Find current option label
  const getCurrentLabel = () => {
    if (isNotSet) return 'NOT SET';
    const option = options.find(opt => opt.value === data);
    return option ? option.label : data;
  };

  return (
    <span className="editable-value-container">
      {isEditing ? (
        <select
          ref={selectRef}
          className="selectable-value-dropdown"
          value={data || ''}
          onChange={handleSelectChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        >
          {isNotSet && <option value="">Select a value...</option>}
          {options.map((option, idx) => (
            <option key={idx} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <span 
          className={`editable-value-text selectable-value-text ${isNotSet ? 'not-set' : ''}`}
        >
          {getCurrentLabel()}
        </span>
      )}
      
      <span className="editable-value-icon">
        {isSubmitting ? (
          <SpinningCircle width={16} height={16} color="#666" />
        ) : errorMessage ? (
          <span 
            className="edit-icon-error"
            title={errorMessage}
            style={{ color: '#d32f2f', fontSize: '16px', cursor: 'help' }}
          >
            ⚠
          </span>
        ) : (
          <span 
            onClick={handleEditClick}
            className="edit-icon-button"
            title="Click to select"
          >
            <EditIcon width={16} height={16} />
          </span>
        )}
      </span>
    </span>
  );
};

export default SelectableValueComp;

