import React, { useState } from 'react';
import ConfigPanel from './Config';
import baseStyles from './Config.module.css';
import styles from './ConfigSubtab.module.css';
import type { ConfigItemStruct, MissingItemStrategy } from './Config';

export type ConfigSubtabItemType = 'subtab';

export interface ConfigSubtabStruct {
  id: string;
  name: string; // Display name for the subtab
  type: ConfigSubtabItemType;
  children?: ConfigItemStruct[]; // Groups and items under this subtab
}

export interface ConfigPanelWithSubtabsStruct {
  items: ConfigSubtabStruct[];
}

export interface ConfigPanelWithSubtabsProps {
  configStruct: ConfigPanelWithSubtabsStruct;
  configValue: Record<string, any>;
  onChangeAttempt?: (id: string, newValue: any) => void;
  missingItemStrategy?: MissingItemStrategy;
}

const ConfigPanelWithSubtabs: React.FC<ConfigPanelWithSubtabsProps> = ({
  configStruct,
  configValue,
  onChangeAttempt,
  missingItemStrategy = 'setDefault'
}) => {
  const [activeSubtabId, setActiveSubtabId] = useState<string>(
    configStruct.items.length > 0 ? configStruct.items[0].id : ''
  );

  const renderSubtabContent = (subtab: ConfigSubtabStruct) => {
    // Validate subtab type
    if (subtab.type !== 'subtab') {
      return (
        <div className={baseStyles.configTabError}>
          <div className={baseStyles.errorTitle}>⚠️ Invalid Subtab Configuration</div>
          <div className={baseStyles.errorMessage}>
            Expected type "subtab" but got "{subtab.type}"
          </div>
          <pre className={baseStyles.errorJson}>
            {JSON.stringify(subtab, null, 2)}
          </pre>
        </div>
      );
    }

    // Render config items for this subtab
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
      {/* Top horizontal subtabs */}
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

      {/* Content area */}
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

