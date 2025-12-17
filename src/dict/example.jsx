import { useState } from 'react';
import KeyValues from './KeyValues.jsx';
import KeyValuesComp from './KeyValuesComp.jsx';
import { InfoIcon } from '../icon/Icon.jsx';

/**
 * Custom Text Component with Info Icon
 * Displays text with a circled exclamation mark that shows a popup on hover
 */
const TextWithInfo = ({ data, onChangeAttempt, isEditable, field, index }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useState(null);
  const originalValueRef = useState('');
  
  const handleTextClick = (e) => {
    if (!isEditable) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    
    originalValueRef.current = String(data);
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (editRef.current) {
      const newValue = editRef.current.textContent;
      
      if (newValue !== originalValueRef.current) {
        if (onChangeAttempt) {
          onChangeAttempt(index, field, newValue);
        }
      }
    }
    
    setIsEditing(false);
    originalValueRef.current = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (editRef.current) {
        editRef.current.textContent = originalValueRef.current;
      }
      setIsEditing(false);
      originalValueRef.current = '';
    }
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <span 
        ref={editRef}
        className={`keyvalues-text ${isEditing ? 'editing' : ''}`}
        contentEditable={isEditing}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleTextClick}
        suppressContentEditableWarning={true}
        style={{ display: 'inline' }}
      >
        {data}
      </span>
      <span 
        style={{ 
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'help',
          color: '#999'
        }}
        onMouseEnter={() => setShowPopup(true)}
        onMouseLeave={() => setShowPopup(false)}
      >
        <InfoIcon width={14} height={14} />
        {showPopup && (
          <div 
            style={{
              position: 'absolute',
              top: '20px',
              left: '-60px',
              width: '180px',
              padding: '8px 10px',
              background: '#333',
              color: '#fff',
              borderRadius: '4px',
              fontSize: '11px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            This is an example tooltip with additional information about the field.
            <div 
              style={{
                position: 'absolute',
                top: '-6px',
                left: '65px',
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '6px solid #333'
              }}
            />
          </div>
        )}
      </span>
    </span>
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
            valueComp: TextWithInfo  // Custom component with info icon
          },
          { 
            key: 'email',
            value: 'john@example.com',
            valueComp: TextWithInfo
          },
          { 
            key: 'status', 
            value: 'Active',
            // No custom component - will use default
          },
          { 
            key: 'role',
            value: 'Administrator',
            keyComp: TextWithInfo,  // Info icon on key
            valueComp: TextWithInfo  // Info icon on value
          }
        ]);

        // Data with all default components
        const [dataDefault, setDataDefault] = useState([
          { key: 'city', value: 'New York' },
          { key: 'country', value: 'USA' }
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
                { key: 'field1', value: 'value1', valueComp: TextWithInfo },
                { key: 'field2', value: 'value2', valueComp: TextWithInfo }
              ]}
              isKeyEditable={true}
              isValueEditable={true}
              onChangeAttempt={handleChange}
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


