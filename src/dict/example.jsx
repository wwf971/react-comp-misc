import { useState } from 'react';
import KeyValues from './KeyValues.jsx';
import KeyValuesComp from './KeyValuesComp.jsx';
import EditableValueWithInfo from '../layout/EditableValueWithInfo.jsx';
import EditableValueComp from '../layout/EditableValueComp.jsx';
import PlusIcon from '../icon/PlusIcon.jsx';

/**
 * Wrapper component to adapt EditableValueComp for use with KeyValuesComp
 * EditableValueComp expects: data, configKey, onUpdate, valueType, isNotSet, onAction
 * KeyValuesComp provides: data, onChangeAttempt, isEditable, field, index
 */
const EditableValueAdapter = ({ data, onChangeAttempt, isEditable, field, index, onAction }) => {
  // Adapter function to convert onChangeAttempt to onUpdate format
  const handleUpdate = async (configKey, newValue) => {
    if (onChangeAttempt) {
      onChangeAttempt(index, field, newValue);
    }
    // Return success response
    return { code: 0, message: 'Updated successfully' };
  };

  // Use configKey as a combination of field and index for uniqueness
  const configKey = `${field}_${index}`;

  return (
    <EditableValueComp
      data={data}
      configKey={configKey}
      onUpdate={handleUpdate}
      onAction={onAction}
      valueType="text"
      isNotSet={false}
      index={index}
      field={field}
    />
  );
};

export const dictExamples = {
  'KeyValues': {
    component: KeyValues,
    description: 'Simple key-value pairs display with inline editing support',
    example: () => {
      const KeyValuesTest = () => {
        const [message, setMessage] = useState('');
        
        const [dataEditable, setDataEditable] = useState([
          { key: 'name', value: 'John Doe' },
          { key: 'email', value: 'john@example.com' },
          { key: 'age', value: '30' },
          { key: 'city', value: 'New York' }
        ]);

        const [dataReadonly, setDataReadonly] = useState([
          { key: 'status', value: 'active' },
          { key: 'role', value: 'admin' }
        ]);

        const [dataKeyEditable, setDataKeyEditable] = useState([
          { key: 'custom_field_1', value: 'value1' },
          { key: 'custom_field_2', value: 'value2' }
        ]);

        const handleChangeEditable = (index, field, newValue) => {
          console.log('Change attempt:', index, field, newValue);
          setDataEditable(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: newValue };
            return updated;
          });
          setMessage(`Updated ${field} at index ${index} to: ${newValue}`);
        };

        const handleChangeKeyEditable = (index, field, newValue) => {
          console.log('Change attempt (key editable):', index, field, newValue);
          setDataKeyEditable(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: newValue };
            return updated;
          });
          setMessage(`Updated ${field} at index ${index} to: ${newValue}`);
        };

        return (
          <div style={{ padding: '20px', maxWidth: '700px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '8px' }}>
              Aligned Columns with Auto Width (default)
              <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
                alignColumn=true, keyColWidth="min"
              </span>
            </h4>
            <KeyValues 
              data={dataEditable}
              onChangeAttempt={handleChangeEditable}
            />

            <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>
              Aligned with Fixed Key Width (200px)
              <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
                alignColumn=true, keyColWidth="200px"
              </span>
            </h4>
            <KeyValues 
              data={dataEditable}
              keyColWidth="200px"
              onChangeAttempt={handleChangeEditable}
            />

            <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>
              No Column Alignment
              <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
                alignColumn=false
              </span>
            </h4>
            <KeyValues 
              data={dataReadonly}
              alignColumn={false}
              isEditable={false}
            />

            <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>
              Both Keys and Values Editable
              <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
                alignColumn=true, keyColWidth="min", isKeyEditable=true
              </span>
            </h4>
            <KeyValues 
              data={dataKeyEditable}
              isKeyEditable={true}
              isValueEditable={true}
              onChangeAttempt={handleChangeKeyEditable}
            />

            <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>Empty Data</h4>
            <KeyValues 
              data={[]}
            />

            {message && (
              <div style={{ marginTop: '16px', padding: '8px', background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '2px', fontSize: '13px' }}>
                {message}
              </div>
            )}

            <div style={{ marginTop: '16px', padding: '8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '2px', fontSize: '12px' }}>
              <strong>Tips:</strong>
              <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>
                <li>Click on a value to edit it (cursor placed at click position)</li>
                <li>Press Enter to save, Escape to cancel</li>
                <li>Click outside to save changes</li>
                <li>Use <code>alignColumn</code> prop to control column alignment</li>
                <li>Use <code>keyColWidth</code> prop: 'min' (auto) or fixed like '200px'</li>
              </ul>
            </div>

            <div style={{ marginTop: '8px', fontSize: '12px', background: '#f0f0f0', padding: '8px', borderRadius: '2px' }}>
              <strong>Editable Data:</strong> {JSON.stringify(dataEditable, null, 2)}
            </div>
          </div>
        );
      };
      return <KeyValuesTest />;
    }
  },
  
  'KeyValuesComp': {
    component: KeyValuesComp,
    description: 'Key-value pairs display with custom component support for keys and values',
    example: () => {
      const KeyValuesCompTest = () => {
        const [message, setMessage] = useState('');
        
        // Data with custom components
        const [dataWithCustomComp, setDataWithCustomComp] = useState([
          { 
            key: 'username', 
            value: 'john_doe',
            valueComp: EditableValueWithInfo  // Custom component with info icon
          },
          { 
            key: 'email',
            value: 'john@example.com',
            valueComp: EditableValueWithInfo
          },
          { 
            key: 'status', 
            value: 'Active',
            // No custom component - will use default
          },
          { 
            key: 'role',
            value: 'Administrator',
            keyComp: EditableValueWithInfo,  // Info icon on key
            valueComp: EditableValueWithInfo  // Info icon on value
          }
        ]);

        // Data with all default components
        const [dataDefault, setDataDefault] = useState([
          { key: 'city', value: 'New York' },
          { key: 'country', value: 'USA' }
        ]);

        // Data with EditableValueComp and add functionality
        const [dataWithAdd, setDataWithAdd] = useState([
          { key: 'name', value: 'John Doe' },
          { key: 'email', value: 'john@example.com' },
          { key: 'phone', value: '+1234567890' }
        ]);

        const handleChange = (index, field, newValue) => {
          console.log('Change attempt:', index, field, newValue);
          setDataWithCustomComp(prev => {
            const updated = [...prev];
            const item = { ...updated[index] };
            item[field] = newValue;
            updated[index] = item;
            return updated;
          });
          setMessage(`Updated ${field} at index ${index} to: ${newValue}`);
        };

        const handleChangeDefault = (index, field, newValue) => {
          console.log('Change attempt (default):', index, field, newValue);
          setDataDefault(prev => {
            const updated = [...prev];
            const item = { ...updated[index] };
            item[field] = newValue;
            updated[index] = item;
            return updated;
          });
          setMessage(`Updated ${field} at index ${index} to: ${newValue}`);
        };

        const handleChangeWithAdd = (index, field, newValue) => {
          console.log('Change attempt (with add):', index, field, newValue);
          setDataWithAdd(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: newValue };
            return updated;
          });
          setMessage(`Updated ${field} at index ${index} to: ${newValue}`);
        };

        const handleAddEntry = () => {
          setDataWithAdd(prev => [
            ...prev,
            { key: `field_${prev.length + 1}`, value: '' }
          ]);
          setMessage('Added new entry');
        };

        // Handle menu actions (add above/below, delete)
        const handleAction = async (action, actionData) => {
          const { index } = actionData;
          
          console.log('Action:', action, 'Data:', actionData);
          
          switch (action) {
            case 'addEntryAbove':
              setDataWithAdd(prev => {
                const updated = [...prev];
                updated.splice(index, 0, { key: `field_${Date.now()}`, value: '' });
                return updated;
              });
              setMessage(`Added entry above index ${index}`);
              break;
              
            case 'addEntryBelow':
              setDataWithAdd(prev => {
                const updated = [...prev];
                updated.splice(index + 1, 0, { key: `field_${Date.now()}`, value: '' });
                return updated;
              });
              setMessage(`Added entry below index ${index}`);
              break;
              
            case 'deleteEntry':
              if (dataWithAdd.length <= 1) {
                return { code: -1, message: 'Cannot delete the last entry' };
              }
              setDataWithAdd(prev => {
                const updated = [...prev];
                updated.splice(index, 1);
                return updated;
              });
              setMessage(`Deleted entry at index ${index}`);
              break;
              
            default:
              return { code: -1, message: `Unknown action: ${action}` };
          }
          
          return { code: 0, message: 'Success' };
        };

        // Create data with EditableValueAdapter for all values
        const dataWithComp = dataWithAdd.map((item, idx) => ({
          ...item,
          valueComp: (props) => (
            <EditableValueAdapter {...props} onAction={handleAction} />
          )
        }));

        return (
          <div style={{ padding: '20px', maxWidth: '700px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '8px' }}>
              With Custom Text Component (Info Icons)
              <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
                Hover over the ⓘ icons
              </span>
            </h4>
            <KeyValuesComp 
              data={dataWithCustomComp}
              onChangeAttempt={handleChange}
              isValueEditable={true}
            />

            <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>
              With Default Components Only
            </h4>
            <KeyValuesComp 
              data={dataDefault}
              onChangeAttempt={handleChangeDefault}
              isValueEditable={true}
            />

            <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>
              Both Keys and Values Editable
            </h4>
            <KeyValuesComp 
              data={[
                { key: 'field1', value: 'value1', valueComp: EditableValueWithInfo },
                { key: 'field2', value: 'value2', valueComp: EditableValueWithInfo }
              ]}
              isKeyEditable={true}
              isValueEditable={true}
              onChangeAttempt={handleChange}
            />

            <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>
              With EditableValueComp and Add Entry Button
              <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
                Click edit icon to modify, plus icon to add
              </span>
            </h4>
            
            <div>
              <KeyValuesComp 
                data={dataWithComp}
                onChangeAttempt={handleChangeWithAdd}
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

            <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>
              With Boolean Type and EditableValueComp
            </h4>
            
            <KeyValuesComp 
              data={[
                { 
                  key: 'enabled', 
                  value: 'true',
                  valueComp: ({ data, onChangeAttempt, isEditable, field, index }) => (
                    <EditableValueComp
                      data={data}
                      configKey={`boolean_${index}`}
                      onUpdate={async (key, val) => {
                        onChangeAttempt(index, field, val);
                        return { code: 0, message: 'Updated' };
                      }}
                      valueType="boolean"
                    />
                  )
                },
                { 
                  key: 'active', 
                  value: 'false',
                  valueComp: ({ data, onChangeAttempt, isEditable, field, index }) => (
                    <EditableValueComp
                      data={data}
                      configKey={`boolean_${index}`}
                      onUpdate={async (key, val) => {
                        onChangeAttempt(index, field, val);
                        return { code: 0, message: 'Updated' };
                      }}
                      valueType="boolean"
                    />
                  )
                }
              ]}
              onChangeAttempt={handleChangeWithAdd}
              isValueEditable={true}
            />

            {message && (
              <div style={{ marginTop: '16px', padding: '8px', background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '2px', fontSize: '13px' }}>
                {message}
              </div>
            )}

            <div style={{ marginTop: '16px', padding: '8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '2px', fontSize: '12px' }}>
              <strong>Features:</strong>
              <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>
                <li>Use custom components via <code>keyComp</code> and <code>valueComp</code></li>
                <li>If not provided, defaults to text display component</li>
                <li>Hover over ⓘ icons to see tooltips</li>
                <li>Click on values to edit them (where editable)</li>
                <li>Custom components receive: data, onChangeAttempt, isEditable, field, index</li>
                <li>Uses <code>EditableValueComp</code> for advanced editing features</li>
                <li>Click the edit icon next to values to enter edit mode</li>
                <li>Shows "Saving..." indicator during updates</li>
                <li>Click the plus icon below to add new entries at the end</li>
                <li><strong>Right-click on any value</strong> to access context menu with: Add Entry Above, Add Entry Below, Delete Entry</li>
                <li>Supports both text and boolean value types</li>
                <li>For booleans, click edit icon to enable radio buttons</li>
              </ul>
            </div>

            <div style={{ marginTop: '8px', fontSize: '12px', background: '#f0f0f0', padding: '8px', borderRadius: '2px' }}>
              <strong>Data Structure:</strong>
              <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }}>
{`[
  {
    key: 'username',
    value: 'john_doe',
    keyComp: CustomComponent,    // optional
    valueComp: CustomComponent   // optional
  }
]`}
              </pre>
            </div>
          </div>
        );
      };
      return <KeyValuesCompTest />;
    }
  },
};


