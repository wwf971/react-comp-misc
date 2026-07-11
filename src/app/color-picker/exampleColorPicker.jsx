import { useMemo } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import EditIcon from '../../icon/EditIcon.jsx';
import ColorPicker from './ColorPicker.jsx';
import { createColorPickerStore, colorPickerModeOptions, swatchGridDefault } from './colorPickerStore.js';
import './exampleColorPicker.css';

const swatchGridMapBlock = {
  rowCount: 4,
  colCount: 6,
  cells: [
    { row: 0, col: 0, value: '#00FFFFFF', label: 'Pure cyan' },
    { row: 0, col: 1, value: '#00CCFFFF', label: 'Sky cyan' },
    { row: 0, col: 2, value: '#0080FFFF', label: 'Azure' },
    { row: 0, col: 3, value: '#0000FFFF', label: 'Pure blue' },
    { row: 0, col: 4, value: '#0000FFCC', label: 'Blue alpha' },
    { row: 0, col: 5, value: '#0000FF80', label: 'Blue half alpha' },
    { row: 1, col: 0, value: '#FFFF00FF', label: 'Pure yellow' },
    { row: 1, col: 1, value: '#CCFF00FF', label: 'Lime yellow' },
    { row: 1, col: 2, value: '#80FF00FF', label: 'Chartreuse' },
    { row: 1, col: 3, value: '#00FF00FF', label: 'Pure green' },
    { row: 1, col: 4, value: '#00FF00CC', label: 'Green alpha' },
    { row: 1, col: 5, value: '#00FF0080', label: 'Green half alpha' },
    { row: 2, col: 0, value: '#FF0000FF', label: 'Pure red' },
    { row: 2, col: 1, value: '#FF4000FF', label: 'Red orange' },
    { row: 2, col: 2, value: '#FF8000FF', label: 'Orange' },
    { row: 2, col: 3, value: '#FF00FFFF', label: 'Pure magenta' },
    { row: 2, col: 4, value: '#FF0000CC', label: 'Red alpha' },
    { row: 2, col: 5, value: '#FF000080', label: 'Red half alpha' },
    { row: 3, col: 0, value: '#FFFFFF30', label: 'White low alpha' },
    { row: 3, col: 1, value: '#FFFFFFFF', label: 'White' },
    { row: 3, col: 2, value: '#808080FF', label: 'Gray' },
    { row: 3, col: 3, value: '#000000FF', label: 'Black' },
    { row: 3, col: 4, value: '#000000CC', label: 'Black alpha' },
    { row: 3, col: 5, value: '#00000080', label: 'Black half alpha' },
  ],
};

const pickerConfigById = {
  default: {
    label: 'Default picker',
    swatchGrid: swatchGridDefault,
    isSwatchGapShown: true,
    swatchCellShape: 'square',
  },
  mapBlock: {
    label: 'Map block custom grid',
    swatchGrid: swatchGridMapBlock,
    isSwatchGapShown: false,
    swatchCellShape: 'circle',
  },
};

function buildAlphaBg(colorValue) {
  return {
    backgroundImage: [
      `linear-gradient(${colorValue}, ${colorValue})`,
      'linear-gradient(45deg, #e2e8f0 25%, transparent 25%)',
      'linear-gradient(-45deg, #e2e8f0 25%, transparent 25%)',
      'linear-gradient(45deg, transparent 75%, #e2e8f0 75%)',
      'linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
    ].join(', '),
    backgroundPosition: '0 0, 0 0, 0 8px, 8px -8px, -8px 0',
    backgroundSize: 'auto, 16px 16px, 16px 16px, 16px 16px, 16px 16px',
  };
}

class StoreDemoColorPicker {
  colorValueById = {
    default: '#FF0000CC',
    mapBlock: '#00FFFFFF',
  };
  pickerTargetId = null;
  pickerStore = null;
  eventLastText = 'Ready';

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get pickerConfigCurrent() {
    return pickerConfigById[this.pickerTargetId] ?? null;
  }

  openPicker(targetId) {
    const pickerConfig = pickerConfigById[targetId];
    if (!pickerConfig) return;
    this.pickerTargetId = targetId;
    this.pickerStore = createColorPickerStore({
      colorInitialValue: this.colorValueById[targetId],
      swatchGrid: pickerConfig.swatchGrid,
      isSwatchGapShown: pickerConfig.isSwatchGapShown,
      swatchCellShape: pickerConfig.swatchCellShape,
    });
    this.eventLastText = `Open ${pickerConfig.label}`;
  }

  applyPicker() {
    if (!this.pickerStore || !this.pickerTargetId) return;
    this.colorValueById[this.pickerTargetId] = this.pickerStore.colorCurrentValue;
    this.eventLastText = `Apply ${this.pickerStore.colorCurrentValue}`;
    this.pickerTargetId = null;
    this.pickerStore = null;
  }

  cancelPicker() {
    this.eventLastText = 'Cancel';
    this.pickerTargetId = null;
    this.pickerStore = null;
  }
}

const ColorFieldDemo = observer(({ store, targetId }) => {
  const pickerConfig = pickerConfigById[targetId];
  return (
    <div className="demo-color-picker-field">
      <div className="demo-color-picker-chip" style={buildAlphaBg(store.colorValueById[targetId])} />
      <div className="demo-color-picker-value">
        <div className="demo-color-picker-label">{pickerConfig.label}</div>
        <div className="demo-color-picker-hex">{store.colorValueById[targetId]}</div>
      </div>
      <button type="button" className="demo-color-picker-edit" onClick={() => store.openPicker(targetId)} aria-label={`Edit ${pickerConfig.label}`}>
        <EditIcon width={18} height={18} />
      </button>
    </div>
  );
});

const DemoColorPicker = observer(() => {
  const store = useMemo(() => new StoreDemoColorPicker(), []);
  const pickerStore = store.pickerStore;
  const pickerConfig = store.pickerConfigCurrent;

  return (
    <div className="demo-color-picker-root">
      <div className="demo-color-picker-example-list">
        <ColorFieldDemo store={store} targetId="default" />
        <ColorFieldDemo store={store} targetId="mapBlock" />
      </div>
      <div className="demo-color-picker-event">{store.eventLastText}</div>

      {pickerStore && pickerConfig ? (
        <div className="demo-color-picker-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) store.cancelPicker();
        }}>
          <div className="demo-color-picker-popup" role="dialog" aria-modal="true" aria-label="Color picker">
            <ColorPicker
              data={{
                modeOptions: colorPickerModeOptions,
                swatchGrid: pickerStore.swatchGrid,
              }}
              config={{
                modeCurrent: pickerStore.modeCurrent,
                hue: pickerStore.hue,
                saturation: pickerStore.saturation,
                value: pickerStore.value,
                alpha: pickerStore.alpha,
                colorCurrentValue: pickerStore.colorCurrentValue,
                colorCurrentCss: pickerStore.colorCurrentCss,
                hueColorHex: pickerStore.hueColorHex,
                isSwatchGapShown: pickerStore.isSwatchGapShown,
                swatchCellShape: pickerStore.swatchCellShape,
              }}
              onEvent={pickerStore.handleEvent}
            />
            <div className="demo-color-picker-actions">
              <button type="button" onClick={() => pickerStore.handleEvent('restoreInitial', {})}>Restore</button>
              <button type="button" onClick={store.cancelPicker}>Cancel</button>
              <button type="button" className="is-primary" onClick={store.applyPicker}>Apply</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});

export const colorPickerExamples = {
  'Color Picker': {
    component: null,
    description: 'HSV and swatch color picker',
    example: () => <DemoColorPicker />,
  },
};

export default DemoColorPicker;