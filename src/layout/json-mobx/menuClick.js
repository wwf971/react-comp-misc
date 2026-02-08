import { runInAction } from 'mobx';
import { moveKeyInOrder } from './keyOrderStore';
import { convertValue } from './typeConvert';

/**
 * Handle menu item click actions for JSON editing
 * @param {Object} params - Parameters object
 * @param {Object} params.item - Menu item that was clicked
 * @param {Object} params.conversionMenu - Current menu state with path, value, menuType, etc.
 * @param {Object} params.data - The observable data object
 * @param {Function} params.onChange - Callback for notifying changes
 * @param {Function} params.closeMenu - Callback to close the menu
 */
export async function handleMenuItemClick({ item, conversionMenu, data, onChange, closeMenu }) {
  if (!conversionMenu || !onChange) return;

  const action = item.data?.action;
  const { path } = conversionMenu;

  try {
    if (action === 'deleteEntry') {
      // Delete this entry from dict (mutate in place)
      const pathParts = path.split('.').filter(p => p !== '');
      const key = pathParts[pathParts.length - 1];
      const parentPath = pathParts.slice(0, -1).join('.');
      
      // Navigate to parent and delete key
      let parent = data;
      for (let i = 0; i < pathParts.length - 1; i++) {
        parent = parent[pathParts[i]];
      }
      
      runInAction(() => {
        delete parent[key];
      });
      
      // Notify backend
      const changeData = {
        old: { type: typeof conversionMenu.value === 'object' && conversionMenu.value !== null ? 'object' : typeof conversionMenu.value, value: conversionMenu.value },
        new: { type: 'deleted' },
        _action: 'deleteEntry',
        _entryPath: path
      };
      await onChange(path, changeData);
    } else if (action === 'deleteDict') {
      // Delete the dict (the entire entry with key and value)
      const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'));
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
      
      runInAction(() => {
        if (pathParts.length === 0) {
          // Top-level root object - can't delete it
          return;
        } else if (pathParts.length === 1) {
          // Top-level key - delete it from root data
          delete data[pathParts[0]];
        } else {
          // Navigate to parent and delete the key
          let parent = data;
          for (let i = 0; i < pathParts.length - 1; i++) {
            parent = parent[pathParts[i]];
          }
          const dictKey = pathParts[pathParts.length - 1];
          delete parent[dictKey];
        }
      });
      
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
      
      // Navigate to parent dict
      let parentDict = data;
      for (let i = 0; i < pathParts.length - 1; i++) {
        parentDict = parentDict[pathParts[i]];
      }
      
      runInAction(() => {
        const keys = Object.keys(parentDict);
        keys.forEach(k => delete parentDict[k]);
      });
      
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
      const pathParts = path.split('..');
      let parent = data;
      
      // Navigate to the array
      if (pathParts[0]) {
        const objKeys = pathParts[0].split('.').filter(k => k !== '');
        for (const key of objKeys) {
          parent = parent[key];
        }
      }
      
      // Navigate through nested arrays
      for (let i = 1; i < pathParts.length - 1; i++) {
        const segments = pathParts[i].split('.');
        const arrayIndex = parseInt(segments[0]);
        parent = parent[arrayIndex];
        for (let j = 1; j < segments.length; j++) {
          const key = segments[j];
          if (key) parent = parent[key];
        }
      }
      
      // Get the index to delete
      const lastSegments = pathParts[pathParts.length - 1].split('.');
      const itemIndex = parseInt(lastSegments[0]);
      
      runInAction(() => {
        parent.splice(itemIndex, 1);
      });
      
      const changeData = {
        old: { type: typeof conversionMenu.value === 'object' && conversionMenu.value !== null ? (Array.isArray(conversionMenu.value) ? 'array' : 'object') : typeof conversionMenu.value, value: conversionMenu.value },
        new: { type: 'deleted' },
        _action: 'deleteArrayItem',
        _itemPath: path
      };
      await onChange(path, changeData);
    } else if (action === 'deleteArray') {
      // Delete/clear the parent array
      const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'));
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
      
      // Navigate to and delete the array
      const arrayPathParts = path.split('..');
      let parent = data;
      
      if (arrayPathParts[0]) {
        const objKeys = arrayPathParts[0].split('.').filter(k => k !== '');
        for (let i = 0; i < objKeys.length - 1; i++) {
          parent = parent[objKeys[i]];
        }
        
        runInAction(() => {
          if (objKeys.length > 0) {
            delete parent[objKeys[objKeys.length - 1]];
          }
        });
      }
      
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
      
      // Navigate to the array
      const arrayPathParts = path.split('..');
      let array = data;
      
      if (arrayPathParts[0]) {
        const objKeys = arrayPathParts[0].split('.').filter(k => k !== '');
        for (const key of objKeys) {
          array = array[key];
        }
      }
      
      runInAction(() => {
        array.length = 0;
      });
      
      const changeData = {
        old: { type: 'array', value: null },
        new: { type: 'array', value: [] },
        _action: 'clearParentArray',
        _itemPath: path,
        _parentPath: parentPath
      };
      await onChange(path, changeData);
    } else if (action === 'convertParentDictToText') {
      // Convert single-entry dict {key:value} to text "key:value"
      // path is the path to the entry (e.g., "user.name")
      // We want to replace the parent dict (e.g., "user") with text
      const entryParts = path.split('.').filter(p => p !== '');
      const dictParts = entryParts.slice(0, -1); // Path to the dict itself
      const parentPath = dictParts.join('.');
      const key = conversionMenu.itemKey;
      const value = conversionMenu.value;
      const textValue = `${key}:${value}`;
      
      // Mutate: replace the dict with text
      runInAction(() => {
        if (dictParts.length === 0) {
          // The dict is the root object - can't replace
          return;
        } else if (dictParts.length === 1) {
          // The dict is a top-level key
          data[dictParts[0]] = textValue;
        } else {
          // Navigate to the parent of the dict and replace
          let parent = data;
          for (let i = 0; i < dictParts.length - 1; i++) {
            parent = parent[dictParts[i]];
          }
          parent[dictParts[dictParts.length - 1]] = textValue;
        }
      });
      
      const changeData = {
        old: { type: 'object', value: { [key]: value } },
        new: { type: 'string', value: textValue },
        _action: 'convertParentToText',
        _parentPath: parentPath
      };
      await onChange(parentPath, changeData);
    } else if (action === 'convertParentArrayToText') {
      // Convert single-item array [value] to text "value"
      // path is the path to the item (e.g., "tags..0")
      // We want to replace the parent array with text
      const value = conversionMenu.value;
      const parts = path.split('..');
      const arrayPath = parts.length > 1 ? parts[0] + (parts.length > 2 ? '..' + parts.slice(1, -1).join('..') : '') : '';
      const textValue = String(value);
      
      // Mutate: replace the array with text
      runInAction(() => {
        if (parts.length === 1) {
          // No ".." in path - shouldn't happen for array items
          return;
        }
        
        // Parse arrayPath to find the array to replace
        if (parts.length === 2 && !arrayPath.includes('..')) {
          // Simple case: array is a direct object property (e.g., "tags..0" -> arrayPath = "tags")
          const objKeys = arrayPath.split('.').filter(k => k !== '');
          if (objKeys.length === 0) {
            // Root is the array
            return;
          } else if (objKeys.length === 1) {
            // Top-level array
            data[objKeys[0]] = textValue;
          } else {
            // Navigate to parent and replace
            let parent = data;
            for (let i = 0; i < objKeys.length - 1; i++) {
              parent = parent[objKeys[i]];
            }
            parent[objKeys[objKeys.length - 1]] = textValue;
          }
        } else {
          // Complex case: nested arrays
          // arrayPath tells us where the array is
          const arrayParts = arrayPath.split('..');
          if (arrayParts[0]) {
            // Navigate through object keys to the first array
            const objKeys = arrayParts[0].split('.').filter(k => k !== '');
            let parent = data;
            for (let i = 0; i < objKeys.length - 1; i++) {
              parent = parent[objKeys[i]];
            }
            
            if (arrayParts.length === 1) {
              // Array is a direct property
              parent[objKeys[objKeys.length - 1]] = textValue;
            } else {
              // Navigate through nested arrays
              parent = parent[objKeys[objKeys.length - 1]];
              for (let i = 1; i < arrayParts.length; i++) {
                const segments = arrayParts[i].split('.');
                const arrayIndex = parseInt(segments[0], 10);
                if (i === arrayParts.length - 1) {
                  // This is the array to replace
                  parent[arrayIndex] = textValue;
                } else {
                  parent = parent[arrayIndex];
                  for (let j = 1; j < segments.length; j++) {
                    const key = segments[j];
                    if (key) parent = parent[key];
                  }
                }
              }
            }
          }
        }
      });
      
      const changeData = {
        old: { type: 'array', value: [value] },
        new: { type: 'string', value: textValue },
        _action: 'convertParentToText',
        _parentPath: arrayPath
      };
      await onChange(arrayPath, changeData);
    } else if (action === 'moveEntryUp' || action === 'moveEntryDown' || action === 'moveEntryToTop' || action === 'moveEntryToBottom') {
      // Move dict entry up/down/to top/to bottom
      const pathParts = path.split('.').filter(p => p !== '');
      const key = pathParts[pathParts.length - 1];
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
      
      // Navigate to parent object
      let parent = data;
      for (let i = 0; i < pathParts.length - 1; i++) {
        parent = parent[pathParts[i]];
      }
      
      // Move in key order
      runInAction(() => {
        moveKeyInOrder(parent, key, action);
      });
      
      const changeData = {
        old: { type: 'entry' },
        new: { type: 'entry' },
        _action: action,
        _parentPath: parentPath
      };
      await onChange(path, changeData);
    } else if (action === 'moveItemUp' || action === 'moveItemDown' || action === 'moveItemToTop' || action === 'moveItemToBottom') {
      // Move array item up/down/to top/to bottom
      const parts = path.split('..');
      const arrayPath = parts.length > 1 ? parts[0] + (parts.length > 2 ? '..' + parts.slice(1, -1).join('..') : '') : '';
      
      // Navigate to the array
      let array = data;
      if (parts[0]) {
        const objKeys = parts[0].split('.').filter(k => k !== '');
        for (const key of objKeys) {
          array = array[key];
        }
      }
      
      // Navigate through nested arrays
      for (let i = 1; i < parts.length - 1; i++) {
        const segments = parts[i].split('.');
        const arrayIndex = parseInt(segments[0], 10);
        array = array[arrayIndex];
        for (let j = 1; j < segments.length; j++) {
          const key = segments[j];
          if (key) array = array[key];
        }
      }
      
      // Get the index to move
      const lastSegments = parts[parts.length - 1].split('.');
      const itemIndex = parseInt(lastSegments[0], 10);
      
      // Move in array
      runInAction(() => {
        const item = array[itemIndex];
        array.splice(itemIndex, 1); // Remove from current position
        
        if (action === 'moveItemUp') {
          array.splice(Math.max(0, itemIndex - 1), 0, item);
        } else if (action === 'moveItemDown') {
          // After removal, to move down we insert at original position + 1
          // Since array is now shorter by 1, itemIndex now points to what was the next item
          // So we insert at itemIndex + 1 (or at end if it would exceed)
          array.splice(itemIndex + 1, 0, item);
        } else if (action === 'moveItemToTop') {
          array.unshift(item);
        } else if (action === 'moveItemToBottom') {
          array.push(item);
        }
      });
      
      const changeData = {
        old: { type: 'item' },
        new: { type: 'item' },
        _action: action,
        _parentPath: arrayPath
      };
      await onChange(path, changeData);
    } else if (action === 'addEntry' || action === 'addEntryAbove' || action === 'addEntryBelow') {
      // Add pseudo entry for interactive creation
      const pathParts = path.split('.').filter(p => p !== '');
      let parent = data;
      let targetObj = data;
      let currentKey = null;
      
      // Navigate to the target object
      for (let i = 0; i < pathParts.length; i++) {
        parent = targetObj;
        targetObj = targetObj[pathParts[i]];
        currentKey = pathParts[i];
      }
      
      // If targetObj is an empty object (emptyDict case), add to targetObj itself
      // Otherwise (normal key case), add to parent
      const isEmptyDict = typeof targetObj === 'object' && 
                          targetObj !== null && 
                          !Array.isArray(targetObj) && 
                          Object.keys(targetObj).length === 0;
      
      runInAction(() => {
        const pseudoKey = `__pseudo__${Date.now()}`;
        const destination = isEmptyDict ? targetObj : parent;
        destination[pseudoKey] = {
          __pseudo__: true,
          position: action === 'addEntry' ? undefined : (action === 'addEntryAbove' ? 'above' : 'below'),
          referenceKey: (action === 'addEntry' || isEmptyDict) ? undefined : currentKey
        };
      });
    } else if (action === 'addItem' || action === 'addItemAbove' || action === 'addItemBelow') {
      // Add pseudo item to array
      const pathParts = path.split('..');
      
      if (pathParts.length === 1) {
        // Simple path without ".." - navigate by object keys to find the array
        const objKeys = path.split('.').filter(k => k !== '');
        let parent = data;
        for (const key of objKeys) {
          parent = parent[key];
        }
        
        // parent is now the array itself
        runInAction(() => {
          if (Array.isArray(parent)) {
            parent.push({ isPseudo: true });
          }
        });
      } else {
        // Path with ".." - navigate through nested arrays
        let parent = data;
        
        // Navigate to the array
        if (pathParts[0]) {
          const objKeys = pathParts[0].split('.').filter(k => k !== '');
          for (const key of objKeys) {
            parent = parent[key];
          }
        }
        
        for (let i = 1; i < pathParts.length; i++) {
          const segments = pathParts[i].split('.');
          const arrayIndex = parseInt(segments[0]);
          
          if (i === pathParts.length - 1) {
            // This is where we insert
            runInAction(() => {
              if (action === 'addItemAbove') {
                parent.splice(arrayIndex, 0, { isPseudo: true });
              } else if (action === 'addItemBelow') {
                parent.splice(arrayIndex + 1, 0, { isPseudo: true });
              } else {
                parent.push({ isPseudo: true });
              }
            });
            break;
          } else {
            parent = parent[arrayIndex];
            for (let j = 1; j < segments.length; j++) {
              const key = segments[j];
              if (key) parent = parent[key];
            }
          }
        }
      }
    } else if (item.data?.targetType) {
      // Type conversion - mutate in place
      const { currentValue, currentType } = conversionMenu;
      const { targetType } = item.data;
      const convertedValue = convertValue(currentValue, targetType);
      
      const pathParts = path.split('.').filter(p => p !== '');
      const key = pathParts[pathParts.length - 1];
      let parent = data;
      for (let i = 0; i < pathParts.length - 1; i++) {
        parent = parent[pathParts[i]];
      }
      
      runInAction(() => {
        parent[key] = convertedValue;
      });
      
      // Notify backend
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
}
