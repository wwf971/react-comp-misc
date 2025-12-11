import { useState } from 'react';
import KeyValues from './KeyValues.jsx';

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
};


