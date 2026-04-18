import React, { useState, useEffect } from 'react';
import './panelPopup.css';

/**
 * PanelPopup - A custom dialog for confirmations, alerts, and input prompts
 * 
 * Props:
 * - type: 'confirm' | 'alert' | 'input' - Dialog type (default: 'confirm')
 * - message: string - The main message to display
 * - statusMessage: string - Success/error message shown above main message (optional)
 * - statusType: 'success' | 'error' | 'info' - Type of status message (optional)
 * - title: string - Dialog title (default: 'Confirm' for confirm, 'Alert' for alert, 'Input' for input)
 * - confirmText: string - Text for confirm button (default: 'OK')
 * - cancelText: string - Text for cancel button (default: 'Cancel', only shown for confirm/input type)
 * - onConfirm: (inputValue?) => void - Called when user confirms (receives input value for 'input' type)
 * - onCancel: () => void - Called when user cancels (only for confirm/input type)
 * - confirmButtonStyle: object - Custom style for confirm button
 * - isDanger: boolean - If true, uses red/danger styling for confirm button
 * - isConfirmDisabled: boolean - If true, disables the confirm button
 * - isLoading: boolean - If true, shows loading state and disables all buttons
 * - inputProps: object - Props for input field (for 'input' type):
 *   - placeholder: string
 *   - defaultValue: string
 *   - required: boolean
 */
const PanelPopup = ({
  type = 'confirm',
  message,
  statusMessage,
  statusType,
  title,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonStyle,
  isDanger = false,
  isConfirmDisabled = false,
  isLoading = false,
  inputProps = {}
}) => {
  const [inputValue, setInputValue] = useState(inputProps.defaultValue || '');
  const defaultTitle = type === 'alert' ? 'Alert' : type === 'input' ? 'Input' : 'Confirm';
  const finalTitle = title || defaultTitle;
  
  // Lock buttons when status message is shown or during loading
  const isLocked = isLoading || !!statusMessage;
  const isConfirmDisabledFinal = isConfirmDisabled || isLocked || (type === 'input' && inputProps.required && !inputValue.trim());
  
  useEffect(() => {
    setInputValue(inputProps.defaultValue || '');
  }, [inputProps.defaultValue]);
  
  const handleOverlayClick = () => {
    if (isLocked) return; // Prevent closing while loading or showing status
    
    if ((type === 'confirm' || type === 'input') && onCancel) {
      onCancel();
    } else if (type === 'alert' && onConfirm) {
      onConfirm();
    }
  };
  
  const handleConfirmClick = () => {
    if (type === 'input') {
      onConfirm && onConfirm(inputValue);
    } else {
      onConfirm && onConfirm();
    }
  };

  return (
    <div className="panel-popup-overlay" onClick={handleOverlayClick}>
      <div className="panel-popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="panel-popup-header">
          <div className="panel-popup-title">{finalTitle}</div>
        </div>
        
        <div className="panel-popup-body">
          {statusMessage && (
            <div 
              style={{ 
                padding: '8px 12px',
                marginBottom: '12px',
                borderRadius: '4px',
                fontSize: '13px',
                backgroundColor: statusType === 'error' ? '#f8d7da' : statusType === 'success' ? '#d4edda' : '#d1ecf1',
                border: `1px solid ${statusType === 'error' ? '#f5c6cb' : statusType === 'success' ? '#c3e6cb' : '#bee5eb'}`,
                color: statusType === 'error' ? '#721c24' : statusType === 'success' ? '#155724' : '#0c5460'
              }}
            >
              {statusMessage}
            </div>
          )}
          
          {message && (
            <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: type === 'input' ? '12px' : '0' }}>
              {message}
            </div>
          )}
          
          {type === 'input' && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputProps.placeholder || ''}
              disabled={isLocked}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isConfirmDisabledFinal) {
                  handleConfirmClick();
                }
              }}
              autoFocus
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '13px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                opacity: isLocked ? 0.6 : 1
              }}
            />
          )}
        </div>
        
        <div className="panel-popup-footer">
          {(type === 'confirm' || type === 'input') && (
            <button
              onClick={onCancel}
              disabled={isLocked}
              className="panel-popup-button panel-popup-button-secondary"
              style={{ opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirmClick}
            disabled={isConfirmDisabledFinal}
            className={`panel-popup-button ${isDanger ? 'panel-popup-button-danger' : 'panel-popup-button-primary'}`}
            style={{
              ...confirmButtonStyle,
              opacity: isConfirmDisabledFinal ? 0.6 : 1,
              cursor: isConfirmDisabledFinal ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelPopup;
