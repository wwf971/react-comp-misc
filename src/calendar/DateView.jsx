import { observer } from 'mobx-react-lite';
import './calendar.css';

const WEEKDAY_LABELS_MONDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_LABELS_SUNDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad2(value) {
  return String(value).padStart(2, '0');
}

function dateObjToKey(dateObj) {
  return `${dateObj.year}-${pad2(dateObj.month)}-${pad2(dateObj.day)}`;
}

function dateObjToJsDate(dateObj) {
  return new Date(dateObj.year, dateObj.month - 1, dateObj.day);
}

function jsDateToDateObj(jsDate) {
  return {
    year: jsDate.getFullYear(),
    month: jsDate.getMonth() + 1,
    day: jsDate.getDate(),
  };
}

function compareDateObj(a, b) {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

function buildDateRange(startDateObj, endDateObj) {
  const from = compareDateObj(startDateObj, endDateObj) <= 0 ? startDateObj : endDateObj;
  const to = compareDateObj(startDateObj, endDateObj) <= 0 ? endDateObj : startDateObj;
  const nextDates = [];
  const cursor = dateObjToJsDate(from);
  const end = dateObjToJsDate(to);
  while (cursor <= end) {
    nextDates.push(jsDateToDateObj(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return nextDates;
}

function normalizeRangeBoundaries(firstDateObj, secondDateObj) {
  if (compareDateObj(firstDateObj, secondDateObj) <= 0) {
    return { beginDate: firstDateObj, endDate: secondDateObj };
  }
  return { beginDate: secondDateObj, endDate: firstDateObj };
}

function getCalendarGridDates(visibleYear, visibleMonth, firstDayOfWeek) {
  const firstDate = new Date(visibleYear, visibleMonth - 1, 1);
  const firstDateDay = firstDate.getDay();
  const offset = firstDayOfWeek === 'monday' ? (firstDateDay + 6) % 7 : firstDateDay;
  const startDate = new Date(visibleYear, visibleMonth - 1, 1 - offset);

  const gridDates = [];
  for (let idx = 0; idx < 42; idx += 1) {
    const jsDate = new Date(startDate);
    jsDate.setDate(startDate.getDate() + idx);
    gridDates.push({
      ...jsDateToDateObj(jsDate),
      isInCurrentMonth: jsDate.getMonth() === visibleMonth - 1,
    });
  }
  return gridDates;
}

function buildNextSelection({
  selectionMode,
  selectedDates,
  selectedDateKeySet,
  rangeAnchorDate,
  rangeBeginDate,
  rangeEndDate,
  isRangeAllowSameDay,
  clickedDate,
  modifiers,
}) {
  if (selectionMode === 'single') {
    return {
      nextSelectedDates: [clickedDate],
      nextRangeAnchorDate: clickedDate,
    };
  }

  if (selectionMode === 'range') {
    const beginDate = rangeBeginDate || null;
    const endDate = rangeEndDate || null;
    const clickedDateKey = dateObjToKey(clickedDate);
    const beginDateKey = beginDate ? dateObjToKey(beginDate) : null;

    if (!beginDate) {
      return {
        nextSelectedDates: [clickedDate],
        nextRangeAnchorDate: clickedDate,
        nextRangeBeginDate: clickedDate,
        nextRangeEndDate: null,
      };
    }

    if (!endDate) {
      if (beginDateKey === clickedDateKey && !isRangeAllowSameDay) {
        return {
          nextSelectedDates: [],
          nextRangeAnchorDate: null,
          nextRangeBeginDate: null,
          nextRangeEndDate: null,
        };
      }
      const normalized = normalizeRangeBoundaries(beginDate, clickedDate);
      return {
        nextSelectedDates: buildDateRange(normalized.beginDate, normalized.endDate),
        nextRangeAnchorDate: normalized.beginDate,
        nextRangeBeginDate: normalized.beginDate,
        nextRangeEndDate: normalized.endDate,
      };
    }

    return {
      nextSelectedDates: [clickedDate],
      nextRangeAnchorDate: clickedDate,
      nextRangeBeginDate: clickedDate,
      nextRangeEndDate: null,
    };
  }

  const isShiftKeyPressed = !!modifiers.shift;
  const isCtrlKeyPressed = !!modifiers.ctrl || !!modifiers.meta;
  const hasRangeAnchor = !!rangeAnchorDate;

  if (isShiftKeyPressed && hasRangeAnchor) {
    return {
      nextSelectedDates: buildDateRange(rangeAnchorDate, clickedDate),
      nextRangeAnchorDate: clickedDate,
    };
  }

  if (isCtrlKeyPressed) {
    const clickedDateKey = dateObjToKey(clickedDate);
    const isAlreadySelected = selectedDateKeySet.has(clickedDateKey);
    const nextSelectedDates = isAlreadySelected
      ? selectedDates.filter((dateObj) => dateObjToKey(dateObj) !== clickedDateKey)
      : [...selectedDates, clickedDate];
    return {
      nextSelectedDates,
      nextRangeAnchorDate: clickedDate,
    };
  }

  return {
    nextSelectedDates: [clickedDate],
    nextRangeAnchorDate: clickedDate,
  };
}

const DateView = observer(({
  data,
  onDataChangeRequest,
  onSelectionChange,
  weekdayLabels,
}) => {
  const visibleYear = data?.visibleYear || new Date().getFullYear();
  const visibleMonth = data?.visibleMonth || new Date().getMonth() + 1;
  const selectedDates = Array.isArray(data?.selectedDates) ? data.selectedDates : [];
  const selectionMode = data?.selectionMode || 'single';
  const firstDayOfWeek = data?.firstDayOfWeek === 'sunday' ? 'sunday' : 'monday';
  const rangeAnchorDate = data?.rangeAnchorDate || null;
  const rangeBeginDate = data?.rangeBeginDate || null;
  const rangeEndDate = data?.rangeEndDate || null;
  const isRangeAllowSameDay = data?.isRangeAllowSameDay !== false;

  const selectedDatesForRender = selectionMode === 'range'
    ? (
      rangeBeginDate && rangeEndDate
        ? buildDateRange(rangeBeginDate, rangeEndDate)
        : (rangeBeginDate ? [rangeBeginDate] : (rangeEndDate ? [rangeEndDate] : []))
    )
    : selectedDates;

  const selectedDateKeySet = new Set(selectedDatesForRender.map((dateObj) => dateObjToKey(dateObj)));
  const cellDates = getCalendarGridDates(visibleYear, visibleMonth, firstDayOfWeek);
  const labels = weekdayLabels || (firstDayOfWeek === 'sunday' ? WEEKDAY_LABELS_SUNDAY : WEEKDAY_LABELS_MONDAY);
  const rangeStartDateKey = selectionMode === 'range' && rangeBeginDate ? dateObjToKey(rangeBeginDate) : null;
  const rangeEndDateKey = selectionMode === 'range' && rangeEndDate ? dateObjToKey(rangeEndDate) : null;

  const handleSelectionChangeAttempt = (nativeEvent, clickedDate) => {
    const nextSelection = buildNextSelection({
      selectionMode,
      selectedDates,
      selectedDateKeySet,
      rangeAnchorDate,
      rangeBeginDate,
      rangeEndDate,
      isRangeAllowSameDay,
      clickedDate,
      modifiers: {
        ctrl: nativeEvent.ctrlKey,
        shift: nativeEvent.shiftKey,
        meta: nativeEvent.metaKey,
      },
    });
    const changeParams = {
      clickedDate,
      selectionMode,
      nextSelectedDates: nextSelection.nextSelectedDates,
      nextRangeAnchorDate: nextSelection.nextRangeAnchorDate,
      nextRangeBeginDate: nextSelection.nextRangeBeginDate || null,
      nextRangeEndDate: nextSelection.nextRangeEndDate || null,
      modifiers: {
        ctrl: nativeEvent.ctrlKey,
        shift: nativeEvent.shiftKey,
        meta: nativeEvent.metaKey,
      },
    };
    if (onDataChangeRequest) onDataChangeRequest('selection-change', changeParams);
    if (onSelectionChange) {
      onSelectionChange(changeParams);
    }
  };

  const handleMonthMove = (monthDelta) => {
    if (!onDataChangeRequest) return;
    onDataChangeRequest('navigate-month', { monthDelta });
  };

  return (
    <div className="calendar-date-view">
      <div className="calendar-date-view-header">
        <button
          type="button"
          className="calendar-date-view-nav-button"
          onClick={() => handleMonthMove(-1)}
          aria-label="Previous month"
        >
          {'<'}
        </button>
        <div className="calendar-date-view-month-label">{visibleYear}-{pad2(visibleMonth)}</div>
        <button
          type="button"
          className="calendar-date-view-nav-button"
          onClick={() => handleMonthMove(1)}
          aria-label="Next month"
        >
          {'>'}
        </button>
      </div>

      <div className="calendar-date-view-weekdays">
        {labels.map((label) => (
          <div key={label} className="calendar-date-view-weekday-cell">{label}</div>
        ))}
      </div>

      <div className="calendar-date-view-grid">
        {cellDates.map((dateObj) => {
          const dateKey = dateObjToKey(dateObj);
          const isSelected = selectedDateKeySet.has(dateKey);
          const isRangeStart = rangeStartDateKey === dateKey;
          const isRangeEnd = rangeEndDateKey === dateKey;
          return (
            <button
              key={dateKey}
              type="button"
              className={[
                'calendar-date-view-day-cell',
                dateObj.isInCurrentMonth ? 'calendar-date-view-day-current-month' : 'calendar-date-view-day-other-month',
                isSelected ? 'calendar-date-view-day-selected' : '',
                isRangeStart ? 'calendar-date-view-day-range-start' : '',
                isRangeEnd ? 'calendar-date-view-day-range-end' : '',
              ].filter(Boolean).join(' ')}
              onClick={(event) => handleSelectionChangeAttempt(event, {
                year: dateObj.year,
                month: dateObj.month,
                day: dateObj.day,
              })}
            >
              {dateObj.day}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default DateView;

