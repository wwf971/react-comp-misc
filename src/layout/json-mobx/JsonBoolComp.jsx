import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { useJsonContext } from './JsonContext';
import { getAvailableConversions } from './typeConvert.js';
import { useRenderCount } from './renderCountStore';
import './JsonComp.css';

/**
 * JsonBoolComp - MobX-based boolean toggle component
 */
const JsonBoolComp = observer(({
  data,
  objKey,
  value: propValue,
  path,
  getPath,
  isEditable,
  onChange
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { showConversionMenu, queryParentInfo, isDebug } = useJsonContext();
  
  // Get persistent render count
  const renderCount = useRenderCount(data, objKey);
  
  // Use propValue if provided (for avoiding array access), otherwise access data[objKey]
  const value = propValue !== undefined ? propValue : data[objKey];

  const resolvePath = () => (getPath ? getPath() : path);

  const handleClick = async () => {
    if (!isEditable || isSubmitting || error) return;

    const oldValue = value;
    const newValue = !oldValue;

    try {
      if (onChange) {
        const changeData = {
          old: { type: 'boolean', value: oldValue },
          new: { type: 'boolean', value: newValue }
        };
        const result = await onChange(resolvePath(), changeData);
        
        if (result && result.code !== 0) {
          setError(result.message || 'Update failed');
          setTimeout(() => setError(null), 3000);
          return;
        }
      }
      
      runInAction(() => {
        data[objKey] = newValue;
      });
    } catch (err) {
      setError(err.message || 'Error');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (showConversionMenu) {
      const currentPath = resolvePath();
      const pathParts = currentPath.split('..');
      const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.');
      const parentInfo = queryParentInfo ? queryParentInfo(currentPath) : { isSingleEntryInParent: false };
      
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        currentValue: value,
        currentType: 'boolean',
        path: currentPath,
        menuType: isArrayItem ? 'arrayItem' : 'value',
        value: value,
        itemKey: objKey,
        availableConversions: getAvailableConversions(value, 'boolean', { includeArray: true, includeObject: true }),
        isSingleEntryInParent: parentInfo.isSingleEntryInParent,
        isFirstInParent: parentInfo.isFirstInParent,
        isLastInParent: parentInfo.isLastInParent
      });
    }
  };

  return (
    <span className="json-value-wrapper">
      <span
        className={`json-value json-boolean ${isEditable && !error ? 'editable clickable' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        title={isEditable && !error ? 'Click to toggle' : ''}
      >
        {String(value)}
      </span>
      {isDebug && (
        <span style={{ color: '#999', fontSize: '11px', marginLeft: '6px' }}>
          #{renderCount}
        </span>
      )}
      {error && (
        <span className="json-error" style={{ color: '#f44336', fontSize: '11px', marginLeft: '6px' }}>
          {error}
        </span>
      )}
    </span>
  );
});

JsonBoolComp.displayName = 'JsonBoolComp';

export default JsonBoolComp;
