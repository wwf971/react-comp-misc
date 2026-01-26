import React, { useState } from 'react';
import ConfigPanel from './Config';
import ConfigPanelWithSubtabs from './ConfigSubtab';
import baseStyles from './Config.module.css';
import styles from './ConfigTab.module.css';
import type { ConfigItemStruct, MissingItemStrategy } from './Config';
import type { ConfigSubtabStruct } from './ConfigSubtab';

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
  onChangeAttempt?: (id: string, newValue: any) => void;
  missingItemStrategy?: MissingItemStrategy;
}

const ConfigPanelWithTabs: React.FC<ConfigPanelWithTabsProps> = ({
  configStruct,
  configValue,
  onChangeAttempt,
  missingItemStrategy = 'setDefault'
}) => {
  const [activeTabId, setActiveTabId] = useState<string>(
    configStruct.items.length > 0 ? configStruct.items[0].id : ''
  );

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

  const activeTab = configStruct.items.find(tab => tab.id === activeTabId);

  return (
    <div className={baseStyles.configTabContainer}>
      <div className={baseStyles.configTabSidebarContainer}>
        {/* Left sidebar with tabs */}
        <div className={baseStyles.configTabSidebar}>
          <div className={styles.configTabList}>
            {configStruct.items.map(tab => (
              <button
                key={tab.id}
                className={`${baseStyles.configTab} ${activeTabId === tab.id ? baseStyles.active : ''}`}
                onClick={() => setActiveTabId(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>
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

ConfigPanelWithTabs.displayName = 'ConfigPanelWithTabs';

export default ConfigPanelWithTabs;

