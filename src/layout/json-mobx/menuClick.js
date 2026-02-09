import { convertValue } from './typeConvert.js';

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
      // Send delete request via onChange - let the parent handle the mutation
      const changeData = {
        old: { type: typeof conversionMenu.value === 'object' && conversionMenu.value !== null ? 'object' : typeof conversionMenu.value, value: conversionMenu.value },
        new: { type: 'deleted' },
        _action: 'deleteEntry',
        _entryPath: path
      };
      await onChange(path, changeData);
    } else if (action === 'deleteDict') {
      // Send delete request via onChange - let the parent handle the mutation
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
      // Send clear request via onChange - let the parent handle the mutation
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
      // Send delete request via onChange - let the parent handle the mutation
      const changeData = {
        old: { type: typeof conversionMenu.value === 'object' && conversionMenu.value !== null ? (Array.isArray(conversionMenu.value) ? 'array' : 'object') : typeof conversionMenu.value, value: conversionMenu.value },
        new: { type: 'deleted' },
        _action: 'deleteArrayItem',
        _itemPath: path
      };
      await onChange(path, changeData);
    } else if (action === 'deleteArray') {
      // Send delete request via onChange - let the parent handle the mutation
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
      // Send clear request via onChange - let the parent handle the mutation
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
    } else if (action === 'convertParentDictToText') {
      // Send convert request via onChange - let the parent handle the mutation
      const entryParts = path.split('.').filter(p => p !== '');
      const dictParts = entryParts.slice(0, -1);
      const parentPath = dictParts.join('.');
      const key = conversionMenu.itemKey;
      const value = conversionMenu.value;
      const textValue = `${key}:${value}`;
      
      const changeData = {
        old: { type: 'object', value: { [key]: value } },
        new: { type: 'string', value: textValue },
        _action: 'convertParentToText',
        _parentPath: parentPath
      };
      await onChange(parentPath, changeData);
    } else if (action === 'convertParentArrayToText') {
      // Send convert request via onChange - let the parent handle the mutation
      const value = conversionMenu.value;
      const parts = path.split('..');
      const arrayPath = parts.length > 1 ? parts[0] + (parts.length > 2 ? '..' + parts.slice(1, -1).join('..') : '') : '';
      const textValue = String(value);
      
      const changeData = {
        old: { type: 'array', value: [value] },
        new: { type: 'string', value: textValue },
        _action: 'convertParentToText',
        _parentPath: arrayPath
      };
      await onChange(arrayPath, changeData);
    } else if (action === 'moveEntryUp' || action === 'moveEntryDown' || action === 'moveEntryToTop' || action === 'moveEntryToBottom') {
      // Send move request via onChange - let the parent handle the actual mutation
      const pathParts = path.split('.').filter(p => p !== '');
      const key = pathParts[pathParts.length - 1];
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
      
      const changeData = {
        old: { type: 'entry' },
        new: { type: 'entry' },
        _action: action,
        _parentPath: parentPath
      };
      await onChange(path, changeData);
    } else if (action === 'moveItemUp' || action === 'moveItemDown' || action === 'moveItemToTop' || action === 'moveItemToBottom') {
      // Send move request via onChange - let the parent handle the actual mutation
      const parts = path.split('..');
      const arrayPath = parts.length > 1 ? parts[0] + (parts.length > 2 ? '..' + parts.slice(1, -1).join('..') : '') : '';
      
      const changeData = {
        old: { type: 'item' },
        new: { type: 'item' },
        _action: action,
        _parentPath: arrayPath
      };
      await onChange(path, changeData);
    } else if (action === 'addEntry' || action === 'addEntryAbove' || action === 'addEntryBelow') {
      // Send add entry request via onChange - let the parent handle the mutation
      const changeData = {
        old: { type: 'none' },
        new: { type: 'pseudo' },
        _action: action
      };
      await onChange(path, changeData);
    } else if (action === 'addItem' || action === 'addItemAbove' || action === 'addItemBelow') {
      // Send add item request via onChange - let the parent handle the mutation
      const changeData = {
        old: { type: 'none' },
        new: { type: 'pseudo' },
        _action: action
      };
      await onChange(path, changeData);
    } else if (item.data?.targetType) {
      // Send type conversion request via onChange - let the parent handle the mutation
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
}
