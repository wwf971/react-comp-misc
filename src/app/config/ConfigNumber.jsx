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

const ConfigNumber = observer(({
  item,
  itemPath
}) => {
  const { data, config, onEvent } = useConfigRuntime();
  const componentPath = getConfigComponentPath(config);
  const value = getConfigValue(data, item);
  const isDisabled = getIsConfigControlDisabled(config, componentPath);

  const handleChange = (e) => {
    emitConfigEvent(onEvent, 'valueChangeAttempt', {
      componentPath,
      componentPathText: joinConfigPath(componentPath),
      itemPath,
      itemPathText: joinConfigPath(itemPath),
      valueId: item.id,
      value: Number(e.target.value)
    });
  };

  return (
    <input
      type="number"
      value={value}
      onChange={handleChange}
      disabled={isDisabled}
      className={styles.configInput}
    />
  );
});

ConfigNumber.displayName = 'ConfigNumber';

export default ConfigNumber;
