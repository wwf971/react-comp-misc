import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { SpinningCircle, EditIcon } from '@wwf971/react-comp-misc';
import CrossIcon from '../../icon/CrossIcon.jsx';
import SuccessIcon from '../../icon/SuccessIcon.jsx';
import './EditableValue.css';
import './SearchableValue.css';
import { getValueCompWidthStyle } from './valueCompEvent.js';
import { useValueCompWheelScroll } from './valueCompScroll.js';

const renderMatchedText = (rawText, matchText) => {
  const text = String(rawText ?? '');
  const query = String(matchText ?? '').trim();
  if (!query) return text;

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const parts = [];
  let startIndex = 0;
  let matchIndex = textLower.indexOf(queryLower);

  while (matchIndex >= 0) {
    if (matchIndex > startIndex) {
      parts.push(text.slice(startIndex, matchIndex));
    }
    const matchEndIndex = matchIndex + query.length;
    parts.push(
      <span key={`${matchIndex}-${matchEndIndex}`} className="value-match-highlight">
        {text.slice(matchIndex, matchEndIndex)}
      </span>,
    );
    startIndex = matchEndIndex;
    matchIndex = textLower.indexOf(queryLower, startIndex);
  }

  if (startIndex < text.length) {
    parts.push(text.slice(startIndex));
  }
  return parts;
};

const SearchableValueComp = ({ 
  data,
  config = {},
  onEvent,
}) => {
  const value = data && typeof data === 'object' && !Array.isArray(data)
    ? data.value ?? ''
    : data;
  const index = config.index ?? data?.index;
  const rowId = config.rowId ?? data?.rowId;
  const field = config.field ?? data?.field;
  const category = config.category ?? data?.category;
  const configKey = config.configKey ?? data?.configKey;
  const isNotSet = Boolean(config.isNotSet ?? data?.isNotSet ?? false);
  const getComp = config.getComp;
  const searchItemCompNameField = config.searchItemCompNameField || 'compName';
  const strictValidation = Boolean(config.strictValidation);
  const searchDebounce = config.searchDebounce ?? 300;
  const validationDebounce = config.validationDebounce ?? 300;
  const errorDisplayMs = config.errorDisplayMs ?? 5000;
  const width = config.width;
  const isWidthConfigured = width !== undefined && width !== null && width !== '';
  const containerClassName = [
    'searchable-value-wrapper',
    isWidthConfigured ? 'has-configured-width' : '',
  ].filter(Boolean).join(' ');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isShowingError, setIsShowingError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchText, setSearchText] = useState('');
  const [isShowingNoResults, setIsShowingNoResults] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // null, 'valid', 'invalid'
  
  const editRef = useRef(null);
  const containerRef = useRef(null);
  const textScrollRef = useRef(null);
  const dropdownRef = useRef(null);
  const originalValueRef = useRef('');
  const editPeriodRef = useRef(-1); // -1 means not in edit mode
  const editPeriodCounterRef = useRef(0); // Incremental counter for generating period numbers
  const searchVersionRef = useRef(0);
  const validationVersionRef = useRef(0);
  const searchTimerRef = useRef(null);
  const validationTimerRef = useRef(null);
  const isSelectingFromDropdownRef = useRef(false);
  const wasEditingRef = useRef(false);
  const resolveResultComp = useCallback((compName, context) => {
    if (!compName || !getComp) return null;
    return getComp(compName, context) || null;
  }, [getComp]);

  const handleEditClick = () => {
    if (isSubmitting) return;
    originalValueRef.current = isNotSet ? '' : String(value);
    // Generate new edit period and set it as current
    editPeriodCounterRef.current += 1;
    editPeriodRef.current = editPeriodCounterRef.current;
    setIsEditing(true);
    // Reset states when starting edit
    setValidationStatus(null);
    setIsSearching(false);
    setIsValidating(false);
    setSearchText('');
  };

  // Helper function to exit edit mode
  const exitEditMode = () => {
    setIsEditing(false);
    setShowDropdown(false);
    // Mark as not in edit mode
    editPeriodRef.current = -1;
  };

  useLayoutEffect(() => {
    if (!editRef.current) return;

    if (isEditing && !wasEditingRef.current) {
      editRef.current.textContent = isNotSet ? '' : String(value ?? '');
      editRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (!isEditing && wasEditingRef.current && !isShowingError) {
      editRef.current.textContent = String(value ?? '');
    } else if (!isEditing && !isShowingError) {
      const newText = String(value ?? '');
      if (editRef.current.textContent !== newText) {
        editRef.current.textContent = newText;
      }
    }

    wasEditingRef.current = isEditing;
  }, [isEditing, isNotSet, value, isShowingError]);

  useValueCompWheelScroll(containerRef, textScrollRef);

  useLayoutEffect(() => {
    if (textScrollRef.current) {
      textScrollRef.current.scrollLeft = 0;
    }
  }, [isEditing, value, configKey]);

  // Perform search with debouncing and version control
  const performSearch = async (value) => {
    if (!onEvent) return;
    
    // Don't search if value is empty
    if (!value || value.trim() === '') {
      setSearchResults([]);
      setShowDropdown(false);
      setIsShowingNoResults(false);
      return;
    }

    // Clear previous timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(async () => {
      const currentPeriod = editPeriodRef.current;
      const currentVersion = ++searchVersionRef.current;
      setIsSearching(true);
      setSearchResults([]);
      setSelectedIndex(-1);
      setIsShowingNoResults(false);
      setShowDropdown(true);

      try {
        const result = await onEvent('searchRequest', {
          configKey,
          index,
          rowId,
          field,
          category,
          value,
          version: currentVersion,
        });
        
        // Check: still the latest request AND same edit period
        if (currentPeriod === editPeriodRef.current && currentVersion === searchVersionRef.current) {
          // Check if still in edit mode before updating dropdown
          setIsEditing(currentIsEditing => {
            if (currentIsEditing) {
              if ((result || { code: -1 }).code === 0 && Array.isArray(result.data)) {
                setSearchResults(result.data);
                setSelectedIndex(-1);
                if (result.data.length > 0) {
                  setIsShowingNoResults(false);
                  setShowDropdown(true);
                } else {
                  setIsShowingNoResults(true);
                  setShowDropdown(true);
                }
              } else {
                setSearchResults([]);
                setIsShowingNoResults(false);
                setShowDropdown(false);
              }
            }
            return currentIsEditing;
          });
          // Always clear searching state
          setIsSearching(false);
        } else {
          // Period or version mismatch - clear searching state
          setIsSearching(false);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
        setIsShowingNoResults(false);
        setShowDropdown(false);
        setIsSearching(false);
      }
    }, searchDebounce);
  };

  // Perform validation with debouncing and version control
  const performValidation = async (value) => {
    if (!strictValidation || !onEvent) return;

    // Clear previous timer
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    validationTimerRef.current = setTimeout(async () => {
      const currentPeriod = editPeriodRef.current;
      const currentVersion = ++validationVersionRef.current;
      setIsValidating(true);

      try {
        const result = await onEvent('validateRequest', {
          configKey,
          index,
          rowId,
          field,
          category,
          value,
          version: currentVersion,
        });
        
        // Check: still the latest request AND same edit period
        if (currentPeriod === editPeriodRef.current && currentVersion === validationVersionRef.current) {
          // Check if still in edit mode before updating validation status
          setIsEditing(currentIsEditing => {
            if (currentIsEditing) {
              if ((result || { code: -1 }).code === 0) {
                setValidationStatus(result.data ? 'valid' : 'invalid');
              }
            }
            return currentIsEditing;
          });
          // Always clear validating state
          setIsValidating(false);
        } else {
          // Period or version mismatch - clear validating state
          setIsValidating(false);
        }
      } catch (error) {
        console.error('Validation failed:', error);
        setValidationStatus('invalid');
        setIsValidating(false);
      }
    }, validationDebounce);
  };

  // Handle input changes
  const handleInput = () => {
    if (!editRef.current || !isEditing) return;
    
    const currentValue = editRef.current.textContent;
    setSearchText(currentValue);
    setIsShowingNoResults(false);
    setShowDropdown(false);
    setSearchResults([]);
    setSelectedIndex(-1);
    
    // Trigger search
    performSearch(currentValue);
    
    // Trigger validation if strict mode
    if (strictValidation) {
      performValidation(currentValue);
    }
  };

  const handleSubmit = async (skipValidation = false) => {
    if (!editRef.current) return;
    
    const newValue = editRef.current.textContent;
    
    if (newValue === originalValueRef.current) {
      exitEditMode();
      return;
    }

    setIsSubmitting(true);
    setShowDropdown(false);
    
    try {
      if (!configKey) {
        console.error('config.configKey or data.configKey is required');
        setIsSubmitting(false);
        exitEditMode();
        return;
      }

      if (!onEvent) {
        console.error('onEvent callback is required');
        setIsSubmitting(false);
        exitEditMode();
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
        valueNext: newValue,
        source: skipValidation ? 'search-result' : 'text',
      });
      
      // Parent rejected the update - show error and wait for parent to update data prop
      if ((result || { code: 0 }).code !== 0) {
        console.error('Failed to update config:', result?.message);
        // Keep the invalid value displayed temporarily
        const invalidValue = newValue;
        if (editRef.current) {
          editRef.current.textContent = invalidValue;
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
      const invalidValue = newValue;
      if (editRef.current) {
        editRef.current.textContent = invalidValue;
      }
      setIsShowingError(true);
      setErrorMessage(error.message || 'Network error');
      setTimeout(() => {
        setErrorMessage(null);
        setIsShowingError(false);
      }, errorDisplayMs);
    } finally {
      setIsSubmitting(false);
      exitEditMode();
      setValidationStatus(null);
    }
  };

  const handleSelectFromDropdown = async (selectedValue) => {
    if (!editRef.current) return;
    
    // Mark that we're selecting from dropdown to avoid triggering search/validation
    isSelectingFromDropdownRef.current = true;
    
    // Update the text
    editRef.current.textContent = selectedValue;
    
    // In strict mode, mark as valid since it's from dropdown
    if (strictValidation) {
      setValidationStatus('valid');
    }
    
    // Close dropdown
    setShowDropdown(false);
    setSearchResults([]);
    
    // Submit the value - skip validation since we're selecting from dropdown
    await handleSubmit(true);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isSelectingFromDropdownRef.current = false;
    }, 100);
  };

  const handleBlur = (e) => {
    // Check if we're clicking on dropdown
    if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    if (!isSubmitting) {
      setShowDropdown(false);
      handleSubmit();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && selectedIndex >= 0 && searchResults[selectedIndex]) {
        handleSelectFromDropdown(searchResults[selectedIndex].value);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (editRef.current) {
        editRef.current.textContent = originalValueRef.current;
      }
      exitEditMode();
      setValidationStatus(null);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showDropdown && searchResults.length > 0) {
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showDropdown && searchResults.length > 0) {
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      }
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, []);

  return (
    <span
      ref={containerRef}
      className={containerClassName}
      style={getValueCompWidthStyle(width)}
    >
      <span ref={textScrollRef} className="searchable-value-fixed-wrapper">
      <span 
        ref={editRef}
        className={`editable-value-text ${isEditing ? 'editing' : ''} ${isNotSet && !isEditing ? 'not-set' : ''}`}
        contentEditable={isEditing && !isSubmitting}
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning={true}
        title={String(value ?? '')}
        style={{
          ...(isSubmitting || isShowingError ? { pointerEvents: 'none', opacity: 0.7 } : {}),
        }}
      >
        {isEditing ? null : value}
        </span>
      </span>
      
      {showDropdown && searchResults.length > 0 && (
        <div 
          ref={dropdownRef}
          className="searchable-dropdown"
          onMouseDown={(e) => e.preventDefault()}
        >
          {searchResults.map((result, idx) => (
            (() => {
              const context = { result, index: idx, mode: 'searchable', searchText };
              const ResultComp = resolveResultComp(result[searchItemCompNameField], context);

              if (ResultComp) {
                return (
                  <div
                    key={idx}
                    className={`searchable-dropdown-item ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleSelectFromDropdown(result.value)}
                  >
                    <ResultComp
                      data={result}
                      config={{
                        result,
                        isSelected: idx === selectedIndex,
                        mode: 'searchable',
                        index: idx,
                        context,
                        searchText,
                      }}
                    />
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`searchable-dropdown-item ${idx === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelectFromDropdown(result.value)}
                >
                  <div className="searchable-dropdown-value">
                    {renderMatchedText(result.label || result.value, searchText)}
                  </div>
                  {result.description && (
                    <div className="searchable-dropdown-desc">
                      {renderMatchedText(result.description, searchText)}
                    </div>
                  )}
                </div>
              );
            })()
          ))}
        </div>
      )}
      {showDropdown && isSearching && (
        <div
          ref={dropdownRef}
          className="searchable-dropdown"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="searchable-dropdown-empty">
            <SpinningCircle width={13} height={13} color="#999" />
            <span className="searchable-dropdown-empty-text">Searching, waiting for server response...</span>
          </div>
        </div>
      )}
      {showDropdown && !isSearching && isShowingNoResults && (
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
        {strictValidation ? (
          <span className="validation-status-icon-slot">
            {!isSubmitting && (isEditing || validationStatus === 'invalid') ? (
              isValidating ? (
                <SpinningCircle width={13} height={13} color="#999" />
              ) : validationStatus === 'valid' ? (
                <SuccessIcon width={13} height={13} />
              ) : validationStatus === 'invalid' ? (
                <CrossIcon size={13} color="#d32f2f" />
              ) : (
                <span className="validation-status-icon-placeholder" />
              )
            ) : (
              <span className="validation-status-icon-placeholder" />
            )}
          </span>
        ) : null}
        
        {isSubmitting ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SpinningCircle width={16} height={16} color="#666" />
            <span style={{ fontSize: '13px', color: '#666' }}>Saving...</span>
          </span>
        ) : errorMessage ? (
          <>
            <span
              onClick={handleEditClick}
              className="edit-icon-button"
              title="Click to edit"
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
            title="Click to edit"
          >
            <EditIcon width={13} height={13} />
          </span>
        )}
      </span>
    </span>
  );
};

export default SearchableValueComp;

