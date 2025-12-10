import React, { useState } from 'react';
import ConfigPanel from './Config';
import './ConfigTabGroup.css';
import type { ConfigItemStruct, MissingItemStrategy } from './Config';

export type ConfigTabGroupItemType = 'tab-group';
export type ConfigTabItemType = 'tab';

export interface ConfigTabStruct {
  id: string;
  name: string; // Display name for the tab
  type: ConfigTabItemType;
  children?: ConfigItemStruct[]; // Groups and items under this tab
}

export interface ConfigTabGroupStruct {
  id: string;
  name?: string; // Optional display name for the group
  type: ConfigTabGroupItemType;
  children: ConfigTabStruct[]; // Tabs within this group
}

export interface ConfigPanelWithTabGroupsStruct {
  items: ConfigTabGroupStruct[];
}

export interface ConfigPanelWithTabGroupsProps {
  configStruct: ConfigPanelWithTabGroupsStruct;
  configValue: Record<string, any>;
  onInternalChange?: (id: string, newValue: any) => void;
  missingItemStrategy?: MissingItemStrategy;
}

const ConfigPanelWithTabGroups: React.FC<ConfigPanelWithTabGroupsProps> = ({
  configStruct,
  configValue,
  onInternalChange,
  missingItemStrategy = 'setDefault'
}) => {
  // Find the first valid tab across all groups
  const findFirstTab = (): string => {
    for (const group of configStruct.items) {
      if (group.type === 'tab-group' && group.children && group.children.length > 0) {
        return group.children[0].id;
      }
    }
    return '';
  };

  const [activeTabId, setActiveTabId] = useState<string>(findFirstTab());

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

  const renderTabGroup = (group: ConfigTabGroupStruct, groupIndex: number) => {
    // Validate group type
    if (group.type !== 'tab-group') {
      return (
        <div key={group.id} className="config-tab-error">
          <div className="error-title">⚠️ Invalid Tab Group Configuration</div>
          <div className="error-message">
            Expected type "tab-group" but got "{group.type}"
          </div>
          <pre className="error-json">
            {JSON.stringify(group, null, 2)}
          </pre>
        </div>
      );
    }

    const showDivider = groupIndex > 0 || (groupIndex === 0 && group.name);
    const showGroupName = group.name && group.name.trim() !== '';

    return (
      <div key={group.id} className="config-tab-group">
        {/* Show group name if it exists and is not empty */}
        {showGroupName && (
          <div className="config-tab-group-name">{group.name}</div>
        )}

        {/* Show divider if not the first group, or if first group has a name */}
        {showDivider && <div className="config-tab-group-divider" />}
                
        {/* Render tabs in this group */}
        {group.children?.map(tab => (
          <button
            key={tab.id}
            className={`config-tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>
    );
  };

  // Find the active tab
  const findActiveTab = (): ConfigTabStruct | undefined => {
    for (const group of configStruct.items) {
      if (group.type === 'tab-group' && group.children) {
        const tab = group.children.find(t => t.id === activeTabId);
        if (tab) return tab;
      }
    }
    return undefined;
  };

  const activeTab = findActiveTab();

  return (
    <div className="config-tab-container">
      {/* Left sidebar with grouped tabs */}
      <div className="config-tab-sidebar">
        {configStruct.items.map((group, index) => renderTabGroup(group, index))}
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

ConfigPanelWithTabGroups.displayName = 'ConfigPanelWithTabGroups';

export default ConfigPanelWithTabGroups;

