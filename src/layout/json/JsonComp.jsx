import React, { useState, useCallback } from 'react';
import JsonKeyValueComp from './JsonKeyValueComp';
import JsonListItemComp from './JsonListItemComp';
import PseudoKeyValueComp from './PseudoKeyValueComp';
import PseudoListItem from './PseudoListItem';
import EmptyDict from './EmptyDict';
import EmptyList from './EmptyList';
import { JsonContextProvider } from './JsonContext';
import MenuComp from '../../menu/MenuComp';
import { convertValue, getValueType } from './typeConvert';
import './JsonComp.css';

/**
 * JsonComp - Component for displaying and editing deeply nested JSON-like objects
 * 
 * @param {Object|Array} data - The JSON data to display
 * @param {boolean} isEditable - Whether the data is editable (default: true)
 * @param {boolean} isKeyEditable - Whether keys are editable (default: false)
 * @param {boolean} isValueEditable - Whether values are editable (default: true)
 * @param {Function} onChange - Callback: (path, changeData) => Promise<{code: number, message?: string}>
 *   - path: string using "." for object keys and ".." for array indices (e.g., "user.name", "tags..0", "items..1.name")
 *   - changeData: { old: { type: string, value: any }, new: { type: string, value: any } }
 * @param {number} indent - Indentation in pixels (default: 20)
 * @param {string} typeConversionBehavior - 'allow' | 'reject' (default: 'allow')
 * @param {string} pathPrefix - Internal: path prefix for nested objects
 * @param {number} depth - Internal: current nesting depth
 * @param {boolean} isArrayItem - Internal: whether this object is an array item
 */
const JsonComp = ({ 
  data, 
  isEditable = true,
  isKeyEditable = false,
  isValueEditable = true,
  onChange,
  indent = 20,
  typeConversionBehavior = 'allow',
  pathPrefix = '',
  depth = 0,
  isArrayItem = false
}) => {
  const [conversionMenu, setConversionMenu] = useState(null);

  // Handle conversion menu request from value components
  const showConversionMenu = useCallback((request) => {
    setConversionMenu(request);
  }, []);

  // Close menu
  const closeMenu = useCallback(() => {
    setConversionMenu(null);
  }, []);

  // Handle menu item selection (both conversion and delete actions)
  const handleMenuItemClick = useCallback(async (item) => {
    if (!conversionMenu || !onChange) return;

    const action = item.data?.action;
    const { path } = conversionMenu;

    try {
      if (action === 'deleteEntry') {
        // Delete this entry from dict
        const changeData = {
          old: { type: typeof conversionMenu.value === 'object' && conversionMenu.value !== null ? 'object' : typeof conversionMenu.value, value: conversionMenu.value },
          new: { type: 'deleted' },
          _action: 'deleteEntry',
          _entryPath: path
        };
        await onChange(path, changeData);
      } else if (action === 'deleteDict') {
        // Delete/clear the parent dict that contains this entry
        const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'));
        const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
        const changeData = {
          old: { type: 'object', value: null },
          new: { type: 'deleted' },
          _action: 'deleteParentDict',
          _entryPath: path,
          _parentPath: parentPath
        };
        await onChange(path, changeData);
      } else if (action === 'deleteAllEntries') {
        // Clear all entries in the parent dict
        const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'));
        const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
        const changeData = {
          old: { type: 'object', value: null },
          new: { type: 'object', value: {} },
          _action: 'clearParentDict',
          _entryPath: path,
          _parentPath: parentPath
        };
        await onChange(path, changeData);
      } else if (action === 'deleteArrayItem') {
        // Delete this item from array
        const changeData = {
          old: { type: typeof conversionMenu.value === 'object' && conversionMenu.value !== null ? (Array.isArray(conversionMenu.value) ? 'array' : 'object') : typeof conversionMenu.value, value: conversionMenu.value },
          new: { type: 'deleted' },
          _action: 'deleteArrayItem',
          _itemPath: path
        };
        await onChange(path, changeData);
      } else if (action === 'deleteArray') {
        // Delete/clear the parent array that contains this item
        const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'));
        const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
        const changeData = {
          old: { type: 'array', value: null },
          new: { type: 'deleted' },
          _action: 'deleteParentArray',
          _itemPath: path,
          _parentPath: parentPath
        };
        await onChange(path, changeData);
      } else if (action === 'clearArray') {
        // Clear all items in the parent array
        const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'));
        const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
        const changeData = {
          old: { type: 'array', value: null },
          new: { type: 'array', value: [] },
          _action: 'clearParentArray',
          _itemPath: path,
          _parentPath: parentPath
        };
        await onChange(path, changeData);
      } else if (action === 'addEntry' || action === 'addEntryAbove' || action === 'addEntryBelow') {
        // Add a new entry to dict
        const changeData = {
          old: { type: 'none' },
          new: { type: 'pseudo' },
          _action: action,
          _targetPath: path
        };
        await onChange(path, changeData);
      } else if (action === 'addItem' || action === 'addItemAbove' || action === 'addItemBelow') {
        // Add a new item to array
        const changeData = {
          old: { type: 'none' },
          new: { type: 'pseudo' },
          _action: action,
          _targetPath: path
        };
        await onChange(path, changeData);
      } else if (item.data?.targetType) {
        // Type conversion
        const { currentValue, currentType } = conversionMenu;
        const { targetType } = item.data;
        const convertedValue = convertValue(currentValue, targetType);
        const changeData = {
          old: { type: currentType, value: currentValue },
          new: { type: targetType, value: convertedValue }
        };
        await onChange(path, changeData);
      }
      
      // Close menu after action
      closeMenu();
    } catch (error) {
      console.error('Menu action failed:', error);
    }
  }, [conversionMenu, onChange, closeMenu]);

  // Generate menu items based on menu type
  const getMenuItems = () => {
    if (!conversionMenu) return [];

    const items = [];
    const { menuType } = conversionMenu;
    
    // Add type conversion menu if available (for values)
    if (conversionMenu.availableConversions) {
      items.push({
        type: 'menu',
        name: 'Convert to',
        children: conversionMenu.availableConversions.map(conv => ({
          type: 'item',
          name: conv.targetType,
          disabled: !conv.canConvert,
          data: { targetType: conv.targetType }
        }))
      });
    }
    
    // Add delete options based on menu type
    if (menuType === 'key' || menuType === 'value') {
      // For dict entries (key or value)
      items.push(
        {
          type: 'item',
          name: 'Add entry above',
          data: { action: 'addEntryAbove' }
        },
        {
          type: 'item',
          name: 'Add entry below',
          data: { action: 'addEntryBelow' }
        },
        {
          type: 'item',
          name: 'Delete entry',
          data: { action: 'deleteEntry' }
        },
        {
          type: 'item',
          name: 'Delete dict',
          data: { action: 'deleteDict' }
        },
        {
          type: 'item',
          name: 'Delete all entries',
          data: { action: 'deleteAllEntries' }
        }
      );
    } else if (menuType === 'arrayItem') {
      // For array items
      items.push(
        {
          type: 'item',
          name: 'Add item above',
          data: { action: 'addItemAbove' }
        },
        {
          type: 'item',
          name: 'Add item below',
          data: { action: 'addItemBelow' }
        },
        {
          type: 'item',
          name: 'Delete item',
          data: { action: 'deleteArrayItem' }
        },
        {
          type: 'item',
          name: 'Delete array',
          data: { action: 'deleteArray' }
        },
        {
          type: 'item',
          name: 'Delete all items',
          data: { action: 'clearArray' }
        }
      );
    } else if (menuType === 'emptyDict') {
      // For empty dict
      items.push(
        {
          type: 'item',
          name: 'Add entry',
          data: { action: 'addEntry' }
        },
        {
          type: 'item',
          name: 'Delete dict',
          data: { action: 'deleteDict' }
        }
      );
    } else if (menuType === 'emptyList') {
      // For empty list
      items.push(
        {
          type: 'item',
          name: 'Add item',
          data: { action: 'addItem' }
        }
      );
    }
    
    return items;
  };

  // Only root (depth 0) renders context provider and menu
  const isRoot = depth === 0;
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
    // Check for pseudo items (marked with isPseudo: true)
    const realItems = data.filter(item => !(item && typeof item === 'object' && item.isPseudo));
    const pseudoItems = data.filter(item => item && typeof item === 'object' && item.isPseudo);
    
    if (realItems.length === 0 && pseudoItems.length === 0) {
      return <EmptyList path={pathPrefix || ''} />;
    }

    return (
      <div className={`json-array ${isArrayItem ? 'json-array-in-array' : ''}`} style={{ '--depth': depth, '--json-indent': `${indent}px` }}>
        <div className="json-bracket">[</div>
        <div className="json-array-items">
          {data.map((item, index) => {
            const itemPath = pathPrefix ? `${pathPrefix}..${index}` : `..${index}`;
            const isLastItem = index === data.length - 1;
            const isPrimitive = item === null || item === undefined || typeof item !== 'object';
            const isPseudo = item && typeof item === 'object' && item.isPseudo;

            if (isPseudo) {
              return (
                <div key={`pseudo-${index}`} className="json-array-item">
                  <PseudoListItem
                    path={itemPath}
                    onChange={onChange}
                    onCancel={() => {
                      // Handle cancel - notify parent to remove pseudo item
                      if (onChange) {
                        onChange(itemPath, {
                          old: { type: 'pseudo' },
                          new: { type: 'deleted' },
                          _action: 'cancelCreate'
                        });
                      }
                    }}
                    depth={depth}
                  />
                </div>
              );
            }

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
                    isArrayItem={true}
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
  const keys = Object.keys(data).filter(k => k !== '__pseudo__');
  const hasPseudo = data.__pseudo__;
  
  if (keys.length === 0 && !hasPseudo) {
    return <EmptyDict path={pathPrefix || ''} />;
  }

  // Build ordered list of items (keys + pseudo items in correct positions)
  const orderedItems = [];
  keys.forEach((key, index) => {
    // Check if there are pseudo items that should appear above this key
    if (hasPseudo) {
      hasPseudo.forEach((pseudoItem, pidx) => {
        if (pseudoItem.position === 'above' && pseudoItem.referenceKey === key) {
          orderedItems.push({ type: 'pseudo', pseudoItem, pidx });
        }
      });
    }
    
    // Add the regular key
    orderedItems.push({ type: 'key', key, index });
    
    // Check if there are pseudo items that should appear below this key
    if (hasPseudo) {
      hasPseudo.forEach((pseudoItem, pidx) => {
        if (pseudoItem.position === 'below' && pseudoItem.referenceKey === key) {
          orderedItems.push({ type: 'pseudo', pseudoItem, pidx });
        }
      });
    }
  });
  
  // Add any pseudo items without position (for empty dicts or at end)
  if (hasPseudo) {
    hasPseudo.forEach((pseudoItem, pidx) => {
      if (!pseudoItem.position && !pseudoItem.referenceKey) {
        orderedItems.push({ type: 'pseudo', pseudoItem, pidx });
      }
    });
  }

  return (
    <div className={`json-object ${isArrayItem ? 'json-object-in-array' : ''}`} style={{ '--depth': depth, '--json-indent': `${indent}px` }}>
      <div className="json-bracket">{'{'}</div>
      <div className="json-object-items">
        {orderedItems.map((item, itemIndex) => {
          if (item.type === 'key') {
            const key = item.key;
            const value = data[key];
            const keyPath = pathPrefix ? `${pathPrefix}.${key}` : key;
            const isLastItem = itemIndex === orderedItems.length - 1;
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
          } else {
            // Pseudo item
            const { pseudoItem, pidx } = item;
            return (
              <div key={`pseudo-${pidx}`} className="json-object-item">
                <PseudoKeyValueComp
                  path={pseudoItem.path}
                  onChange={onChange}
                  onCancel={() => {
                    // Handle cancel - notify parent to remove pseudo item
                    if (onChange) {
                      onChange(pseudoItem.path, {
                        old: { type: 'pseudo' },
                        new: { type: 'deleted' },
                        _action: 'cancelCreate'
                      });
                    }
                  }}
                  depth={depth}
                />
              </div>
            );
          }
        })}
      </div>
      <div className="json-bracket">{'}'}      </div>
    </div>
  );
  };

  // Root component wraps with context provider and menu
  if (isRoot) {
    return (
      <JsonContextProvider 
        typeConversionBehavior={typeConversionBehavior}
        showConversionMenu={showConversionMenu}
      >
        {renderContent()}
        
        {conversionMenu && (
          <MenuComp
            items={getMenuItems()}
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
};

export default React.memo(JsonComp, (prev, next) => {
  // Only re-render if data or core props change
  return prev.data === next.data &&
         prev.isEditable === next.isEditable &&
         prev.isKeyEditable === next.isKeyEditable &&
         prev.isValueEditable === next.isValueEditable &&
         prev.onChange === next.onChange &&
         prev.indent === next.indent &&
         prev.typeConversionBehavior === next.typeConversionBehavior &&
         prev.pathPrefix === next.pathPrefix &&
         prev.depth === next.depth &&
         prev.isArrayItem === next.isArrayItem;
});
