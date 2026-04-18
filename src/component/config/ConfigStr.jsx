import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Config.module.css';

const ConfigStr = observer(({
  parentData,
  entry,
  onChangeAttempt,
  defaultValue
}) => {
  const value = parentData[entry] ?? defaultValue;

  const handleChange = (e) => {
    if (onChangeAttempt) {
      onChangeAttempt(entry, e.target.value);
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      className={styles.configInput}
    />
  );
});

ConfigStr.displayName = 'ConfigStr';

export default ConfigStr;
