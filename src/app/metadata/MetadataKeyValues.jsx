import React, { useMemo, useRef, useState } from 'react';
import KeyValuesComp from '../../component/key-value/KeyValuesComp.jsx';
import EditableValueComp from '../../layout/value-comp/EditableValueComp.jsx';
import SpinningCircle from '../../icon/SpinningCircle.jsx';
import './MetadataKeyValues.css';

const MetadataKeyValues = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const titleText = data?.titleText || 'Metadata';
  const rows = Array.isArray(data?.rows) ? data.rows : [];
  const selectedRowId = data?.selectedRowId ?? null;
  const messageState = data?.messageState ?? null;
  const isLocked = Boolean(config?.isLocked);
  const isEditable = config?.isEditable === undefined ? true : Boolean(config.isEditable);
  const isMessageVisible = config?.isMessageVisible !== false;
  const keyColWidth = config?.keyColWidth || '180px';
  const requestTimeoutMs = config?.requestTimeoutMs ?? 8000;
  const [pendingCell, setPendingCell] = useState(null);
  const [internalMessageState, setInternalMessageState] = useState({ status: 'idle', messageText: '' });
  const requestSequenceRef = useRef(0);

  const emitEvent = (eventType, eventData) => {
    if (!onEvent) {
      return null;
    }
    return onEvent(eventType, eventData);
  };

  const setEffectiveMessageState = (nextState) => {
    setInternalMessageState(nextState);
    emitEvent('messageStateChange', { messageState: nextState });
  };

  const effectiveMessageState = messageState ?? internalMessageState;
  const isRequestPending = pendingCell !== null;
  const effectiveLocked = isLocked || isRequestPending;

  const selectedRowIndex = selectedRowId === null
    ? -1
    : rows.findIndex((row) => row.id === selectedRowId);
  const isMoveUpDisabled = selectedRowIndex <= 0;
  const isMoveDownDisabled = selectedRowIndex < 0 || selectedRowIndex >= rows.length - 1;
  const isDeleteDisabled = selectedRowIndex < 0;
  const isActionDisabled = effectiveLocked || !isEditable;

  const tableData = useMemo(() => rows.map((row) => ({
    id: row.id,
    key: row.key,
    value: row.value,
    keyCompName: 'editable',
    valueCompName: 'editable',
  })), [rows]);

  const EditableMetadataComp = ({ data, field, rowId, isEditable: isEditableFromList }) => (
    <EditableValueComp
      data={String(data ?? '')}
      configKey={`${field}_${String(rowId || '')}`}
      valueType="text"
      isNotSet={false}
      isEditable={Boolean(isEditableFromList) && !effectiveLocked}
      isExternalSubmitting={
        isRequestPending
        && pendingCell?.rowId === rowId
        && pendingCell?.field === field
      }
      onUpdate={async (_key, nextValue) => {
        if (!onEvent || !rowId) {
          return { code: 0, message: 'noop' };
        }
        const requestId = requestSequenceRef.current + 1;
        requestSequenceRef.current = requestId;
        setPendingCell({ rowId, field });
        emitEvent('requestStateChange', { isPending: true, rowId, field });
        setEffectiveMessageState({
          status: 'loading',
          messageText: 'Request sent. Waiting for server response',
        });
        const abortController = new AbortController();
        const normalizedTimeoutMs = Number.isFinite(requestTimeoutMs)
          ? Math.max(500, Math.min(30000, Math.floor(requestTimeoutMs)))
          : 8000;
        const timeoutHandle = window.setTimeout(() => {
          abortController.abort();
        }, normalizedTimeoutMs);
        try {
          const result = await Promise.race([
            Promise.resolve(emitEvent('cellUpdate', {
              rowId: String(rowId),
              field: String(field),
              nextValue: String(nextValue ?? ''),
              requestContext: {
                signal: abortController.signal,
                timeoutMs: normalizedTimeoutMs,
              },
            })),
            new Promise((resolve) => {
              abortController.signal.addEventListener('abort', () => {
                resolve({
                  code: -1,
                  message: `request timeout (${normalizedTimeoutMs}ms)`,
                });
              }, { once: true });
            }),
          ]);
          const normalizedResult = result || { code: -1, message: 'unknown error' };
          if (normalizedResult.code === 0) {
            setEffectiveMessageState({
              status: 'success',
              messageText: String(normalizedResult.message || 'Update success'),
            });
            return { code: 0, message: String(normalizedResult.message || 'ok') };
          }
          setEffectiveMessageState({
            status: 'error',
            messageText: String(normalizedResult.message || 'Update failed'),
          });
          return { code: -1, message: String(normalizedResult.message || 'error') };
        } finally {
          window.clearTimeout(timeoutHandle);
          if (requestSequenceRef.current === requestId) {
            setPendingCell(null);
            emitEvent('requestStateChange', { isPending: false, rowId: null, field: null });
          }
        }
      }}
    />
  );

  return (
    <div className="metadata-kv-root">
      <div className="metadata-kv-title">{titleText}</div>
      {isMessageVisible && effectiveMessageState?.messageText ? (
        <div className={`metadata-kv-message status-${String(effectiveMessageState.status || 'idle')}`}>
          {effectiveMessageState.status === 'loading' ? <SpinningCircle width={13} height={13} /> : null}
          <div className="metadata-kv-message-content">
            <span>{effectiveMessageState.messageText}</span>
            {onEvent ? (
              <button
                type="button"
                className="metadata-kv-dismiss-btn"
                onClick={() => {
                  emitEvent('messageDismiss', { messageState: effectiveMessageState });
                  if (messageState === null) {
                    setEffectiveMessageState({ status: 'idle', messageText: '' });
                  }
                }}
                disabled={effectiveMessageState.status === 'loading'}
              >
                Dismiss
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="metadata-kv-actions">
        <button
          type="button"
          className="metadata-kv-btn"
          disabled={isActionDisabled}
          onClick={() => emitEvent('addAtEnd', { selectedRowId })}
        >
          Add at End
        </button>
        <button
          type="button"
          className="metadata-kv-btn"
          disabled={isActionDisabled || isDeleteDisabled}
          onClick={() => emitEvent('addAbove', { selectedRowId })}
        >
          Add Above
        </button>
        <button
          type="button"
          className="metadata-kv-btn"
          disabled={isActionDisabled || isDeleteDisabled}
          onClick={() => emitEvent('addBelow', { selectedRowId })}
        >
          Add Below
        </button>
        <button
          type="button"
          className="metadata-kv-btn"
          disabled={isActionDisabled || isMoveUpDisabled}
          onClick={() => emitEvent('moveUp', { selectedRowId })}
        >
          Up
        </button>
        <button
          type="button"
          className="metadata-kv-btn"
          disabled={isActionDisabled || isMoveDownDisabled}
          onClick={() => emitEvent('moveDown', { selectedRowId })}
        >
          Down
        </button>
        <button
          type="button"
          className="metadata-kv-btn danger"
          disabled={isActionDisabled || isDeleteDisabled}
          onClick={() => emitEvent('delete', { selectedRowId })}
        >
          Delete
        </button>
      </div>
      <div className={`metadata-kv-table ${effectiveLocked ? 'is-locked' : ''}`}>
        <KeyValuesComp
          data={{
            rows: tableData,
            selectedRowId,
          }}
          config={{
            isEditable: !effectiveLocked && isEditable,
            isKeyEditable: !effectiveLocked && isEditable,
            isValueEditable: !effectiveLocked && isEditable,
            keyColWidth,
            selectionMode: 'single',
            compResolveFn: (name) => {
              if (name === 'editable') {
                return EditableMetadataComp;
              }
              return null;
            },
          }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'selectedRowIdChange') {
              emitEvent('selectedRowIdChange', eventData);
            }
          }}
        />
      </div>
    </div>
  );
};

export default MetadataKeyValues;
