import { useMemo } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import MetadataKeyValues from './MetadataKeyValues.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  CompDemoArea,
} from '../../dev/demo/DemoLayout.jsx';

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

function createStoreMetadataDemo() {
  return makeAutoObservable({
    rows: [
      { id: 'name', key: 'name', value: 'demo space' },
      { id: 'host', key: 'host', value: '127.0.0.1' },
      { id: 'share', key: 'share', value: '/Data' },
    ],
    selectedRowId: null,
    messageState: { status: 'idle', messageText: '' },
    isRequestPending: false,
    async handleEvent(eventType, eventData) {
      if (eventType === 'selectedRowIdChange') {
        if (eventData.selectedRowId === null) return;
        this.selectedRowId = eventData.selectedRowId;
        return;
      }
      if (eventType === 'cellUpdate') {
        const { rowId, field, nextValue, requestContext = {} } = eventData;
        const serverResult = await fakeServerUpdate(requestContext);
        if (serverResult.code !== 0) {
          return serverResult;
        }
        runInAction(() => {
          const row = this.rows.find((item) => item.id === rowId);
          if (row) {
            if (field === 'key') {
              row.key = nextValue;
            } else {
              row.value = nextValue;
            }
          }
        });
        return serverResult;
      }
      if (eventType === 'addAtEnd') {
        const row = createRow();
        this.rows.push(row);
        this.selectedRowId = row.id;
        return;
      }
      if (eventType === 'addAbove') {
        if (!this.selectedRowId) return;
        const row = createRow();
        const idx = this.rows.findIndex((item) => item.id === this.selectedRowId);
        if (idx < 0) return;
        this.rows.splice(idx, 0, row);
        this.selectedRowId = row.id;
        return;
      }
      if (eventType === 'addBelow') {
        if (!this.selectedRowId) return;
        const row = createRow();
        const idx = this.rows.findIndex((item) => item.id === this.selectedRowId);
        if (idx < 0) return;
        this.rows.splice(idx + 1, 0, row);
        this.selectedRowId = row.id;
        return;
      }
      if (eventType === 'moveUp') {
        if (!this.selectedRowId) return;
        const idx = this.rows.findIndex((item) => item.id === this.selectedRowId);
        if (idx <= 0) return;
        const [row] = this.rows.splice(idx, 1);
        this.rows.splice(idx - 1, 0, row);
        return;
      }
      if (eventType === 'moveDown') {
        if (!this.selectedRowId) return;
        const idx = this.rows.findIndex((item) => item.id === this.selectedRowId);
        if (idx < 0 || idx >= this.rows.length - 1) return;
        const [row] = this.rows.splice(idx, 1);
        this.rows.splice(idx + 1, 0, row);
        return;
      }
      if (eventType === 'delete') {
        if (!this.selectedRowId) return;
        this.rows.replace(this.rows.filter((row) => row.id !== this.selectedRowId));
        this.selectedRowId = null;
        return;
      }
      if (eventType === 'requestStateChange') {
        this.isRequestPending = Boolean(eventData.isPending);
        return;
      }
      if (eventType === 'messageStateChange') {
        this.messageState = eventData.messageState;
        return;
      }
      if (eventType === 'messageDismiss') {
        this.messageState = { status: 'idle', messageText: '' };
      }
    },
  }, {}, { autoBind: true });
}

const MetadataExamplesPanel = observer(function MetadataExamplesPanel({ store }) {
  const storeOwn = useMemo(() => (store ? null : createStoreMetadataDemo()), [store]);
  const storeUsed = store || storeOwn;

  return (
    <DemoPanel>
      <Explanation titleText="Metadata">
        Reusable metadata editing panel. Cell updates go through a fake server with abort, timeout, about 25% failure, and occasional late success past the timeout.
      </Explanation>
      <Example title="MetadataKeyValues">
        <CompDemoArea>
          <MetadataKeyValues
            data={{
              titleText: 'MetadataKeyValues Example',
              rows: storeUsed.rows,
              selectedRowId: storeUsed.selectedRowId,
              messageState: storeUsed.messageState,
            }}
            config={{
              isLocked: storeUsed.isRequestPending,
              requestTimeoutMs: 1800,
            }}
            onEvent={storeUsed.handleEvent}
          />
        </CompDemoArea>
      </Example>
    </DemoPanel>
  );
});

export const metadataExamples = {
  Metadata: {
    component: null,
    description: 'Reusable metadata editing panel powered by data and callbacks',
    example: MetadataExamplesPanel,
  },
};
