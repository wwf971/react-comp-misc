import React, { useState, useEffect, useRef } from 'react';
import { SpinningCircle, EditIcon } from '@wwf971/react-comp-misc';
import CrossIcon from '../../icon/CrossIcon.jsx';
import SuccessIcon from '../../icon/SuccessIcon.jsx';
import './EditableValue.css';
import './SearchableValue.css';

/**
 * Searchable value component with autocomplete dropdown
 * Supports validation and search with debouncing
 * 
 * IMPORTANT: This is a controlled component - parent owns the data.
 * - Component displays whatever parent provides via 'data' prop
 * - Component never mutates data, only requests changes via callbacks
 * - Parent decides whether to accept/reject updates (via onUpdate return value)
 * - If rejected, component shows error and reverts display to parent's data
 * 
 * @param {Function} onSearch - Callback function (value, version) => Promise<{code: number, data: Array}>
 *                              Returns search results as array of {value, label} objects
 * @param {Function} onValidate - Callback function (value, version) => Promise<{code: number, data: boolean}>
 *                                Returns whether the value is valid (for visual hint only)
 * @param {Function} onUpdate - Callback function (configKey, newValue) => Promise<{code: number}>
 *                              Parent validates and decides whether to accept the change
 * @param {boolean} strictValidation - If true, shows validation icon hints while editing
 * @param {number} searchDebounce - Debounce time for search in ms (default: 300)
 * @param {number} validationDebounce - Debounce time for validation in ms (default: 300)
 */
const SearchableValueComp = ({ 
  data, 
  index, 
  field, 
  category, 
  isNotSet = false, 
  configKey,
  onUpdate,
  onSearch,
  onValidate,
  strictValidation = false,
  searchDebounce = 300,
  validationDebounce = 300
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isShowingError, setIsShowingError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [validationStatus, setValidationStatus] = useState(null); // null, 'valid', 'invalid'
  
  const editRef = useRef(null);
  const dropdownRef = useRef(null);
  const originalValueRef = useRef('');
  const editPeriodRef = useRef(-1); // -1 means not in edit mode
  const editPeriodCounterRef = useRef(0); // Incremental counter for generating period numbers
  const searchVersionRef = useRef(0);
  const validationVersionRef = useRef(0);
  const searchTimerRef = useRef(null);
  const validationTimerRef = useRef(null);
  const isSelectingFromDropdownRef = useRef(false);

  const handleEditClick = () => {
    if (isSubmitting || isShowingError) return;
    originalValueRef.current = isNotSet ? '' : String(data);
    // Generate new edit period and set it as current
    editPeriodCounterRef.current += 1;
    editPeriodRef.current = editPeriodCounterRef.current;
    setIsEditing(true);
    // Reset states when starting edit
    setValidationStatus(null);
    setIsSearching(false);
    setIsValidating(false);
  };

  // Helper function to exit edit mode
  const exitEditMode = () => {
    setIsEditing(false);
    setShowDropdown(false);
    // Mark as not in edit mode
    editPeriodRef.current = -1;
  };

  useEffect(() => {
    if (isEditing && editRef.current) {
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

  // Sync contentEditable text with data prop when not editing and not showing error
  // Parent controls the data - component loyally displays what parent provides
  useEffect(() => {
    if (!isEditing && !isShowingError && editRef.current) {
      const currentText = editRef.current.textContent;
      const newText = String(data);
      if (currentText !== newText) {
        editRef.current.textContent = newText;
      }
    }
  }, [data, isEditing, isShowingError, configKey]);

  // Perform search with debouncing and version control
  const performSearch = async (value) => {
    if (!onSearch) return;
    
    // Don't search if value is empty
    if (!value || value.trim() === '') {
      setSearchResults([]);
      setShowDropdown(false);
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

      try {
        const result = await onSearch(value, currentVersion);
        
        // Check: still the latest request AND same edit period
        if (currentPeriod === editPeriodRef.current && currentVersion === searchVersionRef.current) {
          // Check if still in edit mode before updating dropdown
          setIsEditing(currentIsEditing => {
            if (currentIsEditing) {
              if (result.code === 0 && Array.isArray(result.data)) {
                setSearchResults(result.data);
                setShowDropdown(result.data.length > 0);
                setSelectedIndex(-1);
              } else {
                setSearchResults([]);
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
        setShowDropdown(false);
        setIsSearching(false);
      }
    }, searchDebounce);
  };

  // Perform validation with debouncing and version control
  const performValidation = async (value) => {
    if (!strictValidation || !onValidate) return;

    // Clear previous timer
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    validationTimerRef.current = setTimeout(async () => {
      const currentPeriod = editPeriodRef.current;
      const currentVersion = ++validationVersionRef.current;
      setIsValidating(true);

      try {
        const result = await onValidate(value, currentVersion);
        
        // Check: still the latest request AND same edit period
        if (currentPeriod === editPeriodRef.current && currentVersion === validationVersionRef.current) {
          // Check if still in edit mode before updating validation status
          setIsEditing(currentIsEditing => {
            if (currentIsEditing) {
              if (result.code === 0) {
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
        console.error('configKey prop is required');
        setIsSubmitting(false);
        exitEditMode();
        return;
      }

      if (!onUpdate) {
        console.error('onUpdate callback is required');
        setIsSubmitting(false);
        exitEditMode();
        return;
      }

      // Submit to parent - parent decides whether to accept or reject
      const result = await onUpdate(configKey, newValue);
      
      // Parent rejected the update - show error and wait for parent to update data prop
      if (result.code !== 0) {
        console.error('Failed to update config:', result.message);
        // Keep the invalid value displayed temporarily
        const invalidValue = newValue;
        if (editRef.current) {
          editRef.current.textContent = invalidValue;
        }
        setIsShowingError(true);
        setErrorMessage(result.message || 'Update failed');
        // After 1 second, clear error state and sync with parent data
        setTimeout(() => {
          setErrorMessage(null);
          setIsShowingError(false);
        }, 1000);
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
      // After 1 second, clear error state and sync with parent data
      setTimeout(() => {
        setErrorMessage(null);
        setIsShowingError(false);
      }, 1000);
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
    <span className="editable-value-container searchable-value-wrapper">
      <span 
        ref={editRef}
        className={`editable-value-text ${isEditing ? 'editing' : ''} ${isNotSet && !isEditing ? 'not-set' : ''}`}
        contentEditable={isEditing && !isSubmitting}
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning={true}
        style={{
          ...(isSubmitting || isShowingError ? { pointerEvents: 'none', opacity: 0.7 } : {}),
          ...(isEditing ? { minWidth: '100px', display: 'inline-block' } : {})
        }}
      >
        {data}
      </span>
      
      {showDropdown && searchResults.length > 0 && (
        <div 
          ref={dropdownRef}
          className="searchable-dropdown"
          onMouseDown={(e) => e.preventDefault()}
        >
          {searchResults.map((result, idx) => (
            <div
              key={idx}
              className={`searchable-dropdown-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelectFromDropdown(result.value)}
            >
              <div className="searchable-dropdown-value">{result.label || result.value}</div>
              {result.description && (
                <div className="searchable-dropdown-desc">{result.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <span className="editable-value-icon">
        {strictValidation && !isSubmitting && (isEditing || validationStatus === 'invalid') && (
          <span className="validation-status-icon">
            {isValidating ? (
              <SpinningCircle width={13} height={13} color="#999" />
            ) : validationStatus === 'valid' ? (
              <SuccessIcon width={13} height={13} />
            ) : validationStatus === 'invalid' ? (
              <CrossIcon size={13} color="#d32f2f" />
            ) : null}
          </span>
        )}
        
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
            title={isShowingError ? "Please wait..." : "Click to edit"}
            style={isShowingError ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
          >
            <EditIcon width={13} height={13} />
          </span>
        )}
      </span>
    </span>
  );
};

export default SearchableValueComp;

