import React, { useState } from 'react';
import MetadataKeyValues from './MetadataKeyValues.jsx';

const MetadataExamplesPanel = () => {
  const [rows, setRows] = useState([
    { id: 'name', key: 'name', value: 'demo space' },
    { id: 'host', key: 'host', value: '127.0.0.1' },
    { id: 'share', key: 'share', value: '/Data' },
  ]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [messageState, setMessageState] = useState({ status: 'idle', messageText: '' });
  const [isRequestPending, setIsRequestPending] = useState(false);

  const createRow = () => ({ id: `row_${Date.now()}`, key: 'new_key', value: '' });
  const randomDelayMs = () => 300 + Math.floor(Math.random() * 700);

  const waitWithSignal = (ms, signal) => new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    if (!signal) {
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error('request aborted'));
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener('abort', onAbort, { once: true });
  });

  const fakeServerUpdate = async ({ signal, timeoutMs }) => {
    const delayMs = randomDelayMs();
    await waitWithSignal(delayMs, signal);
    const randomValue = Math.random();
    if (randomValue < 0.25) {
      return { code: -1, message: 'simulated server failure' };
    }
    if (randomValue < 0.40) {
      await waitWithSignal((timeoutMs || 1200) + 500, signal);
      return { code: 0, message: 'late success' };
    }
    return { code: 0, message: `server ok (${delayMs}ms)` };
  };

  return (
    <div style={{ maxWidth: '900px', padding: '12px' }}>
      <MetadataKeyValues
        data={{
          titleText: 'MetadataKeyValues Example',
          rows,
          selectedRowId,
          messageState,
        }}
        config={{
          isLocked: isRequestPending,
          requestTimeoutMs: 1800,
        }}
        onEvent={async (eventType, eventData) => {
          if (eventType === 'selectedRowIdChange') {
            if (eventData.selectedRowId === null) return;
            setSelectedRowId(eventData.selectedRowId);
            return;
          }
          if (eventType === 'cellUpdate') {
            const { rowId, field, nextValue, requestContext = {} } = eventData;
            const serverResult = await fakeServerUpdate(requestContext);
            if (serverResult.code !== 0) {
              return serverResult;
            }
            setRows((prev) => prev.map((row) => {
              if (row.id !== rowId) return row;
              if (field === 'key') {
                return { ...row, key: nextValue };
              }
              return { ...row, value: nextValue };
            }));
            return serverResult;
          }
          if (eventType === 'addAtEnd') {
            const row = createRow();
            setRows((prev) => [...prev, row]);
            setSelectedRowId(row.id);
            return;
          }
          if (eventType === 'addAbove') {
            if (!selectedRowId) return;
            const row = createRow();
            setRows((prev) => {
              const idx = prev.findIndex((item) => item.id === selectedRowId);
              if (idx < 0) return prev;
              const next = [...prev];
              next.splice(idx, 0, row);
              return next;
            });
            setSelectedRowId(row.id);
            return;
          }
          if (eventType === 'addBelow') {
            if (!selectedRowId) return;
            const row = createRow();
            setRows((prev) => {
              const idx = prev.findIndex((item) => item.id === selectedRowId);
              if (idx < 0) return prev;
              const next = [...prev];
              next.splice(idx + 1, 0, row);
              return next;
            });
            setSelectedRowId(row.id);
            return;
          }
          if (eventType === 'moveUp') {
            if (!selectedRowId) return;
            setRows((prev) => {
              const idx = prev.findIndex((item) => item.id === selectedRowId);
              if (idx <= 0) return prev;
              const next = [...prev];
              const [row] = next.splice(idx, 1);
              next.splice(idx - 1, 0, row);
              return next;
            });
            return;
          }
          if (eventType === 'moveDown') {
            if (!selectedRowId) return;
            setRows((prev) => {
              const idx = prev.findIndex((item) => item.id === selectedRowId);
              if (idx < 0 || idx >= prev.length - 1) return prev;
              const next = [...prev];
              const [row] = next.splice(idx, 1);
              next.splice(idx + 1, 0, row);
              return next;
            });
            return;
          }
          if (eventType === 'delete') {
            if (!selectedRowId) return;
            setRows((prev) => prev.filter((row) => row.id !== selectedRowId));
            setSelectedRowId(null);
            return;
          }
          if (eventType === 'requestStateChange') {
            setIsRequestPending(Boolean(eventData.isPending));
            return;
          }
          if (eventType === 'messageStateChange') {
            setMessageState(eventData.messageState);
            return;
          }
          if (eventType === 'messageDismiss') {
            setMessageState({ status: 'idle', messageText: '' });
          }
        }}
      />
    </div>
  );
};

export const metadataExamples = {
  Metadata: {
    component: null,
    description: 'Reusable metadata editing panel powered by data and callbacks',
    example: () => <MetadataExamplesPanel />,
  },
};
