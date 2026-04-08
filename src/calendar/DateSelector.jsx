import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { CalendarIcon, CrossIcon } from '../icon/Icon';
import DateView from './DateView';
import {
  parseSingleSelectionInput,
  parseMultipleSelectionInput,
  parseRangeSelectionInput,
} from './dateInputParse';
import './calendar.css';

function normalizeDateObj(dateObj) {
  if (!dateObj) return null;
  return {
    year: Number(dateObj.year),
    month: Number(dateObj.month),
    day: Number(dateObj.day),
  };
}

const DateSelector = observer(({
  data,
  onDataChangeRequest,
  onSelectionChange,
  placeholder,
}) => {
  const selectorRef = useRef(null);
  const parseErrorTimerRef = useRef(null);
  const [parseErrorText, setParseErrorText] = useState('');
  const isDropdownOpen = !!data?.isDropdownOpen;
  const inputText = data?.inputText || '';
  const isDisabled = !!data?.isDisabled;
  const selectionMode = data?.selectionMode || 'single';
  const selectedDates = Array.isArray(data?.selectedDates) ? data.selectedDates : [];
  const visibleYear = data?.visibleYear || new Date().getFullYear();
  const visibleMonth = data?.visibleMonth || new Date().getMonth() + 1;
  const rangeAnchorDate = normalizeDateObj(data?.rangeAnchorDate);
  const rangeBeginDate = normalizeDateObj(data?.rangeBeginDate);
  const rangeEndDate = normalizeDateObj(data?.rangeEndDate);
  const isRangeAllowSameDay = data?.isRangeAllowSameDay !== false;
  const defaultPlaceholder = selectionMode === 'multiple'
    ? 'YYYY-MM-DD, YYYY-MM-DD'
    : (selectionMode === 'range' ? 'YYYY-MM-DD ~ YYYY-MM-DD' : 'YYYY-MM-DD');
  const effectivePlaceholder = placeholder || defaultPlaceholder;

  const handleInputTextChange = async (nextInputText) => {
    if (!onDataChangeRequest) return;
    await onDataChangeRequest('set-input-text', { inputText: nextInputText });
  };

  const clearParseErrorWithDelay = () => {
    if (parseErrorTimerRef.current) {
      clearTimeout(parseErrorTimerRef.current);
    }
    parseErrorTimerRef.current = setTimeout(() => {
      parseErrorTimerRef.current = null;
      setParseErrorText('');
    }, 2200);
  };

  const parseInputByMode = (rawInputText, mode, allowSameDay) => {
    if (mode === 'multiple') {
      return parseMultipleSelectionInput(rawInputText);
    }
    if (mode === 'range') {
      return parseRangeSelectionInput(rawInputText, { isRangeAllowSameDay: allowSameDay });
    }
    return parseSingleSelectionInput(rawInputText);
  };

  const handleInputCommit = async () => {
    if (!onDataChangeRequest) return;
    const currentInputText = data?.inputText || '';
    const currentSelectionMode = data?.selectionMode || 'single';
    const currentIsRangeAllowSameDay = data?.isRangeAllowSameDay !== false;
    const parsedResult = parseInputByMode(currentInputText, currentSelectionMode, currentIsRangeAllowSameDay);
    if (!parsedResult.isValid) {
      setParseErrorText(parsedResult.errorText || 'Invalid date input.');
      clearParseErrorWithDelay();
      return;
    }
    setParseErrorText('');
    await onDataChangeRequest('commit-parsed-input', {
      normalizedInputText: parsedResult.normalizedInputText,
      selectedDates: parsedResult.selectedDates,
      rangeBeginDate: parsedResult.rangeBeginDate,
      rangeEndDate: parsedResult.rangeEndDate,
    });
  };

  const handleToggleDropdown = async () => {
    if (!onDataChangeRequest) return;
    await onDataChangeRequest('toggle-dropdown');
  };

  const handleClearInput = async () => {
    if (!onDataChangeRequest) return;
    setParseErrorText('');
    await onDataChangeRequest('clear-input');
  };

  useEffect(() => {
    if (!isDropdownOpen || !onDataChangeRequest) return;
    const handleDocumentPointerDown = (event) => {
      const selectorElement = selectorRef.current;
      if (!selectorElement) return;
      if (selectorElement.contains(event.target)) return;
      handleInputCommit();
      onDataChangeRequest('set-dropdown-open', { isDropdownOpen: false });
    };
    document.addEventListener('mousedown', handleDocumentPointerDown, true);
    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown, true);
    };
  }, [isDropdownOpen, onDataChangeRequest]);

  useEffect(() => {
    return () => {
      if (parseErrorTimerRef.current) {
        clearTimeout(parseErrorTimerRef.current);
      }
    };
  }, []);

  const handleDateViewChange = (type, params) => {
    if (!onDataChangeRequest) return;
    if (type === 'selection-change') {
      onDataChangeRequest('selection-change', params);
      return;
    }
    if (type === 'navigate-month') {
      onDataChangeRequest('navigate-month', params);
    }
  };

  return (
    <div className="calendar-date-selector" ref={selectorRef}>
      <div className={`calendar-date-selector-input-wrap ${isDropdownOpen ? 'calendar-date-selector-input-wrap-open' : ''}`}>
        <input
          className="calendar-date-selector-input"
          value={inputText}
          onChange={(event) => handleInputTextChange(event.target.value)}
          onBlur={handleInputCommit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleInputCommit();
            }
          }}
          placeholder={effectivePlaceholder}
          disabled={isDisabled}
        />
        <button
          type="button"
          className="calendar-date-selector-clear-button"
          onClick={handleClearInput}
          disabled={isDisabled}
          aria-label="Clear date input"
        >
          <CrossIcon size={12} color="#777" strokeWidth={2} />
        </button>
        <button
          type="button"
          className="calendar-date-selector-calendar-button"
          onClick={handleToggleDropdown}
          disabled={isDisabled}
          aria-label="Open calendar"
        >
          <CalendarIcon width={16} height={16} />
        </button>
      </div>

      {isDropdownOpen ? (
        <div className="calendar-date-selector-dropdown">
          <DateView
            data={{
              visibleYear,
              visibleMonth,
              selectedDates,
              selectionMode,
              firstDayOfWeek: data?.firstDayOfWeek,
              rangeAnchorDate,
              rangeBeginDate,
              rangeEndDate,
              isRangeAllowSameDay,
            }}
            onDataChangeRequest={handleDateViewChange}
            onSelectionChange={onSelectionChange}
          />
        </div>
      ) : null}
      {parseErrorText ? (
        <div className="calendar-date-selector-error-text">{parseErrorText}</div>
      ) : (
        <div className="calendar-date-selector-error-placeholder" />
      )}
    </div>
  );
});

export default DateSelector;

