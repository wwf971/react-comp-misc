import React, { useState } from 'react';
import ConfigPanel from './Config';
import ConfigPanelWithSubtabs from './ConfigSubtab';
import baseStyles from './Config.module.css';
import styles from './ConfigTabGroup.module.css';
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
  onChangeAttempt?: (id: string, newValue: any) => void;
  missingItemStrategy?: MissingItemStrategy;
}

const ConfigPanelWithTabGroups: React.FC<ConfigPanelWithTabGroupsProps> = ({
  configStruct,
  configValue,
  onChangeAttempt,
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
        <div className={baseStyles.configTabError}>
          <div className={baseStyles.errorTitle}>⚠️ Invalid Tab Configuration</div>
          <div className={baseStyles.errorMessage}>
            Expected type "tab" but got "{tab.type}"
          </div>
          <pre className={baseStyles.errorJson}>
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
          onChangeAttempt={onChangeAttempt}
          missingItemStrategy={missingItemStrategy}
        />
      );
    }

    // Render config items for this tab
    return (
      <ConfigPanel
        configStruct={{ items: children }}
        configValue={configValue}
        onChangeAttempt={onChangeAttempt}
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
          className={`${baseStyles.configTab} ${activeTabId === item.id ? baseStyles.active : ''}`}
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
        <div key={group.id} className={styles.configTabGroup}>
          {/* Show group name if it exists and is not empty */}
          {showGroupName && (
            <div className={styles.configTabGroupName}>{group.name}</div>
          )}

          {/* Show divider if not the first group, or if first group has a name */}
          {showDivider && <div className={styles.configTabGroupDivider} />}
                  
          {/* Render tabs in this group */}
          {group.children?.map(tab => (
            <button
              key={tab.id}
              className={`${baseStyles.configTab} ${activeTabId === tab.id ? baseStyles.active : ''}`}
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
      <div key={anyItem.id} className={baseStyles.configTabError}>
        <div className={baseStyles.errorTitle}>⚠️ Invalid Configuration</div>
        <div className={baseStyles.errorMessage}>
          Expected type "tab" or "tab-group" but got "{anyItem.type}"
        </div>
        <pre className={baseStyles.errorJson}>
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
    <div className={baseStyles.configTabContainer}>
      <div className={baseStyles.configTabSidebarContainer}>
        {/* Left sidebar with grouped tabs and simple tabs */}
        <div className={`${baseStyles.configTabSidebar} ${styles.configTabSidebar}`}>
          {configStruct.items.map((item, index) => renderItem(item, index))}
        </div>
      </div>

      {/* Right panel with config content */}
      <div className={baseStyles.configTabContent}>
        {activeTab ? renderTabContent(activeTab) : (
          <div className={baseStyles.configTabEmpty}>
            No tab selected
          </div>
        )}
      </div>
    </div>
  );
};

ConfigPanelWithTabGroups.displayName = 'ConfigPanelWithTabGroups';

export default ConfigPanelWithTabGroups;

