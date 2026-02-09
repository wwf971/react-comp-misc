import { runInAction } from 'mobx';
import { parsePathToSegments, navigateToPath } from '../json/pathUtils';

/**
 * Example handleChange implementation for JsonCompMobx
 * 
 * This function receives change requests from JsonCompMobx and performs
 * the actual mutations on the observable data. JsonCompMobx acts as a
 * "controlled component" that doesn't mutate data itself.
 * 
 * @param {Object} observableData - The MobX observable data
 * @returns {Function} - The handleChange function (path, changeData) => Promise<{code: number, message: string}>
 */
export function createHandleChange(observableData) {
  return async (path, changeData) => {
    const { old, new: newData, _action, _key } = changeData;
    
    // Simulate async operation (e.g., backend API call)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const segments = parsePathToSegments(path);
      
      switch (_action) {
        case 'deleteEntry': {
          runInAction(() => {
            const parent = segments.length === 0 ? observableData : navigateToPath(observableData, segments.slice(0, -1));
            const lastSeg = segments[segments.length - 1];
            delete parent[lastSeg.key];
          });
          break;
        }
        W
        case 'deleteParentDict': {
          const parentPath = changeData._parentPath;
          if (!parentPath || parentPath === '') {
            return { code: -1, message: 'Cannot delete root document' };
          }
          
          runInAction(() => {
            const parentSegments = parsePathToSegments(parentPath);
            const grandparent = navigateToPath(observableData, parentSegments.slice(0, -1));
            const lastSeg = parentSegments[parentSegments.length - 1];
            
            if (lastSeg.type === 'arr') {
              grandparent.splice(lastSeg.index, 1);
            } else {
              delete grandparent[lastSeg.key];
            }
          });
          break;
        }
        
        case 'clearParentDict': {
          const parentPath = changeData._parentPath;
          if (!parentPath || parentPath === '') {
            return { code: -1, message: 'Cannot clear root document' };
          }
          
          runInAction(() => {
            const parentSegments = parsePathToSegments(parentPath);
            const targetObj = navigateToPath(observableData, parentSegments);
            Object.keys(targetObj).forEach(k => delete targetObj[k]);
          });
          break;
        }
        
        case 'deleteArrayItem': {
          runInAction(() => {
            const parent = navigateToPath(observableData, segments.slice(0, -1));
            const lastSeg = segments[segments.length - 1];
            parent.splice(lastSeg.index, 1);
          });
          break;
        }
        
        case 'deleteParentArray': {
          const parentPath = changeData._parentPath;
          if (!parentPath || parentPath === '') {
            return { code: -1, message: 'Cannot delete root document' };
          }
          
          runInAction(() => {
            const parentSegments = parsePathToSegments(parentPath);
            const grandparent = navigateToPath(observableData, parentSegments.slice(0, -1));
            const lastSeg = parentSegments[parentSegments.length - 1];
            
            if (lastSeg.type === 'arr') {
              grandparent.splice(lastSeg.index, 1);
            } else {
              delete grandparent[lastSeg.key];
            }
          });
          break;
        }
        
        case 'clearParentArray': {
          const parentPath = changeData._parentPath;
          if (!parentPath || parentPath === '') {
            return { code: -1, message: 'Cannot clear root document' };
          }
          
          runInAction(() => {
            const parentSegments = parsePathToSegments(parentPath);
            const targetArray = navigateToPath(observableData, parentSegments);
            targetArray.length = 0;
          });
          break;
        }
        
        case 'moveItemUp':
        case 'moveItemDown':
        case 'moveItemToTop':
        case 'moveItemToBottom': {
          runInAction(() => {
            const arraySegments = segments.slice(0, -1);
            const array = navigateToPath(observableData, arraySegments);
            const itemIndex = segments[segments.length - 1].index;
            
            const item = array[itemIndex];
            array.splice(itemIndex, 1);
            
            if (_action === 'moveItemUp') {
              array.splice(Math.max(0, itemIndex - 1), 0, item);
            } else if (_action === 'moveItemDown') {
              array.splice(itemIndex + 1, 0, item);
            } else if (_action === 'moveItemToTop') {
              array.unshift(item);
            } else {
              array.push(item);
            }
          });
          break;
        }
        
        case 'moveEntryUp':
        case 'moveEntryDown':
        case 'moveEntryToTop':
        case 'moveEntryToBottom': {
          runInAction(() => {
            const parentSegments = segments.slice(0, -1);
            const parent = parentSegments.length === 0 ? observableData : navigateToPath(observableData, parentSegments);
            const currentKey = segments[segments.length - 1].key;
            
            const keys = Object.keys(parent).filter(k => !k.startsWith('__pseudo__'));
            const currentIndex = keys.indexOf(currentKey);
            
            let newIndex;
            if (_action === 'moveEntryUp') {
              newIndex = currentIndex - 1;
            } else if (_action === 'moveEntryDown') {
              newIndex = currentIndex + 1;
            } else if (_action === 'moveEntryToTop') {
              newIndex = 0;
            } else {
              newIndex = keys.length - 1;
            }
            
            if (newIndex >= 0 && newIndex < keys.length && newIndex !== currentIndex) {
              // Rebuild object with new key order
              const newObj = {};
              const newKeys = [...keys];
              newKeys.splice(currentIndex, 1);
              newKeys.splice(newIndex, 0, currentKey);
              
              newKeys.forEach(k => {
                newObj[k] = parent[k];
              });
              
              // Replace parent's contents
              Object.keys(parent).forEach(k => delete parent[k]);
              Object.keys(newObj).forEach(k => {
                parent[k] = newObj[k];
              });
            }
          });
          break;
        }
        
        case 'convertParentToText': {
          runInAction(() => {
            const parentPath = changeData._parentPath;
            if (parentPath === '') {
              return { code: -1, message: 'Cannot convert root' };
            }
            
            const parentSegments = parsePathToSegments(parentPath);
            const grandparent = navigateToPath(observableData, parentSegments.slice(0, -1));
            const lastSeg = parentSegments[parentSegments.length - 1];
            
            if (lastSeg.type === 'arr') {
              grandparent[lastSeg.index] = newData.value;
            } else {
              grandparent[lastSeg.key] = newData.value;
            }
          });
          break;
        }
        
        case 'addEntry':
        case 'addEntryAbove':
        case 'addEntryBelow': {
          // Add pseudo entry for interactive creation (UI-only, no backend call)
          runInAction(() => {
            const targetObj = segments.length === 0 ? observableData : navigateToPath(observableData, segments);
            
            if (targetObj && typeof targetObj === 'object' && !Array.isArray(targetObj)) {
              const pseudoKey = `__pseudo__${Date.now()}`;
              const lastKey = segments.length > 0 ? segments[segments.length - 1].key : null;
              
              targetObj[pseudoKey] = {
                __pseudo__: true,
                position: _action === 'addEntryAbove' ? 'above' : (_action === 'addEntryBelow' ? 'below' : undefined),
                referenceKey: _action !== 'addEntry' ? lastKey : undefined
              };
            }
          });
          return { code: 0, message: 'Pseudo element added' };
        }
        
        case 'addItem':
        case 'addItemAbove':
        case 'addItemBelow': {
          // Add pseudo item for interactive creation (UI-only, no backend call)
          runInAction(() => {
            const targetArray = navigateToPath(observableData, segments);
            
            if (Array.isArray(targetArray)) {
              const pseudoItem = { isPseudo: true };
              
              if (_action === 'addItem') {
                targetArray.push(pseudoItem);
              } else if (segments.length > 0 && segments[segments.length - 1].type === 'arr') {
                const targetIndex = segments[segments.length - 1].index;
                if (_action === 'addItemAbove') {
                  targetArray.splice(targetIndex, 0, pseudoItem);
                } else {
                  targetArray.splice(targetIndex + 1, 0, pseudoItem);
                }
              }
            }
          });
          return { code: 0, message: 'Pseudo element added' };
        }
        
        case 'cancelCreate': {
          // Remove pseudo element
          runInAction(() => {
            const parent = navigateToPath(observableData, segments.slice(0, -1));
            const lastSeg = segments[segments.length - 1];
            
            if (lastSeg.type === 'arr') {
              parent.splice(lastSeg.index, 1);
            } else {
              delete parent[lastSeg.key];
            }
          });
          break;
        }
        
        case 'createEntry': {
          runInAction(() => {
            const parent = segments.length === 0 ? observableData : navigateToPath(observableData, segments.slice(0, -1));
            const pseudoKey = segments[segments.length - 1].key;
            
            // Remove pseudo key and add real key
            delete parent[pseudoKey];
            parent[_key] = newData.value;
          });
          break;
        }
        
        case 'createItem': {
          runInAction(() => {
            const parent = navigateToPath(observableData, segments.slice(0, -1));
            const lastSeg = segments[segments.length - 1];
            parent[lastSeg.index] = newData.value;
          });
          break;
        }
        
        case 'replaceDictWithJson': {
          runInAction(() => {
            const targetObj = navigateToPath(observableData, segments);
            
            // Clear and rebuild
            Object.keys(targetObj).forEach(k => delete targetObj[k]);
            Object.keys(newData.value).forEach(k => {
              targetObj[k] = newData.value[k];
            });
          });
          break;
        }
        
        case 'mergeDictWithJson': {
          runInAction(() => {
            const targetObj = navigateToPath(observableData, segments);
            
            // Merge new keys
            Object.keys(newData.value).forEach(k => {
              targetObj[k] = newData.value[k];
            });
          });
          break;
        }
        
        default: {
          // Default case: update value (covers type conversions and value edits)
          runInAction(() => {
            if (segments.length === 0) {
              // Root level - can't replace entire root
              return { code: -1, message: 'Cannot replace root' };
            }
            
            const parent = navigateToPath(observableData, segments.slice(0, -1));
            const lastSeg = segments[segments.length - 1];
            
            if (lastSeg.type === 'arr') {
              parent[lastSeg.index] = newData.value;
            } else {
              parent[lastSeg.key] = newData.value;
            }
          });
          break;
        }
      }
      
      return { code: 0, message: 'Success' };
    } catch (error) {
      console.error('handleChange error:', error);
      return { code: -1, message: error.message || 'Unknown error' };
    }
  };
}
