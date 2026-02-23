import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Config.module.css';

const ConfigSelect = observer(({
  parentData,
  entry,
  onChangeAttempt,
  defaultValue,
  options
}) => {
  const value = parentData[entry] ?? defaultValue;

  const handleChange = (e) => {
    if (onChangeAttempt) {
      onChangeAttempt(entry, e.target.value);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={styles.configSelect}
    >
      {options?.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
});

ConfigSelect.displayName = 'ConfigSelect';

export default ConfigSelect;
