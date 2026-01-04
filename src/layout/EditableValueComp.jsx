import React, { useState, useEffect, useRef } from 'react';
import { SpinningCircle, EditIcon } from '@wwf971/react-comp-misc';

/**
 * Editable value component for config editing with inline edit support
 * Supports both text editing and boolean radio buttons
 * 
 * @param {Function} onUpdate - Callback function (configKey, newValue) => Promise<{code: number}>
 */
const EditableValueComp = ({ 
  data, 
  index, 
  field, 
  category, 
  valueType = 'text', 
  isNotSet = false, 
  configKey,
  onUpdate // Callback for handling updates
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const editRef = useRef(null);
  const originalValueRef = useRef('');

  const handleEditClick = () => {
    if (isSubmitting) return;
    // If NOT SET, treat original value as empty string
    originalValueRef.current = isNotSet ? '' : String(data);
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && editRef.current) {
      // If value is "NOT SET", clear it when entering edit mode
      if (isNotSet && editRef.current.textContent === 'NOT SET') {
        editRef.current.textContent = '';
      }
      
      editRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [isEditing, isNotSet]);

  // Sync contentEditable text with data prop when not editing
  useEffect(() => {
    if (!isEditing && editRef.current) {
      const currentText = editRef.current.textContent;
      const newText = String(data);
      if (currentText !== newText) {
        editRef.current.textContent = newText;
      }
    }
  }, [data, isEditing, configKey]);

  const handleSubmit = async () => {
    if (!editRef.current) return;
    
    const newValue = editRef.current.textContent;
    
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
        if (editRef.current) {
          editRef.current.textContent = originalValueRef.current;
        }
        // Show error message temporarily (5 seconds for longer messages)
        setErrorMessage(result.message || 'Update failed');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      if (editRef.current) {
        editRef.current.textContent = originalValueRef.current;
      }
      // Show error message temporarily (5 seconds for longer messages)
      setErrorMessage(error.message || 'Network error');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (!isSubmitting) {
      handleSubmit();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (editRef.current) {
        editRef.current.textContent = originalValueRef.current;
      }
      setIsEditing(false);
    }
  };

  // Handle boolean radio button change
  const handleRadioChange = async (newValue) => {
    if (!isEditing) return;
    
    setIsSubmitting(true);
    originalValueRef.current = String(data);
    
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
        // Show error message temporarily (5 seconds for longer messages)
        setErrorMessage(result.message || 'Update failed');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      // Show error message temporarily (5 seconds for longer messages)
      setErrorMessage(error.message || 'Network error');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  // Render boolean radio buttons
  if (valueType === 'boolean') {
    const boolValue = data === 'true' || data === true;
    
    return (
      <span className="editable-value-container">
        <span className="editable-value-boolean" style={isSubmitting ? { opacity: 0.7, pointerEvents: 'none' } : {}}>
          <label className={`radio-label ${!isEditing ? 'disabled' : ''}`}>
            <input 
              type="radio" 
              checked={boolValue === true}
              disabled={!isEditing || isSubmitting}
              onChange={() => handleRadioChange('true')}
            />
            <span>True</span>
          </label>
          <label className={`radio-label ${!isEditing ? 'disabled' : ''}`}>
            <input 
              type="radio" 
              checked={boolValue === false}
              disabled={!isEditing || isSubmitting}
              onChange={() => handleRadioChange('false')}
            />
            <span>False</span>
          </label>
        </span>
        
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
              title="Click to edit"
            >
              <EditIcon width={16} height={16} />
            </span>
          )}
        </span>
      </span>
    );
  }

  // Render text editing (default)
  return (
    <span className="editable-value-container">
      <span 
        ref={editRef}
        className={`editable-value-text ${isEditing ? 'editing' : ''} ${isNotSet && !isEditing ? 'not-set' : ''}`}
        contentEditable={isEditing && !isSubmitting}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning={true}
        style={isSubmitting ? { pointerEvents: 'none', opacity: 0.7 } : {}}
      >
        {data}
      </span>
      
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
            title="Click to edit"
          >
            <EditIcon width={16} height={16} />
          </span>
        )}
      </span>
    </span>
  );
};

export default EditableValueComp;

