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

const ConfigStr = observer(({
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
    <input
      type="text"
      value={value}
      onChange={handleChange}
      disabled={isDisabled}
      className={styles.configInput}
    />
  );
});

ConfigStr.displayName = 'ConfigStr';

export default ConfigStr;
