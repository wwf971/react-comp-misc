
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import PlusIcon from '../../icon/PlusIcon.jsx';
import MinusIcon from '../../icon/MinusIcon.jsx';
import { EditableValue, ValueShell, isValueLocked } from './PropEditorValueShared.jsx';

function numClamp(valueRaw, min, max) {
  let value = Number(valueRaw);
  if (!Number.isFinite(value)) value = 0;
  if (Number.isFinite(min)) value = Math.max(min, value);
  if (Number.isFinite(max)) value = Math.min(max, value);
  return value;
}

function numStepRound(valueRaw, stepRaw) {
  const step = Number(stepRaw);
  if (!Number.isFinite(step) || step <= 0) return valueRaw;
  const fixed = String(step).split('.')[1]?.length ?? 0;
  return Number((Math.round(valueRaw / step) * step).toFixed(fixed));
}

function numNormalize(valueRaw, meta = {}) {
  const stepped = numStepRound(Number(valueRaw), meta.step ?? 1);
  return numClamp(stepped, meta.min, meta.max);
}

const PropEditorValueNum = observer(function PropEditorValueNum({ data, itemRef, onChangeAttempt, index }) {
  const meta = itemRef?.meta ?? {};
  const valueNum = numNormalize(data, meta);
  const isLocked = isValueLocked(itemRef);
  const [dragValue, setDragValue] = useState(null);
  const [isNumberDragging, setIsNumberDragging] = useState(false);
  const [isDragCancelHover, setIsDragCancelHover] = useState(false);
  const [dragCancelRect, setDragCancelRect] = useState(null);
  const [confirmValue, setConfirmValue] = useState(null);
  const dragRef = useRef(null);
  const dragMovedRef = useRef(false);
  const editValueRef = useRef(null);
  const shownValue = dragValue ?? valueNum;
  const isSlider = itemRef?.displayType === 'slider' && Number.isFinite(Number(meta.min)) && Number.isFinite(Number(meta.max));
  const alignValue = ['left', 'center', 'right'].includes(itemRef?.valueConfig?.align) ? itemRef.valueConfig.align : 'right';
  const confirmDecrease = itemRef?.valueConfig?.confirmDecrease;

  const syncEditText = (valueNext) => {
    editValueRef.current?.replaceEditText(String(valueNext));
  };
  const commitNumDirect = (valueNext) => onChangeAttempt?.(index, 'value', numNormalize(valueNext, meta));
  const commitNum = (valueNext, options = {}) => {
    const normalized = numNormalize(valueNext, meta);
    if (confirmDecrease && normalized < valueNum) {
      setConfirmValue(normalized);
      return { code: 1, message: 'confirm required' };
    }
    if (options.isEditTextSynced) syncEditText(normalized);
    return commitNumDirect(normalized);
  };

  const updateDragCancelRect = (anchorElement) => {
    const editorRect = anchorElement?.closest('.prop-editor-root')?.getBoundingClientRect();
    const rowRect = anchorElement?.getBoundingClientRect();
    if (!editorRect || !rowRect) {
      setDragCancelRect(null);
      return;
    }
    const inset = 6;
    const width = Math.max(80, Math.min(118, editorRect.width - inset * 2));
    const leftMax = editorRect.right - inset - width;
    const leftPreferred = rowRect.left;
    setDragCancelRect({
      left: Math.max(editorRect.left + inset, Math.min(leftPreferred, leftMax)),
      top: rowRect.bottom + 4,
      width,
    });
  };

  const clearDragState = () => {
    dragRef.current = null;
    setIsNumberDragging(false);
    setIsDragCancelHover(false);
    setDragCancelRect(null);
    setDragValue(null);
  };

  const isDragCancelTargetAtPoint = (clientX, clientY) => {
    const element = document.elementFromPoint(clientX, clientY);
    return Boolean(element?.closest('.prop-editor-number-drag-cancel'));
  };

  const dragBegin = (event) => {
    if (isLocked || ![0, 1].includes(event.button)) return;
    const targetElement = event.target instanceof Element ? event.target : null;
    if (targetElement?.closest('.prop-editor-number-confirm')) return;
    if (targetElement?.closest('.prop-editor-editable-number') && editValueRef.current?.isEditing()) {
      event.preventDefault();
      event.stopPropagation();
    }
    updateDragCancelRect(event.currentTarget);
    const step = Number(meta.step ?? 1);
    const drag = {
      pointerId: event.pointerId,
      xStart: event.clientX,
      valueStart: valueNum,
      valueCurrent: valueNum,
      step: Number.isFinite(step) && step > 0 ? step : 1,
    };
    dragRef.current = drag;
    dragMovedRef.current = false;

    const dragMove = (moveEvent) => {
      if (!dragRef.current || drag.pointerId !== moveEvent.pointerId) return;
      const deltaX = moveEvent.clientX - drag.xStart;
      if (Math.abs(deltaX) <= 2 && !dragMovedRef.current) return;
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      if (!dragMovedRef.current) {
        dragMovedRef.current = true;
        setIsNumberDragging(true);
      }
      setIsDragCancelHover(isDragCancelTargetAtPoint(moveEvent.clientX, moveEvent.clientY));
      const deltaStep = Math.round(deltaX / 8);
      const valueNext = numNormalize(drag.valueStart + deltaStep * drag.step, meta);
      if (editValueRef.current?.isEditing()) syncEditText(valueNext);
      drag.valueCurrent = valueNext;
      setDragValue(valueNext);
    };

    const dragEnd = (upEvent) => {
      if (!dragRef.current || drag.pointerId !== upEvent.pointerId) return;
      document.removeEventListener('pointermove', dragMove, true);
      document.removeEventListener('pointerup', dragEnd, true);
      document.removeEventListener('pointercancel', dragEnd, true);
      if (dragMovedRef.current) {
        upEvent.preventDefault();
        upEvent.stopPropagation();
      }
      const isCancelled = upEvent.type === 'pointercancel' || isDragCancelTargetAtPoint(upEvent.clientX, upEvent.clientY);
      if (dragMovedRef.current && !isCancelled && drag.valueCurrent !== valueNum) {
        commitNum(drag.valueCurrent, { isEditTextSynced: true });
      }
      clearDragState();
      window.setTimeout(() => {
        dragMovedRef.current = false;
      }, 0);
    };

    document.addEventListener('pointermove', dragMove, true);
    document.addEventListener('pointerup', dragEnd, true);
    document.addEventListener('pointercancel', dragEnd, true);
  };

  const sliderPercent = isSlider
    ? ((shownValue - Number(meta.min)) / (Number(meta.max) - Number(meta.min))) * 100
    : 0;

  return (
    <ValueShell
      itemRef={itemRef}
      className={`has-number-drag ${isSlider ? 'has-slider' : ''}`}
      onPointerDownCapture={dragBegin}
      onClickCapture={(event) => {
        if (!dragMovedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <div className={`prop-editor-number-row ${isSlider ? 'is-slider' : ''}`}>
        <button type="button" className="prop-editor-step-button" disabled={isLocked} onClick={() => commitNum(valueNum - Number(meta.step ?? 1), { isEditTextSynced: true })}>
          <MinusIcon width={12} height={12} />
        </button>
        {isSlider ? (
          <button
            type="button"
            className="prop-editor-slider-track"
            style={{ '--prop-editor-slider-percent': `${Math.max(0, Math.min(100, sliderPercent))}%` }}
            disabled={isLocked}
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const ratio = (event.clientX - rect.left) / rect.width;
              commitNum(Number(meta.min) + ratio * (Number(meta.max) - Number(meta.min)));
            }}
          >
            <span className="prop-editor-slider-value">{shownValue}</span>
          </button>
        ) : (
          <EditableValue
            ref={editValueRef}
            value={shownValue}
            className="prop-editor-editable-number"
            align={alignValue}
            isLocked={isLocked}
            isTextSyncedWhileEditing
            onCommit={commitNum}
          />
        )}
        <button type="button" className="prop-editor-step-button" disabled={isLocked} onClick={() => commitNum(valueNum + Number(meta.step ?? 1), { isEditTextSynced: true })}>
          <PlusIcon width={12} height={12} />
        </button>
      </div>
      {confirmValue !== null ? (
        <div className="prop-editor-number-confirm" role="dialog" aria-modal="false">
          <div className="prop-editor-number-confirm-title">{confirmDecrease.title || 'Confirm change'}</div>
          <div className="prop-editor-number-confirm-message">{confirmDecrease.message || 'This change will remove existing data.'}</div>
          <div className="prop-editor-number-confirm-actions">
            <button type="button" className="prop-editor-number-confirm-button" onClick={() => setConfirmValue(null)}>{confirmDecrease.cancelLabel || 'Cancel'}</button>
            <button
              type="button"
              className="prop-editor-number-confirm-button is-primary"
              onClick={() => {
                const valueToCommit = confirmValue;
                setConfirmValue(null);
                commitNumDirect(valueToCommit);
              }}
            >
              {confirmDecrease.confirmLabel || 'Confirm'}
            </button>
          </div>
        </div>
      ) : null}
      {isNumberDragging && dragCancelRect ? createPortal(
        <button
          type="button"
          className={`prop-editor-number-drag-cancel ${isDragCancelHover ? 'is-hover' : ''}`}
          style={{ left: dragCancelRect.left, top: dragCancelRect.top, width: dragCancelRect.width }}
          onPointerEnter={() => setIsDragCancelHover(true)}
          onPointerLeave={() => setIsDragCancelHover(false)}
        >
          Cancel
        </button>,
        document.body,
      ) : null}
    </ValueShell>
  );
});

export { numNormalize };
export default PropEditorValueNum;
