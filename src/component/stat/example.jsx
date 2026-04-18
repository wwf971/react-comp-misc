import React, { useMemo, useState } from 'react';
import Radar from './Radar.jsx';
import BoolSlider from '../button/BoolSlider.jsx';
import './example.css';

const DEFAULT_AXIS_ITEMS = [
  { id: 'speed', label: 'Speed', min: 0, max: 100, value: 76, component: 'tag' },
  { id: 'quality', label: 'Quality', min: 0, max: 10, value: 8, component: 'badge' },
  { id: 'cost', label: 'Cost', min: 0, max: 500, value: 220, component: 'tag' },
  { id: 'stability', label: 'Stability', min: 0, max: 1, value: 0.72, component: 'plain' },
  { id: 'growth', label: 'Growth', min: -20, max: 120, value: 64, component: 'badge' },
];

function toSafeNumber(input, fallback) {
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function createAxisByIndex(index) {
  const indexBase = index + 1;
  return {
    id: `axis-${indexBase}`,
    label: `Axis ${indexBase}`,
    min: 0,
    max: 100,
    value: 50,
    component: index % 2 === 0 ? 'tag' : 'plain',
  };
}

function keepAxisCount(list, count) {
  if (list.length === count) return list;
  if (list.length > count) return list.slice(0, count);
  const extra = Array.from({ length: count - list.length }, (_, index) => createAxisByIndex(list.length + index));
  return [...list, ...extra];
}

function formatAxisNumber(input) {
  const numeric = Number(input);
  if (!Number.isFinite(numeric)) return String(input ?? '');
  if (Number.isInteger(numeric)) return String(numeric);
  return numeric.toFixed(2);
}

const CornerTag = ({ axis }) => (
  <div className="radar-demo-corner-tag">{axis.label}</div>
);

const CornerBadge = ({ axis }) => (
  <div className="radar-demo-corner-badge">
    <span className="radar-demo-corner-badge-text">{axis.label}</span>
    <span className="radar-demo-corner-badge-value">{formatAxisNumber(axis.value)}</span>
  </div>
);

const CornerPlain = ({ axis }) => (
  <div className="radar-demo-corner-plain">{axis.label}</div>
);

const RadarExamplesPanel = () => {
  const [axisCount, setAxisCount] = useState(5);
  const [rotationOffsetDeg, setRotationOffsetDeg] = useState(0);
  const [isShowValues, setIsShowValues] = useState(true);
  const [isValueEditable, setIsValueEditable] = useState(true);
  const [axisItems, setAxisItems] = useState(() => keepAxisCount(DEFAULT_AXIS_ITEMS, 5));
  const [isApplying, setIsApplying] = useState(false);
  const [lastFeedback, setLastFeedback] = useState('');

  const axisPreview = useMemo(() => keepAxisCount(axisItems, axisCount), [axisItems, axisCount]);

  const getCornerComp = (componentKey) => {
    if (componentKey === 'tag') return CornerTag;
    if (componentKey === 'badge') return CornerBadge;
    if (componentKey === 'plain') return CornerPlain;
    return null;
  };

  const onDataChangeRequest = async (type, params) => {
    if (type === 'axis-count') {
      const nextCount = Math.max(3, Math.min(12, Math.floor(toSafeNumber(params?.nextAxisCount, axisCount))));
      setAxisCount(nextCount);
      setAxisItems((current) => keepAxisCount(current, nextCount));
      setLastFeedback(`Axis count updated: ${nextCount}`);
      return { code: 0 };
    }

    if (type === 'rotation-offset') {
      const nextOffset = toSafeNumber(params?.nextOffsetDeg, 0);
      setRotationOffsetDeg(nextOffset);
      setLastFeedback(`Rotation updated: ${nextOffset} deg`);
      return { code: 0 };
    }

    if (type === 'update-axis') {
      const targetIndex = params?.index;
      if (targetIndex === undefined || targetIndex < 0 || targetIndex >= axisItems.length) {
        return { code: -1, message: 'invalid axis index' };
      }

      const current = axisItems[targetIndex];
      const nextAxis = {
        ...current,
        ...(params?.patch || {}),
      };

      const nextMin = toSafeNumber(nextAxis.min, 0);
      const nextMax = toSafeNumber(nextAxis.max, 1);
      const nextValue = toSafeNumber(nextAxis.value, nextMin);

      if (nextMax <= nextMin) return { code: -1, message: 'max must be greater than min' };
      if (nextValue < nextMin || nextValue > nextMax) return { code: -1, message: 'value must be in range' };

      setIsApplying(true);
      await new Promise((resolve) => setTimeout(resolve, 120));
      setAxisItems((list) => {
        const nextList = [...list];
        nextList[targetIndex] = {
          ...nextAxis,
          min: nextMin,
          max: nextMax,
          value: nextValue,
        };
        return nextList;
      });
      setIsApplying(false);
      setLastFeedback(`Axis ${targetIndex + 1} updated`);
      return { code: 0 };
    }

    if (type === 'update-axis-value') {
      const targetIndex = params?.index;
      const nextValueInput = params?.nextValue;
      if (targetIndex === undefined || targetIndex < 0 || targetIndex >= axisItems.length) {
        return { code: -1, message: 'invalid axis index' };
      }
      const targetAxis = axisItems[targetIndex];
      const nextValue = toSafeNumber(nextValueInput, targetAxis.value);
      if (nextValue < targetAxis.min || nextValue > targetAxis.max) {
        return { code: -1, message: 'value must be in range' };
      }
      setAxisItems((list) => {
        const nextList = [...list];
        const currentAxis = nextList[targetIndex];
        nextList[targetIndex] = {
          ...currentAxis,
          value: nextValue,
        };
        return nextList;
      });
      return { code: 0 };
    }

    return { code: 0 };
  };

  return (
    <div className="radar-demo-root">
      <div className="radar-demo-block">
        <div className="radar-demo-title">Radar</div>
        <div className="radar-demo-desc">
          Render-only component. Parent controls axis count, rotation, ranges, values, and corner components.
        </div>
        <div className="radar-demo-chart-wrap">
          <Radar
            axisItems={axisPreview}
            rotationOffsetDeg={rotationOffsetDeg}
            ringCount={5}
            size={280}
            showValues={isShowValues}
            isValueEditable={isValueEditable}
            onDataChangeRequest={onDataChangeRequest}
            getComp={getCornerComp}
          />
        </div>
        <div className="radar-demo-feedback">{isApplying ? 'Applying update...' : (lastFeedback || 'Ready')}</div>
      </div>

      <div className="radar-demo-block">
        <div className="radar-demo-title">Controls</div>
        <div className="radar-demo-row">
          <div className="radar-demo-label">Axis Count</div>
          <input
            className="radar-demo-input"
            type="number"
            min="3"
            max="12"
            value={axisCount}
            onChange={async (event) => {
              await onDataChangeRequest('axis-count', { nextAxisCount: event.target.value });
            }}
          />
        </div>
        <div className="radar-demo-row">
          <div className="radar-demo-label">Rotation Offset (clockwise deg)</div>
          <input
            className="radar-demo-input"
            type="number"
            step="1"
            value={rotationOffsetDeg}
            onChange={async (event) => {
              await onDataChangeRequest('rotation-offset', { nextOffsetDeg: event.target.value });
            }}
          />
        </div>
        <div className="radar-demo-row">
          <div className="radar-demo-label">Show Axis Values</div>
          <div className="radar-demo-toggle-wrap">
            <BoolSlider checked={isShowValues} onChange={setIsShowValues} />
            <div className="radar-demo-toggle-text">{isShowValues ? 'on' : 'off'}</div>
          </div>
        </div>
        <div className="radar-demo-row">
          <div className="radar-demo-label">Value Editable</div>
          <div className="radar-demo-toggle-wrap">
            <BoolSlider checked={isValueEditable} onChange={setIsValueEditable} />
            <div className="radar-demo-toggle-text">{isValueEditable ? 'on' : 'off'}</div>
          </div>
        </div>

        <div className="radar-demo-axis-list">
          {axisPreview.map((axis, index) => (
            <div key={axis.id} className="radar-demo-axis-item">
              <div className="radar-demo-axis-head">Axis {index + 1}</div>
              <div className="radar-demo-grid">
                <input
                  className="radar-demo-input"
                  type="text"
                  value={axis.label}
                  onChange={async (event) => {
                    await onDataChangeRequest('update-axis', {
                      index,
                      patch: { label: event.target.value },
                    });
                  }}
                />
                <select
                  className="radar-demo-input"
                  value={axis.component || 'plain'}
                  onChange={async (event) => {
                    await onDataChangeRequest('update-axis', {
                      index,
                      patch: { component: event.target.value },
                    });
                  }}
                >
                  <option value="plain">plain</option>
                  <option value="tag">tag</option>
                  <option value="badge">badge</option>
                </select>
                <input
                  className="radar-demo-input"
                  type="number"
                  value={axis.min}
                  onChange={async (event) => {
                    const result = await onDataChangeRequest('update-axis', {
                      index,
                      patch: { min: event.target.value },
                    });
                    if (result.code !== 0) setLastFeedback(result.message || 'rejected');
                  }}
                />
                <input
                  className="radar-demo-input"
                  type="number"
                  value={axis.max}
                  onChange={async (event) => {
                    const result = await onDataChangeRequest('update-axis', {
                      index,
                      patch: { max: event.target.value },
                    });
                    if (result.code !== 0) setLastFeedback(result.message || 'rejected');
                  }}
                />
                <input
                  className="radar-demo-input"
                  type="number"
                  value={axis.value}
                  onChange={async (event) => {
                    const result = await onDataChangeRequest('update-axis', {
                      index,
                      patch: { value: event.target.value },
                    });
                    if (result.code !== 0) setLastFeedback(result.message || 'rejected');
                  }}
                />
              </div>
              <div className="radar-demo-axis-meta">
                Range [{formatAxisNumber(axis.min)}, {formatAxisNumber(axis.max)}] | Value {formatAxisNumber(axis.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const statExamples = {
  Radar: {
    component: null,
    description: 'Radar chart with dynamic axes and custom corner components',
    example: () => <RadarExamplesPanel />,
  },
};
