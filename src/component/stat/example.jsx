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
  const [radarData, setRadarData] = useState(() => ({
    axisItems: keepAxisCount(DEFAULT_AXIS_ITEMS, 5),
  }));
  const [radarConfig, setRadarConfig] = useState(() => ({
    size: 280,
    ringCount: 5,
    rotationOffsetDeg: 0,
    isShowValues: true,
    isValueEditable: true,
    labelOffset: 18,
  }));
  const [isApplying, setIsApplying] = useState(false);
  const [lastFeedback, setLastFeedback] = useState('');

  const axisPreview = useMemo(
    () => keepAxisCount(radarData.axisItems || [], axisCount),
    [radarData.axisItems, axisCount],
  );

  const getCornerComp = (componentKey) => {
    if (componentKey === 'tag') return CornerTag;
    if (componentKey === 'badge') return CornerBadge;
    if (componentKey === 'plain') return CornerPlain;
    return null;
  };

  const onEvent = async (eventType, eventData) => {
    if (eventType !== 'dataChangeRequest') {
      return { code: 0 };
    }
    const requestType = eventData?.requestType;
    const requestData = eventData?.requestData || {};

    if (requestType === 'axis-count') {
      const nextCount = Math.max(3, Math.min(12, Math.floor(toSafeNumber(requestData?.nextAxisCount, axisCount))));
      setAxisCount(nextCount);
      setRadarData((current) => ({
        ...current,
        axisItems: keepAxisCount(current.axisItems || [], nextCount),
      }));
      setLastFeedback(`Axis count updated: ${nextCount}`);
      return { code: 0 };
    }

    if (requestType === 'rotation-offset') {
      const nextOffset = toSafeNumber(requestData?.nextOffsetDeg, 0);
      setRadarConfig((current) => ({
        ...current,
        rotationOffsetDeg: nextOffset,
      }));
      setLastFeedback(`Rotation updated: ${nextOffset} deg`);
      return { code: 0 };
    }

    if (requestType === 'toggle-show-values') {
      setRadarConfig((current) => ({
        ...current,
        isShowValues: requestData?.nextIsShowValues === true,
      }));
      return { code: 0 };
    }

    if (requestType === 'toggle-value-editable') {
      setRadarConfig((current) => ({
        ...current,
        isValueEditable: requestData?.nextIsValueEditable === true,
      }));
      return { code: 0 };
    }

    if (requestType === 'update-axis') {
      const targetIndex = requestData?.index;
      if (targetIndex === undefined || targetIndex < 0 || targetIndex >= axisPreview.length) {
        return { code: -1, message: 'invalid axis index' };
      }

      const current = axisPreview[targetIndex];
      const nextAxis = {
        ...current,
        ...(requestData?.patch || {}),
      };

      const nextMin = toSafeNumber(nextAxis.min, 0);
      const nextMax = toSafeNumber(nextAxis.max, 1);
      const nextValue = toSafeNumber(nextAxis.value, nextMin);

      if (nextMax <= nextMin) return { code: -1, message: 'max must be greater than min' };
      if (nextValue < nextMin || nextValue > nextMax) return { code: -1, message: 'value must be in range' };

      setIsApplying(true);
      await new Promise((resolve) => setTimeout(resolve, 120));
      setRadarData((currentData) => {
        const nextList = keepAxisCount(currentData.axisItems || [], axisCount);
        nextList[targetIndex] = {
          ...nextAxis,
          min: nextMin,
          max: nextMax,
          value: nextValue,
        };
        return {
          ...currentData,
          axisItems: nextList,
        };
      });
      setIsApplying(false);
      setLastFeedback(`Axis ${targetIndex + 1} updated`);
      return { code: 0 };
    }

    if (requestType === 'update-axis-value') {
      const targetIndex = requestData?.index;
      const nextValueInput = requestData?.nextValue;
      if (targetIndex === undefined || targetIndex < 0 || targetIndex >= axisPreview.length) {
        return { code: -1, message: 'invalid axis index' };
      }
      const targetAxis = axisPreview[targetIndex];
      const nextValue = toSafeNumber(nextValueInput, targetAxis.value);
      if (nextValue < targetAxis.min || nextValue > targetAxis.max) {
        return { code: -1, message: 'value must be in range' };
      }
      setRadarData((currentData) => {
        const nextList = keepAxisCount(currentData.axisItems || [], axisCount);
        const currentAxis = nextList[targetIndex];
        nextList[targetIndex] = {
          ...currentAxis,
          value: nextValue,
        };
        return {
          ...currentData,
          axisItems: nextList,
        };
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
            data={{
              axisItems: axisPreview,
            }}
            config={{
              ...radarConfig,
              getComp: getCornerComp,
            }}
            onEvent={onEvent}
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
              await onEvent('dataChangeRequest', {
                requestType: 'axis-count',
                requestData: { nextAxisCount: event.target.value },
              });
            }}
          />
        </div>
        <div className="radar-demo-row">
          <div className="radar-demo-label">Rotation Offset (clockwise deg)</div>
          <input
            className="radar-demo-input"
            type="number"
            step="1"
            value={radarConfig.rotationOffsetDeg}
            onChange={async (event) => {
              await onEvent('dataChangeRequest', {
                requestType: 'rotation-offset',
                requestData: { nextOffsetDeg: event.target.value },
              });
            }}
          />
        </div>
        <div className="radar-demo-row">
          <div className="radar-demo-label">Show Axis Values</div>
          <div className="radar-demo-toggle-wrap">
            <BoolSlider
              checked={radarConfig.isShowValues}
              onChange={async (nextIsShowValues) => {
                await onEvent('dataChangeRequest', {
                  requestType: 'toggle-show-values',
                  requestData: { nextIsShowValues },
                });
              }}
            />
            <div className="radar-demo-toggle-text">{radarConfig.isShowValues ? 'on' : 'off'}</div>
          </div>
        </div>
        <div className="radar-demo-row">
          <div className="radar-demo-label">Value Editable</div>
          <div className="radar-demo-toggle-wrap">
            <BoolSlider
              checked={radarConfig.isValueEditable}
              onChange={async (nextIsValueEditable) => {
                await onEvent('dataChangeRequest', {
                  requestType: 'toggle-value-editable',
                  requestData: { nextIsValueEditable },
                });
              }}
            />
            <div className="radar-demo-toggle-text">{radarConfig.isValueEditable ? 'on' : 'off'}</div>
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
                    await onEvent('dataChangeRequest', {
                      requestType: 'update-axis',
                      requestData: {
                        index,
                        patch: { label: event.target.value },
                      },
                    });
                  }}
                />
                <select
                  className="radar-demo-input"
                  value={axis.component || 'plain'}
                  onChange={async (event) => {
                    await onEvent('dataChangeRequest', {
                      requestType: 'update-axis',
                      requestData: {
                        index,
                        patch: { component: event.target.value },
                      },
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
                    const result = await onEvent('dataChangeRequest', {
                      requestType: 'update-axis',
                      requestData: {
                        index,
                        patch: { min: event.target.value },
                      },
                    });
                    if (result.code !== 0) setLastFeedback(result.message || 'rejected');
                  }}
                />
                <input
                  className="radar-demo-input"
                  type="number"
                  value={axis.max}
                  onChange={async (event) => {
                    const result = await onEvent('dataChangeRequest', {
                      requestType: 'update-axis',
                      requestData: {
                        index,
                        patch: { max: event.target.value },
                      },
                    });
                    if (result.code !== 0) setLastFeedback(result.message || 'rejected');
                  }}
                />
                <input
                  className="radar-demo-input"
                  type="number"
                  value={axis.value}
                  onChange={async (event) => {
                    const result = await onEvent('dataChangeRequest', {
                      requestType: 'update-axis',
                      requestData: {
                        index,
                        patch: { value: event.target.value },
                      },
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
