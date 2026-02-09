import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { keys as mobxKeys } from 'mobx';
import JsonKeyValueComp from './JsonKeyValueComp';
import { getKeyIdentity, getOrderedKeys } from './keyOrderStore';
import PseudoKeyValueComp from './PseudoKeyValueComp';
import EmptyDict from './EmptyDict';
import EmptyList from './EmptyList';
import ItemWrapperArray from './ItemWrapperArray';
import ItemWrapperObject from './ItemWrapperObject';
import { usePathRef } from './pathRef';
import { JsonContextProvider } from './JsonContext';
import MenuComp from '../../menu/MenuComp';
import { handleMenuItemClick as handleMenuItemClickImpl } from './menuClick';
import { getMenuItems } from './menuItems';
import './JsonComp.css';

/**
 * JsonCompMobx - MobX-based JSON component that supports in-place mutations
 * 
 * Key Design:
 * - Wrap data with makeAutoObservable() before passing to this component
 * - Parent can mutate data in-place (e.g., data.user.name = "new value")
 * - MobX automatically tracks which components accessed which properties
 * - Only components that accessed changed properties will re-render
 * 
 * @param {Object|Array} data - The JSON data (must be observable via makeAutoObservable)
 * @param {boolean} isEditable - Whether the data is editable (default: true)
 * @param {boolean} isKeyEditable - Whether keys are editable (default: false)
 * @param {boolean} isValueEditable - Whether values are editable (default: true)
 * @param {Function} onChange - Callback: (path, changeData) => Promise<{code: number, message?: string}>
 * @param {number} indent - Indentation in pixels (default: 20)
 * @param {string} pathPrefix - Internal: path prefix for nested objects
 * @param {number} depth - Internal: current nesting depth
 * @param {boolean} isArrayItem - Internal: whether this object is an array item
 */
const JsonCompMobx = observer(({ 
  data, 
  isEditable = true,
  isKeyEditable = false,
  isValueEditable = true,
  onChange,
  indent = 20,
  typeConversionBehavior = 'allow',
  isDebug = false,
  pathPrefix = '',
  pathPrefixRef,
  depth = 0,
  isArrayItem = false
}) => {
  const [conversionMenu, setConversionMenu] = useState(null);
  const localPathPrefixRef = usePathRef(pathPrefix);
  const activePathPrefixRef = pathPrefixRef || localPathPrefixRef;
  const activePathPrefix = activePathPrefixRef.current;
  
  // Use state for root, prop for nested
  const isRoot = depth === 0;

  // Handle conversion menu request from value components
  const showConversionMenu = useCallback((request) => {
    setConversionMenu(request);
  }, []);

  // Close menu
  const closeMenu = useCallback(() => {
    setConversionMenu(null);
  }, []);

  // Handle menu item selection
  const handleMenuItemClick = useCallback(async (item) => {
    await handleMenuItemClickImpl({
      item,
      conversionMenu,
      data,
      onChange,
      closeMenu
    });
  }, [conversionMenu, onChange, closeMenu, data]);


  // Render function for the actual content
  const renderContent = () => {
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
    // Check if empty (this will track length, but it's ok for empty check)
    if (data.length === 0) {
      return <EmptyList path={activePathPrefix || ''} />;
    }

    // Generate indices array WITHOUT accessing array elements
    // MobX will only track the length, not individual elements
    const indices = [];
    for (let i = 0; i < data.length; i++) {
      indices.push(i);
    }

    return (
      <div className={`json-array ${isArrayItem ? 'json-array-in-array' : ''}`} style={{ '--depth': depth, '--json-indent': `${indent}px` }}>
        <div className="json-bracket">[</div>
        <div className="json-array-items">
          {indices.map(index => (
            <ItemWrapperArray
              key={index}
              data={data}
              index={index}
              pathPrefixRef={activePathPrefixRef}
              isEditable={isEditable}
              isKeyEditable={isKeyEditable}
              isValueEditable={isValueEditable}
              onChange={onChange}
              indent={indent}
              depth={depth}
              JsonCompMobx={JsonCompMobx}
            />
          ))}
        </div>
        <div className="json-bracket">]</div>
      </div>
    );
  }

  // Handle objects
  // MobX keys() tracks structural changes (add/remove/rename keys)
  const rawKeys = mobxKeys(data).filter(key => key !== '__mobxVersion');
  const allKeys = getOrderedKeys(data, rawKeys);
  
  // console.log('JsonCompMobx rendering OBJECT with keys:', allKeys, 'pathPrefix:', activePathPrefix);
  
  // Separate pseudo keys from regular keys
  const pseudoKeys = allKeys.filter(k => k.startsWith('__pseudo__'));
  const regularKeys = allKeys.filter(k => !k.startsWith('__pseudo__'));
  
  if (regularKeys.length === 0 && pseudoKeys.length === 0) {
    return <EmptyDict path={activePathPrefix || ''} />;
  }

  // Build ordered list of items (keys + pseudo items in correct positions)
  const orderedItems = [];
  
  regularKeys.forEach((key, index) => {
    // Check for pseudo items that should appear above this key
    pseudoKeys.forEach(pseudoKey => {
      const pseudoData = data[pseudoKey];
      if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true &&
          pseudoData.position === 'above' && pseudoData.referenceKey === key) {
        orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData });
      }
    });
    
    // Add the regular key
    orderedItems.push({ type: 'key', key, index });
    
    // Check for pseudo items that should appear below this key
    pseudoKeys.forEach(pseudoKey => {
      const pseudoData = data[pseudoKey];
      if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true &&
          pseudoData.position === 'below' && pseudoData.referenceKey === key) {
        orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData });
      }
    });
  });
  
  // Add any pseudo items without position (for empty dicts or at end)
  pseudoKeys.forEach(pseudoKey => {
    const pseudoData = data[pseudoKey];
    if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true &&
        !pseudoData.position && !pseudoData.referenceKey) {
      orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData });
    }
  });

  return (
    <div className={`json-object ${isArrayItem ? 'json-object-in-array' : ''}`} style={{ '--depth': depth, '--json-indent': `${indent}px` }}>
      <div className="json-bracket">{'{'}</div>
      <div className="json-object-items">
        {orderedItems.map((item, itemIndex) => {
          if (item.type === 'key') {
            const key = item.key;
            const value = data[key];
            const isLastItem = itemIndex === orderedItems.length - 1;

            const keyIdentity = getKeyIdentity(data, key);

              return (
                <ItemWrapperObject
                  key={keyIdentity}
                  data={data}
                  itemKey={key}
                  pathPrefixRef={activePathPrefixRef}
                  isEditable={isEditable}
                  isKeyEditable={isKeyEditable}
                  isValueEditable={isValueEditable}
                  onChange={onChange}
                  indent={indent}
                  depth={depth}
                  isLastItem={isLastItem}
                  JsonCompMobx={JsonCompMobx}
                />
              );
          } else {
            // Pseudo item
            const { key, pseudoData } = item;
            const pseudoPath = activePathPrefix ? `${activePathPrefix}.${key}` : key;
            return (
              <div key={key} className="json-object-item">
                <PseudoKeyValueComp
                  path={pseudoPath}
                  data={data}
                  pseudoKey={key}
                  onChange={onChange}
                  onCancel={() => {
                    // Remove pseudo item by deleting the key
                    delete data[key];
                  }}
                  depth={depth}
                />
              </div>
            );
          }
        })}
      </div>
      <div className="json-bracket">{'}'}</div>
    </div>
  );
  };

  // Root component wraps with context provider and menu
  if (isRoot) {
    return (
      <JsonContextProvider 
        typeConversionBehavior={typeConversionBehavior}
        showConversionMenu={showConversionMenu}
        rootData={data}
        isDebug={isDebug}
      >
        {renderContent()}
        
        {conversionMenu && (
          <MenuComp
            items={getMenuItems(conversionMenu)}
            position={conversionMenu.position}
            onClose={closeMenu}
            onItemClick={handleMenuItemClick}
            onContextMenu={(e) => {
              e.preventDefault();
              // Keep menu open on backdrop right-click
            }}
          />
        )}
      </JsonContextProvider>
    );
  }

  // Non-root components just render content
  return renderContent();
});

JsonCompMobx.displayName = 'JsonCompMobx';

export default JsonCompMobx;
