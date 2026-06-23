import { convertValue } from './typeConvert.js';

/**
 * Handle menu item click actions for JSON editing
 * @param {Object} params - Parameters object
 * @param {Object} params.item - Menu item that was clicked
 * @param {Object} params.menuOpen - Current menu state with path, value, menuType, etc.
 * @param {Object} params.data - The observable data object
 * @param {Function} params.emitEvent - Callback for notifying changes
 * @param {Function} params.closeMenu - Callback to close the menu
 */
export async function handleMenuItemClick({ item, menuOpen, data, emitEvent, closeMenu }) {
  if (!menuOpen || !emitEvent) return;

  const action = item.data?.action;
  const { path } = menuOpen;

  try {
    if (action === 'deleteEntry') {
      const changeData = {
        old: { type: typeof menuOpen.value === 'object' && menuOpen.value !== null ? 'object' : typeof menuOpen.value, value: menuOpen.value },
        new: { type: 'deleted' },
        _action: 'deleteEntry',
        _entryPath: path
      };
      await emitEvent(path, changeData);
    } else if (action === 'deleteDict') {
      const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'));
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
      
      const changeData = {
        old: { type: 'object', value: null },
        new: { type: 'deleted' },
        _action: 'deleteParentDict',
        _entryPath: path,
        _parentPath: parentPath
      };
      await emitEvent(path, changeData);
    } else if (action === 'deleteAllEntries') {
      const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'));
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
      
      const changeData = {
        old: { type: 'object', value: null },
        new: { type: 'object', value: {} },
        _action: 'clearParentDict',
        _entryPath: path,
        _parentPath: parentPath
      };
      await emitEvent(path, changeData);
    } else if (action === 'deleteArrayItem') {
      const changeData = {
        old: { type: typeof menuOpen.value === 'object' && menuOpen.value !== null ? (Array.isArray(menuOpen.value) ? 'array' : 'object') : typeof menuOpen.value, value: menuOpen.value },
        new: { type: 'deleted' },
        _action: 'deleteArrayItem',
        _itemPath: path
      };
      await emitEvent(path, changeData);
    } else if (action === 'deleteArray') {
      const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'));
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
      
      const changeData = {
        old: { type: 'array', value: null },
        new: { type: 'deleted' },
        _action: 'deleteParentArray',
        _itemPath: path,
        _parentPath: parentPath
      };
      await emitEvent(path, changeData);
    } else if (action === 'clearArray') {
      const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'));
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
      
      const changeData = {
        old: { type: 'array', value: null },
        new: { type: 'array', value: [] },
        _action: 'clearParentArray',
        _itemPath: path,
        _parentPath: parentPath
      };
      await emitEvent(path, changeData);
    } else if (action === 'convertParentDictToText') {
      const entryParts = path.split('.').filter(p => p !== '');
      const dictParts = entryParts.slice(0, -1);
      const parentPath = dictParts.join('.');
      const key = menuOpen.itemKey;
      const value = menuOpen.value;
      const textValue = `${key}:${value}`;
      
      const changeData = {
        old: { type: 'object', value: { [key]: value } },
        new: { type: 'string', value: textValue },
        _action: 'convertParentToText',
        _parentPath: parentPath
      };
      await emitEvent(parentPath, changeData);
    } else if (action === 'convertParentArrayToText') {
      const value = menuOpen.value;
      const parts = path.split('..');
      const arrayPath = parts.length > 1 ? parts[0] + (parts.length > 2 ? '..' + parts.slice(1, -1).join('..') : '') : '';
      const textValue = String(value);
      
      const changeData = {
        old: { type: 'array', value: [value] },
        new: { type: 'string', value: textValue },
        _action: 'convertParentToText',
        _parentPath: arrayPath
      };
      await emitEvent(arrayPath, changeData);
    } else if (action === 'moveEntryUp' || action === 'moveEntryDown' || action === 'moveEntryToTop' || action === 'moveEntryToBottom') {
      const pathParts = path.split('.').filter(p => p !== '');
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : '';
      
      const changeData = {
        old: { type: 'entry' },
        new: { type: 'entry' },
        _action: action,
        _parentPath: parentPath
      };
      await emitEvent(path, changeData);
    } else if (action === 'moveItemUp' || action === 'moveItemDown' || action === 'moveItemToTop' || action === 'moveItemToBottom') {
      const parts = path.split('..');
      const arrayPath = parts.length > 1 ? parts[0] + (parts.length > 2 ? '..' + parts.slice(1, -1).join('..') : '') : '';
      
      const changeData = {
        old: { type: 'item' },
        new: { type: 'item' },
        _action: action,
        _parentPath: arrayPath
      };
      await emitEvent(path, changeData);
    } else if (action === 'addEntry' || action === 'addEntryAbove' || action === 'addEntryBelow') {
      const changeData = {
        old: { type: 'none' },
        new: { type: 'pseudo' },
        _action: action
      };
      await emitEvent(path, changeData);
    } else if (action === 'addItem' || action === 'addItemAbove' || action === 'addItemBelow') {
      const changeData = {
        old: { type: 'none' },
        new: { type: 'pseudo' },
        _action: action
      };
      await emitEvent(path, changeData);
    } else if (item.data?.targetType) {
      const { currentValue, currentType } = menuOpen;
      const { targetType } = item.data;
      const convertedValue = convertValue(currentValue, targetType);
      
      const changeData = {
        old: { type: currentType, value: currentValue },
        new: { type: targetType, value: convertedValue }
      };
      await emitEvent(path, changeData);
    }
    
    closeMenu();
  } catch (error) {
    console.error('Menu action failed:', error);
  }
}
