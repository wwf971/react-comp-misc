import { useCallback, useMemo, useState } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import KeyValuesComp from './KeyValuesComp.jsx';
import EditableValueComp from '../../layout/value-comp/EditableValueComp.jsx';

const ClickingOutsidePanel = observer(() => {
  const wait = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

  const store = useMemo(() => {
    const state = {
      rows: [
        { id: 'r1', key: 'name', value: 'alpha', keyCompName: 'editableAsync', valueCompName: 'editableAsync' },
        { id: 'r2', key: 'owner', value: 'team-a', keyCompName: 'editableAsync', valueCompName: 'editableAsync' },
        { id: 'r3', key: 'status', value: 'active', keyCompName: 'editableAsync', valueCompName: 'editableAsync' },
      ],
      nextIndex: 4,
    };
    return makeAutoObservable(state, {}, { deep: true });
  }, []);

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isProtectSelectionOnActionClick, setIsProtectSelectionOnActionClick] = useState(true);
  const [messageText, setMessageText] = useState('Select one row, then click action buttons.');

  const selectedRowIndex = selectedRowId === null
    ? -1
    : store.rows.findIndex((item) => item.id === selectedRowId);
  const isMoveUpDisabled = selectedRowIndex <= 0;
  const isMoveDownDisabled = selectedRowIndex < 0 || selectedRowIndex >= store.rows.length - 1;

  const createRow = () => {
    const id = `r${store.nextIndex}`;
    store.nextIndex += 1;
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
      data={String(data || '')}
      configKey={`${field}_${String(itemRef?.id || index)}`}
      onUpdate={async (_key, val) => {
        await wait(500);
        runInAction(() => {
          itemRef[field] = String(val || '');
        });
        return { code: 0, message: 'Updated' };
      }}
      valueType="text"
      isNotSet={false}
      index={index}
      field={field}
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
      setMessageText('No row selected.');
      return;
    }

    runInAction(() => {
      if (type === 'addAbove') {
        const row = createRow();
        store.rows.splice(selectedRowIndex, 0, row);
        setSelectedRowId(row.id);
        setMessageText(`Added above: ${row.id}`);
        return;
      }
      if (type === 'addBelow') {
        const row = createRow();
        store.rows.splice(selectedRowIndex + 1, 0, row);
        setSelectedRowId(row.id);
        setMessageText(`Added below: ${row.id}`);
        return;
      }
      if (type === 'moveUp' && selectedRowIndex > 0) {
        const row = store.rows[selectedRowIndex];
        store.rows.splice(selectedRowIndex, 1);
        store.rows.splice(selectedRowIndex - 1, 0, row);
        setMessageText(`Moved up: ${row.id}`);
        return;
      }
      if (type === 'moveDown' && selectedRowIndex >= 0 && selectedRowIndex < store.rows.length - 1) {
        const row = store.rows[selectedRowIndex];
        store.rows.splice(selectedRowIndex, 1);
        store.rows.splice(selectedRowIndex + 1, 0, row);
        setMessageText(`Moved down: ${row.id}`);
        return;
      }
      if (type === 'delete') {
        const row = store.rows[selectedRowIndex];
        store.rows.splice(selectedRowIndex, 1);
        setSelectedRowId(null);
        setMessageText(`Deleted: ${row.id}`);
      }
    });
  };

  return (
    <div style={{ padding: '8px', maxWidth: '720px' }}>
      <div style={{ marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>
        KeyValuesComp - Clicking Outside and Action Buttons
      </div>

      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        Technique: Keep selection controlled, and stop mousedown propagation on action buttons.
      </div>

      <div style={{ marginBottom: '6px', fontSize: '12px', color: '#555' }}>
        1) Select one row.
      </div>
      <div style={{ marginBottom: '6px', fontSize: '12px', color: '#555' }}>
        2) Click action buttons after clicking outside.
      </div>
      <div style={{ marginBottom: '10px', fontSize: '12px', color: '#555' }}>
        3) Toggle protection to compare behavior.
      </div>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setIsProtectSelectionOnActionClick((prev) => !prev)}
          style={{
            border: '1px solid #ccc',
            background: isProtectSelectionOnActionClick ? '#eaf6ff' : '#fff',
            color: '#333',
            borderRadius: '2px',
            padding: '2px 6px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {isProtectSelectionOnActionClick ? 'Protection: ON' : 'Protection: OFF'}
        </button>
        <div style={{ fontSize: '12px', color: '#666' }}>
          ON means action bar consumes mousedown before outside-click unselect.
        </div>
      </div>

      <div
        style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}
        onMouseDown={(event) => {
          if (isProtectSelectionOnActionClick) {
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
        data={{ rows: store.rows, selectedRowId }}
        config={{
          selectionMode: 'single',
          isKeyEditable: true,
          isValueEditable: true,
          compResolveFn: getComp,
        }}
        onEvent={(eventType, eventData) => {
          if (eventType === 'selectedRowIdChange') {
            setSelectedRowId(eventData.selectedRowId);
          }
        }}
      />

      <div style={{ marginTop: '8px', border: '1px solid #ddd', background: '#fafafa', padding: '4px', fontSize: '12px' }}>
        {messageText}
      </div>
    </div>
  );
});

export const dictClickingOutsideExamples = {
  'KeyValues Clicking Outside': {
    component: null,
    description: 'How to prevent outside-click unselect race for quick actions',
    example: () => <ClickingOutsidePanel />,
  },
};
