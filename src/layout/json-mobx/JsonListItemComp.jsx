import React from 'react';
import { useJsonContext } from './JsonContext';
import JsonTextComp from './JsonTextComp';
import JsonNumberComp from './JsonNumberComp';
import JsonBoolComp from './JsonBoolComp';
import JsonNullComp from './JsonNullComp';

const JsonListItemComp = ({
  data,
  children,
}) => {
  const { container, itemIndex, path } = data;
  const { config } = useJsonContext();
  const { getValueComp } = config;
  const itemData = container[itemIndex];
  const isPrimitive = itemData === null || itemData === undefined || typeof itemData !== 'object';
  const dataType = itemData === null || itemData === undefined ? 'null' : typeof itemData;

  const renderComponent = () => {
    if (!isPrimitive) {
      return <span className="json-list-item-complex">{children}</span>;
    }

    if (getValueComp) {
      const CustomValueComp = getValueComp({
        path,
        value: itemData,
        data: container,
        itemKey: itemIndex,
        valueType: dataType,
      });
      if (CustomValueComp) return CustomValueComp;
    }

    if (dataType === 'null') {
      return <JsonNullComp data={{ path }} />;
    }
    if (dataType === 'boolean') {
      return <JsonBoolComp data={{ container, itemKey: itemIndex, path }} />;
    }
    if (dataType === 'number') {
      return <JsonNumberComp data={{ container, itemKey: itemIndex, path }} />;
    }
    return <JsonTextComp data={{ container, itemKey: itemIndex, path }} />;
  };

  return (
    <div className="json-list-item">
      {renderComponent()}
    </div>
  );
};

export default JsonListItemComp;
