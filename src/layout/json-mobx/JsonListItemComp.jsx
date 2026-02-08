import React from 'react';
import JsonTextComp from './JsonTextComp';
import JsonNumberComp from './JsonNumberComp';
import JsonBoolComp from './JsonBoolComp';
import JsonNullComp from './JsonNullComp';

/**
 * JsonListItemComp - Displays an item in an array
 * NOT wrapped with observer - receives itemData directly to avoid array tracking
 */
const JsonListItemComp = ({ 
  parentData,
  index,
  itemData,
  getPath,
  isEditable,
  onChange,
  depth,
  children 
}) => {
  const isPrimitive = itemData === null || itemData === undefined || typeof itemData !== 'object';
  const dataType = itemData === null || itemData === undefined ? 'null' : typeof itemData;

  const renderComponent = () => {
    if (!isPrimitive) {
      return <span className="json-list-item-complex">{children}</span>;
    }

    if (dataType === 'null') {
      return <JsonNullComp getPath={getPath} />;
    } else if (dataType === 'boolean') {
      return (
        <JsonBoolComp
          data={parentData}
          objKey={index}
          value={itemData}
          getPath={getPath}
          isEditable={isEditable}
          onChange={onChange}
        />
      );
    } else if (dataType === 'number') {
      return (
        <JsonNumberComp
          data={parentData}
          objKey={index}
          value={itemData}
          getPath={getPath}
          isEditable={isEditable}
          onChange={onChange}
        />
      );
    } else {
      // string or other
      return (
        <JsonTextComp
          data={parentData}
          objKey={index}
          value={itemData}
          getPath={getPath}
          isEditable={isEditable}
          onChange={onChange}
        />
      );
    }
  };

  return (
    <div className="json-list-item">
      {renderComponent()}
    </div>
  );
};

export default JsonListItemComp;
