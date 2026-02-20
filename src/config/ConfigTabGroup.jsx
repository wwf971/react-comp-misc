import React, { useState } from 'react';
import ConfigPanel from './Config.jsx';
import ConfigPanelWithSubtabs from './ConfigSubtab.jsx';
import baseStyles from './Config.module.css';
import styles from './ConfigTabGroup.module.css';

const ConfigPanelWithTabGroups = ({
  configStruct,
  configValue,
  onChangeAttempt,
  missingItemStrategy = 'setDefault'
}) => {
  const findFirstTab = () => {
    for (const item of configStruct.items) {
      if (item.type === 'tab') {
        return item.id;
      } else if (item.type === 'tab-group' && item.children && item.children.length > 0) {
        return item.children[0].id;
      }
    }
    return '';
  };

  const [activeTabId, setActiveTabId] = useState(findFirstTab());

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

  const renderItem = (item, itemIndex) => {
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

    if (item.type === 'tab-group') {
      const group = item;
      const showDivider = itemIndex > 0 || (itemIndex === 0 && group.name);
      const showGroupName = group.name && group.name.trim() !== '';

      return (
        <div key={group.id} className={styles.configTabGroup}>
          {showGroupName && (
            <div className={styles.configTabGroupName}>{group.name}</div>
          )}

          {showDivider && <div className={styles.configTabGroupDivider} />}

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

    return (
      <div key={item.id} className={baseStyles.configTabError}>
        <div className={baseStyles.errorTitle}>Invalid Configuration</div>
        <div className={baseStyles.errorMessage}>
          Expected type "tab" or "tab-group" but got "{item.type}"
        </div>
        <pre className={baseStyles.errorJson}>
          {JSON.stringify(item, null, 2)}
        </pre>
      </div>
    );
  };

  const findActiveTab = () => {
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
        <div className={`${baseStyles.configTabSidebar} ${styles.configTabSidebar}`}>
          {configStruct.items.map((item, index) => renderItem(item, index))}
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

ConfigPanelWithTabGroups.displayName = 'ConfigPanelWithTabGroups';

export default ConfigPanelWithTabGroups;
