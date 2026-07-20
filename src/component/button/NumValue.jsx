import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PlusIcon from '../../icon/PlusIcon.jsx';
import MinusIcon from '../../icon/MinusIcon.jsx';
import './NumValue.css';

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

function numNormalize(valueRaw, config = {}) {
  const stepped = numStepRound(Number(valueRaw), config.step ?? 1);
  return numClamp(stepped, config.min, config.max);
}

function selectEditableContents(element) {
  if (!element) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

const NumValue = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const valueNum = numNormalize(data.value, config);
  const isDisabled = config.isDisabled === true;
  const step = Number(config.step ?? 1);
  const stepSafe = Number.isFinite(step) && step > 0 ? step : 1;
  const alignValue = ['left', 'center', 'right'].includes(config.align) ? config.align : 'center';
  const unitText = `${config.unitText ?? ''}`.trim();
  const [dragValue, setDragValue] = useState(null);
  const [isNumberDragging, setIsNumberDragging] = useState(false);
  const [isDragCancelHover, setIsDragCancelHover] = useState(false);
  const [dragCancelRect, setDragCancelRect] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const dragRef = useRef(null);
  const dragMovedRef = useRef(false);
  const editRef = useRef(null);
  const valueOriginalRef = useRef(String(valueNum));
  const rootRef = useRef(null);
  const shownValue = dragValue ?? valueNum;

  useEffect(() => {
    if (!isEditing && editRef.current) {
      editRef.current.textContent = String(shownValue);
    }
  }, [isEditing, shownValue]);

  useEffect(() => {
    if (!isEditing || !editRef.current) return;
    editRef.current.textContent = valueOriginalRef.current;
    selectEditableContents(editRef.current);
  }, [isEditing]);

  const emitValueChange = (valueNext) => {
    const valueNormalized = numNormalize(valueNext, config);
    if (valueNormalized === valueNum) return;
    onEvent?.('valueChangeAttempt', { value: valueNormalized });
  };

  const syncEditText = (valueNext) => {
    if (!editRef.current || !isEditing) return;
    editRef.current.textContent = String(valueNext);
    selectEditableContents(editRef.current);
  };

  const editStart = () => {
    if (isDisabled || isEditing) return;
    valueOriginalRef.current = String(valueNum);
    setIsEditing(true);
  };

  const editCommit = () => {
    if (!isEditing) return;
    const textNext = editRef.current?.textContent ?? '';
    setIsEditing(false);
    if (textNext === valueOriginalRef.current) return;
    emitValueChange(textNext);
  };

  const editCancel = () => {
    if (!isEditing) return;
    if (editRef.current) editRef.current.textContent = valueOriginalRef.current;
    setIsEditing(false);
  };

  const updateDragCancelRect = (anchorElement) => {
    const rootRect = (anchorElement?.closest('.num-value-root') || rootRef.current)?.getBoundingClientRect();
    const rowRect = anchorElement?.getBoundingClientRect();
    if (!rootRect || !rowRect) {
      setDragCancelRect(null);
      return;
    }
    const inset = 4;
    const width = Math.max(72, Math.min(110, rootRect.width));
    setDragCancelRect({
      left: Math.max(inset, Math.min(rowRect.left, window.innerWidth - width - inset)),
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
    return Boolean(element?.closest('.num-value-drag-cancel'));
  };

  const dragBegin = (event) => {
    if (isDisabled || ![0, 1].includes(event.button)) return;
    const targetElement = event.target instanceof Element ? event.target : null;
    if (targetElement?.closest('.num-value-step-button')) return;
    if (targetElement?.closest('.num-value-editable') && isEditing) {
      event.preventDefault();
      event.stopPropagation();
    }
    updateDragCancelRect(event.currentTarget);
    const drag = {
      pointerId: event.pointerId,
      xStart: event.clientX,
      valueStart: valueNum,
      valueCurrent: valueNum,
      step: stepSafe,
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
      const valueNext = numNormalize(drag.valueStart + deltaStep * drag.step, config);
      if (isEditing) syncEditText(valueNext);
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
      const isCancelled = upEvent.type === 'pointercancel'
        || isDragCancelTargetAtPoint(upEvent.clientX, upEvent.clientY);
      if (dragMovedRef.current && !isCancelled && drag.valueCurrent !== valueNum) {
        if (isEditing) syncEditText(drag.valueCurrent);
        emitValueChange(drag.valueCurrent);
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

  const rootClassName = [
    'num-value-root',
    isDisabled ? 'is-disabled' : '',
    isNumberDragging ? 'is-dragging' : '',
    config.className || '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      onPointerDownCapture={dragBegin}
      onClickCapture={(event) => {
        if (!dragMovedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <div className="num-value-row">
        <button
          type="button"
          className="num-value-step-button"
          disabled={isDisabled}
          onClick={() => emitValueChange(valueNum - stepSafe)}
        >
          <MinusIcon width={12} height={12} />
        </button>
        <div
          ref={editRef}
          className={`num-value-editable align-${alignValue} ${isEditing ? 'is-editing' : ''}`}
          contentEditable={!isDisabled && isEditing}
          suppressContentEditableWarning
          spellCheck={false}
          role="textbox"
          title={String(shownValue)}
          onClick={editStart}
          onBlur={editCommit}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault();
              editCommit();
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              editCancel();
            }
          }}
        >
          {isEditing ? null : String(shownValue)}
        </div>
        <button
          type="button"
          className="num-value-step-button"
          disabled={isDisabled}
          onClick={() => emitValueChange(valueNum + stepSafe)}
        >
          <PlusIcon width={12} height={12} />
        </button>
        {unitText ? <span className="num-value-unit">{unitText}</span> : null}
      </div>
      {isNumberDragging && dragCancelRect ? createPortal(
        <button
          type="button"
          className={`num-value-drag-cancel ${isDragCancelHover ? 'is-hover' : ''}`}
          style={{
            left: dragCancelRect.left,
            top: dragCancelRect.top,
            width: dragCancelRect.width,
          }}
          onPointerEnter={() => setIsDragCancelHover(true)}
          onPointerLeave={() => setIsDragCancelHover(false)}
        >
          Cancel
        </button>,
        document.body,
      ) : null}
    </div>
  );
};

export { numNormalize };
export default NumValue;
