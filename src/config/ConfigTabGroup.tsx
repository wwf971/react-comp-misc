import React, { useState } from 'react';
import ConfigPanel from './Config';
import ConfigPanelWithSubtabs from './ConfigSubtab';
import './ConfigTabGroup.css';
import type { ConfigItemStruct, MissingItemStrategy } from './Config';
import type { ConfigSubtabStruct } from './ConfigSubtab';

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
  items: (ConfigTabGroupStruct | ConfigTabStruct)[]; // Can be tab-group or simple tab
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
  // Find the first valid tab across all groups and simple tabs
  const findFirstTab = (): string => {
    for (const item of configStruct.items) {
      if (item.type === 'tab') {
        return item.id;
      } else if (item.type === 'tab-group' && item.children && item.children.length > 0) {
        return item.children[0].id;
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

    // Check if this tab contains subtabs
    const children = tab.children || [];
    const hasSubtabs = children.length > 0 && children.every((child: any) => child.type === 'subtab');

    if (hasSubtabs) {
      // Render with ConfigPanelWithSubtabs
      return (
        <ConfigPanelWithSubtabs
          configStruct={{ items: children as unknown as ConfigSubtabStruct[] }}
          configValue={configValue}
          onInternalChange={onInternalChange}
          missingItemStrategy={missingItemStrategy}
        />
      );
    }

    // Render config items for this tab
    return (
      <ConfigPanel
        configStruct={{ items: children }}
        configValue={configValue}
        onInternalChange={onInternalChange}
        missingItemStrategy={missingItemStrategy}
      />
    );
  };

  const renderItem = (item: ConfigTabGroupStruct | ConfigTabStruct, itemIndex: number) => {
    // Handle simple tab type
    if (item.type === 'tab') {
      return (
        <button
          key={item.id}
          className={`config-tab ${activeTabId === item.id ? 'active' : ''}`}
          onClick={() => setActiveTabId(item.id)}
        >
          {item.name}
        </button>
      );
    }

    // Handle tab-group type
    if (item.type === 'tab-group') {
      const group = item as ConfigTabGroupStruct;
      const showDivider = itemIndex > 0 || (itemIndex === 0 && group.name);
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
    }

    // Invalid type
    const anyItem = item as any;
    return (
      <div key={anyItem.id} className="config-tab-error">
        <div className="error-title">⚠️ Invalid Configuration</div>
        <div className="error-message">
          Expected type "tab" or "tab-group" but got "{anyItem.type}"
        </div>
        <pre className="error-json">
          {JSON.stringify(anyItem, null, 2)}
        </pre>
      </div>
    );
  };

  // Find the active tab
  const findActiveTab = (): ConfigTabStruct | undefined => {
    for (const item of configStruct.items) {
      if (item.type === 'tab' && item.id === activeTabId) {
        return item;
      } else if (item.type === 'tab-group' && item.children) {
        const tab = item.children.find(t => t.id === activeTabId);
        if (tab) return tab;
      }
    }
    return undefined;
  };

  const activeTab = findActiveTab();

  return (
    <div className="config-tab-container">
      <div className="config-tab-sidebar-container">
        {/* Left sidebar with grouped tabs and simple tabs */}
        <div className="config-tab-sidebar">
          {configStruct.items.map((item, index) => renderItem(item, index))}
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

ConfigPanelWithTabGroups.displayName = 'ConfigPanelWithTabGroups';

export default ConfigPanelWithTabGroups;

