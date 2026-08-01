import React, { useState, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import { SpinningCircle, EditIcon } from '@wwf971/react-comp-misc';
import './EditableValue.css';
import './SearchableValue.css';
import './SelectableValue.css';
import { getValueCompWidthStyle } from './valueCompEvent.js';
import { useValueCompWheelScroll } from './valueCompScroll.js';

const renderMatchedText = (rawText, matchText) => {
  const text = String(rawText ?? '');
  const normalizedMatchText = String(matchText ?? '').trim().toLowerCase();
  if (!normalizedMatchText) {
    return text;
  }
  const startIndex = text.toLowerCase().indexOf(normalizedMatchText);
  if (startIndex < 0) {
    return text;
  }
  const endIndex = startIndex + normalizedMatchText.length;
  return (
    <>
      {text.slice(0, startIndex)}
      <span className="value-match-highlight">{text.slice(startIndex, endIndex)}</span>
      {text.slice(endIndex)}
    </>
  );
};

const SelectableValueComp = ({
  data,
  config = {},
  onEvent,
}) => {
  const valueAccepted = data && typeof data === 'object' && !Array.isArray(data)
    ? data.value ?? ''
    : data;
  const valuePending = data && typeof data === 'object' && !Array.isArray(data)
    ? data.valuePending
    : undefined;
  const isExternalSubmitting = Boolean(config.isExternalSubmitting);
  const [valuePendingLocal, setValuePendingLocal] = useState(undefined);
  const value = valuePendingLocal !== undefined
    ? valuePendingLocal
    : (isExternalSubmitting && valuePending !== undefined ? valuePending : valueAccepted);
  const options = Array.isArray(data?.options) ? data.options : [];
  const index = config.index ?? data?.index;
  const rowId = config.rowId ?? data?.rowId;
  const field = config.field ?? data?.field;
  const category = config.category ?? data?.category;
  const configKey = config.configKey ?? data?.configKey;
  const isNotSet = Boolean(config.isNotSet ?? data?.isNotSet ?? false);
  const getComp = config.getComp;
  const optionCompNameField = config.optionCompNameField || 'compName';
  const errorDisplayMs = config.errorDisplayMs ?? 5000;
  const width = config.width;
  const isWidthConfigured = width !== undefined && width !== null && width !== '';
  const containerClassName = [
    'searchable-value-wrapper',
    isWidthConfigured ? 'has-configured-width' : '',
  ].filter(Boolean).join(' ');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isShowingError, setIsShowingError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef(null);
  const textScrollRef = useRef(null);
  const editRef = useRef(null);
  const wasEditingRef = useRef(false);
  const dropdownRef = useRef(null);
  const originalValueRef = useRef('');

  const resolveOptionComp = useCallback((compName, context) => {
    if (!compName || !getComp) return null;
    return getComp(compName, context) || null;
  }, [getComp]);

  const getOptionByValue = useCallback((value) => {
    return options.find(opt => opt.value === value) || null;
  }, [options]);

  const getOptionLabel = useCallback((option, fallbackValue) => {
    if (!option) return fallbackValue;
    if (option.label != null) return option.label;
    if (option.value != null) return option.value;
    return fallbackValue;
  }, []);

  const getCurrentLabel = useCallback(() => {
    if (isNotSet && !value) return 'NOT SET';
    const option = getOptionByValue(value);
    return getOptionLabel(option, value);
  }, [isNotSet, value, getOptionByValue, getOptionLabel]);

  const getCurrentLabelForValue = useCallback((valueToResolve) => {
    const option = getOptionByValue(valueToResolve);
    return getOptionLabel(option, valueToResolve);
  }, [getOptionByValue, getOptionLabel]);

  const filteredOptions = useMemo(() => {
    const query = String(searchText ?? '').trim().toLowerCase();
    if (!query) {
      return options;
    }
    return options.filter((option) => {
      const label = String(getOptionLabel(option, option.value)).toLowerCase();
      const valueText = String(option.value ?? '').toLowerCase();
      const description = String(option.description ?? '').toLowerCase();
      return label.includes(query) || valueText.includes(query) || description.includes(query);
    });
  }, [options, searchText, getOptionLabel]);

  const handleEditClick = () => {
    if (isSubmitting || isExternalSubmitting) return;
    originalValueRef.current = isNotSet ? '' : String(valueAccepted);
    setSearchText('');
    setIsEditing(true);
    setShowDropdown(true);
    const currentIdx = options.findIndex(opt => opt.value === value);
    setSelectedIndex(currentIdx);
  };

  useLayoutEffect(() => {
    if (!editRef.current) return;

    if (isEditing && !wasEditingRef.current) {
      const nextText = isNotSet ? '' : getCurrentLabel();
      editRef.current.textContent = nextText;
      editRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (!isEditing && wasEditingRef.current && !isShowingError) {
      editRef.current.textContent = getCurrentLabel();
    } else if (!isEditing && !isShowingError) {
      const newText = getCurrentLabel();
      if (editRef.current.textContent !== newText) {
        editRef.current.textContent = newText;
      }
    }

    wasEditingRef.current = isEditing;
  }, [isEditing, isNotSet, isShowingError, getCurrentLabel]);

  useValueCompWheelScroll(containerRef, textScrollRef);

  useLayoutEffect(() => {
    if (textScrollRef.current) {
      textScrollRef.current.scrollLeft = 0;
    }
  }, [isEditing, value, configKey]);

  const handleSelectFromDropdown = async (selectedValue) => {
    if (selectedValue === originalValueRef.current) {
      setSearchText('');
      setIsEditing(false);
      setShowDropdown(false);
      return;
    }

    const selectedLabel = getCurrentLabelForValue(selectedValue);
    setValuePendingLocal(selectedValue);
    setSearchText('');
    setIsEditing(false);
    if (editRef.current) {
      editRef.current.textContent = selectedLabel;
    }
    setIsSubmitting(true);
    setShowDropdown(false);
    
    try {
      if (!configKey) {
        console.error('config.configKey or data.configKey is required');
        setValuePendingLocal(undefined);
        setIsSubmitting(false);
        setIsEditing(false);
        return;
      }

      if (!onEvent) {
        console.error('onEvent callback is required');
        setValuePendingLocal(undefined);
        setIsSubmitting(false);
        setIsEditing(false);
        return;
      }

      // Submit to parent - parent decides whether to accept or reject
      const result = await onEvent('valueCommit', {
        configKey,
        index,
        rowId,
        field,
        category,
        valuePrevious: originalValueRef.current,
        valueNext: selectedValue,
        source: 'select',
      });
      
      // Parent rejected the update - show error and wait for parent to update data prop
      if ((result || { code: 0 }).code !== 0) {
        console.error('Failed to update config:', result?.message);
        // Keep the invalid value displayed temporarily
        if (editRef.current) {
          editRef.current.textContent = selectedLabel;
        }
        setIsShowingError(true);
        setErrorMessage(result?.message || 'Update failed');
        setTimeout(() => {
          setErrorMessage(null);
          setIsShowingError(false);
        }, errorDisplayMs);
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      // Keep the invalid value displayed temporarily
      if (editRef.current) {
        editRef.current.textContent = selectedLabel;
      }
      setIsShowingError(true);
      setErrorMessage(error.message || 'Network error');
      setTimeout(() => {
        setErrorMessage(null);
        setIsShowingError(false);
      }, errorDisplayMs);
    } finally {
      setValuePendingLocal(undefined);
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleInput = () => {
    if (!editRef.current || !isEditing) return;
    setSearchText(editRef.current.textContent ?? '');
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  const handleBlur = (e) => {
    // Check if we're clicking on dropdown
    if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    if (!isSubmitting) {
      setShowDropdown(false);
      setSearchText('');
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && selectedIndex >= 0 && filteredOptions[selectedIndex]) {
        handleSelectFromDropdown(filteredOptions[selectedIndex].value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      setSearchText('');
      setIsEditing(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showDropdown && filteredOptions.length > 0) {
        setSelectedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showDropdown && filteredOptions.length > 0) {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
    }
  };

  return (
    <span
      ref={containerRef}
      className={containerClassName}
      style={getValueCompWidthStyle(width)}
    >
      <span ref={textScrollRef} className="selectable-value-fixed-wrapper">
        <span 
          ref={editRef}
          className={`editable-value-text ${isEditing ? 'editing selectable-editing' : ''} ${isNotSet && !isEditing ? 'not-set' : ''} ${isSubmitting || isExternalSubmitting ? 'is-submitting' : ''}`}
          contentEditable={isEditing && !isSubmitting && !isExternalSubmitting}
          tabIndex={isEditing ? 0 : -1}
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning={true}
          title={String(getCurrentLabel() ?? '')}
          style={isSubmitting || isExternalSubmitting || isShowingError ? { pointerEvents: 'none' } : undefined}
        >
          {!isEditing ? getCurrentLabel() : null}
        </span>
      </span>
      
      {showDropdown && filteredOptions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="searchable-dropdown"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filteredOptions.map((option, idx) => (
            (() => {
              const context = { option, index: idx, mode: 'selectable', searchText };
              const OptionComp = resolveOptionComp(option[optionCompNameField], context);

              if (OptionComp) {
                return (
                  <div
                    key={idx}
                    className={`searchable-dropdown-item ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleSelectFromDropdown(option.value)}
                  >
                    <OptionComp
                      data={option}
                      config={{
                        option,
                        isSelected: idx === selectedIndex,
                        mode: 'selectable',
                        index: idx,
                        context,
                        searchText,
                      }}
                    />
                  </div>
                );
              }

              const optionLabel = getOptionLabel(option, option.value);
              return (
                <div
                  key={idx}
                  className={`searchable-dropdown-item ${idx === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelectFromDropdown(option.value)}
                >
                  <div className="searchable-dropdown-value">
                    {renderMatchedText(optionLabel, searchText)}
                  </div>
                  {option.description && (
                    <div className="searchable-dropdown-desc">
                      {renderMatchedText(option.description, searchText)}
                    </div>
                  )}
                </div>
              );
            })()
          ))}
        </div>
      )}
      {showDropdown && String(searchText ?? '').trim() !== '' && filteredOptions.length === 0 && (
        <div
          ref={dropdownRef}
          className="searchable-dropdown"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="searchable-dropdown-empty">
            <span className="searchable-dropdown-empty-text">No matching items</span>
          </div>
        </div>
      )}
      
      <span className="editable-value-icon searchable-value-icon-cluster">
        {isSubmitting || isExternalSubmitting ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SpinningCircle width={16} height={16} color="#666" />
            <span style={{ fontSize: '13px', color: '#666' }}>Saving...</span>
          </span>
        ) : errorMessage ? (
          <>
            <span
              onClick={handleEditClick}
              className="edit-icon-button"
              title="Click to select"
            >
              <EditIcon width={13} height={13} />
            </span>
            <span
              className="edit-icon-error"
              style={{ color: '#d32f2f', fontSize: '13px' }}
              title={errorMessage}
            >
              {errorMessage}
            </span>
          </>
        ) : (
          <span 
            onClick={handleEditClick}
            className="edit-icon-button"
            title="Click to select"
          >
            <EditIcon width={13} height={13} />
          </span>
        )}
      </span>
    </span>
  );
};

export default SelectableValueComp;

