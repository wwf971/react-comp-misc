import React from 'react';
import { observer } from 'mobx-react-lite';
import BoolSlider from '../../component/button/BoolSlider.jsx';
import styles from './Config.module.css';
import {
  emitConfigEvent,
  getConfigComponentPath,
  getConfigValue,
  getIsConfigControlDisabled,
  joinConfigPath,
  useConfigRuntime
} from './ConfigUtils.jsx';

const ConfigBool = observer(({
  item,
  itemPath
}) => {
  const { data, config, onEvent } = useConfigRuntime();
  const compPath = getConfigComponentPath(config);
  const value = getConfigValue(data, item);
  const isDisabled = getIsConfigControlDisabled(config, compPath);

  const handleChange = (checked) => {
    const compPathText = joinConfigPath(compPath);
    emitConfigEvent(onEvent, 'valueChangeAttempt', {
      compPath,
      compPathText,
      componentPath: compPath,
      componentPathText: compPathText,
      itemPath,
      itemPathText: joinConfigPath(itemPath),
      valueId: item.id,
      value: checked
    });
  };

  return (
    <div className={styles.configBoolControl}>
      <BoolSlider
        checked={value}
        onChange={handleChange}
        disabled={isDisabled}
      />
    </div>
  );
});

ConfigBool.displayName = 'ConfigBool';

export default ConfigBool;
