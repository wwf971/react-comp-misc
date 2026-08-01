import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SpinningCircle, EditIcon } from '@wwf971/react-comp-misc';
import Menu from '../menu/Menu.jsx';
import './EditableValue.css';
import { getValueCompWidthStyle } from './valueCompEvent.js';
import { useValueCompWheelScroll } from './valueCompScroll.js';

const EditableValueComp = ({
  data,
  config = {},
  onEvent,
}) => {
  const getDisplayData = () => {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const hasTextField = Object.prototype.hasOwnProperty.call(data, 'text');
      const hasValueField = Object.prototype.hasOwnProperty.call(data, 'value');
      const textValue = hasTextField ? data.text : (hasValueField ? data.value : '');
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
  const externalMessageState = data && typeof data === 'object' && !Array.isArray(data)
    ? data.messageState
    : null;
  const messageConfig = config.messageConfig || {};
  const isMessageVisible = messageConfig.isVisible !== false;
  const messageTextByStatus = {
    loading: 'Saving...',
    success: 'Saved',
    error: 'Update failed',
    ...(messageConfig.textByStatus || {}),
  };
  const messageColorByStatus = {
    loading: '#666',
    success: '#2e7d32',
    error: '#d32f2f',
    ...(messageConfig.colorByStatus || {}),
  };
  const index = config.index ?? data?.index;
  const rowId = config.rowId ?? data?.rowId;
  const field = config.field ?? data?.field;
  const category = config.category ?? data?.category;
  const configKey = config.configKey ?? data?.configKey;
  const valueType = config.valueType ?? data?.valueType ?? 'text';
  const isNotSet = Boolean(config.isNotSet ?? data?.isNotSet ?? false);
  const isEditable = config.isEditable === undefined ? true : Boolean(config.isEditable);
  const isExternalSubmitting = Boolean(config.isExternalSubmitting);
  const isEditingControlled = config.isEditing;
  const isFocusOnEdit = config.isFocusOnEdit === undefined ? true : Boolean(config.isFocusOnEdit);
  const isEditIconVisible = config.isEditIconVisible === undefined ? true : Boolean(config.isEditIconVisible);
  const className = config.className || '';
  const textClassName = config.textClassName || '';
  const placeholder = config.placeholder || '';
  const width = config.width;
  const isWidthConfigured = width !== undefined && width !== null && width !== '';
  const editElementRef = config.editElementRef;
  const commitRootRef = config.commitRootRef;
  const renderText = config.renderText;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [menuPosOpen, setMenuPosOpen] = useState(null);
  const containerRef = useRef(null);
  const textViewportRef = useRef(null);
  const contentRowRef = useRef(null);
  const booleanRef = useRef(null);
  const iconMeasureRef = useRef(null);
  const trailingIconRef = useRef(null);
  const editRefLocal = useRef(null);
  const editRef = editElementRef ?? editRefLocal;
  const originalValueRef = useRef('');
  const [isIconPinned, setIsIconPinned] = useState(false);
  const isSubmittingRef = useRef(false);
  const ignoreBlurRef = useRef(false);
  const wasEditingRef = useRef(false);
  const isEditing = isEditingControlled ?? isEditingLocal;

  const setEditing = (nextIsEditing, meta = {}) => {
    if (isEditingControlled === undefined) {
      setIsEditingLocal(nextIsEditing);
    }
    onEvent?.('editStateChange', {
      ...getEventBaseData(),
      isEditing: nextIsEditing,
      ...meta,
    });
  };

  const getEventBaseData = () => ({
    configKey,
    index,
    rowId,
    field,
    category,
    valueType,
  });

  const getCommitRoot = () => commitRootRef?.current ?? containerRef.current;

  const measureIconPlacement = useCallback(() => {
    if (isEditing) return;

    const container = containerRef.current;
    const iconEl = iconMeasureRef.current || trailingIconRef.current;
    const contentEl = editRef.current || booleanRef.current;
    if (!container || !iconEl || !contentEl) {
      setIsIconPinned(false);
      return;
    }
    const gap = 4;
    const neededWidth = contentEl.scrollWidth + gap + iconEl.offsetWidth;
    setIsIconPinned(neededWidth > container.clientWidth + 0.5);
  }, [isEditing]);

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
  }, [measureIconPlacement, displayData.text, isEditing, isSubmitting, isExternalSubmitting, errorMessage, externalMessageState?.status, externalMessageState?.messageText]);

  useValueCompWheelScroll(containerRef, textViewportRef);

  useLayoutEffect(() => {
    if (textViewportRef.current) {
      textViewportRef.current.scrollLeft = 0;
    }
  }, [isEditing, displayData.text, configKey]);

  const handleEditClick = () => {
    if (isSubmitting || isExternalSubmitting || !isEditable) return;
    // If NOT SET, treat original value as empty string
    originalValueRef.current = isNotSet ? '' : displayData.text;
    setEditing(true, { reason: 'edit-start' });
  };

  const handleContextMenu = (e) => {
    if (!onEvent || !isEditable || isExternalSubmitting) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Always update position - React will handle the update properly
    // Force a re-render by closing first, then opening at new position in next tick
    setMenuPosOpen(null);
    requestAnimationFrame(() => {
      setMenuPosOpen({ x: e.pageX, y: e.pageY });
    });
  };

  const handleCloseMenu = () => {
    setMenuPosOpen(null);
  };

  const handleMenuItemClick = async (item) => {
    if (!onEvent) return;

    setMenuPosOpen(null);
    setIsSubmitting(true);

    try {
      const result = await onEvent('actionRequest', {
        ...getEventBaseData(),
        action: item.data.action,
      });

      if ((result || { code: 0 }).code !== 0) {
        console.error('Action failed:', result?.message);
        setErrorMessage(result?.message || 'Action failed');
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
    if (!onEvent) return [];

    const items = [];
    
    items.push({
      id: 'add-entry-above',
      label: 'Add Entry Above',
      data: { action: 'addEntryAbove' }
    });
    
    items.push({
      id: 'add-entry-below',
      label: 'Add Entry Below',
      data: { action: 'addEntryBelow' }
    });
    
    items.push({
      id: 'delete-entry',
      label: 'Delete Entry',
      data: { action: 'deleteEntry' }
    });

    return items;
  };

  useLayoutEffect(() => {
    if (isEditing && !wasEditingRef.current && editRef.current) {
      originalValueRef.current = isNotSet ? '' : displayData.text;
      editRef.current.textContent = originalValueRef.current;
      // If value is "NOT SET", clear it when entering edit mode
      if (isNotSet && editRef.current.textContent === 'NOT SET') {
        editRef.current.textContent = '';
      }

      if (isFocusOnEdit) {
        editRef.current.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    wasEditingRef.current = isEditing;
  }, [displayData.text, isEditing, isFocusOnEdit, isNotSet]);

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
    if (!editRef.current || isSubmittingRef.current) return;
    
    const newValue = editRef.current.textContent;
    
    if (newValue === originalValueRef.current) {
      setEditing(false, { reason: 'unchanged' });
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    try {
      if (!configKey) {
        console.error('config.configKey or data.configKey is required');
        setIsSubmitting(false);
        setEditing(false, { reason: 'missing-config-key' });
        return;
      }

      if (!onEvent) {
        console.error('onEvent callback is required');
        setIsSubmitting(false);
        setEditing(false, { reason: 'missing-on-event' });
        return;
      }

      const result = await onEvent('valueCommit', {
        ...getEventBaseData(),
        valuePrevious: originalValueRef.current,
        valueNext: newValue,
        source: 'text',
      }) || { code: 0, message: 'ok' };
      
      if ((result || { code: 0 }).code !== 0) {
        console.error('Failed to update config:', result?.message);
        if (editRef.current) {
          editRef.current.textContent = originalValueRef.current;
        }
        // Show error message temporarily (5 seconds for longer messages)
        setErrorMessage(result?.message || 'Update failed');
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
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setEditing(false, { reason: 'submit' });
    }
  };

  const handleBlur = () => {
    if (!isEditing || isSubmitting) return;
    setTimeout(() => {
      if (ignoreBlurRef.current) {
        ignoreBlurRef.current = false;
        return;
      }
      const root = getCommitRoot();
      if (root?.contains(document.activeElement)) return;
      handleSubmit();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return;
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (editRef.current) {
        editRef.current.textContent = originalValueRef.current;
      }
      onEvent?.('cancel', {
        ...getEventBaseData(),
        valuePrevious: originalValueRef.current,
      });
      setEditing(false, { reason: 'cancel' });
    }
  };

  useEffect(() => {
    if (!isEditing) return undefined;
    const onPointerDown = (event) => {
      const root = getCommitRoot();
      if (!root) return;
      if (root.contains(event.target)) {
        ignoreBlurRef.current = true;
        return;
      }
      handleSubmit();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [isEditing]);

  // Handle boolean radio button change
  const handleRadioChange = async (newValue) => {
    if (!isEditing) return;
    
    setIsSubmitting(true);
    originalValueRef.current = displayData.text;
    
    try {
      if (!configKey) {
        console.error('config.configKey or data.configKey is required');
        setIsSubmitting(false);
        setEditing(false, { reason: 'missing-config-key' });
        return;
      }

      if (!onEvent) {
        console.error('onEvent callback is required');
        setIsSubmitting(false);
        setEditing(false, { reason: 'missing-on-event' });
        return;
      }

      const result = await onEvent('valueCommit', {
        ...getEventBaseData(),
        valuePrevious: originalValueRef.current,
        valueNext: newValue,
        source: 'boolean',
      }) || { code: 0, message: 'ok' };
      
      if ((result || { code: 0 }).code !== 0) {
        console.error('Failed to update config:', result?.message);
        // Show error message temporarily (5 seconds for longer messages)
        setErrorMessage(result?.message || 'Update failed');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      // Show error message temporarily (5 seconds for longer messages)
      setErrorMessage(error.message || 'Network error');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
      setEditing(false, { reason: 'submit' });
    }
  };

  const dataMessageState = isMessageVisible && externalMessageState?.status && externalMessageState.status !== 'idle'
    ? externalMessageState
    : null;
  const effectiveMessageState = errorMessage
    ? { status: 'error', messageText: errorMessage }
    : dataMessageState;
  const effectiveStatus = effectiveMessageState?.status;
  const effectiveMessageText = effectiveMessageState?.messageText || messageTextByStatus[effectiveStatus];
  const isLoadingStatus = isSubmitting || isExternalSubmitting || effectiveStatus === 'loading';
  const isIconStatusMode = isLoadingStatus || Boolean(effectiveMessageState) || !isEditable;
  const isEditIconPinned = isWidthConfigured || isIconPinned;
  const hasTrailingIcon = isEditIconPinned || isIconStatusMode;
  const containerClassName = [
    'editable-value-container',
    isLoadingStatus ? 'is-submitting' : '',
    hasTrailingIcon ? 'has-trailing-icon' : '',
    isIconStatusMode ? 'has-inline-status' : '',
    isEditIconPinned ? 'is-icon-pinned' : '',
    isWidthConfigured ? 'has-configured-width' : '',
    className,
  ].filter(Boolean).join(' ');
  const containerStyle = getValueCompWidthStyle(width);

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
      className={[
        'editable-value-icon',
        'editable-value-icon-at-content',
        isEditIconPinned ? 'is-measure-only' : '',
        isEditing ? 'is-inactive' : '',
      ].filter(Boolean).join(' ')}
    >
      {renderEditIconButton(!isEditing && !isEditIconPinned)}
    </span>
  );

  const renderInlineStatusIcon = () => {
    if (isLoadingStatus) {
      return (
        <span className="editable-value-icon editable-value-icon-status">
          <span className="editable-value-loading">
            <SpinningCircle width={13} height={13} color="#666" />
            <span className="editable-value-status-text" style={{ color: messageColorByStatus.loading }}>
              {effectiveMessageText || messageTextByStatus.loading}
            </span>
          </span>
        </span>
      );
    }
    if (effectiveMessageState) {
      const statusColor = messageColorByStatus[effectiveStatus] || messageColorByStatus.error;
      return (
        <span className="editable-value-icon editable-value-icon-status">
          {isEditable ? renderEditIconButton(true) : null}
          <span className="edit-icon-error" style={{ color: statusColor }} title={effectiveMessageText}>
            <span className="editable-value-status-text">{effectiveMessageText}</span>
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
    return null;
  };

  const renderPinnedEditIcon = () => (
      <span
        ref={trailingIconRef}
        className="editable-value-icon editable-value-trailing-icon editable-value-icon-at-cell-end"
      >
        {renderEditIconButton(isEditIconPinned && !isEditing)}
      </span>
  );

  // Render boolean radio buttons
  if (valueType === 'boolean') {
    const boolValue = displayData.text === 'true';
    
    return (
      <>
        <span
          ref={containerRef}
          className={containerClassName}
          style={containerStyle}
          onContextMenu={handleContextMenu}
        >
          <span ref={contentRowRef} className="editable-value-content-row">
            <span ref={booleanRef} className={`editable-value-boolean ${isLoadingStatus ? 'is-submitting' : ''}`}>
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
            {isEditIconVisible && isIconStatusMode ? renderInlineStatusIcon() : null}
            {isEditIconVisible && !isIconStatusMode && !isEditIconPinned ? renderContentEditIcon() : null}
          </span>
          {isEditIconVisible && !isIconStatusMode && isEditIconPinned ? renderPinnedEditIcon() : null}
        </span>
        
        {menuPosOpen && (
          <Menu
            data={{
              items: getMenuItems(),
            }}
            config={{
              isOpen: true,
              posOpen: menuPosOpen,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'closeRequest') {
                handleCloseMenu();
                return;
              }
              if (eventType === 'itemClick') {
                handleMenuItemClick(eventData.item);
                return;
              }
              if (eventType === 'backdropContextMenu') {
                handleContextMenu(eventData.event);
              }
            }}
          />
        )}
      </>
    );
  }

  // Render text editing (default)
  return (
    <>
      <span
        ref={containerRef}
        className={containerClassName}
        style={containerStyle}
        onContextMenu={handleContextMenu}
      >
        <span ref={contentRowRef} className="editable-value-content-row">
          <span ref={textViewportRef} className="value-text-viewport">
            <span 
              ref={editRef}
              className={`editable-value-text ${textClassName} ${isEditing ? 'editing' : ''} ${isNotSet && !isEditing ? 'not-set' : ''} ${isLoadingStatus ? 'is-submitting' : ''}`}
              contentEditable={isEditing && !isSubmitting && !isExternalSubmitting && isEditable}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              suppressContentEditableWarning={true}
              data-placeholder={placeholder}
              title={displayData.text}
              style={{
                ...(displayData.style ?? {}),
              }}
            >
              {isEditing ? null : (renderText ? renderText(displayData.text) : displayData.text)}
            </span>
          </span>
          {isEditIconVisible && isIconStatusMode ? renderInlineStatusIcon() : null}
          {isEditIconVisible && !isIconStatusMode && !isEditIconPinned ? renderContentEditIcon() : null}
        </span>
        {isEditIconVisible && !isIconStatusMode && isEditIconPinned ? renderPinnedEditIcon() : null}
      </span>
      
      {menuPosOpen && (
        <Menu
          data={{
            items: getMenuItems(),
          }}
          config={{
            isOpen: true,
            posOpen: menuPosOpen,
          }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'closeRequest') {
              handleCloseMenu();
              return;
            }
            if (eventType === 'itemClick') {
              handleMenuItemClick(eventData.item);
              return;
            }
            if (eventType === 'backdropContextMenu') {
              handleContextMenu(eventData.event);
            }
          }}
        />
      )}
    </>
  );
};

export default EditableValueComp;

