import { useMemo } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import EndpointCard from './EndpointCard.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  Controls,
  ControlItem,
  CompDemoArea,
  MessageAndOutputs,
} from '../dev/demo/DemoLayout.jsx';
import { createStoreSimServer } from '../dev/demo/simServerStore.js';
import SimServerControl from '../dev/demo/SimServerControl.jsx';
import './example.css';

function createStoreDatabaseExample() {
  return makeAutoObservable({
    currentKey: 'local',
    items: [
      { key: 'local', label: 'Local', host: '127.0.0.1', port: 5432, databaseName: 'postgres', username: 'postgres' },
      { key: 'dev', label: 'Dev', host: '10.0.0.8', port: 5432, databaseName: 'app_dev', username: 'dev_user' },
    ],
    messageText: 'Use card actions to trigger async requests.',
    isGlobalLocked: false,
    lockToggle() {
      this.isGlobalLocked = !this.isGlobalLocked;
    },
    async actionRun(itemKey, actionId, storeSimServer) {
      if (!itemKey || !actionId) return { code: -1, message: 'Missing action' };
      const result = await storeSimServer.requestRun(`${actionId} ${itemKey}`);
      if (result.code !== 0) {
        this.messageText = result.message;
        return result;
      }
      if (actionId === 'switch') {
        this.currentKey = itemKey;
        this.messageText = `Switched to ${itemKey}`;
        return { code: 0 };
      }
      if (actionId === 'test') {
        this.messageText = `Test completed for ${itemKey}`;
        return { code: 0 };
      }
      this.messageText = result.message;
      return { code: 0 };
    },
  }, {}, { autoBind: true, deep: true });
}

const ExampleEndpointCards = observer(function ExampleEndpointCards({ store, storeSimServer }) {
  const storeLocal = useMemo(() => (store ? null : createStoreDatabaseExample()), [store]);
  const storeUsed = store || storeLocal;
  const storeSimServerOwn = useMemo(
    () => (storeSimServer ? null : createStoreSimServer({ delayAvgMs: 600, failRatePercent: 0 })),
    [storeSimServer],
  );
  const storeSimServerUsed = storeSimServer || storeSimServerOwn;

  return (
    <Example title="Endpoint cards">
      {storeSimServerOwn ? (
        <Controls>
          <SimServerControl labelText="Sim server (example)" store={storeSimServerOwn} />
        </Controls>
      ) : null}
      <CompDemoArea>
        <div className="database-example-card-list">
        {storeUsed.items.map((item) => {
          const isCurrent = item.key === storeUsed.currentKey;
          return (
            <EndpointCard
              key={item.key}
              data={{
                id: item.key,
                titleText: item.label,
                statusTagText: isCurrent ? 'current' : '',
                keyValues: [
                  { key: 'key', value: item.key },
                  { key: 'host', value: item.host },
                  { key: 'port', value: String(item.port) },
                  { key: 'database', value: item.databaseName },
                  { key: 'user', value: item.username },
                ],
              }}
              config={{
                isLocked: storeUsed.isGlobalLocked,
                actionItems: [
                  {
                    id: 'switch',
                    labelText: 'Switch',
                    isDisabled: isCurrent,
                  },
                  {
                    id: 'test',
                    labelText: 'Test',
                    isDisabled: false,
                  },
                ],
              }}
              onEvent={async (eventType, eventData) => {
                if (eventType === 'action') {
                  await storeUsed.actionRun(item.key, eventData.actionId, storeSimServerUsed);
                }
              }}
            />
          );
        })}
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.messageText}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const DbCardExamplesPanel = observer(function DbCardExamplesPanel() {
  const storeSimServer = useMemo(() => createStoreSimServer({ delayAvgMs: 600, failRatePercent: 0 }), []);
  const store = useMemo(() => createStoreDatabaseExample(), []);

  return (
    <DemoPanel>
      <Explanation titleText="Database">
        Endpoint card with data/config/onEvent and header actions.
      </Explanation>
      <SimServerControl labelText="Sim server" store={storeSimServer} />
      <Controls>
        <ControlItem>
          <button type="button" className="demo-button" onClick={() => store.lockToggle()}>
            {store.isGlobalLocked ? 'Unlock All' : 'Lock All'}
          </button>
        </ControlItem>
      </Controls>
      <ExampleEndpointCards store={store} storeSimServer={storeSimServer} />
    </DemoPanel>
  );
});

export const databaseExamples = {
  Database: {
    component: null,
    description: 'Endpoint card with data/config/onEvent and header actions',
    example: DbCardExamplesPanel,
  },
};

export default DbCardExamplesPanel;
