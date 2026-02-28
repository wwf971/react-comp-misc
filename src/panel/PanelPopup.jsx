import React from 'react';
import './panelPopup.css';

/**
 * PanelPopup - A custom dialog for confirmations and alerts
 * 
 * Props:
 * - type: 'confirm' | 'alert' - Dialog type (default: 'confirm')
 * - message: string - The message to display
 * - title: string - Dialog title (default: 'Confirm' for confirm, 'Alert' for alert)
 * - confirmText: string - Text for confirm button (default: 'OK')
 * - cancelText: string - Text for cancel button (default: 'Cancel', only shown for confirm type)
 * - onConfirm: () => void - Called when user confirms
 * - onCancel: () => void - Called when user cancels (only for confirm type)
 * - confirmButtonStyle: object - Custom style for confirm button
 * - danger: boolean - If true, uses red/danger styling for confirm button
 */
const PanelPopup = ({
  type = 'confirm',
  message,
  title,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonStyle,
  danger = false
}) => {
  const defaultTitle = type === 'alert' ? 'Alert' : 'Confirm';
  const finalTitle = title || defaultTitle;
  
  const handleOverlayClick = () => {
    if (type === 'confirm' && onCancel) {
      onCancel();
    } else if (type === 'alert' && onConfirm) {
      onConfirm();
    }
  };

  return (
    <div className="panel-popup-overlay" onClick={handleOverlayClick}>
      <div className="panel-popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="panel-popup-header">
          <div className="panel-popup-title">{finalTitle}</div>
        </div>
        
        <div className="panel-popup-body">
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {message}
          </div>
        </div>
        
        <div className="panel-popup-footer">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="panel-popup-button panel-popup-button-secondary"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`panel-popup-button ${danger ? 'panel-popup-button-danger' : 'panel-popup-button-primary'}`}
            style={confirmButtonStyle}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelPopup;
