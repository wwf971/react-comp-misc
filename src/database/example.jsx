import React, { useMemo, useState } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import DbConnectionCard from './DbConnectionCard.jsx';

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const DbCardExamplesPanel = observer(() => {
  const store = useMemo(() => {
    const state = {
      currentKey: 'local',
      items: [
        { key: 'local', label: 'Local', host: '127.0.0.1', port: 5432, databaseName: 'postgres', username: 'postgres' },
        { key: 'dev', label: 'Dev', host: '10.0.0.8', port: 5432, databaseName: 'app_dev', username: 'dev_user' },
      ],
      messageText: 'Use card actions to trigger async requests.',
    };
    return makeAutoObservable(state, {}, { deep: true });
  }, []);

  const [isGlobalLocked, setIsGlobalLocked] = useState(false);

  const handleAction = async (itemKey, actionId) => {
    if (!itemKey || !actionId) return;
    if (actionId === 'switch') {
      await wait(600);
      runInAction(() => {
        store.currentKey = itemKey;
        store.messageText = `Switched to ${itemKey}`;
      });
      return;
    }
    if (actionId === 'test') {
      await wait(600);
      runInAction(() => {
        store.messageText = `Test completed for ${itemKey}`;
      });
    }
  };

  return (
    <div style={{ maxWidth: '760px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <button
          type="button"
          style={{ border: '1px solid #c8d2df', borderRadius: '3px', padding: '2px 6px', fontSize: '12px' }}
          onClick={() => {
            setIsGlobalLocked((prev) => !prev);
          }}
        >
          {isGlobalLocked ? 'Unlock All' : 'Lock All'}
        </button>
        <span style={{ fontSize: '12px', color: '#5b6474' }}>{store.messageText}</span>
      </div>

      {store.items.map((item) => {
        const isCurrent = item.key === store.currentKey;
        return (
          <DbConnectionCard
            key={item.key}
            titleText={item.label}
            statusTagText={isCurrent ? 'current' : ''}
            keyValuesData={[
              { key: 'key', value: item.key },
              { key: 'host', value: item.host },
              { key: 'port', value: String(item.port) },
              { key: 'database', value: item.databaseName },
              { key: 'user', value: item.username },
            ]}
            actionItems={[
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
            ]}
            isLocked={isGlobalLocked}
            onAction={async (actionId) => {
              await handleAction(item.key, actionId);
            }}
          />
        );
      })}
    </div>
  );
});

export const databaseExamples = {
  'Database': {
    component: null,
    description: 'Database connection card with data-driven actions and parent callbacks',
    example: () => <DbCardExamplesPanel />,
  },
};
