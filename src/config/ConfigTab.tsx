import React, { useState } from 'react';
import ConfigPanel from './Config';
import './ConfigTab.css';
import type { ConfigItemStruct, MissingItemStrategy } from './Config';

export type ConfigTabItemType = 'tab';

export interface ConfigTabStruct {
  id: string;
  name: string; // Display name for the tab
  type: ConfigTabItemType;
  children?: ConfigItemStruct[]; // Groups and items under this tab
}

export interface ConfigPanelWithTabsStruct {
  items: ConfigTabStruct[];
}

export interface ConfigPanelWithTabsProps {
  configStruct: ConfigPanelWithTabsStruct;
  configValue: Record<string, any>;
  onInternalChange?: (id: string, newValue: any) => void;
  missingItemStrategy?: MissingItemStrategy;
}

const ConfigPanelWithTabs: React.FC<ConfigPanelWithTabsProps> = ({
  configStruct,
  configValue,
  onInternalChange,
  missingItemStrategy = 'setDefault'
}) => {
  const [activeTabId, setActiveTabId] = useState<string>(
    configStruct.items.length > 0 ? configStruct.items[0].id : ''
  );

  const renderTabContent = (tab: ConfigTabStruct) => {
    // Validate tab type
    if (tab.type !== 'tab') {
      return (
        <div className="config-tab-error">
          <div className="error-title">⚠️ Invalid Tab Configuration</div>
          <div className="error-message">
            Expected type "tab" but got "{tab.type}"
          </div>
          <pre className="error-json">
            {JSON.stringify(tab, null, 2)}
          </pre>
        </div>
      );
    }

    // Render config items for this tab
    return (
      <ConfigPanel
        configStruct={{ items: tab.children || [] }}
        configValue={configValue}
        onInternalChange={onInternalChange}
        missingItemStrategy={missingItemStrategy}
      />
    );
  };

  const activeTab = configStruct.items.find(tab => tab.id === activeTabId);

  return (
    <div className="config-tab-container">
      {/* Left sidebar with tabs */}
      <div className="config-tab-sidebar">
        <div className="config-tab-list">
          {configStruct.items.map(tab => (
            <button
              key={tab.id}
              className={`config-tab ${activeTabId === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right panel with config content */}
      <div className="config-tab-content">
        {activeTab ? renderTabContent(activeTab) : (
          <div className="config-tab-empty">
            No tab selected
          </div>
        )}
      </div>
    </div>
  );
};

ConfigPanelWithTabs.displayName = 'ConfigPanelWithTabs';

export default ConfigPanelWithTabs;

