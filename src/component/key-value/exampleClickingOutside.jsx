import { useCallback, useMemo } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import KeyValuesComp from './KeyValuesComp.jsx';
import EditableValueComp from '../value/EditableValueComp.jsx';
import { createValueCompOnEvent } from '../value/valueCompEvent.js';
import {
  DemoPanel,
  Example,
  Explanation,
  Controls,
  ControlItem,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';

function createStoreClickingOutside() {
  const state = {
    rows: [
      { id: 'r1', key: 'name', value: 'alpha', keyCompName: 'editableAsync', valueCompName: 'editableAsync' },
      { id: 'r2', key: 'owner', value: 'team-a', keyCompName: 'editableAsync', valueCompName: 'editableAsync' },
      { id: 'r3', key: 'status', value: 'active', keyCompName: 'editableAsync', valueCompName: 'editableAsync' },
    ],
    nextIndex: 4,
    selectedRowId: null,
    isProtectSelectionOnActionClick: true,
    messageText: 'Select one row, then click action buttons.',
    selectedRowIdSet(selectedRowId) {
      this.selectedRowId = selectedRowId;
    },
    protectionToggle() {
      this.isProtectSelectionOnActionClick = !this.isProtectSelectionOnActionClick;
    },
    messageTextSet(messageText) {
      this.messageText = messageText;
    },
  };
  return makeAutoObservable(state, {}, { deep: true, autoBind: true });
}

export const ClickingOutsidePanel = observer(function ClickingOutsidePanel({ store }) {
  const wait = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

  const storeLocal = useMemo(() => (store ? null : createStoreClickingOutside()), [store]);
  const storeUsed = store || storeLocal;

  const selectedRowIndex = storeUsed.selectedRowId === null
    ? -1
    : storeUsed.rows.findIndex((item) => item.id === storeUsed.selectedRowId);
  const isMoveUpDisabled = selectedRowIndex <= 0;
  const isMoveDownDisabled = selectedRowIndex < 0 || selectedRowIndex >= storeUsed.rows.length - 1;

  const createRow = () => {
    const id = `r${storeUsed.nextIndex}`;
    storeUsed.nextIndex += 1;
    return {
      id,
      key: `new_key_${id}`,
      value: '',
      keyCompName: 'editableAsync',
      valueCompName: 'editableAsync',
    };
  };

  const EditableAsyncComp = ({ data, field, index, itemRef }) => (
    <EditableValueComp
      data={{ value: String(data || '') }}
      config={{
        configKey: `${field}_${String(itemRef?.id || index)}`,
        valueType: 'text',
        isNotSet: false,
        index,
        field,
      }}
      onEvent={createValueCompOnEvent({
        onUpdate: async (_key, val) => {
          await wait(500);
          runInAction(() => {
            itemRef[field] = String(val || '');
          });
          return { code: 0, message: 'Updated' };
        },
      })}
    />
  );

  const getComp = useCallback((name) => {
    if (name === 'editableAsync') {
      return EditableAsyncComp;
    }
    return null;
  }, []);

  const handleAction = (type) => {
    if (selectedRowIndex < 0) {
      storeUsed.messageTextSet('No row selected.');
      return;
    }

    runInAction(() => {
      if (type === 'addAbove') {
        const row = createRow();
        storeUsed.rows.splice(selectedRowIndex, 0, row);
        storeUsed.selectedRowIdSet(row.id);
        storeUsed.messageTextSet(`Added above: ${row.id}`);
        return;
      }
      if (type === 'addBelow') {
        const row = createRow();
        storeUsed.rows.splice(selectedRowIndex + 1, 0, row);
        storeUsed.selectedRowIdSet(row.id);
        storeUsed.messageTextSet(`Added below: ${row.id}`);
        return;
      }
      if (type === 'moveUp' && selectedRowIndex > 0) {
        const row = storeUsed.rows[selectedRowIndex];
        storeUsed.rows.splice(selectedRowIndex, 1);
        storeUsed.rows.splice(selectedRowIndex - 1, 0, row);
        storeUsed.messageTextSet(`Moved up: ${row.id}`);
        return;
      }
      if (type === 'moveDown' && selectedRowIndex >= 0 && selectedRowIndex < storeUsed.rows.length - 1) {
        const row = storeUsed.rows[selectedRowIndex];
        storeUsed.rows.splice(selectedRowIndex, 1);
        storeUsed.rows.splice(selectedRowIndex + 1, 0, row);
        storeUsed.messageTextSet(`Moved down: ${row.id}`);
        return;
      }
      if (type === 'delete') {
        const row = storeUsed.rows[selectedRowIndex];
        storeUsed.rows.splice(selectedRowIndex, 1);
        storeUsed.selectedRowIdSet(null);
        storeUsed.messageTextSet(`Deleted: ${row.id}`);
      }
    });
  };

  return (
    <Example title="KeyValuesComp - Clicking Outside and Action Buttons">
      <Explanation>
        Technique: Keep selection controlled, and stop mousedown propagation on action buttons.
      </Explanation>
      <Explanation>
        <ul>
          <li>Select one row.</li>
          <li>Click action buttons after clicking outside.</li>
          <li>Toggle protection to compare behavior. ON means the action bar consumes mousedown before outside-click unselect.</li>
        </ul>
      </Explanation>
      <Controls>
        <ControlItem>
          <button
            type="button"
            className={`demo-button${storeUsed.isProtectSelectionOnActionClick ? ' is-active' : ''}`}
            onClick={() => storeUsed.protectionToggle()}
          >
            {storeUsed.isProtectSelectionOnActionClick ? 'Protection: ON' : 'Protection: OFF'}
          </button>
        </ControlItem>
      </Controls>
      <CompDemoArea>
        <div
          style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}
          onMouseDown={(event) => {
            if (storeUsed.isProtectSelectionOnActionClick) {
              event.stopPropagation();
            }
          }}
        >
          <button type="button" onClick={() => handleAction('addAbove')} style={{ padding: '2px 6px', fontSize: '12px' }} disabled={selectedRowIndex < 0}>
            Add Above
          </button>
          <button type="button" onClick={() => handleAction('addBelow')} style={{ padding: '2px 6px', fontSize: '12px' }} disabled={selectedRowIndex < 0}>
            Add Below
          </button>
          <button type="button" onClick={() => handleAction('moveUp')} style={{ padding: '2px 6px', fontSize: '12px' }} disabled={isMoveUpDisabled}>
            Up
          </button>
          <button type="button" onClick={() => handleAction('moveDown')} style={{ padding: '2px 6px', fontSize: '12px' }} disabled={isMoveDownDisabled}>
            Down
          </button>
          <button type="button" onClick={() => handleAction('delete')} style={{ padding: '2px 6px', fontSize: '12px' }} disabled={selectedRowIndex < 0}>
            Delete
          </button>
        </div>
        <KeyValuesComp
          data={{ rows: storeUsed.rows, selectedRowId: storeUsed.selectedRowId }}
          config={{
            selectionMode: 'single',
            isKeyEditable: true,
            isValueEditable: true,
            compResolveFn: getComp,
          }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'selectedRowIdChange') {
              storeUsed.selectedRowIdSet(eventData.selectedRowId);
            }
          }}
        />
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.messageText}</span>
      </MessageAndOutputs>
    </Example>
  );
});

export const dictClickingOutsideExamples = {
  'KeyValues Clicking Outside': {
    component: null,
    description: 'How to prevent outside-click unselect race for quick actions',
    example: () => (
      <DemoPanel>
        <ClickingOutsidePanel />
      </DemoPanel>
    ),
  },
};
