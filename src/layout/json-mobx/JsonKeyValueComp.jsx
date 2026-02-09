import React, { useState, useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction, keys as mobxKeys, set as mobxSet, remove as mobxRemove } from 'mobx';
import { renameKeyIdentity, renameKeyInOrder } from './keyOrderStore';
import { useJsonContext } from './JsonContext';
import JsonTextComp from './JsonTextComp';
import JsonNumberComp from './JsonNumberComp';
import JsonBoolComp from './JsonBoolComp';
import JsonNullComp from './JsonNullComp';

/**
 * JsonKeyValueComp - Displays a key-value pair in an object
 * Wrapped with observer to auto-track MobX dependencies
 */
const JsonKeyValueComp = observer(({ 
  data,
  itemKey, 
  path,
  getPath,
  isEditable,
  isKeyEditable,
  isValueEditable,
  onChange,
  depth,
  children 
}) => {
  // Call all hooks first (before any conditional returns)
  const { showConversionMenu, queryParentInfo } = useJsonContext();
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [error, setError] = useState(null);
  const keyRef = useRef(null);
  const originalKeyRef = useRef('');
  const resolvePath = useCallback(() => (getPath ? getPath() : path), [getPath, path]);
  
  // Handle key edit focus (useEffect must be called before any return)
  useEffect(() => {
    if (isEditingKey && keyRef.current) {
      keyRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(keyRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [isEditingKey]);
  
  // If the key doesn't exist in data, don't render (likely mid-rename)
  const hasKey = mobxKeys(data).includes(itemKey);
  if (!hasKey) {
    // console.log('JsonKeyValueComp: key not in data, returning null', { itemKey });
    return null;
  }
  
  const value = data[itemKey];
  // Detect empty collections for special handling
  const isEmptyCollection = (typeof value === 'object' && value !== null) && 
    ((Array.isArray(value) && value.length === 0) || 
     (!Array.isArray(value) && Object.keys(value).length === 0));
  // Empty collections are NOT treated as primitive (they need to be on new line with indent)
  const isPrimitive = value === null || value === undefined || typeof value !== 'object';
  const valueType = value === null || value === undefined ? 'null' : typeof value;
  
  const canEditKey = isEditable && isKeyEditable;
  const canEditValue = isEditable && isValueEditable;

  const handleKeyClick = () => {
    if (!canEditKey) return;
    // Don't enter edit mode if key doesn't exist (mid-rename scenario)
    if (!hasKey) return;
    originalKeyRef.current = itemKey;
    setIsEditingKey(true);
  };

  const handleKeySubmit = async () => {
    if (!keyRef.current) return;
    
    const newKey = keyRef.current.textContent.trim();
    
    // Don't submit if value hasn't changed
    if (newKey === originalKeyRef.current) {
      setIsEditingKey(false);
      if (keyRef.current) {
        keyRef.current.textContent = originalKeyRef.current;
      }
      return;
    }
    
    // Don't allow empty key
    if (newKey === '') {
      setError('Key cannot be empty');
      if (keyRef.current) {
        keyRef.current.textContent = originalKeyRef.current;
      }
      setTimeout(() => setError(null), 3000);
      setIsEditingKey(false);
      return;
    }

    // Check if key already exists
    if (newKey in data) {
      setError(`Key "${newKey}" already exists`);
      if (keyRef.current) {
        keyRef.current.textContent = originalKeyRef.current;
      }
      setTimeout(() => setError(null), 3000);
      setIsEditingKey(false);
      return;
    }

    // Exit edit mode immediately to prevent re-renders with stale itemKey
    setIsEditingKey(false);
    
    try {
      if (onChange) {
        // For key changes, send structured format with special _keyRename marker
        const changeData = {
          old: { type: 'key', value: originalKeyRef.current },
          new: { type: 'key', value: newKey },
          _keyRename: true
        };
        
        const result = await onChange(resolvePath(), changeData);
        
        if (result && result.code !== 0) {
          setError(result.message || 'Failed to update key');
          if (keyRef.current) {
            keyRef.current.textContent = originalKeyRef.current;
          }
          setTimeout(() => setError(null), 3000);
          return;
        }
      }
      
      // Mutate in place - rename key while preserving position
      runInAction(() => {
        renameKeyInOrder(data, originalKeyRef.current, newKey);
        renameKeyIdentity(data, originalKeyRef.current, newKey);
        const tempValue = data[originalKeyRef.current];
        mobxRemove(data, originalKeyRef.current);
        mobxSet(data, newKey, tempValue);
      });
    } catch (error) {
      setError(error.message || 'Error renaming key');
      if (keyRef.current) {
        keyRef.current.textContent = originalKeyRef.current;
      }
      setTimeout(() => setError(null), 3000);
    }
  };

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
    }
  };

  // Handle context menu on key
  const handleKeyContextMenu = (e) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    
    if (showConversionMenu) {
      const parentInfo = queryParentInfo ? queryParentInfo(resolvePath()) : { isSingleEntryInParent: false };
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        menuType: 'key',
        itemKey: itemKey,
        path: resolvePath(),
        value: value,
        isSingleEntryInParent: parentInfo.isSingleEntryInParent,
        isFirstInParent: parentInfo.isFirstInParent,
        isLastInParent: parentInfo.isLastInParent
      });
    }
  };

  const renderValueComponent = () => {
    // Handle empty collections first (even though isPrimitive is true for layout)
    if (isEmptyCollection) {
      return children; // Render the EmptyList or EmptyDict component
    }
    
    if (!isPrimitive) {
      return <span className="json-value-complex">{children}</span>;
    }

    if (valueType === 'null') {
      return <JsonNullComp getPath={resolvePath} />;
    } else if (valueType === 'boolean') {
      return (
        <JsonBoolComp
          data={data}
          objKey={itemKey}
          getPath={resolvePath}
          isEditable={canEditValue}
          onChange={onChange}
        />
      );
    } else if (valueType === 'number') {
      return (
        <JsonNumberComp
          data={data}
          objKey={itemKey}
          getPath={resolvePath}
          isEditable={canEditValue}
          onChange={onChange}
        />
      );
    } else {
      // string or other
      return (
        <JsonTextComp
          data={data}
          objKey={itemKey}
          getPath={resolvePath}
          isEditable={canEditValue}
          onChange={onChange}
        />
      );
    }
  };

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
