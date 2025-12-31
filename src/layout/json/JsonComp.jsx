import React from 'react';
import JsonKeyValueComp from './JsonKeyValueComp';
import JsonListItemComp from './JsonListItemComp';
import './JsonComp.css';

/**
 * JsonComp - Component for displaying and editing deeply nested JSON-like objects
 * 
 * @param {Object|Array} data - The JSON data to display
 * @param {boolean} isEditable - Whether the data is editable (default: true)
 * @param {boolean} isKeyEditable - Whether keys are editable (default: false)
 * @param {boolean} isValueEditable - Whether values are editable (default: true)
 * @param {Function} onChange - Callback when value changes: (path, newValue) => Promise<{code: number, message?: string}>
 * @param {number} indent - Indentation in pixels (default: 20)
 * @param {string} pathPrefix - Internal: path prefix for nested objects
 * @param {number} depth - Internal: current nesting depth
 */
const JsonComp = ({ 
  data, 
  isEditable = true,
  isKeyEditable = false,
  isValueEditable = true,
  onChange,
  indent = 20,
  pathPrefix = '',
  depth = 0
}) => {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return <span className="json-null">null</span>;
  }

  // Handle primitive types
  if (typeof data !== 'object') {
    return <span className={`json-primitive json-${typeof data}`}>{String(data)}</span>;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="json-empty-array">[ ]</span>;
    }

    return (
      <div className="json-array" style={{ '--depth': depth, '--json-indent': `${indent}px` }}>
        <div className="json-bracket">[</div>
        <div className="json-array-items">
          {data.map((item, index) => {
            const itemPath = pathPrefix ? `${pathPrefix}[${index}]` : `[${index}]`;
            const isLastItem = index === data.length - 1;
            const isPrimitive = item === null || item === undefined || typeof item !== 'object';

            return (
              <div key={index} className="json-array-item">
                <JsonListItemComp
                  data={item}
                  index={index}
                  path={itemPath}
                  isEditable={isEditable && isValueEditable}
                  onChange={onChange}
                  depth={depth}
                >
                  <JsonComp
                    data={item}
                    isEditable={isEditable}
                    isKeyEditable={isKeyEditable}
                    isValueEditable={isValueEditable}
                    onChange={onChange}
                    indent={indent}
                    pathPrefix={itemPath}
                    depth={depth + 1}
                  />
                </JsonListItemComp>
                {!isLastItem && isPrimitive && <span className="json-comma">,</span>}
              </div>
            );
          })}
        </div>
        <div className="json-bracket">]</div>
      </div>
    );
  }

  // Handle objects
  const keys = Object.keys(data);
  
  if (keys.length === 0) {
    return <span className="json-empty-object">{'{ }'}</span>;
  }

  return (
    <div className="json-object" style={{ '--depth': depth, '--json-indent': `${indent}px` }}>
      <div className="json-bracket">{'{'}</div>
      <div className="json-object-items">
        {keys.map((key, index) => {
          const value = data[key];
          const keyPath = pathPrefix ? `${pathPrefix}.${key}` : key;
          const isLastItem = index === keys.length - 1;
          const isPrimitive = value === null || value === undefined || typeof value !== 'object';

          return (
            <div key={key} className="json-object-item">
              <JsonKeyValueComp
                itemKey={key}
                value={value}
                path={keyPath}
                isEditable={isEditable}
                isKeyEditable={isKeyEditable}
                isValueEditable={isValueEditable}
                onChange={onChange}
                depth={depth}
              >
                <JsonComp
                  data={value}
                  isEditable={isEditable}
                  isKeyEditable={isKeyEditable}
                  isValueEditable={isValueEditable}
                  onChange={onChange}
                  indent={indent}
                  pathPrefix={keyPath}
                  depth={depth + 1}
                />
              </JsonKeyValueComp>
              {!isLastItem && isPrimitive && <span className="json-comma">,</span>}
            </div>
          );
        })}
      </div>
      <div className="json-bracket">{'}'}</div>
    </div>
  );
};

export default JsonComp;
