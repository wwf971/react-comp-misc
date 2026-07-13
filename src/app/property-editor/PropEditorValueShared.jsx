import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SpinningCircle from '../../icon/SpinningCircle.jsx';

function RequestStatus({ requestState, onDismiss }) {
  const anchorRef = useRef(null);
  const [panelRect, panelRectSet] = useState(null);
  if (!requestState) return null;
  if (requestState.status === 'pending') {
    return (
      <span className="prop-editor-request-status is-pending">
        <SpinningCircle width={13} height={13} color="#5b6f89" />
      </span>
    );
  }
  if (requestState.status !== 'error') return null;
  const messageText = String(requestState.message ?? 'Update failed');
  const panelShow = () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    const editorRect = anchorRef.current?.closest('.prop-editor-root')?.getBoundingClientRect();
    if (!rect) return;
    const panelInset = 6;
    const panelRight = Math.min((editorRect?.right ?? window.innerWidth) - panelInset, window.innerWidth - panelInset);
    const panelLeftMin = Math.max(editorRect?.left ?? panelInset, panelInset);
    const panelLeft = Math.max(panelLeftMin, Math.min(rect.left + 18, panelRight - 160));
    panelRectSet({
      left: panelLeft,
      top: rect.top + rect.height / 2,
      width: Math.max(1, panelRight - panelLeft),
    });
  };
  const panelHide = () => panelRectSet(null);
  return (
    <span ref={anchorRef} className="prop-editor-request-status is-error" onMouseEnter={panelShow} onMouseLeave={panelHide}>
      <span className="prop-editor-error-inline">{messageText}</span>
      {panelRect ? createPortal(
        <span className="prop-editor-error-panel is-fixed" style={{ left: panelRect.left, top: panelRect.top, width: panelRect.width }} onMouseEnter={panelShow} onMouseLeave={panelHide}>
          <span className="prop-editor-error-text">{messageText}</span>
          <button type="button" className="prop-editor-error-dismiss" onClick={onDismiss}>Dismiss</button>
        </span>,
        document.body,
      ) : null}
    </span>
  );
}

function ValueShell({ itemRef, children, className = '', onPointerDownCapture, onClickCapture }) {
  return (
    <div className={`prop-editor-value-shell ${className} ${itemRef?.isDisabled ? 'is-disabled' : ''}`.trim()} onPointerDownCapture={onPointerDownCapture} onClickCapture={onClickCapture}>
      {children}
      <RequestStatus
        requestState={itemRef?.requestState}
        onDismiss={() => itemRef?.onRequestDismiss?.(itemRef.propertyPath)}
      />
    </div>
  );
}

function selectEditableContents(element) {
  if (!element) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

const EditableValue = forwardRef(function EditableValue({ value, className, onCommit, align = 'left', isLocked = false, isTextSyncedWhileEditing = false }, ref) {
  const valueText = String(value ?? '');
  const editRef = useRef(null);
  const valueOriginalRef = useRef(valueText);
  const isEditingRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing && editRef.current) editRef.current.textContent = valueText;
  }, [isEditing, valueText]);

  useEffect(() => {
    if (!isEditing || !editRef.current) return;
    editRef.current.textContent = valueOriginalRef.current;
    selectEditableContents(editRef.current);
  }, [isEditing]);

  useEffect(() => {
    if (!isTextSyncedWhileEditing || !isEditing || !editRef.current) return;
    editRef.current.textContent = valueText;
    valueOriginalRef.current = valueText;
    selectEditableContents(editRef.current);
  }, [isTextSyncedWhileEditing, isEditing, valueText]);

  useImperativeHandle(ref, () => ({
    isEditing: () => isEditingRef.current,
    replaceEditText: (valueNext) => {
      if (!isEditingRef.current || !editRef.current) return;
      const valueTextNext = String(valueNext ?? '');
      editRef.current.textContent = valueTextNext;
      valueOriginalRef.current = valueTextNext;
      selectEditableContents(editRef.current);
    },
  }));

  const editStart = () => {
    if (isLocked || isEditing) return;
    valueOriginalRef.current = valueText;
    isEditingRef.current = true;
    setIsEditing(true);
  };

  const editCommit = () => {
    if (!isEditingRef.current) return;
    const valueNext = editRef.current?.textContent ?? '';
    isEditingRef.current = false;
    setIsEditing(false);
    if (valueNext !== valueOriginalRef.current) onCommit?.(valueNext);
  };

  const editCancel = () => {
    if (!isEditingRef.current) return;
    if (editRef.current) editRef.current.textContent = valueOriginalRef.current;
    isEditingRef.current = false;
    setIsEditing(false);
  };

  useEffect(() => {
    if (!isEditing) return undefined;
    const outsidePointerCommit = (event) => {
      const target = event.target;
      const valueCell = editRef.current?.closest('.value-cell');
      if (target instanceof Node && valueCell?.contains(target)) return;
      editCommit();
    };
    document.addEventListener('pointerdown', outsidePointerCommit, true);
    return () => document.removeEventListener('pointerdown', outsidePointerCommit, true);
  }, [isEditing]);

  return (
    <span
      ref={editRef}
      className={`prop-editor-editable-value ${className ?? ''}`}
      contentEditable={isEditing && !isLocked}
      suppressContentEditableWarning
      spellCheck={false}
      style={{ textAlign: align }}
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
      {isEditing ? null : valueText}
    </span>
  );
});

function isValueLocked(itemRef) {
  return Boolean(itemRef?.isReadOnly || itemRef?.isDisabled || itemRef?.isEditorLocked || itemRef?.requestState?.status === 'pending');
}

export { EditableValue, ValueShell, isValueLocked };