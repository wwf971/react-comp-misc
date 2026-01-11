import React, { useState, useRef, useEffect } from 'react';
import { SpinningCircle, EditIcon } from '@wwf971/react-comp-misc';
import './EditableValue.css';
import './SearchableValue.css';
import './SelectableValue.css';

/**
 * Selectable value component for config editing with dropdown selection
 * User can only select values from a predefined list
 * 
 * IMPORTANT: This is a controlled component - parent owns the data.
 * - Component displays whatever parent provides via 'data' prop
 * - Component never mutates data, only requests changes via callbacks
 * - Parent decides whether to accept/reject updates (via onUpdate return value)
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
  const [isShowingError, setIsShowingError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const editRef = useRef(null);
  const dropdownRef = useRef(null);
  const originalValueRef = useRef('');

  const handleEditClick = () => {
    if (isSubmitting || isShowingError) return;
    originalValueRef.current = isNotSet ? '' : String(data);
    setIsEditing(true);
    setShowDropdown(true);
    // Find current selection index
    const currentIdx = options.findIndex(opt => opt.value === data);
    setSelectedIndex(currentIdx);
  };

  // Sync contentEditable text with data prop when not editing and not showing error
  // Parent controls the data - component loyally displays what parent provides
  useEffect(() => {
    if (!isEditing && !isShowingError && editRef.current) {
      const currentText = editRef.current.textContent;
      const newText = getCurrentLabel();
      if (currentText !== newText) {
        editRef.current.textContent = newText;
      }
    }
  }, [data, isEditing, isShowingError, configKey]);

  // Focus when entering edit mode
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
    }
  }, [isEditing]);

  const handleSelectFromDropdown = async (selectedValue) => {
    if (selectedValue === originalValueRef.current) {
      setIsEditing(false);
      setShowDropdown(false);
      return;
    }

    setIsSubmitting(true);
    setShowDropdown(false);
    
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

      // Submit to parent - parent decides whether to accept or reject
      const result = await onUpdate(configKey, selectedValue);
      
      // Parent rejected the update - show error and wait for parent to update data prop
      if (result.code !== 0) {
        console.error('Failed to update config:', result.message);
        // Keep the invalid value displayed temporarily
        const invalidValue = getCurrentLabelForValue(selectedValue);
        if (editRef.current) {
          editRef.current.textContent = invalidValue;
        }
        setIsShowingError(true);
        setErrorMessage(result.message || 'Update failed');
        // After 1 second, clear error state and sync with parent data
        setTimeout(() => {
          setErrorMessage(null);
          setIsShowingError(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      // Keep the invalid value displayed temporarily
      const invalidValue = getCurrentLabelForValue(selectedValue);
      if (editRef.current) {
        editRef.current.textContent = invalidValue;
      }
      setIsShowingError(true);
      setErrorMessage(error.message || 'Network error');
      // After 1 second, clear error state and sync with parent data
      setTimeout(() => {
        setErrorMessage(null);
        setIsShowingError(false);
      }, 1000);
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleBlur = (e) => {
    // Check if we're clicking on dropdown
    if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    if (!isSubmitting) {
      setShowDropdown(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && selectedIndex >= 0 && options[selectedIndex]) {
        handleSelectFromDropdown(options[selectedIndex].value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      setIsEditing(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showDropdown && options.length > 0) {
        setSelectedIndex(prev => Math.min(prev + 1, options.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showDropdown && options.length > 0) {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
    }
  };

  // Find current option label for data prop
  const getCurrentLabel = () => {
    if (isNotSet && !data) return 'NOT SET';
    const option = options.find(opt => opt.value === data);
    return option ? option.label : data;
  };

  // Find label for a specific value
  const getCurrentLabelForValue = (value) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <span className="editable-value-container searchable-value-wrapper">
      <span className="selectable-value-fixed-wrapper">
        <span 
          ref={editRef}
          className={`editable-value-text ${isEditing ? 'editing selectable-editing' : ''} ${isNotSet && !isEditing ? 'not-set' : ''}`}
          tabIndex={isEditing ? 0 : -1}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning={true}
          style={{
            ...(isSubmitting || isShowingError ? { pointerEvents: 'none', opacity: 0.7 } : {}),
            ...(isEditing ? { minWidth: '100px' } : {})
          }}
        >
          {getCurrentLabel()}
        </span>
      </span>
      
      {showDropdown && options.length > 0 && (
        <div 
          ref={dropdownRef}
          className="searchable-dropdown"
          onMouseDown={(e) => e.preventDefault()}
        >
          {options.map((option, idx) => (
            <div
              key={idx}
              className={`searchable-dropdown-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelectFromDropdown(option.value)}
            >
              <div className="searchable-dropdown-value">{option.label}</div>
              {option.description && (
                <div className="searchable-dropdown-desc">{option.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <span className="editable-value-icon">
        {isSubmitting ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SpinningCircle width={16} height={16} color="#666" />
            <span style={{ fontSize: '13px', color: '#666' }}>Saving...</span>
          </span>
        ) : errorMessage ? (
          <span 
            className="edit-icon-error"
            style={{ color: '#d32f2f', fontSize: '13px', cursor: 'help' }}
            title={errorMessage}
          >
            {errorMessage}
          </span>
        ) : (
          <span 
            onClick={handleEditClick}
            className="edit-icon-button"
            title={isShowingError ? "Please wait..." : "Click to select"}
            style={isShowingError ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
          >
            <EditIcon width={13} height={13} />
          </span>
        )}
      </span>
    </span>
  );
};

export default SelectableValueComp;

