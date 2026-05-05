import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import KeyValues from './KeyValues.jsx';
import KeyValuesComp from './KeyValuesComp.jsx';
import EditableValueWithInfo from '../../layout/value-comp/EditableValueWithInfo.jsx';
import EditableValueComp from '../../layout/value-comp/EditableValueComp.jsx';
import PlusIcon from '../../icon/PlusIcon.jsx';
import DeleteIcon from '../../icon/DeleteIcon.jsx';
import { UpIcon, DownIcon } from '../../icon/DirectionIcons.jsx';

const DictExamplesPanel = observer(() => {
  const wait = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

  const [store] = useState(() => {
    const store = {
      basicData: [
        { key: 'name', value: 'John Doe' },
        { key: 'email', value: 'john@example.com' },
        { key: 'age', value: '30' },
        { key: 'city', value: 'New York' }
      ],
      dataWithComp: [
        { 
          key: 'username', 
          value: 'john_doe',
          valueCompName: 'editableWithInfo'
        },
        { 
          key: 'email',
          value: 'john@example.com',
          valueCompName: 'editableWithInfo'
        },
        { 
          key: 'status', 
          value: 'Active',
        },
        { 
          key: 'role',
          value: 'Administrator',
          keyCompName: 'editableWithInfo',
          valueCompName: 'editableWithInfo'
        }
      ],
      dataWithActions: [
        { id: 'action_1', key: 'field_1', value: 'value 1', keyCompName: 'editableWithActions', valueCompName: 'editableWithActions' },
        { id: 'action_2', key: 'field_2', value: 'value 2', keyCompName: 'editableWithActions', valueCompName: 'editableWithActions' },
        { id: 'action_3', key: 'field_3', value: 'value 3', keyCompName: 'editableWithActions', valueCompName: 'editableWithActions' }
      ]
    };
    return makeAutoObservable(store, {}, { deep: true });
  });

  const [isAutoUpdate, setIsAutoUpdate] = useState(false);
  const [autoUpdateCounter, setAutoUpdateCounter] = useState(0);
  const [selectedActionRowId, setSelectedActionRowId] = useState(null);
  const [actionButtonsTop, setActionButtonsTop] = useState(0);
  const actionPanelRef = useRef(null);
  const actionButtonsRef = useRef(null);
  const nextActionRowIdRef = useRef(4);

  const createActionRow = useCallback(() => {
    const nextId = nextActionRowIdRef.current;
    nextActionRowIdRef.current += 1;
    return {
      id: `action_${nextId}`,
      key: `field_${nextId}`,
      value: '',
      keyCompName: 'editableWithActions',
      valueCompName: 'editableWithActions'
    };
  }, []);

  const handleIncrementAge = () => {
    runInAction(() => {
      const ageItem = store.basicData.find(item => item.key === 'age');
      if (ageItem) {
        ageItem.value = String(parseInt(ageItem.value || '0') + 1);
      }
    });
  };

  const handleChangeName = () => {
    runInAction(() => {
      const nameItem = store.basicData.find(item => item.key === 'name');
      if (nameItem) {
        const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams'];
        const currentIndex = names.indexOf(nameItem.value);
        const nextIndex = (currentIndex + 1) % names.length;
        nameItem.value = names[nextIndex];
      }
    });
  };

  useEffect(() => {
    if (!isAutoUpdate) return;
    
    const interval = setInterval(() => {
      setAutoUpdateCounter(prev => {
        const next = prev + 1;
        runInAction(() => {
          const ageItem = store.basicData.find(item => item.key === 'age');
          if (ageItem) {
            ageItem.value = String(30 + next);
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoUpdate, store.basicData]);

  const handleAddEntry = () => {
    runInAction(() => {
      store.dataWithActions.push(createActionRow());
    });
  };

  const handleAction = async (action, actionData) => {
    const { index, rowId } = actionData || {};
    const targetIndex = rowId !== undefined && rowId !== null
      ? store.dataWithActions.findIndex((item) => item.id === rowId)
      : index;
    
    return runInAction(() => {
      if (typeof targetIndex !== 'number' || targetIndex < 0 || targetIndex >= store.dataWithActions.length) {
        return { code: -1, message: 'Invalid target row' };
      }
      switch (action) {
        case 'addEntryAbove': {
          const createdRow = createActionRow();
          store.dataWithActions.splice(targetIndex, 0, createdRow);
          return { code: 0, message: 'Success', rowId: createdRow.id };
        }
          
        case 'addEntryBelow': {
          const createdRow = createActionRow();
          store.dataWithActions.splice(targetIndex + 1, 0, createdRow);
          return { code: 0, message: 'Success', rowId: createdRow.id };
        }
          
        case 'deleteEntry':
          if (store.dataWithActions.length <= 1) {
            return { code: -1, message: 'Cannot delete the last entry' };
          }
          store.dataWithActions.splice(targetIndex, 1);
          break;
          
        default:
          return { code: -1, message: `Unknown action: ${action}` };
      }
      
      return { code: 0, message: 'Success' };
    });
  };

  const handleSelectedRowAction = async (action) => {
    if (selectedActionRowId === null) return;
    const selectedActionRowIndex = store.dataWithActions.findIndex((item) => item.id === selectedActionRowId);
    if (selectedActionRowIndex < 0) {
      setSelectedActionRowId(null);
      return;
    }
    if (action === 'moveUp') {
      if (selectedActionRowIndex <= 0) return;
      runInAction(() => {
        const targetIndex = selectedActionRowIndex - 1;
        const currentItem = store.dataWithActions[selectedActionRowIndex];
        store.dataWithActions[selectedActionRowIndex] = store.dataWithActions[targetIndex];
        store.dataWithActions[targetIndex] = currentItem;
      });
      return;
    }
    if (action === 'moveDown') {
      if (selectedActionRowIndex >= store.dataWithActions.length - 1) return;
      runInAction(() => {
        const targetIndex = selectedActionRowIndex + 1;
        const currentItem = store.dataWithActions[selectedActionRowIndex];
        store.dataWithActions[selectedActionRowIndex] = store.dataWithActions[targetIndex];
        store.dataWithActions[targetIndex] = currentItem;
      });
      return;
    }
    if (action === 'addEntryAbove') {
      const result = await handleAction('addEntryAbove', {
        rowId: selectedActionRowId
      });
      if (result.code === 0 && result.rowId) {
        setSelectedActionRowId(result.rowId);
      }
      return;
    }
    if (action === 'addEntryBelow') {
      const result = await handleAction('addEntryBelow', {
        rowId: selectedActionRowId
      });
      if (result.code === 0 && result.rowId) {
        setSelectedActionRowId(result.rowId);
      }
      return;
    }
    const result = await handleAction(action, {
      rowId: selectedActionRowId
    });
    if (result.code === 0 && action === 'deleteEntry') {
      setSelectedActionRowId(null);
    }
  };

  const selectedActionRowIndex = selectedActionRowId === null
    ? -1
    : store.dataWithActions.findIndex((item) => item.id === selectedActionRowId);
  const isMoveUpDisabled = selectedActionRowIndex <= 0;
  const isMoveDownDisabled = selectedActionRowIndex < 0 || selectedActionRowIndex >= store.dataWithActions.length - 1;

  const syncActionButtonsTop = useCallback(() => {
    const panelElement = actionPanelRef.current;
    if (!panelElement || selectedActionRowIndex < 0) return;
    const selectedRowElement = panelElement.querySelector('.keyvalues-row.selected-row');
    if (!selectedRowElement) return;
    const panelRect = panelElement.getBoundingClientRect();
    const rowRect = selectedRowElement.getBoundingClientRect();
    const actionGroupHeight = actionButtonsRef.current?.offsetHeight || 30;
    const centeredTop = rowRect.top - panelRect.top + Math.max(0, (rowRect.height - actionGroupHeight) / 2);
    setActionButtonsTop(centeredTop);
  }, [selectedActionRowIndex]);

  useLayoutEffect(() => {
    syncActionButtonsTop();
  }, [syncActionButtonsTop, selectedActionRowIndex, store.dataWithActions.length]);

  useEffect(() => {
    if (selectedActionRowIndex < 0) return undefined;
    const handleResize = () => {
      syncActionButtonsTop();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedActionRowIndex, syncActionButtonsTop]);

  const EditableValueWithActionsComp = ({ data, field, index, itemRef }) => (
    <EditableValueComp
      data={data}
      configKey={`${field}_${String(itemRef?.id || index)}`}
      onUpdate={async (key, val) => {
        await wait(500);
        runInAction(() => {
          itemRef[field] = val;
        });
        return { code: 0, message: 'Updated' };
      }}
      onAction={handleAction}
      valueType="text"
      isNotSet={false}
      index={index}
      field={field}
    />
  );

  const getComp = useCallback((name) => {
    if (name === 'editableWithInfo') {
      return EditableValueWithInfo;
    }
    if (name === 'editableWithActions') {
      return EditableValueWithActionsComp;
    }
    return null;
  }, [handleAction]);

  return (
    <div style={{ maxWidth: '900px', padding: '12px' }}>
      <div style={{ marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>
        KeyValues - Basic
      </div>
      
      <div style={{ marginBottom: '12px', padding: '10px', background: '#e3f2fd', borderRadius: '2px', fontSize: '13px' }}>
        Edit values directly or use buttons. Data mutates in-place.
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={handleIncrementAge}
          style={{ padding: '6px 12px', fontSize: '13px', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', borderRadius: '2px' }}
        >
          Increment Age
        </button>
        <button
          onClick={handleChangeName}
          style={{ padding: '6px 12px', fontSize: '13px', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', borderRadius: '2px' }}
        >
          Change Name
        </button>
        <button
          onClick={() => setIsAutoUpdate(!isAutoUpdate)}
          style={{ padding: '6px 12px', fontSize: '13px', cursor: 'pointer', border: '1px solid #ccc', background: isAutoUpdate ? '#4caf50' : '#fff', color: isAutoUpdate ? '#fff' : '#000', borderRadius: '2px' }}
        >
          {isAutoUpdate ? 'Stop' : 'Start'} Auto Update
        </button>
      </div>

      <KeyValues 
        data={store.basicData}
        isKeyEditable={true}
      />

      <div style={{ marginTop: '20px', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>
        KeyValues - Column Alignment Options
      </div>
      
      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        Auto width (keyColWidth="min")
      </div>
      <KeyValues 
        data={store.basicData}
        keyColWidth="min"
      />

      <div style={{ marginTop: '16px', marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        Fixed width (keyColWidth="200px")
      </div>
      <KeyValues 
        data={store.basicData}
        keyColWidth="200px"
      />

      <div style={{ marginTop: '16px', marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        No alignment (alignColumn=false)
      </div>
      <KeyValues 
        data={store.basicData}
        alignColumn={false}
      />

      <div style={{ marginTop: '24px', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>
        KeyValuesComp - With Custom Components
      </div>

      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        Custom components with info icons
      </div>
      <KeyValuesComp 
        data={store.dataWithComp}
        isValueEditable={true}
        getComp={getComp}
      />

      <div style={{ marginTop: '24px', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>
        KeyValuesComp - Row Selection and Quick Actions
      </div>

      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        Select a row to show quick actions on the right, or right-click a value for the context menu
      </div>
      
      <div ref={actionPanelRef} style={{ position: 'relative', paddingRight: '126px' }}>
        <KeyValuesComp 
          data={store.dataWithActions}
          isValueEditable={true}
          getComp={getComp}
          selectionMode="single"
          onSelectionChange={setSelectedActionRowId}
          selectedRowId={selectedActionRowId}
        />

        {selectedActionRowIndex >= 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0px',
            position: 'absolute',
            right: '0px',
            top: `${actionButtonsTop}px`,
            padding: '1px 2px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            background: '#fff'
          }}
            ref={actionButtonsRef}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <button
              onClick={() => handleSelectedRowAction('addEntryAbove')}
              title="Add entry above selected row"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '24px', padding: '0', border: 'none', borderRadius: '2px', background: 'transparent', color: '#555', cursor: 'pointer' }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = '#ededed';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ position: 'relative', display: 'inline-flex', width: '16px', height: '16px', alignItems: 'center', justifyContent: 'center' }}>
                <PlusIcon width={16} height={16} />
                <span style={{ position: 'absolute', top: '-2px', right: '-5px', lineHeight: 0 }}>
                  <UpIcon width={9} height={9} />
                </span>
              </span>
            </button>
            <button
              onClick={() => handleSelectedRowAction('addEntryBelow')}
              title="Add entry below selected row"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '24px', padding: '0', border: 'none', borderRadius: '2px', background: 'transparent', color: '#555', cursor: 'pointer' }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = '#ededed';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ position: 'relative', display: 'inline-flex', width: '16px', height: '16px', alignItems: 'center', justifyContent: 'center' }}>
                <PlusIcon width={16} height={16} />
                <span style={{ position: 'absolute', top: '-2px', right: '-5px', lineHeight: 0 }}>
                  <DownIcon width={9} height={9} />
                </span>
              </span>
            </button>
            <button
              onClick={() => handleSelectedRowAction('moveUp')}
              title="Move selected row up"
              disabled={isMoveUpDisabled}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '24px', padding: '0', border: 'none', borderRadius: '2px', background: 'transparent', color: '#555', cursor: isMoveUpDisabled ? 'default' : 'pointer', opacity: isMoveUpDisabled ? 0.45 : 1 }}
              onMouseEnter={(event) => {
                if (isMoveUpDisabled) return;
                event.currentTarget.style.background = '#ededed';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'transparent';
              }}
            >
              <UpIcon width={16} height={16} />
            </button>
            <button
              onClick={() => handleSelectedRowAction('moveDown')}
              title="Move selected row down"
              disabled={isMoveDownDisabled}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '24px', padding: '0', border: 'none', borderRadius: '2px', background: 'transparent', color: '#555', cursor: isMoveDownDisabled ? 'default' : 'pointer', opacity: isMoveDownDisabled ? 0.45 : 1 }}
              onMouseEnter={(event) => {
                if (isMoveDownDisabled) return;
                event.currentTarget.style.background = '#ededed';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'transparent';
              }}
            >
              <DownIcon width={16} height={16} />
            </button>
            <button
              onClick={() => handleSelectedRowAction('deleteEntry')}
              title="Delete selected row"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '24px', padding: '0', border: 'none', borderRadius: '2px', background: 'transparent', color: '#a33', cursor: 'pointer' }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = '#f3e6e6';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'transparent';
              }}
            >
              <DeleteIcon width={16} height={16} />
            </button>
          </div>
        )}
        
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px',
          marginTop: '8px',
          padding: '6px 10px',
          cursor: 'pointer',
          color: '#666',
          border: '1px solid #ccc',
          borderRadius: '4px',
          transition: 'all 0.2s',
          width: 'fit-content'
        }}
          onClick={handleAddEntry}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#333';
            e.currentTarget.style.borderColor = '#999';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#666';
            e.currentTarget.style.borderColor = '#ccc';
          }}
        >
          <PlusIcon width={16} height={16} />
          <span style={{ fontSize: '13px' }}>Add Entry</span>
        </div>
      </div>

      <div style={{ marginTop: '24px', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>
        KeyValues - Content Overflow: wrap vs clip
      </div>

      <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>
        Clip (default)
      </div>
      <KeyValues
        data={[
          { key: 'short_key', value: 'Short value' },
          { key: 'a_very_long_key_name_that_overflows', value: 'A value that is also quite long and would normally overflow the available cell width' }
        ]}
        keyColWidth="120px"
      />

      <div style={{ marginTop: '12px', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
        Wrap (isWrap=true)
      </div>
      <KeyValues
        data={[
          { key: 'short_key', value: 'Short value' },
          { key: 'a_very_long_key_name_that_overflows', value: 'A value that is also quite long and would normally overflow the available cell width' }
        ]}
        keyColWidth="120px"
        isWrap={true}
      />

      <div style={{ marginTop: '24px', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>
        KeyValuesComp - Draggable Divider
      </div>

      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        Hover the divider line and drag to resize columns
      </div>
      <KeyValuesComp
        data={store.basicData}
        isKeyEditable={true}
        isDividerDraggable={true}
      />

      <div style={{ marginTop: '16px', padding: '8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '2px', fontSize: '12px' }}>
        <strong>Current Data:</strong>
        <pre style={{ margin: '4px 0', fontSize: '11px' }}>{JSON.stringify(store.basicData, null, 2)}</pre>
      </div>
    </div>
  );
});

export const dictExamples = {
  'KeyValues': {
    component: null,
    description: 'Key-value pairs display with MobX support for in-place mutations',
    example: () => <DictExamplesPanel />
  }
};
