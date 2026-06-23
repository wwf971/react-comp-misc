import React, { useState, useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction, runInAction, keys as mobxKeys, set as mobxSet, remove as mobxRemove } from 'mobx';
import { getKeyIdentity, renameKeyIdentity, renameKeyInOrder } from './keyOrderStore';
import { useJsonContext } from './JsonContext';
import JsonTextComp, { clearBrowserTextSelection } from './JsonTextComp';
import JsonNumberComp from './JsonNumberComp';
import JsonBoolComp from './JsonBoolComp';
import JsonNullComp from './JsonNullComp';

/**
 * JsonKeyValueComp - Displays a key-value pair in an object
 * Wrapped with observer to auto-track MobX dependencies
 */
const JsonKeyValueComp = observer(({ 
  data: dataProp,
  children 
}) => {
  const { container, itemKey, path } = dataProp;
  const { config, store, emitEvent, pathQueryParentInfo } = useJsonContext();
  const { selection, openMenu } = store;
  const { isEditable, isKeyEditable, isValueEditable, isDebug, getValueComp } = config;
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [error, setError] = useState(null);
  const keyRef = useRef(null);
  const originalKeyRef = useRef('');
  
  useEffect(() => {
    if (isEditingKey && keyRef.current) {
      keyRef.current.focus();
      const range = document.createRange();
      const selectionWindow = window.getSelection();
      range.selectNodeContents(keyRef.current);
      selectionWindow.removeAllRanges();
      selectionWindow.addRange(range);
    }
  }, [isEditingKey]);
  
  const hasKey = mobxKeys(container).includes(itemKey);
  
  const value = container[itemKey];
  const isEmptyCollection = (typeof value === 'object' && value !== null) && 
    ((Array.isArray(value) && value.length === 0) || 
     (!Array.isArray(value) && Object.keys(value).length === 0));
  const isPrimitive = value === null || value === undefined || typeof value !== 'object';
  const valueType = value === null || value === undefined ? 'null' : typeof value;
  
  const canEditKey = isEditable && isKeyEditable;
  const canEditValue = isEditable && isValueEditable;
  const renderCountKey = isDebug ? getKeyIdentity(container, itemKey) : undefined;

  const handleKeyClick = () => {
    if (!canEditKey) return;
    if (!hasKey) return;
    originalKeyRef.current = itemKey;
    setIsEditingKey(true);
  };

  const handleKeySubmit = useCallback(async () => {
    if (!keyRef.current) return;
    
    const newKey = keyRef.current.textContent.trim();
    
    if (newKey === originalKeyRef.current) {
      setIsEditingKey(false);
      clearBrowserTextSelection();
      if (keyRef.current) {
        keyRef.current.textContent = originalKeyRef.current;
      }
      return;
    }
    
    if (newKey === '') {
      setError('Key cannot be empty');
      if (keyRef.current) {
        keyRef.current.textContent = originalKeyRef.current;
      }
      setTimeout(() => setError(null), 3000);
      setIsEditingKey(false);
      clearBrowserTextSelection();
      return;
    }

    if (newKey in container) {
      setError(`Key "${newKey}" already exists`);
      if (keyRef.current) {
        keyRef.current.textContent = originalKeyRef.current;
      }
      setTimeout(() => setError(null), 3000);
      setIsEditingKey(false);
      clearBrowserTextSelection();
      return;
    }

    setIsEditingKey(false);
    clearBrowserTextSelection();
    
    try {
      const changeData = {
        old: { type: 'key', value: originalKeyRef.current },
        new: { type: 'key', value: newKey },
        _keyRename: true
      };
      
      const result = await emitEvent(path, changeData);
      
      if (result && result.code !== 0) {
        setError(result.message || 'Failed to update key');
        if (keyRef.current) {
          keyRef.current.textContent = originalKeyRef.current;
        }
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      runInAction(() => {
        renameKeyInOrder(container, originalKeyRef.current, newKey);
        renameKeyIdentity(container, originalKeyRef.current, newKey);
        const tempValue = container[originalKeyRef.current];
        mobxRemove(container, originalKeyRef.current);
        mobxSet(container, newKey, tempValue);
      });
    } catch (errorSubmit) {
      setError(errorSubmit.message || 'Error renaming key');
      if (keyRef.current) {
        keyRef.current.textContent = originalKeyRef.current;
      }
      setTimeout(() => setError(null), 3000);
    }
  }, [container, emitEvent, path]);

  useEffect(() => {
    if (!isEditingKey || !selection) return undefined;
    return reaction(
      () => selection.revisionSelection,
      () => {
        handleKeySubmit();
      }
    );
  }, [handleKeySubmit, isEditingKey, selection]);

  const handleKeyBlur = () => {
    handleKeySubmit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleKeySubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (keyRef.current) {
        keyRef.current.textContent = originalKeyRef.current;
      }
      setIsEditingKey(false);
      clearBrowserTextSelection();
    }
  };

  const handleKeyContextMenu = (e) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    
    const parentInfo = pathQueryParentInfo ? pathQueryParentInfo(path) : { isSingleEntryInParent: false };
    openMenu({
      position: { x: e.clientX, y: e.clientY },
      menuType: 'key',
      itemKey,
      path,
      value,
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    });
  };

  const renderValueComponent = () => {
    if (isEmptyCollection) {
      return children;
    }
    
    if (!isPrimitive) {
      return <span className="json-value-complex">{children}</span>;
    }

    if (getValueComp) {
      const CustomValueComp = getValueComp({
        path,
        value,
        data: container,
        itemKey,
        valueType,
      });
      if (CustomValueComp) return CustomValueComp;
    }

    if (valueType === 'null') {
      return <JsonNullComp data={{ path }} />;
    } else if (valueType === 'boolean') {
      return (
        <JsonBoolComp
          data={{ container, itemKey, path, renderCountKey }}
        />
      );
    } else if (valueType === 'number') {
      return (
        <JsonNumberComp
          data={{ container, itemKey, path, renderCountKey }}
        />
      );
    } else {
      return (
        <JsonTextComp
          data={{ container, itemKey, path, renderCountKey }}
        />
      );
    }
  };

  if (!hasKey) {
    return null;
  }

  return (
    <div className={`json-keyvalue ${!isPrimitive ? 'has-complex-value' : ''}`}>
      <div className="json-key-and-colon">
        <span className="json-key-wrapper">
          <span
            ref={keyRef}
            className={`json-key ${canEditKey ? 'editable' : ''} ${isEditingKey ? 'editing' : ''}`}
            contentEditable={isEditingKey}
            onBlur={handleKeyBlur}
            onKeyDown={handleKeyDown}
            onClick={handleKeyClick}
            onContextMenu={handleKeyContextMenu}
            draggable={false}
            suppressContentEditableWarning={true}
          >
            {itemKey}
          </span>
          {error && (
            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#d32f2f' }}>
              {error}
            </span>
          )}
        </span>
        
        <span className="json-colon">:</span>
      </div>
      
      {renderValueComponent()}
    </div>
  );
});

JsonKeyValueComp.displayName = 'JsonKeyValueComp';

export default JsonKeyValueComp;
