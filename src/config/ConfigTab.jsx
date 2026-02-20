import React, { useState } from 'react';
import ConfigPanel from './Config.jsx';
import ConfigPanelWithSubtabs from './ConfigSubtab.jsx';
import baseStyles from './Config.module.css';
import styles from './ConfigTab.module.css';

const ConfigPanelWithTabs = ({
  configStruct,
  configValue,
  onChangeAttempt,
  missingItemStrategy = 'setDefault'
}) => {
  const [activeTabId, setActiveTabId] = useState(
    configStruct.items.length > 0 ? configStruct.items[0].id : ''
  );

  const renderTabContent = (tab) => {
    if (tab.type !== 'tab') {
      return (
        <div className={baseStyles.configTabError}>
          <div className={baseStyles.errorTitle}>Invalid Tab Configuration</div>
          <div className={baseStyles.errorMessage}>
            Expected type "tab" but got "{tab.type}"
          </div>
          <pre className={baseStyles.errorJson}>
            {JSON.stringify(tab, null, 2)}
          </pre>
        </div>
      );
    }

    const children = tab.children || [];
    const hasSubtabs = children.length > 0 && children.every((child) => child.type === 'subtab');

    if (hasSubtabs) {
      return (
        <ConfigPanelWithSubtabs
          configStruct={{ items: children }}
          configValue={configValue}
          onChangeAttempt={onChangeAttempt}
          missingItemStrategy={missingItemStrategy}
        />
      );
    }

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
