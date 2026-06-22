import React from 'react';
import { observer } from 'mobx-react-lite';
import ConfigPanel from './Config.jsx';
import baseStyles from './Config.module.css';
import styles from './ConfigSubtab.module.css';
import {
  ConfigRuntimeProvider,
  appendConfigPath,
  emitConfigEvent,
  getConfigComponentPath,
  getConfigOperationState,
  joinConfigPath,
  useConfigRuntime
} from './ConfigUtils.jsx';

const ConfigPanelWithSubtabs = observer(({
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
  const activeSubtabId = operationState.activeSubtabId ?? effectiveConfig.activeSubtabId ?? items[0]?.id ?? '';

  const renderSubtabContent = (subtab) => {
    if (subtab.type !== 'subtab') {
      return (
        <div className={baseStyles.configTabError}>
          <div className={baseStyles.errorTitle}>Invalid Subtab Configuration</div>
          <div className={baseStyles.errorMessage}>
            Expected type "subtab" but got "{subtab.type}"
          </div>
          <pre className={baseStyles.errorJson}>
            {JSON.stringify(subtab, null, 2)}
          </pre>
        </div>
      );
    }

    const subtabPath = appendConfigPath(componentPath, subtab.id);

    return (
      <ConfigPanel
        data={effectiveData}
        config={{
          ...effectiveConfig,
          componentPath: subtabPath,
          items: subtab.children || []
        }}
      />
    );
  };

  const handleSubtabClick = (subtab) => {
    const subtabPath = appendConfigPath(componentPath, subtab.id);
    emitConfigEvent(effectiveOnEvent, 'activeSubtabChange', {
      componentPath,
      componentPathText: joinConfigPath(componentPath),
      subtabPath,
      subtabPathText: joinConfigPath(subtabPath),
      subtabId: subtab.id
    });
  };

  const activeSubtab = items.find(subtab => subtab.id === activeSubtabId);

  return (
    <ConfigRuntimeProvider
      data={effectiveData}
      config={effectiveConfig}
      onEvent={effectiveOnEvent}
    >
      <div className={styles.configSubtabContainer}>
        <div className={styles.configSubtabBar}>
          {items.map(subtab => (
            <button
              key={subtab.id}
              className={`${styles.configSubtab} ${activeSubtabId === subtab.id ? styles.active : ''}`}
              onClick={() => handleSubtabClick(subtab)}
            >
              {subtab.name}
            </button>
          ))}
        </div>

        <div className={styles.configSubtabContent}>
          {activeSubtab ? renderSubtabContent(activeSubtab) : (
            <div className={baseStyles.configTabEmpty}>
              No subtab selected
            </div>
          )}
        </div>
      </div>
    </ConfigRuntimeProvider>
  );
});

ConfigPanelWithSubtabs.displayName = 'ConfigPanelWithSubtabs';

export default ConfigPanelWithSubtabs;
