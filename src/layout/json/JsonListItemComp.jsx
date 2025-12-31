import React from 'react';
import JsonTextComp from './JsonTextComp';
import JsonNumberComp from './JsonNumberComp';
import JsonBoolComp from './JsonBoolComp';
import JsonNullComp from './JsonNullComp';
import './JsonComp.css';

/**
 * JsonListItemComp - Editable array item component for JSON arrays
 */
const JsonListItemComp = ({
  data,
  index,
  path,
  isEditable,
  onChange,
  children,
  depth
}) => {
  // Check if data is a primitive (can be edited inline)
  const isPrimitive = data === null || data === undefined || typeof data !== 'object';
  const dataType = data === null || data === undefined ? 'null' : typeof data;

  // Render appropriate component based on type
  const renderComponent = () => {
    if (!isPrimitive) {
      return <span className="json-list-item-complex">{children}</span>;
    }

    if (dataType === 'null') {
      return <JsonNullComp />;
    } else if (dataType === 'boolean') {
      return (
        <JsonBoolComp
          value={data}
          path={path}
          isEditable={isEditable}
          onChange={onChange}
        />
      );
    } else if (dataType === 'number') {
      return (
        <JsonNumberComp
          value={data}
          path={path}
          isEditable={isEditable}
          onChange={onChange}
        />
      );
    } else {
      // string or other
      return (
        <JsonTextComp
          value={data}
          path={path}
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

export default React.memo(JsonListItemComp, (prev, next) => {
  return prev.data === next.data && 
         prev.isEditable === next.isEditable &&
         prev.onChange === next.onChange; // Include onChange - if it changes, child needs new callback
});
