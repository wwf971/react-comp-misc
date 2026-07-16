import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Config.module.css';
import {
  emitConfigEvent,
  getConfigComponentPath,
  getConfigValue,
  getIsConfigControlDisabled,
  joinConfigPath,
  useConfigRuntime
} from './ConfigUtils.jsx';

const ConfigSelect = observer(({
  item,
  itemPath
}) => {
  const { data, config, onEvent } = useConfigRuntime();
  const compPath = getConfigComponentPath(config);
  const value = getConfigValue(data, item);
  const isDisabled = getIsConfigControlDisabled(config, compPath, itemPath, item);

  const handleChange = (e) => {
    const compPathText = joinConfigPath(compPath);
    emitConfigEvent(onEvent, 'valueChangeAttempt', {
      compPath,
      compPathText,
      componentPath: compPath,
      componentPathText: compPathText,
      itemPath,
      itemPathText: joinConfigPath(itemPath),
      valueId: item.id,
      value: e.target.value
    });
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={isDisabled}
      className={styles.configSelect}
    >
      {item.options?.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
});

ConfigSelect.displayName = 'ConfigSelect';

export default ConfigSelect;
