import React from 'react';
import KeyValuesComp from './KeyValuesComp.jsx';

const KeyValues = ({
  data = {},
  config = {},
  onEvent,
}) => (
  <KeyValuesComp
    data={data}
    config={config}
    onEvent={onEvent}
  />
);

export default KeyValues;
