import React, { useState } from 'react';
import ConfigPanel from './Config.jsx';
import baseStyles from './Config.module.css';
import styles from './ConfigSubtab.module.css';

const ConfigPanelWithSubtabs = ({
  configStruct,
  configValue,
  onChangeAttempt,
  missingItemStrategy = 'setDefault'
}) => {
  const [activeSubtabId, setActiveSubtabId] = useState(
    configStruct.items.length > 0 ? configStruct.items[0].id : ''
  );

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

    return (
      <ConfigPanel
        configStruct={{ items: subtab.children || [] }}
        configValue={configValue}
        onChangeAttempt={onChangeAttempt}
        missingItemStrategy={missingItemStrategy}
      />
    );
  };

  const activeSubtab = configStruct.items.find(subtab => subtab.id === activeSubtabId);

  return (
    <div className={styles.configSubtabContainer}>
      <div className={styles.configSubtabBar}>
        {configStruct.items.map(subtab => (
          <button
            key={subtab.id}
            className={`${styles.configSubtab} ${activeSubtabId === subtab.id ? styles.active : ''}`}
            onClick={() => setActiveSubtabId(subtab.id)}
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
  );
};

ConfigPanelWithSubtabs.displayName = 'ConfigPanelWithSubtabs';

export default ConfigPanelWithSubtabs;
