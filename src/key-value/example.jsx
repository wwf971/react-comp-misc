import { useState, useEffect } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import KeyValues from './KeyValues.jsx';
import KeyValuesComp from './KeyValuesComp.jsx';
import EditableValueWithInfo from '../layout/value-comp/EditableValueWithInfo.jsx';
import EditableValueComp from '../layout/value-comp/EditableValueComp.jsx';
import PlusIcon from '../icon/PlusIcon.jsx';

const DictExamplesPanel = observer(() => {
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
          valueComp: EditableValueWithInfo
        },
        { 
          key: 'email',
          value: 'john@example.com',
          valueComp: EditableValueWithInfo
        },
        { 
          key: 'status', 
          value: 'Active',
        },
        { 
          key: 'role',
          value: 'Administrator',
          keyComp: EditableValueWithInfo,
          valueComp: EditableValueWithInfo
        }
      ],
      dataWithActions: [
        { key: 'field_1', value: 'value 1' },
        { key: 'field_2', value: 'value 2' },
        { key: 'field_3', value: 'value 3' }
      ]
    };
    return makeAutoObservable(store, {}, { deep: true });
  });

  const [isAutoUpdate, setIsAutoUpdate] = useState(false);
  const [autoUpdateCounter, setAutoUpdateCounter] = useState(0);

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
      store.dataWithActions.push({ 
        key: `field_${store.dataWithActions.length + 1}`, 
        value: '' 
      });
    });
  };

  const handleAction = async (action, actionData) => {
    const { index } = actionData;
    
    return runInAction(() => {
      switch (action) {
        case 'addEntryAbove':
          store.dataWithActions.splice(index, 0, { 
            key: `field_${Date.now()}`, 
            value: '' 
          });
          break;
          
        case 'addEntryBelow':
          store.dataWithActions.splice(index + 1, 0, { 
            key: `field_${Date.now()}`, 
            value: '' 
          });
          break;
          
        case 'deleteEntry':
          if (store.dataWithActions.length <= 1) {
            return { code: -1, message: 'Cannot delete the last entry' };
          }
          store.dataWithActions.splice(index, 1);
          break;
          
        default:
          return { code: -1, message: `Unknown action: ${action}` };
      }
      
      return { code: 0, message: 'Success' };
    });
  };

  const dataWithAdapter = store.dataWithActions.map((item, idx) => ({
    ...item,
    valueComp: (props) => (
      <EditableValueComp
        data={props.data}
        configKey={`${props.field}_${props.index}`}
        onUpdate={async (key, val) => {
          runInAction(() => {
            item[props.field] = val;
          });
          return { code: 0, message: 'Updated' };
        }}
        onAction={handleAction}
        valueType="text"
        isNotSet={false}
        index={props.index}
        field={props.field}
      />
    )
  }));

  return (
    <div style={{ maxWidth: '900px', padding: '12px' }}>
      <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}>
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

      <div style={{ marginTop: '20px', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
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

      <div style={{ marginTop: '24px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}>
        KeyValuesComp - With Custom Components
      </div>

      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        Custom components with info icons
      </div>
      <KeyValuesComp 
        data={store.dataWithComp}
        isValueEditable={true}
      />

      <div style={{ marginTop: '24px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}>
        KeyValuesComp - With EditableValueComp and Actions
      </div>

      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        Right-click values for context menu
      </div>
      
      <div>
        <KeyValuesComp 
          data={dataWithAdapter}
          isValueEditable={true}
        />
        
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
