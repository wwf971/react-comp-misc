import React from 'react';
import { observer } from 'mobx-react-lite';
import ConfigPanel from './Config.jsx';
import ConfigPanelWithSubtabs from './ConfigSubtab.jsx';
import baseStyles from './Config.module.css';
import styles from './ConfigTab.module.css';
import {
  ConfigRuntimeProvider,
  appendConfigPath,
  emitConfigEvent,
  getConfigComponentPath,
  getConfigOperationState,
  joinConfigPath,
  useConfigRuntime
} from './ConfigUtils.jsx';

const ConfigPanelWithTabs = observer(({
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
  const activeTabId = operationState.activeTabId ?? effectiveConfig.activeTabId ?? items[0]?.id ?? '';

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

  const activeTab = items.find(tab => tab.id === activeTabId);

  return (
    <ConfigRuntimeProvider
      data={effectiveData}
      config={effectiveConfig}
      onEvent={effectiveOnEvent}
    >
      <div className={baseStyles.configTabContainer}>
        <div className={baseStyles.configTabSidebarContainer}>
          <div className={baseStyles.configTabSidebar}>
            <div className={styles.configTabList}>
              {items.map(tab => (
                <button
                  key={tab.id}
                  className={`${baseStyles.configTab} ${activeTabId === tab.id ? baseStyles.active : ''}`}
                  onClick={() => handleTabClick(tab)}
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
    </ConfigRuntimeProvider>
  );
});

ConfigPanelWithTabs.displayName = 'ConfigPanelWithTabs';

export default ConfigPanelWithTabs;
