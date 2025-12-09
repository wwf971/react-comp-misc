import React, { useState } from 'react';
import Config, { ConfigStruct } from './Config';

/**
 * Example usage of the Config component with separated struct and values
 */
const ConfigExample: React.FC = () => {
  // Config structure (schema) - defines what config items exist
  const configStruct: ConfigStruct = {
    items: [
      {
        id: 'general_group',
        label: 'General Settings',
        type: 'group',
        items: [
          {
            id: 'enable_feature_a',
            label: 'Enable Feature A',
            description: 'Turn this feature on or off',
            type: 'boolean',
            defaultValue: true
          },
          {
            id: 'username',
            label: 'Username',
            description: 'Enter your username',
            type: 'string',
            defaultValue: ''
          }
        ]
      },
      {
        id: 'appearance_group',
        label: 'Appearance',
        type: 'group',
        items: [
          {
            id: 'theme',
            label: 'Theme',
            description: 'Select your preferred theme',
            type: 'select',
            defaultValue: 'light',
            options: ['light', 'dark', 'auto']
          },
          {
            id: 'max_items',
            label: 'Max Items',
            description: 'Maximum number of items to display',
            type: 'number',
            defaultValue: 10
          }
        ]
      }
    ]
  };

  // Config values (actual data) - separate from structure
  const [configValue, setConfigValue] = useState<Record<string, any>>({
    enable_feature_a: true,
    username: 'john_doe',
    max_items: 10,
    theme: 'light'
  });

  const [missingItemStrategy, setMissingItemStrategy] = useState<'setDefault' | 'reportError'>('setDefault');

  const handleInternalChange = (id: string, newValue: any) => {
    console.log('Config changed:', id, '=', newValue);
    
    // Update the value
    setConfigValue(prev => ({
      ...prev,
      [id]: newValue
    }));
    
    // Here you would persist the change:
    // - localStorage.setItem(id, JSON.stringify(newValue));
    // - Send to API
    // - Send message to background script (for extensions)
    // - etc.
  };

  // Simulate external update (e.g., from API, storage, etc.)
  const handleExternalUpdate = () => {
    setConfigValue(prev => ({
      ...prev,
      enable_feature_a: false,
      username: 'jane_smith'
    }));
    console.log('External update applied');
  };

  // Simulate missing value
  const handleSimulateMissing = () => {
    const { username, ...rest } = configValue;
    setConfigValue(rest);
    console.log('Removed username from configValue');
  };

  const handleResetValues = () => {
    setConfigValue({
      enable_feature_a: true,
      username: 'john_doe',
      max_items: 10,
      theme: 'light'
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Config Component Example</h2>
      
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Missing Item Strategy:</span>
          <select 
            value={missingItemStrategy} 
            onChange={(e) => setMissingItemStrategy(e.target.value as any)}
            style={{ padding: '4px 8px' }}
          >
            <option value="setDefault">Set Default</option>
            <option value="reportError">Report Error</option>
          </select>
        </label>
      </div>

      <Config
        configStruct={configStruct}
        configValue={configValue}
        onInternalChange={handleInternalChange}
        missingItemStrategy={missingItemStrategy}
      />

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={handleExternalUpdate} style={{ padding: '8px 12px', cursor: 'pointer' }}>
          External Update
        </button>
        <button onClick={handleSimulateMissing} style={{ padding: '8px 12px', cursor: 'pointer' }}>
          Simulate Missing Value
        </button>
        <button onClick={handleResetValues} style={{ padding: '8px 12px', cursor: 'pointer' }}>
          Reset Values
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
        <h3>Architecture Notes:</h3>
        <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <li><strong>configStruct:</strong> Schema defining config items (readonly)</li>
          <li><strong>configValue:</strong> Actual values (controlled by parent)</li>
          <li><strong>External updates:</strong> Just update configValue prop, component re-renders</li>
          <li><strong>Missing values:</strong> Handled by missingItemStrategy</li>
        </ul>
        <h4>Current Values:</h4>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>{JSON.stringify(configValue, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ConfigExample;
