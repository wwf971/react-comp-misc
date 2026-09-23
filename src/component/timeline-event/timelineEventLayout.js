const timeMsHour = 60 * 60 * 1000;
const timeMsDay = 24 * timeMsHour;

function timeMsGet(value) {
  if (value instanceof Date) return value.getTime();
  const timeMs = new Date(value).getTime();
  return Number.isFinite(timeMs) ? timeMs : null;
}

function valueClamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function eventListNormalize(eventById = {}, eventIdList = []) {
  return eventIdList.flatMap((eventId, index) => {
    const eventData = eventById[eventId];
    if (!eventData) return [];
    const timeStartMs = timeMsGet(eventData.timeStart ?? eventData.start);
    const timeEndRawMs = timeMsGet(eventData.timeEnd ?? eventData.end);
    if (timeStartMs == null) return [];
    const timeEndMs = timeEndRawMs == null ? timeStartMs : Math.max(timeStartMs, timeEndRawMs);
    return [{
      ...eventData,
      id: String(eventData.id ?? eventId),
      indexSource: index,
      timeStartMs,
      timeEndMs,
    }];
  });
}

function timeRangeResolve(eventList = [], timeRange = {}) {
  const timeStartGivenMs = timeMsGet(timeRange.timeStart ?? timeRange.start);
  const timeEndGivenMs = timeMsGet(timeRange.timeEnd ?? timeRange.end);
  if (timeStartGivenMs != null && timeEndGivenMs != null && timeEndGivenMs > timeStartGivenMs) {
    return { timeStartMs: timeStartGivenMs, timeEndMs: timeEndGivenMs };
  }
  if (!eventList.length) {
    const timeStartMs = Date.now() - 12 * timeMsHour;
    return { timeStartMs, timeEndMs: timeStartMs + 24 * timeMsHour };
  }
  const timeMinMs = Math.min(...eventList.map((eventData) => eventData.timeStartMs));
  const timeMaxMs = Math.max(...eventList.map((eventData) => eventData.timeEndMs));
  const durationMs = Math.max(timeMsHour, timeMaxMs - timeMinMs);
  const paddingMs = Math.max(timeMsHour, durationMs * 0.12);
  return { timeStartMs: timeMinMs - paddingMs, timeEndMs: timeMaxMs + paddingMs };
}

function eventChannelLaneAssign(eventList = [], laneCount = 5) {
  const laneCountSafe = Math.max(1, Math.floor(Number(laneCount) || 5));
  const laneEndByIndex = Array.from({ length: laneCountSafe }, () => Number.NEGATIVE_INFINITY);
  return [...eventList]
    .sort((eventA, eventB) => eventA.timeStartMs - eventB.timeStartMs || eventA.timeEndMs - eventB.timeEndMs || eventA.indexSource - eventB.indexSource)
    .map((eventData) => {
      let laneIndex = laneEndByIndex.findIndex((timeEndMs) => timeEndMs <= eventData.timeStartMs);
      let isLaneShared = false;
      if (laneIndex < 0) {
        laneIndex = laneEndByIndex.indexOf(Math.min(...laneEndByIndex));
        isLaneShared = true;
      }
      laneEndByIndex[laneIndex] = Math.max(laneEndByIndex[laneIndex], eventData.timeEndMs);
      return { ...eventData, laneIndex, isLaneShared };
    });
}

function labelWidthEstimate(text, widthMax = 190) {
  const countWide = [...String(text || '')].reduce((sum, char) => sum + (/[^\u0000-\u00ff]/.test(char) ? 1 : 0.58), 0);
  return valueClamp(Math.round(countWide * 12 + 20), 72, Math.max(72, Number(widthMax) || 190));
}

function intervalOverlapGet(leftA, rightA, leftB, rightB, gap = 0) {
  return leftA < rightB + gap && rightA + gap > leftB;
}

function aggregationLevelResolve(levelList = [], durationMs = 0) {
  return [...levelList]
    .filter((levelData) => levelData && Number(durationMs) >= Math.max(0, Number(levelData.durationMinMs) || 0))
    .sort((levelA, levelB) => Number(levelB.durationMinMs || 0) - Number(levelA.durationMinMs || 0))[0] || null;
}

function timeBucketGet(timeMs, levelData = {}, offsetMinute = 0) {
  const unit = String(levelData.unit || 'day');
  const size = Math.max(1, Math.floor(Number(levelData.size) || 1));
  const offsetMs = Number(offsetMinute || 0) * 60 * 1000;
  const timeShiftedMs = timeMs + offsetMs;
  if (unit === 'minute' || unit === 'hour' || unit === 'day' || unit === 'week') {
    const durationUnitMs = unit === 'minute' ? 60 * 1000 : (unit === 'hour' ? timeMsHour : timeMsDay);
    const durationBucketMs = durationUnitMs * size * (unit === 'week' ? 7 : 1);
    const originMs = unit === 'week' ? Date.UTC(1970, 0, 5) : 0;
    const timeStartShiftedMs = Math.floor((timeShiftedMs - originMs) / durationBucketMs) * durationBucketMs + originMs;
    return {
      key: `${unit}:${timeStartShiftedMs}`,
      timeStartMs: timeStartShiftedMs - offsetMs,
      timeEndMs: timeStartShiftedMs + durationBucketMs - offsetMs - 1,
    };
  }
  const dateShifted = new Date(timeShiftedMs);
  const year = dateShifted.getUTCFullYear();
  const month = dateShifted.getUTCMonth();
  if (unit === 'halfMonth' || unit === 'half-month') {
    const isSecondHalf = dateShifted.getUTCDate() >= 16;
    const dayStart = isSecondHalf ? 16 : 1;
    const timeStartShiftedMs = Date.UTC(year, month, dayStart);
    const timeEndShiftedMs = isSecondHalf
      ? Date.UTC(year, month + 1, 1)
      : Date.UTC(year, month, 16);
    return {
      key: `halfMonth:${year}-${month}-${isSecondHalf ? 2 : 1}`,
      timeStartMs: timeStartShiftedMs - offsetMs,
      timeEndMs: timeEndShiftedMs - offsetMs - 1,
    };
  }
  if (unit === 'year') {
    const yearStart = Math.floor(year / size) * size;
    return {
      key: `year:${yearStart}`,
      timeStartMs: Date.UTC(yearStart, 0, 1) - offsetMs,
      timeEndMs: Date.UTC(yearStart + size, 0, 1) - offsetMs - 1,
    };
  }
  const monthAbsolute = year * 12 + month;
  const monthStartAbsolute = Math.floor(monthAbsolute / size) * size;
  const yearStart = Math.floor(monthStartAbsolute / 12);
  const monthStart = monthStartAbsolute - yearStart * 12;
  return {
    key: `month:${monthStartAbsolute}`,
    timeStartMs: Date.UTC(yearStart, monthStart, 1) - offsetMs,
    timeEndMs: Date.UTC(yearStart, monthStart + size, 1) - offsetMs - 1,
  };
}

function eventListAggregate(eventList = [], levelData = null, config = {}) {
  if (!levelData) return eventList;
  const countMin = Math.max(2, Math.floor(Number(config.countMin) || 2));
  const offsetMinute = Number(config.offsetMinute) || 0;
  const eventListByBucketKey = new Map();
  eventList.forEach((eventData) => {
    const bucketData = timeBucketGet(eventData.timeStartMs, levelData, offsetMinute);
    const groupData = eventListByBucketKey.get(bucketData.key) || { bucketData, eventList: [] };
    groupData.eventList.push(eventData);
    eventListByBucketKey.set(bucketData.key, groupData);
  });
  return [...eventListByBucketKey.values()].flatMap(({ bucketData, eventList: eventListMerged }) => {
    if (eventListMerged.length < countMin) return eventListMerged;
    const idLevel = String(levelData.id || levelData.unit || 'period');
    const eventIdListMerged = eventListMerged.map((eventData) => eventData.id);
    return [{
      id: `aggregate:${idLevel}:${bucketData.key}`,
      name: `${eventListMerged.length} events`,
      textSecondary: String(levelData.label || idLevel),
      timeStartMs: bucketData.timeStartMs,
      timeEndMs: bucketData.timeEndMs,
      indexSource: Math.min(...eventListMerged.map((eventData) => eventData.indexSource)),
      tone: eventListMerged[0]?.tone,
      color: eventListMerged[0]?.color,
      isAggregate: true,
      aggregationLevelId: idLevel,
      aggregationUnit: String(levelData.unit || idLevel),
      eventIdListMerged,
      eventListMerged,
    }];
  });
}

function eventScreenLayoutGet({
  eventList = [],
  timeStartMs,
  timeEndMs,
  width,
  laneCountEvent = 5,
  labelWidthMax = 190,
  labelGap = 8,
  labelAnchorOffset = 2,
} = {}) {
  const widthSafe = Math.max(1, Number(width) || 1);
  const durationMs = Math.max(1, Number(timeEndMs) - Number(timeStartMs));
  const eventVisibleList = eventList.filter((eventData) => eventData.timeEndMs >= timeStartMs && eventData.timeStartMs <= timeEndMs);
  const eventLaneList = eventChannelLaneAssign(eventVisibleList, laneCountEvent).map((eventData) => {
    const timeStartClippedMs = valueClamp(eventData.timeStartMs, timeStartMs, timeEndMs);
    const timeEndClippedMs = valueClamp(eventData.timeEndMs, timeStartMs, timeEndMs);
    const xStart = ((timeStartClippedMs - timeStartMs) / durationMs) * widthSafe;
    const xEndRaw = ((timeEndClippedMs - timeStartMs) / durationMs) * widthSafe;
    const widthEvent = Math.max(5, xEndRaw - xStart);
    return {
      ...eventData,
      xStart: valueClamp(xStart, 0, widthSafe),
      xEnd: valueClamp(Math.max(xStart + widthEvent, xEndRaw), 0, widthSafe),
      xAnchor: valueClamp((xStart + xEndRaw) / 2, 0, widthSafe),
    };
  });

  const rectListByLane = [];
  return [...eventLaneList]
    .sort((eventA, eventB) => eventA.xAnchor - eventB.xAnchor || eventA.indexSource - eventB.indexSource)
    .map((eventData) => {
      const widthLabel = Math.min(labelWidthEstimate(eventData.name ?? eventData.label, labelWidthMax), Math.max(40, widthSafe));
      const leftLabel = eventData.xAnchor - Math.max(0, Number(labelAnchorOffset) || 0);
      let laneLabelIndex = rectListByLane.findIndex((rectList) => (
        !rectList.some((rect) => intervalOverlapGet(leftLabel, leftLabel + widthLabel, rect.left, rect.right, labelGap))
      ));
      if (laneLabelIndex < 0) {
        laneLabelIndex = rectListByLane.length;
        rectListByLane.push([]);
      }
      rectListByLane[laneLabelIndex].push({ left: leftLabel, right: leftLabel + widthLabel });
      return {
        ...eventData,
        laneLabelIndex,
        leftLabel,
        widthLabel,
        xLabelAnchor: eventData.xAnchor,
      };
    });
}

export {
  aggregationLevelResolve,
  eventListAggregate,
  eventListNormalize,
  eventScreenLayoutGet,
  timeMsGet,
  timeRangeResolve,
};
