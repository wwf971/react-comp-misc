import React, { useLayoutEffect, useRef, useState } from 'react';
import { normalizeSegmentedControlProps } from './segmentedControlPropsNormalize.js';
import './SegmentedControl.css';

const SegmentedControl = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const normalized = normalizeSegmentedControlProps({ data, config, onEvent });
  const {
    valueSelected,
    segList,
    isDisabled,
    colorHighlight,
    widthModeSegment,
    durationTransitionMs,
    compResolveFn,
    classNameTrack,
    onEvent: emitEvent,
  } = normalized;

  const isAutoWidthMode = widthModeSegment === 'auto';
  const count = segList.length;
  const selectedIndex = segList.findIndex((segment) => segment.value === valueSelected);
  const hasSelection = selectedIndex >= 0 && count > 0;
  const trackRef = useRef(null);
  const itemRefs = useRef([]);
  const [highlightMetrics, setHighlightMetrics] = useState({ left: 2, width: 0 });

  useLayoutEffect(() => {
    if (!isAutoWidthMode || !hasSelection) {
      return;
    }
    const selectedButton = itemRefs.current[selectedIndex];
    const trackElement = trackRef.current;
    if (!selectedButton || !trackElement) {
      return;
    }
    const nextLeft = Number(selectedButton.offsetLeft || 0);
    const nextWidth = Number(selectedButton.offsetWidth || 0);
    setHighlightMetrics((metricsPrev) => {
      if (metricsPrev.left === nextLeft && metricsPrev.width === nextWidth) {
        return metricsPrev;
      }
      return { left: nextLeft, width: nextWidth };
    });
  }, [count, hasSelection, isAutoWidthMode, selectedIndex, segList]);

  const trackClassName = [
    'segmented-control-track',
    isDisabled ? 'is-disabled' : '',
    classNameTrack,
  ].filter(Boolean).join(' ');

  const widthModeClass = isAutoWidthMode ? 'width-mode-auto' : 'width-mode-equal';

  const trackStyle = {
    '--segment-control-color-highlight': colorHighlight,
    '--segment-control-duration-transition-ms': `${durationTransitionMs}ms`,
    '--segment-control-segment-count': String(Math.max(count, 1)),
    '--segment-control-highlight-index': String(Math.max(selectedIndex, 0)),
    ...(isAutoWidthMode ? {
      '--segment-control-highlight-left': `${highlightMetrics.left}px`,
      '--segment-control-highlight-width': `${Math.max(0, Number(highlightMetrics.width || 0))}px`,
    } : {}),
  };

  const resolveSegmentContent = (segment, isSelected) => {
    const colorTextSelected = isSelected ? '#ffffff' : '#475569';
    if (segment.compName && compResolveFn) {
      const CustomComp = compResolveFn(segment.compName);
      if (CustomComp) {
        const compProps = {
          value: segment.value,
          isSelected,
          isDisabled,
          colorTextSelected,
        };
        if (typeof CustomComp === 'function') {
          return <CustomComp {...compProps} />;
        }
        return React.cloneElement(CustomComp, compProps);
      }
    }
    return segment.labelText;
  };

  return (
    <div
      ref={trackRef}
      className={trackClassName}
      style={trackStyle}
      role="radiogroup"
      aria-disabled={isDisabled ? true : undefined}
    >
      {count > 0 ? (
        <span
          className={`segmented-control-highlight ${widthModeClass}${hasSelection ? ' is-visible' : ''}`}
          aria-hidden
        />
      ) : null}
      {segList.map((segment, segmentIndex) => {
        const isSelected = valueSelected === segment.value;
        return (
          <button
            key={String(segment.value)}
            ref={(element) => { itemRefs.current[segmentIndex] = element; }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            className={`segmented-control-segment ${widthModeClass}${isSelected ? ' is-selected' : ' is-unselected'}`}
            onClick={() => {
              if (isDisabled || !emitEvent) {
                return;
              }
              if (segment.value === valueSelected) {
                return;
              }
              emitEvent('valueSelectedChange', {
                valueSelected: segment.value,
                valuePrev: valueSelected,
                segmentIndex,
              });
            }}
          >
            {resolveSegmentContent(segment, isSelected)}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
