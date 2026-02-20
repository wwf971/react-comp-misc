import React, { useEffect } from 'react';
import styles from './Config.module.css';
import BoolSlider from '../button/BoolSlider.jsx';

const ConfigPanel = ({
  configStruct,
  configValue,
  onChangeAttempt,
  missingItemStrategy = 'setDefault'
}) => {
  useEffect(() => {
    if (missingItemStrategy === 'setDefault') {
      const checkItems = (items) => {
        items.forEach(item => {
          if (item.type === 'group' && item.children) {
            checkItems(item.children);
          } else if (!(item.id in configValue) && onChangeAttempt && item.defaultValue !== undefined) {
            onChangeAttempt(item.id, item.defaultValue);
          }
        });
      };
      checkItems(configStruct.items);
    }
  }, [configStruct, configValue, onChangeAttempt, missingItemStrategy]);

  const handleChange = (id, newValue) => {
    if (onChangeAttempt) {
      onChangeAttempt(id, newValue);
    }
  };

  const renderConfigItem = (item) => {
    const currentValue = configValue[item.id];

    if (!(item.id in configValue) && missingItemStrategy === 'reportError') {
      return (
        <div className={styles.configError}>
          Value missing in configValue
        </div>
      );
    }

    const value = currentValue ?? item.defaultValue;

    switch (item.type) {
      case 'boolean':
        return (
          <BoolSlider
            checked={value}
            onChange={(checked) => handleChange(item.id, checked)}
          />
        );

      case 'string':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(item.id, e.target.value)}
            className={styles.configInput}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(item.id, Number(e.target.value))}
            className={styles.configInput}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(item.id, e.target.value)}
            className={styles.configSelect}
          >
            {item.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
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
};

ConfigPanel.displayName = 'ConfigPanel';

export default ConfigPanel;
