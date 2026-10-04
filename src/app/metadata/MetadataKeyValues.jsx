import React, { useMemo, useRef, useState } from 'react';
import KeyValuesComp from '../../component/key-value/KeyValuesComp.jsx';
import EditableValueComp from '../../component/value/EditableValueComp.jsx';
import { createValueCompOnEvent } from '../../component/value/valueCompEvent.js';
import SpinningCircle from '../../icon/SpinningCircle.jsx';
import './MetadataKeyValues.css';

const buttonLabelDefaultById = {
  addAtEnd: 'Add at End',
  addAbove: 'Add Above',
  addBelow: 'Add Below',
  moveUp: 'Up',
  moveDown: 'Down',
  delete: 'Delete',
};

const MetadataKeyValues = ({
  data = {},
  config = {},
  onEvent,
  // Extra controls rendered after the built-in buttons, on the same row.
  compActionsAfter = null,
}) => {
  const titleText = data?.titleText || 'Metadata';
  const rows = Array.isArray(data?.rows) ? data.rows : [];
  const selectedRowId = data?.selectedRowId ?? null;
  const messageState = data?.messageState ?? null;
  // Optional column captions shown as a header row above the table.
  const headerKeyText = data?.headerKeyText ?? '';
  const headerValueText = data?.headerValueText ?? '';
  const isHeaderVisible = headerKeyText !== '' || headerValueText !== '';
  const isLocked = Boolean(config?.isLocked);
  const isEditable = config?.isEditable === undefined ? true : Boolean(config.isEditable);
  const isTitleVisible = config?.isTitleVisible !== false;
  const isMessageVisible = config?.isMessageVisible !== false;
  // Up/Down make no sense when the caller keeps the rows in a derived order.
  const isMoveVisible = config?.isMoveVisible !== false;
  const buttonLabelById = { ...buttonLabelDefaultById, ...(config?.labelTextByButtonId || {}) };
  const keyColWidth = config?.keyColWidth || '180px';
  const requestTimeoutMs = config?.requestTimeoutMs ?? 8000;
  const [isRequestPending, setIsRequestPending] = useState(false);
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
  const effectiveLocked = isLocked || isRequestPending;

  const selectedRowIndex = selectedRowId === null
    ? -1
    : rows.findIndex((row) => row.id === selectedRowId);
  const isMoveUpDisabled = selectedRowIndex <= 0;
  const isMoveDownDisabled = selectedRowIndex < 0 || selectedRowIndex >= rows.length - 1;
  const isDeleteDisabled = selectedRowIndex < 0;
  const isActionDisabled = effectiveLocked || !isEditable;

  const getTimeoutMsNormalized = () => (
    Number.isFinite(requestTimeoutMs)
      ? Math.max(500, Math.min(30000, Math.floor(requestTimeoutMs)))
      : 8000
  );

  const beginPendingRequest = (requestMeta = {}) => {
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    setIsRequestPending(true);
    if (requestMeta.rowId && requestMeta.field) {
      setPendingCell({ rowId: requestMeta.rowId, field: requestMeta.field });
    } else {
      setPendingCell(null);
    }
    emitEvent('requestStateChange', { isPending: true, ...requestMeta });
    setEffectiveMessageState({
      status: 'loading',
      messageText: 'Request sent. Waiting for server response',
    });
    return requestId;
  };

  const endPendingRequest = (requestId) => {
    if (requestSequenceRef.current !== requestId) {
      return;
    }
    setIsRequestPending(false);
    setPendingCell(null);
    emitEvent('requestStateChange', {
      isPending: false,
      rowId: null,
      field: null,
      eventType: null,
    });
  };

  const runPendingRequest = async (eventType, eventData = {}, requestMeta = {}) => {
    if (!onEvent || isLocked || isRequestPending) {
      return null;
    }
    const requestId = beginPendingRequest({ eventType, ...requestMeta });
    const abortController = new AbortController();
    const normalizedTimeoutMs = getTimeoutMsNormalized();
    const timeoutHandle = window.setTimeout(() => {
      abortController.abort();
    }, normalizedTimeoutMs);
    try {
      const result = await Promise.race([
        Promise.resolve(emitEvent(eventType, {
          ...eventData,
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
      if (eventType === 'cellUpdate') {
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
      }
      if (result && typeof result === 'object' && Number(result.code) < 0) {
        setEffectiveMessageState({
          status: 'error',
          messageText: String(result.message || 'Request failed'),
        });
      } else if (result && typeof result === 'object' && Number(result.code) === 0) {
        // a confirmed row operation ends the loading message
        setEffectiveMessageState(result.message
          ? { status: 'success', messageText: String(result.message) }
          : { status: 'idle', messageText: '' });
      }
      return result;
    } finally {
      window.clearTimeout(timeoutHandle);
      endPendingRequest(requestId);
    }
  };

  const tableData = useMemo(() => rows.map((row) => ({
    id: row.id,
    key: row.key,
    value: row.value,
    keyCompName: 'editable',
    valueCompName: 'editable',
  })), [rows]);

  const EditableMetadataComp = ({ data, field, rowId, isEditable: isEditableFromList }) => (
    <EditableValueComp
      data={{ value: String(data ?? '') }}
      config={{
        configKey: `${field}_${String(rowId || '')}`,
        valueType: 'text',
        isNotSet: false,
        isEditable: Boolean(isEditableFromList) && !effectiveLocked,
        isExternalSubmitting:
          isRequestPending
          && pendingCell?.rowId === rowId
          && pendingCell?.field === field,
        field,
        rowId,
      }}
      onEvent={createValueCompOnEvent({
        onUpdate: async (_key, nextValue) => runPendingRequest('cellUpdate', {
          rowId: String(rowId),
          field: String(field),
          nextValue: String(nextValue ?? ''),
        }, {
          rowId: String(rowId),
          field: String(field),
        }),
      })}
    />
  );

  return (
    <div className="metadata-kv-root">
      {isTitleVisible ? <div className="metadata-kv-title">{titleText}</div> : null}
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
      {/* mousedown must not bubble: the table clears its selection on any
          mousedown outside itself, which would disable these buttons before
          their click event and swallow the action silently */}
      <div
        className={`metadata-kv-actions ${effectiveLocked ? 'is-locked' : ''}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="metadata-kv-btn"
          disabled={isActionDisabled}
          onClick={() => runPendingRequest('addAtEnd', { selectedRowId })}
        >
          {buttonLabelById.addAtEnd}
        </button>
        <button
          type="button"
          className="metadata-kv-btn"
          disabled={isActionDisabled || isDeleteDisabled}
          onClick={() => runPendingRequest('addAbove', { selectedRowId })}
        >
          {buttonLabelById.addAbove}
        </button>
        <button
          type="button"
          className="metadata-kv-btn"
          disabled={isActionDisabled || isDeleteDisabled}
          onClick={() => runPendingRequest('addBelow', { selectedRowId })}
        >
          {buttonLabelById.addBelow}
        </button>
        {isMoveVisible ? (
          <button
            type="button"
            className="metadata-kv-btn"
            disabled={isActionDisabled || isMoveUpDisabled}
            onClick={() => runPendingRequest('moveUp', { selectedRowId })}
          >
            {buttonLabelById.moveUp}
          </button>
        ) : null}
        {isMoveVisible ? (
          <button
            type="button"
            className="metadata-kv-btn"
            disabled={isActionDisabled || isMoveDownDisabled}
            onClick={() => runPendingRequest('moveDown', { selectedRowId })}
          >
            {buttonLabelById.moveDown}
          </button>
        ) : null}
        <button
          type="button"
          className="metadata-kv-btn danger"
          disabled={isActionDisabled || isDeleteDisabled}
          onClick={() => runPendingRequest('delete', { selectedRowId })}
        >
          {buttonLabelById.delete}
        </button>
        {compActionsAfter}
      </div>
      {isHeaderVisible ? (
        <div className="metadata-kv-header" style={{ '--metadata-kv-key-col-width': keyColWidth }}>
          <div className="metadata-kv-header-key">{headerKeyText}</div>
          <div className="metadata-kv-header-value">{headerValueText}</div>
        </div>
      ) : null}
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
              if (effectiveLocked) {
                return;
              }
              emitEvent('selectedRowIdChange', eventData);
            }
          }}
        />
      </div>
    </div>
  );
};

export default MetadataKeyValues;
