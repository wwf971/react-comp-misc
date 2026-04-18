import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Config.module.css';

const ConfigNumber = observer(({
  parentData,
  entry,
  onChangeAttempt,
  defaultValue
}) => {
  const value = parentData[entry] ?? defaultValue;

  const handleChange = (e) => {
    if (onChangeAttempt) {
      onChangeAttempt(entry, Number(e.target.value));
    }
  };

  return (
    <input
      type="number"
      value={value}
      onChange={handleChange}
      className={styles.configInput}
    />
  );
});

ConfigNumber.displayName = 'ConfigNumber';

export default ConfigNumber;
