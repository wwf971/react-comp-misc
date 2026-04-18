import React from 'react';
import { observer } from 'mobx-react-lite';
import BoolSlider from '../button/BoolSlider.jsx';

const ConfigBool = observer(({
  parentData,
  entry,
  onChangeAttempt,
  defaultValue
}) => {
  const value = parentData[entry] ?? defaultValue;

  const handleChange = (checked) => {
    if (onChangeAttempt) {
      onChangeAttempt(entry, checked);
    }
  };

  return (
    <div style={{ minWidth: '44px', flexShrink: 0 }}>
      <BoolSlider
        checked={value}
        onChange={handleChange}
      />
    </div>
  );
});

ConfigBool.displayName = 'ConfigBool';

export default ConfigBool;
