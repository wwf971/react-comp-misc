import React, { useState, useCallback } from 'react';
import { formatJson } from '../../utils/parseString';
import './JsonRaw.css';

/**
 * JsonRaw - Component for displaying raw JSON in a popup
 * 
 * @param {Object|Array} data - The data to display as JSON
 * @param {Function} onClose - Callback: () => void
 * @param {string} title - Dialog title (default: "Raw JSON")
 */
const JsonRaw = ({ data, onClose, title = "Raw JSON" }) => {
  const [copied, setCopied] = useState(false);

  const jsonString = formatJson(data, 2);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }, [jsonString]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  return (
    <div className="raw-json-overlay" onClick={handleClose}>
      <div 
        className="raw-json-panel" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="raw-json-header">
          <h3 className="raw-json-title">{title}</h3>
          <div className="raw-json-header-buttons">
            <button
              className="raw-json-copy-button"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              className="raw-json-close-button"
              onClick={handleClose}
              title="Close (ESC)"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="raw-json-content">
          <pre className="raw-json-pre">
            <code className="raw-json-code">{jsonString}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default JsonRaw;

