import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import {
  aggregationLevelResolve,
  eventListAggregate,
  eventListNormalize,
  eventScreenLayoutGet,
  timeRangeResolve,
} from './timelineEventLayout.js';
import './timelineEvent.css';

const TimelineEvent = observer(function TimelineEvent({ data = {}, config = {}, onEvent }) {
  const rootRef = useRef(null);
  const timelineElRef = useRef(null);
  const labelViewportRef = useRef(null);
  const timelineRef = useRef(null);
  const onEventRef = useRef(onEvent);
  const wheelZoomHandleRef = useRef(null);
  const isRangeChangingRef = useRef(false);
  const aggregateHoverTimerRef = useRef(null);
  const labelPanRef = useRef(null);
  const [widthRoot, widthRootSet] = useState(1);
  const [scrollLabelTop, scrollLabelTopSet] = useState(0);
  const [aggregateHoverData, aggregateHoverDataSet] = useState(null);

  const eventList = useMemo(
    () => eventListNormalize(data.eventById, data.eventIdList),
    [data.eventById, data.eventIdList],
  );
  const timeRange = timeRangeResolve(eventList, data.timeRange);
  const durationRangeMs = timeRange.timeEndMs - timeRange.timeStartMs;
  const aggregationConfig = config.aggregation || {};
  const aggregationLevel = config.isAggregationEnabled === true
    ? aggregationLevelResolve(aggregationConfig.levelList, durationRangeMs)
    : null;
  const eventDisplayList = useMemo(
    () => eventListAggregate(eventList, aggregationLevel, aggregationConfig),
    [aggregationConfig, aggregationLevel, eventList],
  );
  const heightBase = Math.max(220, Number(config.height) || 330);
  const topChannel = Math.max(42, Number(config.topChannel) || 62);
  const laneCountEvent = Math.max(1, Number(config.laneCountEvent) || 5);
  const labelVariant = labelVariantResolve(config.labelVariant);
  const labelStyle = labelStyleByVariant[labelVariant];
  const heightBar = Math.max(2, Number(config.heightBar) || 3);
  const heightBarAggregate = Math.max(heightBar, Number(config.heightBarAggregate) || 12);
  const gapBar = Math.max(1, Number(config.gapBar) || 2);
  const heightChannel = laneCountEvent * heightBar + (laneCountEvent - 1) * gapBar + 8;
  const gapChannelLabel = Math.max(2, Number(config.gapChannelLabel) || 8);
  const topLabel = topChannel + heightChannel + gapChannelLabel;
  const heightLabelLane = Math.max(labelStyle.height + 5, Number(config.heightLabelLane) || labelStyle.heightLane);
  const isLocked = config.isLocked === true;
  const eventLayoutList = useMemo(() => eventScreenLayoutGet({
    eventList: eventDisplayList,
    timeStartMs: timeRange.timeStartMs,
    timeEndMs: timeRange.timeEndMs,
    width: widthRoot,
    laneCountEvent,
    labelWidthMax: config.widthLabelMax,
    labelGap: config.gapLabel,
    labelAnchorOffset: labelStyle.anchorOffset,
  }), [
    config.gapLabel,
    config.widthLabelMax,
    eventDisplayList,
    labelStyle.anchorOffset,
    laneCountEvent,
    timeRange.timeEndMs,
    timeRange.timeStartMs,
    widthRoot,
  ]);
  const laneCountLabelUsed = Math.max(1, ...eventLayoutList.map((eventData) => eventData.laneLabelIndex + 1));
  const heightLabelContent = laneCountLabelUsed * heightLabelLane;
  const isLabelChannelHeightLimited = config.isLabelChannelHeightLimited === true;
  const heightLabelChannelMax = Math.max(heightLabelLane, Number(config.heightLabelChannelMax) || 150);
  const heightLabelViewport = isLabelChannelHeightLimited
    ? Math.min(heightLabelContent, heightLabelChannelMax)
    : heightLabelContent;
  const height = isLabelChannelHeightLimited
    ? topLabel + heightLabelViewport + 12
    : Math.max(heightBase, topLabel + heightLabelViewport + 12);
  const tickList = useMemo(
    () => timeTickListGet(timeRange.timeStartMs, timeRange.timeEndMs, widthRoot),
    [timeRange.timeEndMs, timeRange.timeStartMs, widthRoot],
  );

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (labelViewportRef.current) labelViewportRef.current.scrollTop = 0;
    scrollLabelTopSet(0);
    aggregateHoverDataSet(null);
  }, [isLabelChannelHeightLimited, aggregationLevel?.id, data.eventIdList]);

  useEffect(() => () => clearTimeout(aggregateHoverTimerRef.current), []);

  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return undefined;
    const widthUpdate = () => {
      widthRootSet(Math.max(1, Math.round(rootEl.clientWidth)));
      timelineRef.current?.redraw();
    };
    widthUpdate();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', widthUpdate);
      return () => window.removeEventListener('resize', widthUpdate);
    }
    const observerResize = new ResizeObserver(widthUpdate);
    observerResize.observe(rootEl);
    return () => observerResize.disconnect();
  }, []);

  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return undefined;
    const wheelHandle = (event) => wheelZoomHandleRef.current?.(event);
    rootEl.addEventListener('wheel', wheelHandle, { capture: true, passive: false });
    return () => rootEl.removeEventListener('wheel', wheelHandle, { capture: true });
  }, []);

  useEffect(() => {
    if (!timelineElRef.current) return undefined;
    const itemDataSet = new DataSet([]);
    const timeline = new Timeline(timelineElRef.current, itemDataSet, {
      start: new Date(timeRange.timeStartMs),
      end: new Date(timeRange.timeEndMs),
      min: config.timeMin ? new Date(config.timeMin) : undefined,
      max: config.timeMax ? new Date(config.timeMax) : undefined,
      height,
      orientation: 'top',
      stack: false,
      selectable: false,
      moveable: !isLocked,
      zoomable: !isLocked,
      zoomKey: '',
      zoomMin: Math.max(60 * 1000, Number(config.zoomMinMs) || 15 * 60 * 1000),
      zoomMax: Math.max(60 * 60 * 1000, Number(config.zoomMaxMs) || 1000 * 24 * 60 * 60 * 1000),
      showCurrentTime: config.isCurrentTimeVisible === true,
      format: timelineFormat,
      locale: config.locale || 'ja',
    });
    timelineRef.current = timeline;

    const rangeEmit = (properties, isFinal) => {
      const timeStart = new Date(properties.start);
      const timeEnd = new Date(properties.end);
      const durationMs = Math.max(0, timeEnd.getTime() - timeStart.getTime());
      isRangeChangingRef.current = !isFinal;
      onEventRef.current?.('timeRangeChange', {
        timeStart,
        timeEnd,
        durationMs,
        isFinal,
      });
    };
    const rangeChangeHandle = (properties) => rangeEmit(properties, false);
    const rangeChangedHandle = (properties) => rangeEmit(properties, true);
    const clickHandle = (properties) => {
      if (properties.what === 'background') onEventRef.current?.('eventSelect', { eventId: '' });
    };
    timeline.on('rangechange', rangeChangeHandle);
    timeline.on('rangechanged', rangeChangedHandle);
    timeline.on('click', clickHandle);
    return () => {
      timeline.off('rangechange', rangeChangeHandle);
      timeline.off('rangechanged', rangeChangedHandle);
      timeline.off('click', clickHandle);
      timeline.destroy();
      timelineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    timeline.setOptions({
      height,
      moveable: !isLocked,
      zoomable: !isLocked,
      showCurrentTime: config.isCurrentTimeVisible === true,
    });
  }, [config.isCurrentTimeVisible, height, isLocked]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline || isRangeChangingRef.current) return;
    const rangeCurrent = timeline.getWindow();
    const differenceMs = Math.abs(rangeCurrent.start.getTime() - timeRange.timeStartMs)
      + Math.abs(rangeCurrent.end.getTime() - timeRange.timeEndMs);
    if (differenceMs > 2) {
      timeline.setWindow(new Date(timeRange.timeStartMs), new Date(timeRange.timeEndMs), { animation: false });
    }
  }, [timeRange.timeEndMs, timeRange.timeStartMs]);

  const eventSelect = (eventId) => {
    if (isLocked) return;
    onEventRef.current?.('eventSelect', { eventId });
  };

  const wheelZoomHandle = (event) => {
    if (isLocked || !timelineRef.current || !rootRef.current) return;
    const labelViewport = event.target instanceof Element
      ? event.target.closest('.timeline-event-label-viewport')
      : null;
    if (isLabelChannelHeightLimited && labelViewport && labelViewport.scrollHeight > labelViewport.clientHeight) return;
    event.preventDefault();
    event.stopPropagation();
    const rangeCurrent = timelineRef.current.getWindow();
    const durationCurrentMs = Math.max(1, rangeCurrent.end.getTime() - rangeCurrent.start.getTime());
    const zoomMinMs = Math.max(60 * 1000, Number(config.zoomMinMs) || 15 * 60 * 1000);
    const zoomMaxMs = Math.max(60 * 60 * 1000, Number(config.zoomMaxMs) || 1000 * 24 * 60 * 60 * 1000);
    const factor = Math.exp(Math.max(-240, Math.min(240, event.deltaY)) * 0.0018);
    const durationNextMs = Math.max(zoomMinMs, Math.min(zoomMaxMs, durationCurrentMs * factor));
    const rect = rootRef.current.getBoundingClientRect();
    const ratioPointer = Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width)));
    const timeAnchorMs = rangeCurrent.start.getTime() + durationCurrentMs * ratioPointer;
    const timeStartNextMs = timeAnchorMs - durationNextMs * ratioPointer;
    timelineRef.current.setWindow(
      new Date(timeStartNextMs),
      new Date(timeStartNextMs + durationNextMs),
      { animation: false },
    );
  };
  wheelZoomHandleRef.current = wheelZoomHandle;

  const aggregateHoverOpen = (eventData, element) => {
    clearTimeout(aggregateHoverTimerRef.current);
    const rect = element.getBoundingClientRect();
    aggregateHoverDataSet({
      eventData,
      left: Math.max(8, Math.min(window.innerWidth - 292, rect.left)),
      top: Math.min(window.innerHeight - 12, rect.bottom + 5),
    });
  };

  const aggregateHoverCloseSchedule = () => {
    clearTimeout(aggregateHoverTimerRef.current);
    aggregateHoverTimerRef.current = setTimeout(() => aggregateHoverDataSet(null), 120);
  };

  const aggregateHoverKeep = () => clearTimeout(aggregateHoverTimerRef.current);

  const labelChannelPointerDown = (event) => {
    if (isLocked || event.button !== 0 || event.target.closest('.timeline-event-label')) return;
    const viewport = event.currentTarget;
    const rect = viewport.getBoundingClientRect();
    const widthScrollbar = Math.max(0, viewport.offsetWidth - viewport.clientWidth);
    if (widthScrollbar > 0 && event.clientX >= rect.right - widthScrollbar) return;
    const rangeCurrent = timelineRef.current?.getWindow();
    if (!rangeCurrent) return;
    labelPanRef.current = {
      pointerId: event.pointerId,
      xStart: event.clientX,
      timeStartMs: rangeCurrent.start.getTime(),
      timeEndMs: rangeCurrent.end.getTime(),
      isMoved: false,
    };
    viewport.setPointerCapture(event.pointerId);
  };

  const labelChannelPointerMove = (event) => {
    const panData = labelPanRef.current;
    if (!panData || panData.pointerId !== event.pointerId || !timelineRef.current) return;
    const distanceX = event.clientX - panData.xStart;
    if (Math.abs(distanceX) > 2) panData.isMoved = true;
    if (!panData.isMoved) return;
    event.preventDefault();
    const durationMs = panData.timeEndMs - panData.timeStartMs;
    const timeOffsetMs = -(distanceX / Math.max(1, widthRoot)) * durationMs;
    timelineRef.current.setWindow(
      new Date(panData.timeStartMs + timeOffsetMs),
      new Date(panData.timeEndMs + timeOffsetMs),
      { animation: false },
    );
  };

  const labelChannelPointerEnd = (event) => {
    const panData = labelPanRef.current;
    if (!panData || panData.pointerId !== event.pointerId) return;
    labelPanRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!panData.isMoved) {
      aggregateHoverDataSet(null);
      onEventRef.current?.('eventSelect', { eventId: '' });
    }
  };

  const emptySpaceClick = (event) => {
    if (event.target instanceof Element && event.target.closest('.timeline-event-label, .timeline-event-bar')) return;
    aggregateHoverDataSet(null);
    onEventRef.current?.('eventSelect', { eventId: '' });
  };

  return (
    <div
      ref={rootRef}
      className={`timeline-event-root${isLocked ? ' is-locked' : ''}${isLabelChannelHeightLimited ? ' is-label-height-limited' : ''}`}
      style={{ height: `${height}px`, '--timeline-event-channel-top': `${topChannel}px`, '--timeline-event-channel-height': `${heightChannel}px` }}
      onClick={emptySpaceClick}
    >
      <div ref={timelineElRef} className="timeline-event-vis" />
      <div className="timeline-event-overlay">
        <div className="timeline-event-axis-major">{timeRangeLabelGet(timeRange.timeStartMs, timeRange.timeEndMs)}</div>
        <div className="timeline-event-axis" style={{ height: `${Math.max(24, topChannel - 27)}px` }}>
          {tickList.map((tickData) => (
            <div key={tickData.timeMs} className="timeline-event-axis-tick" style={{ left: `${tickData.x}px` }}>
              <span>{tickData.label}</span>
            </div>
          ))}
        </div>
        <div className="timeline-event-channel" />
        <svg className="timeline-event-connectors" width={widthRoot} height={height} aria-hidden="true">
          {eventLayoutList.map((eventData) => {
            const heightBarCurrent = eventData.isAggregate ? heightBarAggregate : heightBar;
            const yAnchor = topChannel + 4 + eventData.laneIndex * (heightBar + gapBar) + heightBarCurrent;
            const yLabel = topLabel + eventData.laneLabelIndex * heightLabelLane - scrollLabelTop;
            if (yLabel + labelStyle.height < topLabel || yLabel > topLabel + heightLabelViewport) return null;
            const yConnectorEnd = Math.max(
              topLabel + 1,
              Math.min(topLabel + heightLabelViewport - 1, yLabel + labelStyle.connectorEndOffset),
            );
            return (
              <line
                key={eventData.id}
                className={`timeline-event-connector${String(data.eventIdSelected || '') === eventData.id ? ' is-selected' : ''}`}
                x1={eventData.xLabelAnchor}
                y1={yAnchor}
                x2={eventData.xLabelAnchor}
                y2={yConnectorEnd}
              />
            );
          })}
        </svg>
        {eventLayoutList.map((eventData) => {
          const isSelected = String(data.eventIdSelected || '') === eventData.id;
          const color = eventData.color || colorToneGet(eventData.tone);
          const heightBarCurrent = eventData.isAggregate ? heightBarAggregate : heightBar;
          return (
            <button
              key={`bar-${eventData.id}`}
              type="button"
              className={`timeline-event-bar${isSelected ? ' is-selected' : ''}${eventData.isLaneShared && !eventData.isAggregate ? ' is-shared' : ''}${eventData.isAggregate ? ' is-aggregate' : ''}`}
              style={{
                left: `${eventData.xStart}px`,
                top: `${topChannel + 4 + eventData.laneIndex * (heightBar + gapBar)}px`,
                width: `${Math.max(5, eventData.xEnd - eventData.xStart)}px`,
                height: `${heightBarCurrent}px`,
                '--timeline-event-color': color,
              }}
              title={`${eventData.name || eventData.label || eventData.id}\n${timeTextGet(eventData)}`}
              aria-label={eventData.isAggregate ? `${eventData.eventIdListMerged.length} merged events` : (eventData.name || eventData.label || eventData.id)}
              onClick={(event) => {
                event.stopPropagation();
                if (eventData.isAggregate) {
                  onEventRef.current?.('aggregateSelect', {
                    aggregationId: eventData.id,
                    eventIdList: eventData.eventIdListMerged,
                  });
                } else eventSelect(eventData.id);
              }}
            >
              {eventData.isAggregate ? (
                <span className="timeline-event-bar-range-text">
                  {aggregationRangeTextGet(eventData, aggregationConfig.offsetMinute, config.locale)}
                </span>
              ) : null}
            </button>
          );
        })}
        <div
          ref={labelViewportRef}
          className="timeline-event-label-viewport"
          style={{ top: `${topLabel}px`, height: `${heightLabelViewport}px` }}
          onScroll={(event) => scrollLabelTopSet(event.currentTarget.scrollTop)}
          onPointerDown={labelChannelPointerDown}
          onPointerMove={labelChannelPointerMove}
          onPointerUp={labelChannelPointerEnd}
          onPointerCancel={labelChannelPointerEnd}
        >
          <div className="timeline-event-label-content-area" style={{ height: `${heightLabelContent}px` }}>
            {eventLayoutList.map((eventData) => {
              const isSelected = String(data.eventIdSelected || '') === eventData.id;
              const label = String(eventData.name || eventData.label || eventData.id);
              const textSecondary = String(eventData.textSecondary || timeTextGet(eventData));
              const color = eventData.color || colorToneGet(eventData.tone);
              return (
                <button
                  key={`label-${eventData.id}`}
                  type="button"
                  className={`timeline-event-label is-${labelVariant}${isSelected ? ' is-selected' : ''}${eventData.isAggregate ? ' is-aggregate' : ''}`}
                  style={{
                    left: `${eventData.leftLabel}px`,
                    top: `${eventData.laneLabelIndex * heightLabelLane}px`,
                    width: `${eventData.widthLabel}px`,
                    height: `${labelStyle.height}px`,
                    '--timeline-event-color': color,
                  }}
                  title={eventData.isAggregate ? undefined : `${label}\n${textSecondary}`}
                  onMouseEnter={(event) => {
                    if (eventData.isAggregate) aggregateHoverOpen(eventData, event.currentTarget);
                  }}
                  onMouseLeave={() => {
                    if (eventData.isAggregate) aggregateHoverCloseSchedule();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (eventData.isAggregate) {
                      onEventRef.current?.('aggregateSelect', {
                        aggregationId: eventData.id,
                        eventIdList: eventData.eventIdListMerged,
                      });
                    } else eventSelect(eventData.id);
                  }}
                >
                  <span className="timeline-event-label-mark" />
                  <span className="timeline-event-label-content">
                    <span className="timeline-event-label-main">{eventData.isAggregate ? eventData.eventIdListMerged.length : label}</span>
                    {eventData.isAggregate
                      ? <span className="timeline-event-label-aggregate-unit">events</span>
                      : (config.isTimeTextVisible === false || labelVariant === 'compactDot' ? null : <span className="timeline-event-label-secondary">{textSecondary}</span>)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {!eventLayoutList.length ? <div className="timeline-event-empty">表示範囲にイベントがありません</div> : null}
      </div>
      {aggregateHoverData && typeof document !== 'undefined' ? createPortal(
        <div
          className="timeline-event-aggregate-panel"
          style={{ left: `${aggregateHoverData.left}px`, top: `${aggregateHoverData.top}px` }}
          onMouseEnter={aggregateHoverKeep}
          onMouseLeave={aggregateHoverCloseSchedule}
        >
          <div className="timeline-event-aggregate-panel-title">
            {aggregateHoverData.eventData.eventListMerged.length} events in this period
          </div>
          <div className="timeline-event-aggregate-panel-list">
            {aggregateHoverData.eventData.eventListMerged.map((eventData) => (
              <div key={eventData.id} className="timeline-event-aggregate-panel-item">
                <span style={{ '--timeline-event-color': eventData.color || colorToneGet(eventData.tone) }} />
                <div>
                  <strong>{eventData.name || eventData.label || eventData.id}</strong>
                  <small>{eventData.textSecondary || timeTextGet(eventData)}</small>
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
});

const timelineFormat = {
  minorLabels: {
    millisecond: 'HH:mm:ss.SSS',
    second: 'HH:mm:ss',
    minute: 'HH:mm',
    hour: 'H:mm',
    weekday: 'M/D(ddd)',
    day: 'M/D',
    week: 'M/D',
    month: 'M月',
    year: 'YYYY',
  },
  majorLabels: {
    millisecond: 'YYYY/M/D',
    second: 'YYYY/M/D',
    minute: 'YYYY/M/D',
    hour: 'YYYY/M/D',
    weekday: 'YYYY年M月',
    day: 'YYYY年M月',
    week: 'YYYY年M月',
    month: 'YYYY年',
    year: '',
  },
};

const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function timeTextGet(eventData) {
  const textStart = timeFormatter.format(new Date(eventData.timeStartMs));
  if (eventData.timeEndMs <= eventData.timeStartMs) return textStart;
  return `${textStart}–${timeFormatter.format(new Date(eventData.timeEndMs))}`;
}

function colorToneGet(tone) {
  if (tone === 'green') return '#27866f';
  if (tone === 'amber') return '#b47519';
  if (tone === 'purple') return '#7759a8';
  if (tone === 'red') return '#b84e5a';
  return '#3975a8';
}

function aggregationRangeTextGet(eventData, offsetMinute = 0, locale = 'ja') {
  const offsetMs = (Number(offsetMinute) || 0) * 60 * 1000;
  const dateStart = new Date(eventData.timeStartMs + offsetMs);
  const dateEnd = new Date(eventData.timeEndMs + offsetMs);
  const unit = String(eventData.aggregationUnit || eventData.aggregationLevelId || '');
  const format = (date, options) => new Intl.DateTimeFormat(locale || 'ja', {
    ...options,
    timeZone: 'UTC',
  }).format(date);
  if (unit === 'day') return format(dateStart, { month: 'numeric', day: 'numeric' });
  if (unit === 'week') {
    const startText = format(dateStart, { month: 'numeric', day: 'numeric' });
    const endText = format(dateEnd, { month: 'numeric', day: 'numeric' });
    return `${startText}–${endText}`;
  }
  if (unit === 'halfMonth' || unit === 'half-month') {
    const monthText = format(dateStart, { month: 'short' });
    return `${monthText}${dateStart.getUTCDate() >= 16 ? '後半' : '前半'}`;
  }
  if (unit === 'month') return format(dateStart, { month: 'short' });
  if (unit === 'year') return format(dateStart, { year: 'numeric' });
  const startText = format(dateStart, { month: 'numeric', day: 'numeric' });
  const endText = format(dateEnd, { month: 'numeric', day: 'numeric' });
  return startText === endText ? startText : `${startText}–${endText}`;
}

const labelStyleByVariant = {
  detailEdge: { anchorOffset: 2.5, connectorEndOffset: 1, height: 31, heightLane: 40 },
  compactDot: { anchorOffset: 5, connectorEndOffset: 6, height: 20, heightLane: 27 },
  compactTime: { anchorOffset: 5, connectorEndOffset: 8, height: 25, heightLane: 33 },
};

function labelVariantResolve(value) {
  return Object.prototype.hasOwnProperty.call(labelStyleByVariant, value) ? value : 'detailEdge';
}

const tickIntervalMsList = [
  60 * 1000,
  5 * 60 * 1000,
  15 * 60 * 1000,
  30 * 60 * 1000,
  60 * 60 * 1000,
  2 * 60 * 60 * 1000,
  3 * 60 * 60 * 1000,
  6 * 60 * 60 * 1000,
  12 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  2 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  14 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
  90 * 24 * 60 * 60 * 1000,
  365 * 24 * 60 * 60 * 1000,
];

const tickTimeFormatter = new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit' });
const tickDateTimeFormatter = new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit' });
const tickDateFormatter = new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric' });
const rangeDateFormatter = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });

function timeTickListGet(timeStartMs, timeEndMs, width) {
  const durationMs = Math.max(1, timeEndMs - timeStartMs);
  const tickCountTarget = Math.max(2, Math.floor(Math.max(1, width) / 92));
  const intervalIdealMs = durationMs / tickCountTarget;
  const intervalMs = tickIntervalMsList.find((value) => value >= intervalIdealMs) || tickIntervalMsList[tickIntervalMsList.length - 1];
  const timeFirstMs = Math.ceil(timeStartMs / intervalMs) * intervalMs;
  const tickList = [];
  for (let timeMs = timeFirstMs; timeMs <= timeEndMs && tickList.length < 100; timeMs += intervalMs) {
    const date = new Date(timeMs);
    const label = intervalMs < 24 * 60 * 60 * 1000
      ? (durationMs <= 24 * 60 * 60 * 1000 ? tickTimeFormatter.format(date) : tickDateTimeFormatter.format(date))
      : tickDateFormatter.format(date);
    tickList.push({
      timeMs,
      x: ((timeMs - timeStartMs) / durationMs) * Math.max(1, width),
      label,
    });
  }
  return tickList;
}

function timeRangeLabelGet(timeStartMs, timeEndMs) {
  const startText = rangeDateFormatter.format(new Date(timeStartMs));
  const endText = rangeDateFormatter.format(new Date(timeEndMs));
  return startText === endText ? startText : `${startText} – ${endText}`;
}

export default TimelineEvent;
