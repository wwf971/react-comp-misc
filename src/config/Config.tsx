import React, { useEffect } from 'react';
import './Config.css';

// Define config item types
export type ConfigItemType = 'boolean' | 'string' | 'number' | 'select' | 'group';

export interface ConfigItemStruct {
  id: string;
  label: string;
  description?: string;
  type: ConfigItemType;
  defaultValue?: any;
  options?: string[]; // For 'select' type
  children?: ConfigItemStruct[]; // For 'group' type (one level only)
}

export interface ConfigStruct {
  items: ConfigItemStruct[];
}

export type MissingItemStrategy = 'setDefault' | 'reportError';

export interface ConfigProps {
  configStruct: ConfigStruct;
  configValue: Record<string, any>;
  onChangeAttempt?: (id: string, newValue: any) => void;
  missingItemStrategy?: MissingItemStrategy;
}


// onChangeAttempt should be used for submitting change request only.
  // it does not directly change configValue.
  // the change should be implemented by directly changing configValue.
const ConfigPanel: React.FC<ConfigProps> = ({ 
  configStruct, 
  configValue,
  onChangeAttempt,
  missingItemStrategy = 'setDefault'
}) => {
  
  // Check for missing items in configValue, based on configStruct.
  // missing values are handled according to missingItemStrategy.
  useEffect(() => {
    if (missingItemStrategy === 'setDefault') {
      const checkItems = (items: ConfigItemStruct[]) => {
        items.forEach(item => {
          if (item.type === 'group' && item.children) {
            // Recursively check group items
            checkItems(item.children);
          } else if (!(item.id in configValue) && onChangeAttempt && item.defaultValue !== undefined) {
            // Set default value and notify parent
            onChangeAttempt(item.id, item.defaultValue);
          }
        });
      };
      checkItems(configStruct.items);
    }
  }, [configStruct, configValue, onChangeAttempt, missingItemStrategy]);
  
  const handleChange = (id: string, newValue: any) => {
    if (onChangeAttempt) {
      onChangeAttempt(id, newValue);
    }
  };

  const renderConfigItem = (item: ConfigItemStruct) => {
    const currentValue = configValue[item.id];
    
    // Handle missing value with reportError strategy
    if (!(item.id in configValue) && missingItemStrategy === 'reportError') {
      return (
        <div className="config-error">
          ⚠️ Value missing in configValue
        </div>
      );
    }
    
    const value = currentValue ?? item.defaultValue;
    
    switch (item.type) {
      case 'boolean':
        return (
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(item.id, e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        );
      
      case 'string':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(item.id, e.target.value)}
            className="config-input"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(item.id, Number(e.target.value))}
            className="config-input"
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(item.id, e.target.value)}
            className="config-select"
          >
            {item.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  const renderItem = (item: ConfigItemStruct) => {
    // Handle group type
    if (item.type === 'group') {
      return (
        <div key={item.id} className="config-group">
          <div className="config-group-title">{item.label}</div>
          <div className="config-group-divider" />
          <div className="config-group-items">
            {item.children?.map(subItem => (
              <div key={subItem.id} className="config-item">
                <div className="config-info">
                  <div className="config-label">{subItem.label}</div>
                  {subItem.description && (
                    <div className="config-description">{subItem.description}</div>
                  )}
                </div>
                <div className="config-control">
                  {renderConfigItem(subItem)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Handle regular config item
    return (
      <div key={item.id} className="config-item">
        <div className="config-info">
          <div className="config-label">{item.label}</div>
          {item.description && (
            <div className="config-description">{item.description}</div>
          )}
        </div>
        <div className="config-control">
          {renderConfigItem(item)}
        </div>
      </div>
    );
  };

  return (
    <div className="config-container">
      <div className="config-list">
        {configStruct.items.map(item => renderItem(item))}
      </div>
    </div>
  );
};

ConfigPanel.displayName = 'ConfigPanel';

export default ConfigPanel;
