import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpinningCircle, EditIcon } from '@wwf971/react-comp-misc';
import Menu from '../../component/menu/Menu.jsx';
import './EditableValue.css';

/**
 * Editable value component for config editing with inline edit support
 * Supports both text editing and boolean radio buttons
 * 
 * @param {Function} onUpdate - Callback function (configKey, newValue) => Promise<{code: number}>
 * @param {Function} onAction - Callback function for menu actions (action, data) => Promise<{code: number}>
 *                               action can be: 'addEntryAbove', 'addEntryBelow', 'deleteEntry'
 *                               data contains: { index, field, configKey }
 */
const EditableValueComp = ({ 
  data, 
  index, 
  rowId,
  isEditable = true,
  isExternalSubmitting = false,
  field, 
  category, 
  valueType = 'text', 
  isNotSet = false, 
  configKey,
  onUpdate, // Callback for handling updates
  onAction // Callback for handling menu actions
}) => {
  const getDisplayData = () => {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const hasTextField = Object.prototype.hasOwnProperty.call(data, 'text');
      const hasValueField = Object.prototype.hasOwnProperty.call(data, 'value');
      const textValue = hasTextField ? data.text : (hasValueField ? data.value : data);
      const styleValue = data.style && typeof data.style === 'object' ? data.style : {};
      return {
        text: String(textValue ?? ''),
        style: styleValue,
      };
    }
    return {
      text: String(data ?? ''),
      style: {},
    };
  };
  const displayData = getDisplayData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const containerRef = useRef(null);
  const contentRowRef = useRef(null);
  const booleanRef = useRef(null);
  const iconMeasureRef = useRef(null);
  const editRef = useRef(null);
  const originalValueRef = useRef('');
  const [isIconPinned, setIsIconPinned] = useState(false);

  const measureIconPlacement = useCallback(() => {
    const container = containerRef.current;
    const iconEl = iconMeasureRef.current;
    const contentEl = editRef.current || booleanRef.current;
    if (!container || !iconEl || !contentEl) {
      setIsIconPinned(false);
      return;
    }
    const gap = 4;
    const neededWidth = contentEl.scrollWidth + gap + iconEl.offsetWidth;
    setIsIconPinned(neededWidth > container.clientWidth + 0.5);
  }, []);

  useEffect(() => {
    measureIconPlacement();
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      measureIconPlacement();
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [measureIconPlacement, displayData.text, isEditing, isSubmitting, isExternalSubmitting, errorMessage]);

  const handleEditClick = () => {
    if (isSubmitting || isExternalSubmitting || !isEditable) return;
    // If NOT SET, treat original value as empty string
    originalValueRef.current = isNotSet ? '' : displayData.text;
    setIsEditing(true);
  };

  const handleContextMenu = (e) => {
    // Only show menu if onAction callback is provided
    if (!onAction || !isEditable || isExternalSubmitting) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Always update position - React will handle the update properly
    // Force a re-render by closing first, then opening at new position in next tick
    setMenuPosition(null);
    requestAnimationFrame(() => {
      setMenuPosition({ x: e.pageX, y: e.pageY });
    });
  };

  const handleCloseMenu = () => {
    setMenuPosition(null);
  };

  const handleMenuItemClick = async (item) => {
    if (!onAction) return;

    setMenuPosition(null);
    setIsSubmitting(true);

    try {
      const result = await onAction(item.data.action, {
        index,
        rowId,
        field,
        configKey
      });

      if (result.code !== 0) {
        console.error('Action failed:', result.message);
        setErrorMessage(result.message || 'Action failed');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      console.error('Action failed:', error);
      setErrorMessage(error.message || 'Action failed');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build menu items based on available callbacks
  const getMenuItems = () => {
    if (!onAction) return [];

    const items = [];
    
    items.push({
      type: 'item',
      name: 'Add Entry Above',
      data: { action: 'addEntryAbove' }
    });
    
    items.push({
      type: 'item',
      name: 'Add Entry Below',
      data: { action: 'addEntryBelow' }
    });
    
    items.push({
      type: 'item',
      name: 'Delete Entry',
      data: { action: 'deleteEntry' }
    });

    return items;
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
      const newText = displayData.text;
      if (currentText !== newText) {
        editRef.current.textContent = newText;
      }
    }
  }, [displayData.text, isEditing, configKey]);

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
    originalValueRef.current = displayData.text;
    
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

  const isIconStatusMode = isSubmitting || isExternalSubmitting || Boolean(errorMessage) || !isEditable;
  const hasTrailingIcon = isIconPinned || isIconStatusMode;
  const containerClassName = [
    'editable-value-container',
    isSubmitting || isExternalSubmitting ? 'is-submitting' : '',
    hasTrailingIcon ? 'has-trailing-icon' : '',
    isIconPinned ? 'is-icon-pinned' : '',
  ].filter(Boolean).join(' ');

  const renderEditIconButton = (isClickable) => (
    <span
      onClick={isClickable ? handleEditClick : undefined}
      className={`edit-icon-button${isClickable ? '' : ' disabled'}`}
      title="Click to edit"
    >
      <EditIcon width={13} height={13} />
    </span>
  );

  const renderContentEditIcon = () => (
    <span
      ref={iconMeasureRef}
      className={`editable-value-icon editable-value-icon-at-content${isIconPinned ? ' is-inactive' : ''}`}
    >
      {renderEditIconButton(!isIconPinned)}
    </span>
  );

  const renderPinnedOrStatusIcon = () => {
    if (isSubmitting || isExternalSubmitting) {
      return (
        <span className="editable-value-icon editable-value-icon-status">
          <span className="editable-value-loading">
            <SpinningCircle width={16} height={16} color="#666" />
            <span style={{ fontSize: '13px', color: '#666' }}>Saving...</span>
          </span>
        </span>
      );
    }
    if (errorMessage) {
      return (
        <span className="editable-value-icon editable-value-icon-status">
          <span
            className="edit-icon-error"
            style={{ color: '#d32f2f', fontSize: '13px', cursor: 'help' }}
            title={errorMessage}
          >
            {errorMessage}
          </span>
        </span>
      );
    }
    if (!isEditable) {
      return (
        <span className="editable-value-icon editable-value-icon-status">
          <span className="edit-icon-button disabled" title="Editing is locked">
            <EditIcon width={13} height={13} />
          </span>
        </span>
      );
    }
    return (
      <span className={`editable-value-icon editable-value-icon-at-cell-end${isIconPinned ? '' : ' is-inactive'}`}>
        {renderEditIconButton(isIconPinned)}
      </span>
    );
  };

  // Render boolean radio buttons
  if (valueType === 'boolean') {
    const boolValue = displayData.text === 'true';
    
    return (
      <>
        <span ref={containerRef} className={containerClassName} onContextMenu={handleContextMenu}>
          <span ref={contentRowRef} className="editable-value-content-row">
            <span ref={booleanRef} className={`editable-value-boolean ${isSubmitting || isExternalSubmitting ? 'is-submitting' : ''}`}>
              <label className={`radio-label ${!isEditing || !isEditable || isExternalSubmitting ? 'disabled' : ''}`}>
                <input 
                  type="radio" 
                  checked={boolValue === true}
                  disabled={!isEditing || isSubmitting || isExternalSubmitting || !isEditable}
                  onChange={() => handleRadioChange('true')}
                />
                <span>True</span>
              </label>
              <label className={`radio-label ${!isEditing || !isEditable || isExternalSubmitting ? 'disabled' : ''}`}>
                <input 
                  type="radio" 
                  checked={boolValue === false}
                  disabled={!isEditing || isSubmitting || isExternalSubmitting || !isEditable}
                  onChange={() => handleRadioChange('false')}
                />
                <span>False</span>
              </label>
            </span>
            {!isIconStatusMode ? renderContentEditIcon() : null}
          </span>
          {renderPinnedOrStatusIcon()}
        </span>
        
        {menuPosition && (
          <Menu
            items={getMenuItems()}
            position={menuPosition}
            onClose={handleCloseMenu}
            onItemClick={handleMenuItemClick}
            onContextMenu={handleContextMenu}
          />
        )}
      </>
    );
  }

  // Render text editing (default)
  return (
    <>
      <span ref={containerRef} className={containerClassName} onContextMenu={handleContextMenu}>
        <span ref={contentRowRef} className="editable-value-content-row">
          <span 
            ref={editRef}
            className={`editable-value-text ${isEditing ? 'editing' : ''} ${isNotSet && !isEditing ? 'not-set' : ''} ${isSubmitting || isExternalSubmitting ? 'is-submitting' : ''}`}
            contentEditable={isEditing && !isSubmitting && !isExternalSubmitting && isEditable}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            suppressContentEditableWarning={true}
            style={{
              ...(displayData.style ?? {}),
            }}
          >
            {displayData.text}
          </span>
          {!isIconStatusMode ? renderContentEditIcon() : null}
        </span>
        {renderPinnedOrStatusIcon()}
      </span>
      
      {menuPosition && (
        <Menu
          items={getMenuItems()}
          position={menuPosition}
          onClose={handleCloseMenu}
          onItemClick={handleMenuItemClick}
          onContextMenu={handleContextMenu}
        />
      )}
    </>
  );
};

export default EditableValueComp;

