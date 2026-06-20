import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Config.module.css';
import ConfigBool from './ConfigBool.jsx';
import ConfigStr from './ConfigStr.jsx';
import ConfigNumber from './ConfigNumber.jsx';
import ConfigSelect from './ConfigSelect.jsx';
import {
  ConfigRuntimeProvider,
  appendConfigPath,
  emitConfigEvent,
  getConfigComponentPath,
  joinConfigPath,
  useConfigRuntime
} from './ConfigUtils.jsx';

const ConfigPanel = observer(({
  data,
  config,
  onEvent
}) => {
  const runtime = useConfigRuntime();
  const effectiveData = data ?? runtime.data ?? {};
  const effectiveConfig = config ?? runtime.config ?? {};
  const effectiveOnEvent = onEvent ?? runtime.onEvent;
  const componentPath = getConfigComponentPath(effectiveConfig);
  const componentPathText = joinConfigPath(componentPath);
  const missingItemStrategy = effectiveConfig.missingItemStrategy ?? 'setDefault';
  const items = effectiveConfig.items ?? [];

  useEffect(() => {
    if (missingItemStrategy === 'setDefault') {
      const checkItems = (items) => {
        items.forEach(item => {
          if (item.type === 'group' && item.children) {
            checkItems(item.children);
          } else if (!(item.id in effectiveData) && item.defaultValue !== undefined) {
            const itemPath = appendConfigPath(componentPath, item.id);
            emitConfigEvent(effectiveOnEvent, 'valueDefaultSetAttempt', {
              componentPath,
              componentPathText,
              itemPath,
              itemPathText: joinConfigPath(itemPath),
              valueId: item.id,
              value: item.defaultValue
            });
          }
        });
      };
      checkItems(items);
    }
  }, [componentPathText, effectiveData, effectiveOnEvent, items, missingItemStrategy]);

  const renderConfigItem = (item, itemPath) => {
    if (!(item.id in effectiveData) && missingItemStrategy === 'reportError') {
      return (
        <div className={styles.configError}>
          Value missing in data
        </div>
      );
    }

    switch (item.type) {
      case 'boolean':
        return (
          <ConfigBool
            item={item}
            itemPath={itemPath}
          />
        );

      case 'string':
        return (
          <ConfigStr
            item={item}
            itemPath={itemPath}
          />
        );

      case 'number':
        return (
          <ConfigNumber
            item={item}
            itemPath={itemPath}
          />
        );

      case 'select':
        return (
          <ConfigSelect
            item={item}
            itemPath={itemPath}
          />
        );

      default:
        return null;
    }
  };

  const renderItem = (item) => {
    const itemPath = appendConfigPath(componentPath, item.id);

    if (item.type === 'group') {
      return (
        <div key={item.id} className={styles.configGroup}>
          <div className={styles.configGroupTitle}>{item.label}</div>
          <div className={styles.configGroupDivider} />
          <div className={styles.configGroupItems}>
            {item.children?.map(subItem => (
              <div key={subItem.id} className={styles.configItem}>
                <div className={styles.configInfo}>
                  <div className={styles.configLabel}>{subItem.label}</div>
                  {subItem.description && (
                    <div className={styles.configDescription}>{subItem.description}</div>
                  )}
                </div>
                <div className={styles.configControl}>
                  {renderConfigItem(subItem, appendConfigPath(itemPath, subItem.id))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={item.id} className={styles.configItem}>
        <div className={styles.configInfo}>
          <div className={styles.configLabel}>{item.label}</div>
          {item.description && (
            <div className={styles.configDescription}>{item.description}</div>
          )}
        </div>
        <div className={styles.configControl}>
          {renderConfigItem(item, itemPath)}
        </div>
      </div>
    );
  };

  return (
    <ConfigRuntimeProvider
      data={effectiveData}
      config={effectiveConfig}
      onEvent={effectiveOnEvent}
    >
      <div className={styles.configContainer}>
        <div className={styles.configList}>
          {items.map(item => renderItem(item))}
        </div>
      </div>
    </ConfigRuntimeProvider>
  );
});

ConfigPanel.displayName = 'ConfigPanel';

export default ConfigPanel;
