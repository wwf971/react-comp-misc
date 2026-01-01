import React, { useState, useRef, useEffect } from 'react';
import SpinningCircle from '../../icon/SpinningCircle';
import './JsonComp.css';

/**
 * PseudoKeyValueComp - Temporary component for creating a new key-value pair
 * Shows editable key and value fields before confirmation
 */
const PseudoKeyValueComp = ({ path, onChange, onCancel, depth }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const keyRef = useRef(null);
  const valueRef = useRef(null);

  useEffect(() => {
    // Focus on key input when component mounts
    if (keyRef.current) {
      keyRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    if (!key.trim()) {
      // Key is required - don't submit
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const changeData = {
        old: { type: 'pseudo' },
        new: { type: 'string', value: value },
        _action: 'createEntry',
        _key: key.trim()
      };
      
      const result = await onChange(path, changeData);
      
      if (result && result.code === 0) {
        // Success - parent will remove __pseudo__ marker and re-render with normal component
      } else {
        // Failed - show error briefly then remove via onCancel
        const errMsg = result?.message || 'Failed to create entry';
        setErrorMessage(errMsg);
        setIsSubmitting(false);
        
        // Auto-remove after showing error for 2 seconds
        setTimeout(() => {
          onCancel();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create entry:', error);
      setErrorMessage(error.message || 'Network error');
      setIsSubmitting(false);
      
      // Auto-remove after showing error for 2 seconds
      setTimeout(() => {
        onCancel();
      }, 2000);
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'key' && valueRef.current) {
        valueRef.current.focus();
      } else if (field === 'value') {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = (e, field) => {
    // Check if the blur is moving to the other input field
    const relatedTarget = e.relatedTarget;
    if (relatedTarget && (relatedTarget === keyRef.current || relatedTarget === valueRef.current)) {
      // Moving between key and value inputs - don't submit or cancel
      return;
    }
    
    // Clicking outside - submit if we have a key, otherwise cancel
    if (key.trim()) {
      handleSubmit();
    } else {
      onCancel();
    }
  };

  return (
    <div className="json-keyvalue json-pseudo">
      <div className="json-key-and-colon">
        <span className="json-key-wrapper">
          <input
            ref={keyRef}
            type="text"
            className="json-key editing"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 'key')}
            onBlur={(e) => handleBlur(e, 'key')}
            placeholder="key"
            disabled={isSubmitting}
            style={{ width: '80px', border: 'none', outline: 'none', background: 'transparent' }}
          />
        </span>
        <span className="json-colon">:</span>
      </div>
      
      <span className="json-value-wrapper">
        <input
          ref={valueRef}
          type="text"
          className="json-value json-string editing"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 'value')}
          onBlur={(e) => handleBlur(e, 'value')}
          placeholder="value"
          disabled={isSubmitting || errorMessage}
          style={{ width: '100px', border: 'none', outline: 'none', background: 'transparent' }}
        />
        {isSubmitting && !errorMessage && (
          <span className="json-spinner">
            <SpinningCircle width={14} height={14} color="#666" />
          </span>
        )}
        {errorMessage && (
          <span style={{ marginLeft: '8px', fontSize: '12px', color: '#d32f2f' }}>
            ✗ {errorMessage}
          </span>
        )}
      </span>
    </div>
  );
};

export default PseudoKeyValueComp;

