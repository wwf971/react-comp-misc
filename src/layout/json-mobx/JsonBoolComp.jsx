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
const JsonBoolComp = observer(({ data: dataProp }) => {
  const { container, itemKey, path, renderCountKey } = dataProp;
  const { config, store, emitEvent, pathQueryParentInfo } = useJsonContext();
  const { openMenu } = store;
  const { isEditable, isValueEditable, isDebug } = config;
  const canEditValue = isEditable && isValueEditable;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const renderCount = useRenderCount(container, renderCountKey ?? itemKey, isDebug);
  
  const value = container[itemKey];

  const handleClick = async () => {
    if (!canEditValue || isSubmitting || error) return;

    const oldValue = value;
    const newValue = !oldValue;

    try {
      const changeData = {
        old: { type: 'boolean', value: oldValue },
        new: { type: 'boolean', value: newValue }
      };
      const result = await emitEvent(path, changeData);
      
      if (result && result.code !== 0) {
        setError(result.message || 'Update failed');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      runInAction(() => {
        container[itemKey] = newValue;
      });
    } catch (err) {
      setError(err.message || 'Error');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const pathParts = path.split('..');
    const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.');
    const parentInfo = pathQueryParentInfo ? pathQueryParentInfo(path) : { isSingleEntryInParent: false };
    
    openMenu({
      position: { x: e.clientX, y: e.clientY },
      currentValue: value,
      currentType: 'boolean',
      path,
      menuType: isArrayItem ? 'arrayItem' : 'value',
      value,
      itemKey,
      availableConversions: getAvailableConversions(value, 'boolean', { includeArray: true, includeObject: true }),
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    });
  };

  return (
    <span className="json-value-wrapper">
      <span
        className={`json-value json-boolean ${canEditValue && !error ? 'editable clickable' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        title={canEditValue && !error ? 'Click to toggle' : ''}
      >
        {String(value)}
      </span>
      {isDebug && (
        <span className="json-render-count">
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
