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
      } else if (action === 'convertParentDictToText') {
        // Convert single-entry dict {key:value} to text "key:value"
        const parentParts = path.split('.').filter(p => p !== '');
        const parentPath = parentParts.length > 1 ? parentParts.slice(0, -1).join('.') : '';
        const key = conversionMenu.itemKey;
        const value = conversionMenu.value;
        const textValue = `${key}:${String(value)}`;
        
        const changeData = {
          old: { type: 'object', value: { [key]: value } },
          new: { type: 'string', value: textValue },
          _action: 'convertParentToText',
          _parentPath: parentPath
        };
        await onChange(parentPath, changeData);
      } else if (action === 'convertParentArrayToText') {
        // Convert single-item array [value] to text "value"
        const parentParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'));
        const parentPath = parentParts.length > 0 ? parentParts.slice(0, -1).join('.') : '';
        const value = conversionMenu.value;
        const textValue = String(value);
        
        const changeData = {
          old: { type: 'array', value: [value] },
          new: { type: 'string', value: textValue },
          _action: 'convertParentToText',
          _parentPath: parentPath
        };
        await onChange(parentPath, changeData);
      } else if (action === 'moveEntryUp' || action === 'moveEntryDown') {
        // Move dict entry up or down
        // Compute parent path for dict entry
        const pathParts = path.split('.').filter(p => p !== '');
        const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
        const changeData = {
          old: { type: 'entry' },
          new: { type: 'entry' },
          _action: action,
          _parentPath: parentPath
        };
        await onChange(path, changeData);
      } else if (action === 'moveItemUp' || action === 'moveItemDown') {
        // Move array item up or down
        // Compute parent path for array item (remove the ..index part)
        const parts = path.split('..');
        const arrayPath = parts.length > 1 ? parts[0] + (parts.length > 2 ? '..' + parts.slice(1, -1).join('..') : '') : '';
        const changeData = {
          old: { type: 'arrayItem' },
          new: { type: 'arrayItem' },
          _action: action,
          _parentPath: arrayPath
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
      
      // If this is the only entry in parent dict, show option (disabled if value is not primitive)
      // Show on both key and value menus
      if (conversionMenu.isSingleEntryInParent && conversionMenu.itemKey) {
        const valueIsPrimitive = conversionMenu.value === null || 
                                 conversionMenu.value === undefined || 
                                 typeof conversionMenu.value !== 'object';
        items.push({
          type: 'item',
          name: 'Convert parent dict to text',
          disabled: !valueIsPrimitive,
          data: { action: 'convertParentDictToText' }
        });
      }
      
      // Add move up/down for dict entries
      // For values, only allow if value is primitive
      if (menuType === 'key' || (menuType === 'value' && 
          (conversionMenu.value === null || 
           conversionMenu.value === undefined || 
           typeof conversionMenu.value !== 'object'))) {
        items.push(
          {
            type: 'item',
            name: 'Move up',
            disabled: conversionMenu.isFirstInParent,
            data: { action: 'moveEntryUp' }
          },
          {
            type: 'item',
            name: 'Move down',
            disabled: conversionMenu.isLastInParent,
            data: { action: 'moveEntryDown' }
          }
        );
      }
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
      
      // If this is the only item in parent array, show option (disabled if item is not primitive)
      if (conversionMenu.isSingleEntryInParent) {
        const valueIsPrimitive = conversionMenu.value === null || 
                                 conversionMenu.value === undefined || 
                                 typeof conversionMenu.value !== 'object';
        items.push({
          type: 'item',
          name: 'Convert parent array to text',
          disabled: !valueIsPrimitive,
          data: { action: 'convertParentArrayToText' }
        });
      }
      
      // Add move up/down for array items (only for primitive values)
      const itemIsPrimitive = conversionMenu.value === null || 
                              conversionMenu.value === undefined || 
                              typeof conversionMenu.value !== 'object';
      if (itemIsPrimitive) {
        items.push(
          {
            type: 'item',
            name: 'Move up',
            disabled: conversionMenu.isFirstInParent,
            data: { action: 'moveItemUp' }
          },
          {
            type: 'item',
            name: 'Move down',
            disabled: conversionMenu.isLastInParent,
            data: { action: 'moveItemDown' }
          }
        );
      }
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
  const allKeys = Object.keys(data);
  
  // Separate regular keys from pseudo keys
  const pseudoKeys = allKeys.filter(k => k.startsWith('__pseudo__'));
  const regularKeys = allKeys.filter(k => !k.startsWith('__pseudo__'));
  
  if (regularKeys.length === 0 && pseudoKeys.length === 0) {
    return <EmptyDict path={pathPrefix || ''} />;
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
            const { key, pseudoData } = item;
            const pseudoPath = pathPrefix ? `${pathPrefix}.${key}` : key;
            return (
              <div key={key} className="json-object-item">
                <PseudoKeyValueComp
                  path={pseudoPath}
                  onChange={onChange}
                  onCancel={() => {
                    // Handle cancel - notify parent to remove pseudo item
                    if (onChange) {
                      onChange(pseudoPath, {
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
        rootData={data}
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
