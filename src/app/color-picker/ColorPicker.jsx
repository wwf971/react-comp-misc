
import React from 'react';
import { observer } from 'mobx-react-lite';
import SegmentedControl from '../../component/button/SegmentedControl.jsx';
import './ColorPicker.css';

function emitSvFromPointer(event, onEvent) {
  const rect = event.currentTarget.getBoundingClientRect();
  const saturation = Math.round(((event.clientX - rect.left) / rect.width) * 100);
  const value = Math.round((1 - ((event.clientY - rect.top) / rect.height)) * 100);
  onEvent?.('hsvSet', { key: 'saturation', value: Math.min(100, Math.max(0, saturation)) });
  onEvent?.('hsvSet', { key: 'value', value: Math.min(100, Math.max(0, value)) });
}

function buildSwatchCellList(swatchGrid) {
  const rowCount = Math.max(1, Number(swatchGrid?.rowCount ?? 3));
  const colCount = Math.max(1, Number(swatchGrid?.colCount ?? 8));
  const cellByPos = new Map();
  for (const cell of swatchGrid?.cells ?? []) {
    cellByPos.set(`${cell.row}:${cell.col}`, cell);
  }

  const cellList = [];
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    for (let colIndex = 0; colIndex < colCount; colIndex += 1) {
      cellList.push(cellByPos.get(`${rowIndex}:${colIndex}`) ?? { row: rowIndex, col: colIndex, value: null });
    }
  }
  return { cellList, rowCount, colCount };
}

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

const ColorPicker = observer(({ data = {}, config = {}, onEvent }) => {
  const modeOptions = Array.isArray(data.modeOptions) ? data.modeOptions : [];
  const modeCurrent = config.modeCurrent ?? 'hsv';
  const hue = Number(config.hue ?? 0);
  const saturation = Number(config.saturation ?? 0);
  const value = Number(config.value ?? 0);
  const alpha = Number(config.alpha ?? 100);
  const colorCurrentValue = config.colorCurrentValue ?? '#000000FF';
  const colorCurrentCss = config.colorCurrentCss ?? '#000000';
  const hueColorHex = config.hueColorHex ?? '#ff0000';
  const isSwatchGapShown = config.isSwatchGapShown !== false;
  const swatchCellShape = config.swatchCellShape === 'circle' ? 'circle' : 'square';
  const { cellList, colCount } = buildSwatchCellList(data.swatchGrid ?? {});

  return (
    <div className="color-picker-root">
      <div className="color-picker-header">
        <div className="color-picker-title-wrap">
          <div className="color-picker-title">Color</div>
          <div className="color-picker-value">{colorCurrentValue}</div>
        </div>
        <SegmentedControl
          data={{ valueSelected: modeCurrent, segList: modeOptions }}
          config={{ colorHighlight: '#2563eb', widthModeSegment: 'auto' }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'valueSelectedChange') {
              onEvent?.('modeSet', { mode: eventData.valueSelected });
            }
          }}
        />
      </div>

      <div className="color-picker-body">
        {modeCurrent === 'hsv' ? (
          <div className="color-picker-hsv-panel">
            <button
              type="button"
              className="color-picker-sv-box"
              style={{ '--color-picker-hue-color': hueColorHex }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture?.(event.pointerId);
                emitSvFromPointer(event, onEvent);
              }}
              onPointerMove={(event) => {
                if (event.buttons !== 1) return;
                emitSvFromPointer(event, onEvent);
              }}
              aria-label="Set saturation and value"
            >
              <span className="color-picker-sv-cursor" style={{ left: `${saturation}%`, top: `${100 - value}%` }} aria-hidden />
            </button>

            <input
              className="color-picker-hue-range"
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(event) => onEvent?.('hsvSet', { key: 'hue', value: event.target.value })}
              aria-label="Hue"
            />

            <div className="color-picker-field-list">
              {[
                ['hue', 'H', hue, 360],
                ['saturation', 'S', saturation, 100],
                ['value', 'V', value, 100],
                ['alpha', 'A', alpha, 100],
              ].map(([key, label, dataValue, max]) => (
                <label className="color-picker-field-row" key={key}>
                  <span className="color-picker-field-label">{label}</span>
                  <input
                    className="color-picker-field-range"
                    type="range"
                    min="0"
                    max={max}
                    value={dataValue}
                    onChange={(event) => onEvent?.('hsvSet', { key, value: event.target.value })}
                  />
                  <input
                    className="color-picker-field-number"
                    type="number"
                    min="0"
                    max={max}
                    value={dataValue}
                    onChange={(event) => onEvent?.('hsvSet', { key, value: event.target.value })}
                  />
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`color-picker-swatch-panel ${isSwatchGapShown ? 'has-gap' : 'no-gap'} is-${swatchCellShape}`}
            style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
          >
            {cellList.map((cell) => {
              const valueCell = cell.value ?? '';
              const isSelected = String(valueCell).toUpperCase() === String(colorCurrentValue).toUpperCase();
              return (
                <button
                  key={`${cell.row}:${cell.col}`}
                  type="button"
                  className={`color-picker-swatch ${isSelected ? 'is-selected' : ''} ${valueCell ? '' : 'is-empty'}`}
                  style={valueCell ? buildAlphaBg(valueCell) : undefined}
                  onClick={() => valueCell && onEvent?.('swatchSelect', { value: valueCell })}
                  aria-label={cell.label ? `Select ${cell.label}` : 'Empty swatch'}
                  aria-pressed={isSelected}
                  disabled={!valueCell}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="color-picker-preview-row">
        <div className="color-picker-preview-chip" style={buildAlphaBg(colorCurrentCss)} />
        <label className="color-picker-value-row">
          <span>RGBA</span>
          <input
            className="color-picker-value-input"
            value={colorCurrentValue}
            onChange={(event) => onEvent?.('colorValueSet', { value: event.target.value })}
          />
        </label>
      </div>
    </div>
  );
});

export default ColorPicker;