
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import ColorPicker from '../color-picker/ColorPicker.jsx';
import { colorPickerModeOptions, createColorPickerStore } from '../color-picker/colorPickerStore.js';
import { ValueShell, isValueLocked } from './PropEditorValueShared.jsx';

const PropEditorValueColor = observer(function PropEditorValueColor({ data, itemRef, onChangeAttempt, index }) {
  const valueText = String(data ?? '#000000FF');
  const isLocked = isValueLocked(itemRef);
  const popupPlacement = itemRef?.valueConfig?.popupPlacement;
  const popupSize = itemRef?.valueConfig?.popupSize ?? { width: 264, height: 360 };
  const modeCommit = itemRef?.valueConfig?.modeCommit === 'immediate' ? 'immediate' : 'apply';
  const [pickerStore, setPickerStore] = useState(null);
  const [pickerPos, setPickerPos] = useState({ left: 0, top: 0 });
  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const dragRef = useRef(null);

  const getPopupPos = (triggerRect, size) => {
    if (typeof popupPlacement === 'function') return popupPlacement(triggerRect, size);
    return {
      x: Math.min(window.innerWidth - size.width, Math.max(8, triggerRect.left)),
      y: Math.min(window.innerHeight - size.height, Math.max(8, triggerRect.bottom + 4)),
    };
  };

  useEffect(() => {
    if (!pickerStore) return undefined;
    const pointerDownHandle = (event) => {
      const target = event.target;
      if (popupRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setPickerStore(null);
    };
    const keyDownHandle = (event) => {
      if (event.key === 'Escape') setPickerStore(null);
    };
    document.addEventListener('pointerdown', pointerDownHandle, true);
    document.addEventListener('keydown', keyDownHandle, true);
    return () => {
      document.removeEventListener('pointerdown', pointerDownHandle, true);
      document.removeEventListener('keydown', keyDownHandle, true);
    };
  }, [pickerStore]);

  useLayoutEffect(() => {
    if (!pickerStore || !popupRef.current || !triggerRef.current) return;
    const popupRect = popupRef.current.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const pos = getPopupPos(triggerRect, { width: popupRect.width, height: popupRect.height });
    setPickerPos((posPrev) => {
      if (Math.abs(posPrev.left - pos.x) < 1 && Math.abs(posPrev.top - pos.y) < 1) return posPrev;
      return { left: pos.x, top: pos.y };
    });
  }, [pickerStore, popupPlacement]);

  const openPicker = () => {
    if (isLocked) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const pos = getPopupPos(rect, popupSize);
      setPickerPos({ left: pos.x, top: pos.y });
    }
    setPickerStore(createColorPickerStore({ colorInitialValue: valueText }));
  };

  const pickerEventHandle = (eventType, eventData = {}) => {
    const result = pickerStore?.handleEvent(eventType, eventData);
    if (modeCommit === 'immediate' && ['hsvSet', 'colorValueSet', 'swatchSelect'].includes(eventType)) {
      onChangeAttempt?.(index, 'value', pickerStore.colorCurrentValue);
    }
    return result;
  };

  const dragBegin = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const drag = {
      pointerId: event.pointerId,
      xStart: event.clientX,
      yStart: event.clientY,
      leftStart: pickerPos.left,
      topStart: pickerPos.top,
    };
    dragRef.current = drag;

    const dragMove = (moveEvent) => {
      if (!dragRef.current || drag.pointerId !== moveEvent.pointerId) return;
      setPickerPos({
        left: drag.leftStart + moveEvent.clientX - drag.xStart,
        top: drag.topStart + moveEvent.clientY - drag.yStart,
      });
    };

    const dragEnd = (upEvent) => {
      if (!dragRef.current || drag.pointerId !== upEvent.pointerId) return;
      dragRef.current = null;
      document.removeEventListener('pointermove', dragMove, true);
      document.removeEventListener('pointerup', dragEnd, true);
      document.removeEventListener('pointercancel', dragEnd, true);
    };

    document.addEventListener('pointermove', dragMove, true);
    document.addEventListener('pointerup', dragEnd, true);
    document.addEventListener('pointercancel', dragEnd, true);
  };

  return (
    <ValueShell itemRef={itemRef} className="has-color-picker">
      <div className="prop-editor-color-row" ref={triggerRef}>
        <button type="button" className="prop-editor-color-chip" style={{ backgroundColor: valueText }} disabled={isLocked} onClick={openPicker} aria-label="Edit color" />
        <button type="button" className="prop-editor-color-value" disabled={isLocked} onClick={openPicker}>{valueText}</button>
        {pickerStore ? createPortal((
          <div className="prop-editor-color-popover" ref={popupRef} style={{ left: `${pickerPos.left}px`, top: `${pickerPos.top}px` }}>
            <div className="prop-editor-color-popover-title" onPointerDown={dragBegin}>
              <span>{pickerStore.colorCurrentValue}</span>
            </div>
            <ColorPicker
              data={{ modeOptions: colorPickerModeOptions, swatchGrid: pickerStore.swatchGrid }}
              config={{
                hue: pickerStore.hue,
                saturation: pickerStore.saturation,
                value: pickerStore.value,
                alpha: pickerStore.alpha,
                modeCurrent: pickerStore.modeCurrent,
                colorCurrentValue: pickerStore.colorCurrentValue,
                colorCurrentCss: pickerStore.colorCurrentCss,
                hueColorHex: pickerStore.hueColorHex,
                isSwatchGapShown: pickerStore.isSwatchGapShown,
                swatchCellShape: pickerStore.swatchCellShape,
              }}
              onEvent={pickerEventHandle}
            />
            <div className="prop-editor-color-actions">
              {modeCommit === 'immediate' ? (
                <button type="button" onClick={() => setPickerStore(null)}>Close</button>
              ) : (
                <>
                  <button type="button" onClick={() => setPickerStore(null)}>Cancel</button>
                  <button type="button" onClick={() => { onChangeAttempt?.(index, 'value', pickerStore.colorCurrentValue); setPickerStore(null); }}>Apply</button>
                </>
              )}
            </div>
          </div>
        ), document.body) : null}
      </div>
    </ValueShell>
  );
});

export default PropEditorValueColor;
