import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Config.module.css';
import ConfigBool from './ConfigBool.jsx';
import ConfigStr from './ConfigStr.jsx';
import ConfigNumber from './ConfigNumber.jsx';
import ConfigSelect from './ConfigSelect.jsx';

const ConfigPanel = observer(({
  parentData,
  configStruct,
  onChangeAttempt,
  missingItemStrategy = 'setDefault'
}) => {
  useEffect(() => {
    if (missingItemStrategy === 'setDefault') {
      const checkItems = (items) => {
        items.forEach(item => {
          if (item.type === 'group' && item.children) {
            checkItems(item.children);
          } else if (!(item.id in parentData) && onChangeAttempt && item.defaultValue !== undefined) {
            onChangeAttempt(item.id, item.defaultValue);
          }
        });
      };
      checkItems(configStruct.items);
    }
  }, [configStruct, parentData, onChangeAttempt, missingItemStrategy]);

  const renderConfigItem = (item) => {
    if (!(item.id in parentData) && missingItemStrategy === 'reportError') {
      return (
        <div className={styles.configError}>
          Value missing in parentData
        </div>
      );
    }

    switch (item.type) {
      case 'boolean':
        return (
          <ConfigBool
            parentData={parentData}
            entry={item.id}
            onChangeAttempt={onChangeAttempt}
            defaultValue={item.defaultValue}
          />
        );

      case 'string':
        return (
          <ConfigStr
            parentData={parentData}
            entry={item.id}
            onChangeAttempt={onChangeAttempt}
            defaultValue={item.defaultValue}
          />
        );

      case 'number':
        return (
          <ConfigNumber
            parentData={parentData}
            entry={item.id}
            onChangeAttempt={onChangeAttempt}
            defaultValue={item.defaultValue}
          />
        );

      case 'select':
        return (
          <ConfigSelect
            parentData={parentData}
            entry={item.id}
            onChangeAttempt={onChangeAttempt}
            defaultValue={item.defaultValue}
            options={item.options}
          />
        );

      default:
        return null;
    }
  };

  const renderItem = (item) => {
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
                  {renderConfigItem(subItem)}
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
          {renderConfigItem(item)}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.configContainer}>
      <div className={styles.configList}>
        {configStruct.items.map(item => renderItem(item))}
      </div>
    </div>
  );
});

ConfigPanel.displayName = 'ConfigPanel';

export default ConfigPanel;
