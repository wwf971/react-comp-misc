import React from 'react';
import { observer } from 'mobx-react-lite';
import ConfigPanel from './Config.jsx';
import ConfigPanelWithSubtabs from './ConfigSubtab.jsx';
import baseStyles from './Config.module.css';
import styles from './ConfigTabGroup.module.css';
import {
  ConfigRuntimeProvider,
  appendConfigPath,
  emitConfigEvent,
  getConfigComponentPath,
  getConfigOperationState,
  joinConfigPath,
  useConfigRuntime
} from './ConfigUtils.jsx';

const ConfigPanelWithTabGroups = observer(({
  data,
  config,
  onEvent
}) => {
  const runtime = useConfigRuntime();
  const effectiveData = data ?? runtime.data ?? {};
  const effectiveConfig = config ?? runtime.config ?? {};
  const effectiveOnEvent = onEvent ?? runtime.onEvent;
  const componentPath = getConfigComponentPath(effectiveConfig);
  const operationState = getConfigOperationState(effectiveConfig, componentPath);
  const items = effectiveConfig.items ?? [];

  const findFirstTab = () => {
    for (const item of items) {
      if (item.type === 'tab') {
        return item.id;
      } else if (item.type === 'tab-group' && item.children && item.children.length > 0) {
        return item.children[0].id;
      }
    }
    return '';
  };

  const activeTabId = operationState.activeTabId ?? effectiveConfig.activeTabId ?? findFirstTab();

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
    const tabPath = appendConfigPath(componentPath, tab.id);
    const childConfig = {
      ...effectiveConfig,
      componentPath: tabPath,
      items: children
    };

    if (hasSubtabs) {
      return (
        <ConfigPanelWithSubtabs
          data={effectiveData}
          config={childConfig}
        />
      );
    }

    return (
      <ConfigPanel
        data={effectiveData}
        config={childConfig}
      />
    );
  };

  const handleTabClick = (tab) => {
    const tabPath = appendConfigPath(componentPath, tab.id);
    emitConfigEvent(effectiveOnEvent, 'activeTabChange', {
      componentPath,
      componentPathText: joinConfigPath(componentPath),
      tabPath,
      tabPathText: joinConfigPath(tabPath),
      tabId: tab.id
    });
  };

  const renderItem = (item, itemIndex) => {
    if (item.type === 'tab') {
      return (
        <button
          key={item.id}
          className={`${baseStyles.configTab} ${activeTabId === item.id ? baseStyles.active : ''}`}
          onClick={() => handleTabClick(item)}
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
              onClick={() => handleTabClick(tab)}
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
    for (const item of items) {
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
    <ConfigRuntimeProvider
      data={effectiveData}
      config={effectiveConfig}
      onEvent={effectiveOnEvent}
    >
      <div className={baseStyles.configTabContainer}>
        <div className={baseStyles.configTabSidebarContainer}>
          <div className={`${baseStyles.configTabSidebar} ${styles.configTabSidebar}`}>
            {items.map((item, index) => renderItem(item, index))}
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
    </ConfigRuntimeProvider>
  );
});

ConfigPanelWithTabGroups.displayName = 'ConfigPanelWithTabGroups';

export default ConfigPanelWithTabGroups;
