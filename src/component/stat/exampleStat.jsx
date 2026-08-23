import { useMemo } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import Radar from './Radar.jsx';
import BoolSlider from '../button/BoolSlider.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  Controls,
  ControlItem,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
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

function getCornerComp(componentKey) {
  if (componentKey === 'tag') return CornerTag;
  if (componentKey === 'badge') return CornerBadge;
  if (componentKey === 'plain') return CornerPlain;
  return null;
}

function createStoreRadarDemo() {
  return makeAutoObservable({
    axisCount: 5,
    radarData: {
      axisItems: keepAxisCount(DEFAULT_AXIS_ITEMS, 5),
    },
    radarConfig: {
      size: 280,
      ringCount: 5,
      rotationOffsetDeg: 0,
      isShowValues: true,
      isValueEditable: true,
      labelOffset: 18,
    },
    isApplying: false,
    lastFeedback: '',
    get axisPreview() {
      return keepAxisCount(this.radarData.axisItems || [], this.axisCount);
    },
    async onEvent(eventType, eventData) {
      if (eventType !== 'dataChangeRequest') {
        return { code: 0 };
      }
      const requestType = eventData?.requestType;
      const requestData = eventData?.requestData || {};

      if (requestType === 'axis-count') {
        const nextCount = Math.max(3, Math.min(12, Math.floor(toSafeNumber(requestData?.nextAxisCount, this.axisCount))));
        this.axisCount = nextCount;
        this.radarData.axisItems = keepAxisCount(this.radarData.axisItems || [], nextCount);
        this.lastFeedback = `Axis count updated: ${nextCount}`;
        return { code: 0 };
      }

      if (requestType === 'rotation-offset') {
        const nextOffset = toSafeNumber(requestData?.nextOffsetDeg, 0);
        this.radarConfig.rotationOffsetDeg = nextOffset;
        this.lastFeedback = `Rotation updated: ${nextOffset} deg`;
        return { code: 0 };
      }

      if (requestType === 'toggle-show-values') {
        this.radarConfig.isShowValues = requestData?.nextIsShowValues === true;
        return { code: 0 };
      }

      if (requestType === 'toggle-value-editable') {
        this.radarConfig.isValueEditable = requestData?.nextIsValueEditable === true;
        return { code: 0 };
      }

      if (requestType === 'update-axis') {
        const targetIndex = requestData?.index;
        if (targetIndex === undefined || targetIndex < 0 || targetIndex >= this.axisPreview.length) {
          return { code: -1, message: 'invalid axis index' };
        }

        const current = this.axisPreview[targetIndex];
        const nextAxis = {
          ...current,
          ...(requestData?.patch || {}),
        };

        const nextMin = toSafeNumber(nextAxis.min, 0);
        const nextMax = toSafeNumber(nextAxis.max, 1);
        const nextValue = toSafeNumber(nextAxis.value, nextMin);

        if (nextMax <= nextMin) return { code: -1, message: 'max must be greater than min' };
        if (nextValue < nextMin || nextValue > nextMax) return { code: -1, message: 'value must be in range' };

        this.isApplying = true;
        await new Promise((resolve) => setTimeout(resolve, 120));
        runInAction(() => {
          const nextList = keepAxisCount(this.radarData.axisItems || [], this.axisCount);
          nextList[targetIndex] = {
            ...nextAxis,
            min: nextMin,
            max: nextMax,
            value: nextValue,
          };
          this.radarData.axisItems = nextList;
          this.isApplying = false;
          this.lastFeedback = `Axis ${targetIndex + 1} updated`;
        });
        return { code: 0 };
      }

      if (requestType === 'update-axis-value') {
        const targetIndex = requestData?.index;
        const nextValueInput = requestData?.nextValue;
        if (targetIndex === undefined || targetIndex < 0 || targetIndex >= this.axisPreview.length) {
          return { code: -1, message: 'invalid axis index' };
        }
        const targetAxis = this.axisPreview[targetIndex];
        const nextValue = toSafeNumber(nextValueInput, targetAxis.value);
        if (nextValue < targetAxis.min || nextValue > targetAxis.max) {
          return { code: -1, message: 'value must be in range' };
        }
        const nextList = keepAxisCount(this.radarData.axisItems || [], this.axisCount);
        const currentAxis = nextList[targetIndex];
        nextList[targetIndex] = {
          ...currentAxis,
          value: nextValue,
        };
        this.radarData.axisItems = nextList;
        return { code: 0 };
      }

      return { code: 0 };
    },
  }, {}, { autoBind: true });
}

const RadarExamplesPanel = observer(function RadarExamplesPanel({ store }) {
  const storeOwn = useMemo(() => (store ? null : createStoreRadarDemo()), [store]);
  const storeUsed = store || storeOwn;

  return (
    <DemoPanel>
      <Explanation titleText="Radar">
        Render-only component. Parent controls axis count, rotation, ranges, values, and corner components.
      </Explanation>
      <Example title="Radar">
        <Controls>
          <ControlItem labelText="Axis Count">
            <input
              className="radar-demo-input"
              style={{ width: 72 }}
              type="number"
              min="3"
              max="12"
              value={storeUsed.axisCount}
              onChange={async (event) => {
                await storeUsed.onEvent('dataChangeRequest', {
                  requestType: 'axis-count',
                  requestData: { nextAxisCount: event.target.value },
                });
              }}
            />
          </ControlItem>
          <ControlItem labelText="Rotation Offset (clockwise deg)">
            <input
              className="radar-demo-input"
              style={{ width: 72 }}
              type="number"
              step="1"
              value={storeUsed.radarConfig.rotationOffsetDeg}
              onChange={async (event) => {
                await storeUsed.onEvent('dataChangeRequest', {
                  requestType: 'rotation-offset',
                  requestData: { nextOffsetDeg: event.target.value },
                });
              }}
            />
          </ControlItem>
          <ControlItem labelText="Show Axis Values">
            <span className="radar-demo-toggle-wrap">
              <BoolSlider
                checked={storeUsed.radarConfig.isShowValues}
                onChange={async (nextIsShowValues) => {
                  await storeUsed.onEvent('dataChangeRequest', {
                    requestType: 'toggle-show-values',
                    requestData: { nextIsShowValues },
                  });
                }}
              />
              <span className="radar-demo-toggle-text">{storeUsed.radarConfig.isShowValues ? 'on' : 'off'}</span>
            </span>
          </ControlItem>
          <ControlItem labelText="Value Editable">
            <span className="radar-demo-toggle-wrap">
              <BoolSlider
                checked={storeUsed.radarConfig.isValueEditable}
                onChange={async (nextIsValueEditable) => {
                  await storeUsed.onEvent('dataChangeRequest', {
                    requestType: 'toggle-value-editable',
                    requestData: { nextIsValueEditable },
                  });
                }}
              />
              <span className="radar-demo-toggle-text">{storeUsed.radarConfig.isValueEditable ? 'on' : 'off'}</span>
            </span>
          </ControlItem>
        </Controls>
        <CompDemoArea>
          <div className="radar-demo-chart-wrap">
            <Radar
              data={{
                axisItems: storeUsed.axisPreview,
              }}
              config={{
                ...storeUsed.radarConfig,
                getComp: getCornerComp,
              }}
              onEvent={storeUsed.onEvent}
            />
          </div>
        </CompDemoArea>
        <div className="radar-demo-axis-list">
          {storeUsed.axisPreview.map((axis, index) => (
            <div key={axis.id} className="radar-demo-axis-item">
              <div className="radar-demo-axis-head">Axis {index + 1}</div>
              <div className="radar-demo-grid">
                <input
                  className="radar-demo-input"
                  type="text"
                  value={axis.label}
                  onChange={async (event) => {
                    await storeUsed.onEvent('dataChangeRequest', {
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
                    await storeUsed.onEvent('dataChangeRequest', {
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
                    const result = await storeUsed.onEvent('dataChangeRequest', {
                      requestType: 'update-axis',
                      requestData: {
                        index,
                        patch: { min: event.target.value },
                      },
                    });
                    if (result.code !== 0) storeUsed.lastFeedback = result.message || 'rejected';
                  }}
                />
                <input
                  className="radar-demo-input"
                  type="number"
                  value={axis.max}
                  onChange={async (event) => {
                    const result = await storeUsed.onEvent('dataChangeRequest', {
                      requestType: 'update-axis',
                      requestData: {
                        index,
                        patch: { max: event.target.value },
                      },
                    });
                    if (result.code !== 0) storeUsed.lastFeedback = result.message || 'rejected';
                  }}
                />
                <input
                  className="radar-demo-input"
                  type="number"
                  value={axis.value}
                  onChange={async (event) => {
                    const result = await storeUsed.onEvent('dataChangeRequest', {
                      requestType: 'update-axis',
                      requestData: {
                        index,
                        patch: { value: event.target.value },
                      },
                    });
                    if (result.code !== 0) storeUsed.lastFeedback = result.message || 'rejected';
                  }}
                />
              </div>
              <div className="radar-demo-axis-meta">
                Range [{formatAxisNumber(axis.min)}, {formatAxisNumber(axis.max)}] | Value {formatAxisNumber(axis.value)}
              </div>
            </div>
          ))}
        </div>
        <MessageAndOutputs>
          <span>{storeUsed.isApplying ? 'Applying update...' : (storeUsed.lastFeedback || 'Ready')}</span>
        </MessageAndOutputs>
      </Example>
    </DemoPanel>
  );
});

export const statExamples = {
  Radar: {
    component: null,
    description: 'Radar chart with dynamic axes and custom corner components',
    example: RadarExamplesPanel,
    routeAliases: ['stat', 'chart'],
  },
};
