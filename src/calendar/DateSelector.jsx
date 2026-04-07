import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { CalendarIcon } from '../icon/Icon';
import DateView from './DateView';
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
  placeholder = 'YYYY-MM-DD',
}) => {
  const selectorRef = useRef(null);
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

  const handleInputTextChange = async (nextInputText) => {
    if (!onDataChangeRequest) return;
    await onDataChangeRequest('set-input-text', { inputText: nextInputText });
  };

  const handleInputCommit = async () => {
    if (!onDataChangeRequest) return;
    await onDataChangeRequest('commit-input-text');
  };

  const handleToggleDropdown = async () => {
    if (!onDataChangeRequest) return;
    await onDataChangeRequest('toggle-dropdown');
  };

  useEffect(() => {
    if (!isDropdownOpen || !onDataChangeRequest) return;
    const handleDocumentPointerDown = (event) => {
      const selectorElement = selectorRef.current;
      if (!selectorElement) return;
      if (selectorElement.contains(event.target)) return;
      onDataChangeRequest('set-dropdown-open', { isDropdownOpen: false });
    };
    document.addEventListener('mousedown', handleDocumentPointerDown, true);
    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown, true);
    };
  }, [isDropdownOpen, onDataChangeRequest]);

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
          placeholder={placeholder}
          disabled={isDisabled}
        />
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
    </div>
  );
});

export default DateSelector;

