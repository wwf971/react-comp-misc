import React, { useState } from 'react';
import ConfigPanel from './Config';
import './ConfigSubtab.css';
import type { ConfigItemStruct, MissingItemStrategy } from './Config';

export type ConfigSubtabItemType = 'subtab';

export interface ConfigSubtabStruct {
  id: string;
  name: string; // Display name for the subtab
  type: ConfigSubtabItemType;
  children?: ConfigItemStruct[]; // Groups and items under this subtab
}

export interface ConfigPanelWithSubtabsStruct {
  items: ConfigSubtabStruct[];
}

export interface ConfigPanelWithSubtabsProps {
  configStruct: ConfigPanelWithSubtabsStruct;
  configValue: Record<string, any>;
  onInternalChange?: (id: string, newValue: any) => void;
  missingItemStrategy?: MissingItemStrategy;
}

const ConfigPanelWithSubtabs: React.FC<ConfigPanelWithSubtabsProps> = ({
  configStruct,
  configValue,
  onInternalChange,
  missingItemStrategy = 'setDefault'
}) => {
  const [activeSubtabId, setActiveSubtabId] = useState<string>(
    configStruct.items.length > 0 ? configStruct.items[0].id : ''
  );

  const renderSubtabContent = (subtab: ConfigSubtabStruct) => {
    // Validate subtab type
    if (subtab.type !== 'subtab') {
      return (
        <div className="config-tab-error">
          <div className="error-title">⚠️ Invalid Subtab Configuration</div>
          <div className="error-message">
            Expected type "subtab" but got "{subtab.type}"
          </div>
          <pre className="error-json">
            {JSON.stringify(subtab, null, 2)}
          </pre>
        </div>
      );
    }

    // Render config items for this subtab
    return (
      <ConfigPanel
        configStruct={{ items: subtab.children || [] }}
        configValue={configValue}
        onInternalChange={onInternalChange}
        missingItemStrategy={missingItemStrategy}
      />
    );
  };

  const activeSubtab = configStruct.items.find(subtab => subtab.id === activeSubtabId);

  return (
    <div className="config-subtab-container">
      {/* Top horizontal subtabs */}
      <div className="config-subtab-bar">
        {configStruct.items.map(subtab => (
          <button
            key={subtab.id}
            className={`config-subtab ${activeSubtabId === subtab.id ? 'active' : ''}`}
            onClick={() => setActiveSubtabId(subtab.id)}
          >
            {subtab.name}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="config-subtab-content">
        {activeSubtab ? renderSubtabContent(activeSubtab) : (
          <div className="config-tab-empty">
            No subtab selected
          </div>
        )}
      </div>
    </div>
  );
};

ConfigPanelWithSubtabs.displayName = 'ConfigPanelWithSubtabs';

export default ConfigPanelWithSubtabs;

