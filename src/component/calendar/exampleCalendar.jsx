import { useState } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import DateSelector from './DateSelector.jsx';
import './calendar.css';

function pad2(value) {
  return String(value).padStart(2, '0');
}

function dateObjToKey(dateObj) {
  return `${dateObj.year}-${pad2(dateObj.month)}-${pad2(dateObj.day)}`;
}

function parseDateFromInput(inputText) {
  const trimmedText = (inputText || '').trim();
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedText);
  if (!matched) return null;
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function formatSelectionForInput(selectionMode, selectedDates, rangeBeginDate, rangeEndDate) {
  if (selectionMode === 'single') {
    if (!Array.isArray(selectedDates) || selectedDates.length === 0) return '';
    return dateObjToKey(selectedDates[0]);
  }
  if (selectionMode === 'range') {
    if (rangeBeginDate && rangeEndDate) {
      return `${dateObjToKey(rangeBeginDate)} ~ ${dateObjToKey(rangeEndDate)}`;
    }
    if (rangeBeginDate && !rangeEndDate) {
      return `${dateObjToKey(rangeBeginDate)} ~`;
    }
    if (!rangeBeginDate && rangeEndDate) {
      return `~ ${dateObjToKey(rangeEndDate)}`;
    }
    return '';
  }
  if (!Array.isArray(selectedDates) || selectedDates.length === 0) return '';
  return selectedDates.map((dateObj) => dateObjToKey(dateObj)).join(', ');
}

function createCalendarDemoStore() {
  const today = new Date();
  return makeAutoObservable({
    inputText: '',
    isDropdownOpen: false,
    selectedDates: [],
    selectionMode: 'single',
    firstDayOfWeek: 'monday',
    rangeAnchorDate: null,
    rangeBeginDate: null,
    rangeEndDate: null,
    isRangeAllowSameDay: true,
    visibleYear: today.getFullYear(),
    visibleMonth: today.getMonth() + 1,
    onDataChangeRequest(type, params = {}) {
      if (type === 'set-input-text') {
        this.inputText = params.inputText || '';
        return { code: 0 };
      }
      if (type === 'commit-input-text') {
        const parsedDate = parseDateFromInput(this.inputText);
        if (!parsedDate) return { code: -1, message: 'Invalid date' };
        this.selectedDates = [parsedDate];
        this.rangeAnchorDate = parsedDate;
        this.rangeBeginDate = parsedDate;
        this.rangeEndDate = null;
        this.visibleYear = parsedDate.year;
        this.visibleMonth = parsedDate.month;
        this.inputText = formatSelectionForInput(this.selectionMode, this.selectedDates, this.rangeBeginDate, this.rangeEndDate);
        return { code: 0 };
      }
      if (type === 'commit-parsed-input') {
        this.selectedDates = Array.isArray(params.selectedDates) ? params.selectedDates : [];
        this.rangeBeginDate = params.rangeBeginDate || null;
        this.rangeEndDate = params.rangeEndDate || null;
        this.rangeAnchorDate = this.rangeBeginDate || this.rangeEndDate || null;
        this.inputText = params.normalizedInputText || '';
        const firstDate = this.selectedDates[0] || this.rangeBeginDate || this.rangeEndDate;
        if (firstDate) {
          this.visibleYear = firstDate.year;
          this.visibleMonth = firstDate.month;
        }
        return { code: 0 };
      }
      if (type === 'clear-input') {
        this.inputText = '';
        this.selectedDates = [];
        this.rangeBeginDate = null;
        this.rangeEndDate = null;
        this.rangeAnchorDate = null;
        return { code: 0 };
      }
      if (type === 'toggle-dropdown') {
        this.isDropdownOpen = !this.isDropdownOpen;
        return { code: 0 };
      }
      if (type === 'set-dropdown-open') {
        this.isDropdownOpen = !!params.isDropdownOpen;
        return { code: 0 };
      }
      if (type === 'navigate-month') {
        const monthDelta = Number(params.monthDelta || 0);
        if (monthDelta === 0) return { code: 0 };
        const nextMonthIndex = this.visibleMonth - 1 + monthDelta;
        const nextDate = new Date(this.visibleYear, nextMonthIndex, 1);
        this.visibleYear = nextDate.getFullYear();
        this.visibleMonth = nextDate.getMonth() + 1;
        return { code: 0 };
      }
      if (type === 'selection-change') {
        this.selectedDates = Array.isArray(params.nextSelectedDates) ? params.nextSelectedDates : [];
        this.rangeAnchorDate = params.nextRangeAnchorDate || null;
        this.rangeBeginDate = params.nextRangeBeginDate || null;
        this.rangeEndDate = params.nextRangeEndDate || null;
        this.inputText = formatSelectionForInput(this.selectionMode, this.selectedDates, this.rangeBeginDate, this.rangeEndDate);
        return { code: 0 };
      }
      if (type === 'set-selection-mode') {
        const nextSelectionMode = params.selectionMode;
        this.selectionMode = nextSelectionMode === 'multiple' || nextSelectionMode === 'range' ? nextSelectionMode : 'single';
        if (this.selectionMode !== 'range') {
          this.rangeBeginDate = null;
          this.rangeEndDate = null;
        }
        this.inputText = formatSelectionForInput(this.selectionMode, this.selectedDates, this.rangeBeginDate, this.rangeEndDate);
        return { code: 0 };
      }
      if (type === 'set-range-allow-same-day') {
        this.isRangeAllowSameDay = params.isRangeAllowSameDay !== false;
        return { code: 0 };
      }
      if (type === 'set-first-day-of-week') {
        this.firstDayOfWeek = params.firstDayOfWeek === 'sunday' ? 'sunday' : 'monday';
        return { code: 0 };
      }
      return { code: 0 };
    },
  }, {}, { autoBind: true });
}

const CalendarExamplesPanel = observer(() => {
  const [calendarStore] = useState(() => createCalendarDemoStore());
  return (
    <div className="calendar-demo-root">
      <div className="calendar-demo-title">Date Selector</div>

      <div className="calendar-demo-row">
        <button
          type="button"
          className={`calendar-demo-button ${calendarStore.selectionMode === 'single' ? 'calendar-demo-button-active' : ''}`}
          onClick={() => calendarStore.onDataChangeRequest('set-selection-mode', { selectionMode: 'single' })}
        >
          Single
        </button>
        <button
          type="button"
          className={`calendar-demo-button ${calendarStore.selectionMode === 'multiple' ? 'calendar-demo-button-active' : ''}`}
          onClick={() => calendarStore.onDataChangeRequest('set-selection-mode', { selectionMode: 'multiple' })}
        >
          Multiple
        </button>
        <button
          type="button"
          className={`calendar-demo-button ${calendarStore.selectionMode === 'range' ? 'calendar-demo-button-active' : ''}`}
          onClick={() => calendarStore.onDataChangeRequest('set-selection-mode', { selectionMode: 'range' })}
        >
          Range
        </button>
      </div>

      <div className="calendar-demo-row">
        <button
          type="button"
          className={`calendar-demo-button ${calendarStore.firstDayOfWeek === 'monday' ? 'calendar-demo-button-active' : ''}`}
          onClick={() => calendarStore.onDataChangeRequest('set-first-day-of-week', { firstDayOfWeek: 'monday' })}
        >
          Monday First
        </button>
        <button
          type="button"
          className={`calendar-demo-button ${calendarStore.firstDayOfWeek === 'sunday' ? 'calendar-demo-button-active' : ''}`}
          onClick={() => calendarStore.onDataChangeRequest('set-first-day-of-week', { firstDayOfWeek: 'sunday' })}
        >
          Sunday First
        </button>
      </div>

      <div className="calendar-demo-row">
        <button
          type="button"
          className={`calendar-demo-button ${calendarStore.isRangeAllowSameDay ? 'calendar-demo-button-active' : ''}`}
          onClick={() => calendarStore.onDataChangeRequest('set-range-allow-same-day', { isRangeAllowSameDay: true })}
        >
          Range Same Day On
        </button>
        <button
          type="button"
          className={`calendar-demo-button ${!calendarStore.isRangeAllowSameDay ? 'calendar-demo-button-active' : ''}`}
          onClick={() => calendarStore.onDataChangeRequest('set-range-allow-same-day', { isRangeAllowSameDay: false })}
        >
          Range Same Day Off
        </button>
      </div>

      <DateSelector
        data={calendarStore}
        onDataChangeRequest={calendarStore.onDataChangeRequest}
      />

      <div className="calendar-demo-row">
        <div className="calendar-demo-value">Mode: {calendarStore.selectionMode}</div>
        <div className="calendar-demo-value">First Column: {calendarStore.firstDayOfWeek}</div>
      </div>
      <div className="calendar-demo-row">
        <div className="calendar-demo-value">Selection Count: {calendarStore.selectedDates.length}</div>
      </div>
      <div className="calendar-demo-row">
        <div className="calendar-demo-value">Range Begin: {calendarStore.rangeBeginDate ? dateObjToKey(calendarStore.rangeBeginDate) : '(null)'}</div>
      </div>
      <div className="calendar-demo-row">
        <div className="calendar-demo-value">Range End: {calendarStore.rangeEndDate ? dateObjToKey(calendarStore.rangeEndDate) : '(null)'}</div>
      </div>
    </div>
  );
});

export const calendarExamples = {
  Calendar: {
    component: null,
    description: 'Date selector and date view with single, multiple, and range selection',
    example: () => <CalendarExamplesPanel />,
  },
};

