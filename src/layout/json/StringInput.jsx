import React, { useState, useCallback } from 'react';
import { parseJsonString, parseYamlToJson } from '../../utils/parseString';
import './StringInput.css';

/**
 * StringInput - Component for inputting and parsing JSON/YAML strings
 * 
 * @param {Function} onConfirm - Callback: (parsedValue) => void
 * @param {Function} onCancel - Callback: () => void
 * @param {string} title - Dialog title (default: "Insert JSON/YAML")
 */
const StringInput = ({ onConfirm, onCancel, title = "Insert JSON/YAML" }) => {
  const [inputValue, setInputValue] = useState('');
  const [parseType, setParseType] = useState('json'); // 'json' or 'yaml'
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirm = useCallback(() => {
    if (!inputValue.trim()) {
      setErrorMessage('Input cannot be empty');
      return;
    }

    // Parse based on selected type
    let result;
    if (parseType === 'json') {
      result = parseJsonString(inputValue);
    } else if (parseType === 'yaml') {
      result = parseYamlToJson(inputValue);
    }

    if (result.code === 0) {
      // Success - call onConfirm with parsed data
      onConfirm(result.data);
      setErrorMessage('');
    } else {
      // Error - show error message
      setErrorMessage(result.message);
    }
  }, [inputValue, parseType, onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    // Note: We don't handle Enter for confirm because multi-line input needs Enter
  }, [handleCancel]);

  return (
    <div className="string-input-overlay" onClick={handleCancel}>
      <div className="string-input-panel" onClick={(e) => e.stopPropagation()}>
        <div className="string-input-header">
          <h3 className="string-input-title">{title}</h3>
          <button
            className="string-input-close-button"
            onClick={handleCancel}
            title="Close (ESC)"
          >
            ✕
          </button>
        </div>

        <div className="string-input-content">
          <textarea
            className="string-input-textarea"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={parseType === 'json' 
              ? 'Enter JSON: {"key": "value"} or ["item1", "item2"]' 
              : 'Enter YAML:\nkey: value\nlist:\n  - item1\n  - item2'}
            autoFocus
          />

          <div className="string-input-type-selector">
            <span className="string-input-type-label">Format:</span>
            <label className="string-input-radio-label">
              <input
                type="radio"
                name="parseType"
                value="json"
                checked={parseType === 'json'}
                onChange={(e) => setParseType(e.target.value)}
              />
              <span className="string-input-radio-text">JSON</span>
            </label>
            <label className="string-input-radio-label">
              <input
                type="radio"
                name="parseType"
                value="yaml"
                checked={parseType === 'yaml'}
                onChange={(e) => setParseType(e.target.value)}
              />
              <span className="string-input-radio-text">YAML</span>
            </label>
          </div>

          <div className="string-input-buttons">
            <button
              className="string-input-button string-input-button-confirm"
              onClick={handleConfirm}
            >
              Confirm
            </button>
            <button
              className="string-input-button string-input-button-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>

          {errorMessage && (
            <div className="string-input-error">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StringInput;

