function pad2(value) {
  return String(value).padStart(2, '0');
}

function dateObjToKey(dateObj) {
  return `${dateObj.year}-${pad2(dateObj.month)}-${pad2(dateObj.day)}`;
}

function parseDateToken(rawToken) {
  const token = (rawToken || '').trim();
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(token);
  if (!matched) return null;
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const jsDate = new Date(year, month - 1, day);
  if (
    jsDate.getFullYear() !== year
    || jsDate.getMonth() !== month - 1
    || jsDate.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
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
  const cursor = new Date(from.year, from.month - 1, from.day);
  const end = new Date(to.year, to.month - 1, to.day);
  while (cursor <= end) {
    nextDates.push({
      year: cursor.getFullYear(),
      month: cursor.getMonth() + 1,
      day: cursor.getDate(),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return nextDates;
}

export function parseSingleSelectionInput(inputText) {
  const rawText = (inputText || '').trim();
  if (rawText === '') {
    return {
      isValid: true,
      normalizedInputText: '',
      selectedDates: [],
      rangeBeginDate: null,
      rangeEndDate: null,
    };
  }
  const parsedDate = parseDateToken(rawText);
  if (!parsedDate) {
    return { isValid: false, errorText: 'Invalid single date. Expected YYYY-MM-DD.' };
  }
  return {
    isValid: true,
    normalizedInputText: dateObjToKey(parsedDate),
    selectedDates: [parsedDate],
    rangeBeginDate: parsedDate,
    rangeEndDate: null,
  };
}

export function parseMultipleSelectionInput(inputText) {
  const rawText = (inputText || '').trim();
  if (rawText === '') {
    return {
      isValid: true,
      normalizedInputText: '',
      selectedDates: [],
      rangeBeginDate: null,
      rangeEndDate: null,
    };
  }
  const rawTokens = rawText.split(',').map((item) => item.trim()).filter(Boolean);
  if (rawTokens.length === 0) {
    return {
      isValid: true,
      normalizedInputText: '',
      selectedDates: [],
      rangeBeginDate: null,
      rangeEndDate: null,
    };
  }
  const parsedDates = [];
  for (const token of rawTokens) {
    const parsedDate = parseDateToken(token);
    if (!parsedDate) {
      return { isValid: false, errorText: 'Invalid date list. Use YYYY-MM-DD, YYYY-MM-DD.' };
    }
    parsedDates.push(parsedDate);
  }
  const uniqueByKey = new Map(parsedDates.map((dateObj) => [dateObjToKey(dateObj), dateObj]));
  const selectedDates = [...uniqueByKey.values()];
  return {
    isValid: true,
    normalizedInputText: selectedDates.map((dateObj) => dateObjToKey(dateObj)).join(', '),
    selectedDates,
    rangeBeginDate: null,
    rangeEndDate: null,
  };
}

export function parseRangeSelectionInput(inputText, options = {}) {
  const isRangeAllowSameDay = options.isRangeAllowSameDay !== false;
  const rawText = (inputText || '').trim();
  if (rawText === '') {
    return {
      isValid: true,
      normalizedInputText: '',
      selectedDates: [],
      rangeBeginDate: null,
      rangeEndDate: null,
    };
  }

  const rangeParts = rawText.split('~');
  if (rangeParts.length !== 2) {
    return { isValid: false, errorText: 'Invalid range. Use YYYY-MM-DD ~ YYYY-MM-DD.' };
  }
  const leftText = rangeParts[0].trim();
  const rightText = rangeParts[1].trim();
  const beginDate = leftText ? parseDateToken(leftText) : null;
  const endDate = rightText ? parseDateToken(rightText) : null;
  if (leftText && !beginDate) {
    return { isValid: false, errorText: 'Invalid range begin date.' };
  }
  if (rightText && !endDate) {
    return { isValid: false, errorText: 'Invalid range end date.' };
  }
  if (!beginDate && !endDate) {
    return {
      isValid: true,
      normalizedInputText: '',
      selectedDates: [],
      rangeBeginDate: null,
      rangeEndDate: null,
    };
  }
  if (beginDate && endDate) {
    if (!isRangeAllowSameDay && compareDateObj(beginDate, endDate) === 0) {
      return { isValid: false, errorText: 'Same-day range is not allowed.' };
    }
    return {
      isValid: true,
      normalizedInputText: `${dateObjToKey(beginDate)} ~ ${dateObjToKey(endDate)}`,
      selectedDates: buildDateRange(beginDate, endDate),
      rangeBeginDate: beginDate,
      rangeEndDate: endDate,
    };
  }
  if (beginDate && !endDate) {
    return {
      isValid: true,
      normalizedInputText: `${dateObjToKey(beginDate)} ~`,
      selectedDates: [beginDate],
      rangeBeginDate: beginDate,
      rangeEndDate: null,
    };
  }
  return {
    isValid: true,
    normalizedInputText: `~ ${dateObjToKey(endDate)}`,
    selectedDates: [endDate],
    rangeBeginDate: null,
    rangeEndDate: endDate,
  };
}

