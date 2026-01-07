import React, { useState, useCallback } from 'react';
import JsonComp from './JsonComp';

/**
 * Consolidated JSON examples in a single panel
 */
const JsonExamplesPanel = () => {
  // Example 1: Simple nested object (read-only)
  const simpleData = {
    name: "John Doe",
    age: 30,
    email: "john@example.com",
    address: {
      street: "123 Main St",
      city: "New York",
      zip: "10001"
    }
  };

  // Example 2: Editable values
  const [editableData, setEditableData] = useState({
    username: "johndoe",
    email: "john@example.com",
    age: 30,
    active: true,
    verified: false
  });

  // Example 3: Complex nested structure
  const [complexData, setComplexData] = useState({
    user: {
      id: 123,
      name: "Alice Smith",
      roles: ["admin", "editor", "viewer"],
      settings: {
        theme: "dark",
        notifications: {
          email: true,
          push: false
        }
      }
    },
    tags: ["important", "verified"]
  });

  // Example 4: Array with mixed types
  const [arrayData, setArrayData] = useState([
    "Simple string",
    42,
    true,
    null,
    { nested: "object" },
    ["nested", "array"]
  ]);

  // Example 5: MongoDB document
  const [mongoDoc, setMongoDoc] = useState({
    _id: "507f1f77bcf86cd799439011",
    title: "Sample Blog Post",
    author: {
      name: "Jane Developer",
      email: "jane@dev.com",
      verified: true
    },
    content: "This is a sample blog post content...",
    tags: ["javascript", "react", "mongodb"],
    comments: [
      { user: "user1", text: "Great post!", likes: 5 },
      { user: "user2", text: "Very helpful", likes: 3 }
    ],
    metadata: {
      views: 1234,
      published: true,
      created_at: "2024-01-15T10:30:00Z"
    }
  });

  const [message, setMessage] = useState('');

  // Handler for editable data
  const handleEditableChange = useCallback(async (path, changeData) => {
    const { old, new: newData, _action, _parentPath, _key } = changeData;
    console.log(`Change:`, { path, _action, _parentPath, changeData });
    
    // For pseudo-related actions, execute immediately without delay/errors (just UI state)
    switch (_action) {
      case 'addEntry':
      case 'addEntryAbove':
      case 'addEntryBelow':
      case 'cancelCreate':
        setEditableData(prevData => {
          const result = JSON.parse(JSON.stringify(prevData));
          const keys = path.split('.');
          
          switch (_action) {
            case 'addEntry': {
              // Add pseudo entry to empty dict
              const targetObj = keys.length === 0 || keys[0] === '' ? result : keys.reduce((obj, key) => obj[key], result);
              const pseudoKey = `__pseudo__${Date.now()}`;
              targetObj[pseudoKey] = { __pseudo__: true };
              return result;
            }
            case 'addEntryAbove':
            case 'addEntryBelow': {
              // Add pseudo entry above/below current entry (at root level)
              const pseudoKey = `__pseudo__${Date.now()}`;
              result[pseudoKey] = { 
                __pseudo__: true,
                position: _action === 'addEntryAbove' ? 'above' : 'below', 
                referenceKey: keys[0]
              };
              return result;
            }
            case 'cancelCreate': {
              // Remove pseudo entry - the key itself is the pseudo key
              const parentObj = keys.length === 0 || keys[0] === '' ? result : keys.slice(0, -1).reduce((obj, key) => obj[key], result);
              const pseudoKey = keys[keys.length - 1];
              delete parentObj[pseudoKey];
              return result;
            }
          }
        });
        return { code: 0, message: 'Success' };
    }
    
    // For actual data operations, apply delay and error simulation
    setMessage(`Updating ${path}...`);
    
    // Simulate network delay (optional - comment out for instant updates)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Random success/failure (80% success rate)
    const success = Math.random() > 0.2;

    if (success) {
      setEditableData(prevData => {
        const result = JSON.parse(JSON.stringify(prevData));
        const keys = path.split('.');
        
        switch (_action) {
          case 'createEntry': {
            // Convert pseudo to real entry: delete the pseudo key, add real key
            const parentObj = keys.length === 0 || keys[0] === '' ? result : keys.slice(0, -1).reduce((obj, key) => obj[key], result);
            const pseudoKey = keys[keys.length - 1];
            const pseudoData = parentObj[pseudoKey];
            
            // Check if pseudo has position info
            if (pseudoData && pseudoData.position && pseudoData.referenceKey) {
              // Reconstruct parent object with correct order
              const newParentObj = {};
              for (const key of Object.keys(parentObj)) {
                if (key === pseudoKey) continue; // Skip the pseudo key
                
                // Insert new key at the right position
                if (key === pseudoData.referenceKey) {
                  if (pseudoData.position === 'above') {
                    newParentObj[_key] = newData.value;
                    newParentObj[key] = parentObj[key];
                  } else {
                    newParentObj[key] = parentObj[key];
                    newParentObj[_key] = newData.value;
                  }
                } else {
                  newParentObj[key] = parentObj[key];
                }
              }
              // Replace parent object keys
              Object.keys(parentObj).forEach(k => delete parentObj[k]);
              Object.assign(parentObj, newParentObj);
            } else {
              // No position info - just delete pseudo and add at end
              delete parentObj[pseudoKey];
              parentObj[_key] = newData.value;
            }
            
            console.log('After createEntry, result:', result);
            return result;
          }
          case 'deleteEntry': {
            // Delete this entry
            let current = result;
            for (let i = 0; i < keys.length - 1; i++) {
              current = current[keys[i]];
            }
            delete current[keys[keys.length - 1]];
            break;
          }
          case 'deleteParentDict': {
            // Delete the parent dict
            if (_parentPath === '') {
              return {};  // Parent is root
            }
            const parentParts = _parentPath.split('.').filter(p => p !== '');
            let current = result;
            for (let i = 0; i < parentParts.length - 1; i++) {
              current = current[parentParts[i]];
            }
            const lastKey = parentParts[parentParts.length - 1];
            current[lastKey] = null;
            break;
          }
          case 'clearParentDict': {
            // Clear all entries in parent dict
            if (_parentPath === '') {
              return {};  // Parent is root
            }
            const parentParts = _parentPath.split('.').filter(p => p !== '');
            let current = result;
            for (let i = 0; i < parentParts.length - 1; i++) {
              current = current[parentParts[i]];
            }
            current[parentParts[parentParts.length - 1]] = {};
            break;
          }
          default: {
            // Normal value change
            let current = result;
            for (let i = 0; i < keys.length - 1; i++) {
              current = current[keys[i]];
            }
            
            // Determine final value based on whether types match
            let finalValue = newData.value;
            if (old.type === newData.type && newData.type === 'number' && typeof newData.value === 'string') {
              // User edited a number field - parse string input to number
              finalValue = !isNaN(newData.value) ? Number(newData.value) : old.value;
            } else if (old.type !== newData.type) {
              // Type conversion - use the converted value directly (already correct type)
              finalValue = newData.value;
            } else {
              // Same type - use new value as is
              finalValue = newData.value;
            }
            
            current[keys[keys.length - 1]] = finalValue;
          }
        }
        
        console.log('After update, data:', JSON.stringify(result, null, 2));
        return result;
      });

      setMessage(`✓ Updated ${path} successfully`);
      setTimeout(() => setMessage(''), 3000);
      return { code: 0, message: 'Success' };
    } else {
      setMessage(`✗ Failed to update ${path} (simulated error)`);
      setTimeout(() => setMessage(''), 3000);
      return { code: -1, message: 'Failed to update (simulated error)' };
    }
  }, []);

  // Handler for complex nested data
  const handleComplexChange = useCallback(async (path, changeData) => {
    const { old, new: newData, _action, _parentPath, _itemPath, _keyRename, _key } = changeData;
    console.log(`Complex change:`, { path, _action, _parentPath, _itemPath, changeData });
    
    // For pseudo-related actions, execute immediately without delay (just UI state)
    switch (_action) {
      case 'addEntry':
      case 'addEntryAbove':
      case 'addEntryBelow':
      case 'addItem':
      case 'addItemAbove':
      case 'addItemBelow':
      case 'cancelCreate':
        setComplexData(prevData => {
          const result = JSON.parse(JSON.stringify(prevData));
          const pathParts = path.split('.').flatMap(part => 
            part.startsWith('.') ? [part.slice(1)] : [part]
          ).filter(part => part !== '');
          
          switch (_action) {
            case 'addEntry': {
              // Add pseudo entry to empty dict
              const targetObj = pathParts.length === 0 ? result : pathParts.reduce((obj, key) => obj[key], result);
              const pseudoKey = `__pseudo__${Date.now()}`;
              targetObj[pseudoKey] = { __pseudo__: true };
              return result;
            }
            case 'addEntryAbove':
            case 'addEntryBelow': {
              // Add pseudo entry above/below current entry
              const parentObj = pathParts.length === 1 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
              const pseudoKey = `__pseudo__${Date.now()}`;
              parentObj[pseudoKey] = { 
                __pseudo__: true,
                position: _action === 'addEntryAbove' ? 'above' : 'below', 
                referenceKey: pathParts[pathParts.length - 1]
              };
              return result;
            }
            case 'addItem':
            case 'addItemAbove':
            case 'addItemBelow': {
              // Add pseudo item to array
              const pathIsArray = path.includes('..');
              if (pathIsArray) {
                // Parse path like "tags..0" or "user.roles..2"
                const parts = path.split('..');
                let current = result;
                
                // First part: navigate through object keys
                if (parts[0]) {
                  const objKeys = parts[0].split('.').filter(k => k !== '');
                  for (const key of objKeys) {
                    current = current[key];
                  }
                }
                
                // Remaining parts: navigate through array indices (except last)
                for (let i = 1; i < parts.length - 1; i++) {
                  const index = parseInt(parts[i]);
                  current = current[index];
                }
                
                const targetIndex = parseInt(parts[parts.length - 1]);
                if (_action === 'addItemAbove') {
                  current.splice(targetIndex, 0, { isPseudo: true });
                } else if (_action === 'addItemBelow') {
                  current.splice(targetIndex + 1, 0, { isPseudo: true });
                }
              } else {
                // Empty array - add to it
                const targetArray = pathParts.length === 0 ? result : pathParts.reduce((obj, key) => obj[key], result);
                if (Array.isArray(targetArray)) {
                  targetArray.push({ isPseudo: true });
                }
              }
              return result;
            }
            case 'cancelCreate': {
              // Remove pseudo entry/item
              if (path.includes('..')) {
                // Array item - parse path like "tags..0"
                const parts = path.split('..');
                let current = result;
                
                // First part: navigate through object keys
                if (parts[0]) {
                  const objKeys = parts[0].split('.').filter(k => k !== '');
                  for (const key of objKeys) {
                    current = current[key];
                  }
                }
                
                // Remaining parts: navigate through array indices (except last)
                for (let i = 1; i < parts.length - 1; i++) {
                  const index = parseInt(parts[i]);
                  current = current[index];
                }
                
                const targetIndex = parseInt(parts[parts.length - 1]);
                current.splice(targetIndex, 1);
              } else {
                // Dict entry - delete the pseudo key
                const parentObj = pathParts.length === 0 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
                const pseudoKey = pathParts[pathParts.length - 1];
                delete parentObj[pseudoKey];
              }
              return result;
            }
          }
        });
        return { code: 0 };
    }
    
    // For actual data operations, apply delay
    await new Promise(resolve => setTimeout(resolve, 200));

    setComplexData(prevData => {
      const result = JSON.parse(JSON.stringify(prevData));
      const pathParts = path.split('.').flatMap(part => 
        part.startsWith('.') ? [part.slice(1)] : [part]
      ).filter(part => part !== '');
      
      // Handle key rename first (special case)
      if (_keyRename) {
        let current = result;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        const oldKey = pathParts[pathParts.length - 1];
        const newKey = newData.value;
        const value = current[oldKey];
        delete current[oldKey];
        current[newKey] = value;
      } else if (_action === 'moveEntryUp' || _action === 'moveEntryDown') {
        // Move dict entry up or down
        const parentObj = pathParts.length === 0 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
        const currentKey = pathParts[pathParts.length - 1];
        const keys = Object.keys(parentObj).filter(k => !k.startsWith('__pseudo__'));
        const currentIndex = keys.indexOf(currentKey);
        const newIndex = _action === 'moveEntryUp' ? currentIndex - 1 : currentIndex + 1;
        
        if (newIndex >= 0 && newIndex < keys.length) {
          // Rebuild object with swapped order
          const newObj = {};
          keys.forEach((k, idx) => {
            if (idx === currentIndex) return; // Skip current
            if (idx === newIndex) {
              // Insert current before/after this key
              if (_action === 'moveEntryUp') {
                newObj[currentKey] = parentObj[currentKey];
                newObj[k] = parentObj[k];
              } else {
                newObj[k] = parentObj[k];
                newObj[currentKey] = parentObj[currentKey];
              }
            } else {
              newObj[k] = parentObj[k];
            }
          });
          
          // Copy back to parent
          keys.forEach(k => delete parentObj[k]);
          Object.assign(parentObj, newObj);
        }
      } else if (_action === 'moveEntryToTop' || _action === 'moveEntryToBottom') {
        // Move dict entry to top or bottom
        const parentObj = pathParts.length === 0 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
        const currentKey = pathParts[pathParts.length - 1];
        const keys = Object.keys(parentObj).filter(k => !k.startsWith('__pseudo__'));
        
        // Rebuild object with entry at new position
        const newObj = {};
        if (_action === 'moveEntryToTop') {
          // Add current key first
          newObj[currentKey] = parentObj[currentKey];
          // Add all other keys
          keys.forEach(k => {
            if (k !== currentKey) {
              newObj[k] = parentObj[k];
            }
          });
        } else {
          // Add all other keys first
          keys.forEach(k => {
            if (k !== currentKey) {
              newObj[k] = parentObj[k];
            }
          });
          // Add current key last
          newObj[currentKey] = parentObj[currentKey];
        }
        
        // Copy back to parent
        keys.forEach(k => delete parentObj[k]);
        Object.assign(parentObj, newObj);
      } else if (_action === 'moveItemUp' || _action === 'moveItemDown') {
        // Move array item up or down
        let current = result;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        const currentIndex = parseInt(pathParts[pathParts.length - 1]);
        
        if (Array.isArray(current)) {
          // Filter out pseudo items for correct indices
          const realIndices = [];
          current.forEach((item, idx) => {
            if (!(item && typeof item === 'object' && item.isPseudo)) {
              realIndices.push(idx);
            }
          });
          
          const posInReal = realIndices.indexOf(currentIndex);
          if (posInReal >= 0) {
            const targetPos = _action === 'moveItemUp' ? posInReal - 1 : posInReal + 1;
            if (targetPos >= 0 && targetPos < realIndices.length) {
              const targetIndex = realIndices[targetPos];
              // Swap the two real items
              const temp = current[currentIndex];
              current[currentIndex] = current[targetIndex];
              current[targetIndex] = temp;
            }
          }
        }
      } else if (_action === 'moveItemToTop' || _action === 'moveItemToBottom') {
        // Move array item to top or bottom
        let current = result;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        const currentIndex = parseInt(pathParts[pathParts.length - 1]);
        
        if (Array.isArray(current)) {
          // Filter out pseudo items to get real indices
          const realIndices = [];
          current.forEach((item, idx) => {
            if (!(item && typeof item === 'object' && item.isPseudo)) {
              realIndices.push(idx);
            }
          });
          
          const posInReal = realIndices.indexOf(currentIndex);
          if (posInReal >= 0) {
            const item = current[currentIndex];
            // Remove item from current position
            current.splice(currentIndex, 1);
            
            if (_action === 'moveItemToTop') {
              // Insert at beginning
              current.unshift(item);
            } else {
              // Insert at end
              current.push(item);
            }
          }
        }
      } else {
        switch (_action) {
          case 'createEntry': {
            // Convert pseudo to real entry: delete the pseudo key, add real key
            const parentObj = pathParts.length === 0 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
            const pseudoKey = pathParts[pathParts.length - 1];
            const pseudoData = parentObj[pseudoKey];
            
            // Check if pseudo has position info
            if (pseudoData && pseudoData.position && pseudoData.referenceKey) {
              // Reconstruct parent object with correct order
              const newParentObj = {};
              for (const key of Object.keys(parentObj)) {
                if (key === pseudoKey) continue; // Skip the pseudo key
                
                // Insert new key at the right position
                if (key === pseudoData.referenceKey) {
                  if (pseudoData.position === 'above') {
                    newParentObj[_key] = newData.value;
                    newParentObj[key] = parentObj[key];
                  } else {
                    newParentObj[key] = parentObj[key];
                    newParentObj[_key] = newData.value;
                  }
                } else {
                  newParentObj[key] = parentObj[key];
                }
              }
              // Replace parent object keys
              Object.keys(parentObj).forEach(k => delete parentObj[k]);
              Object.assign(parentObj, newParentObj);
            } else {
              // No position info - just delete pseudo and add at end
              delete parentObj[pseudoKey];
              parentObj[_key] = newData.value;
            }
            
            return result;
          }
          case 'createItem': {
            // Convert pseudo array item to real item - parse path like "tags..0"
            const parts = path.split('..');
            let current = result;
            
            // First part: navigate through object keys
            if (parts[0]) {
              const objKeys = parts[0].split('.').filter(k => k !== '');
              for (const key of objKeys) {
                current = current[key];
              }
            }
            
            // Remaining parts: navigate through array indices (except last)
            for (let i = 1; i < parts.length - 1; i++) {
              const index = parseInt(parts[i]);
              current = current[index];
            }
            
            const targetIndex = parseInt(parts[parts.length - 1]);
            current[targetIndex] = newData.value;
            // Remove isPseudo flag
            delete current[targetIndex].isPseudo;
            return result;
          }
          case 'deleteEntry': {
            // Delete the entry from dict
            let current = result;
            for (let i = 0; i < pathParts.length - 1; i++) {
              current = current[pathParts[i]];
            }
            delete current[pathParts[pathParts.length - 1]];
            break;
          }
          case 'deleteParentDict': {
            // Delete the parent dict using explicit _parentPath
            if (_parentPath === '') {
              return {};  // Parent is root
            }
            const parentParts = _parentPath.split('.').filter(p => p !== '' && !p.startsWith('.'));
            let current = result;
            for (let i = 0; i < parentParts.length - 1; i++) {
              current = current[parentParts[i]];
            }
            const lastKey = parentParts[parentParts.length - 1];
            if (Array.isArray(current)) {
              current.splice(parseInt(lastKey), 1);
            } else {
              current[lastKey] = null;
            }
            break;
          }
          case 'clearParentDict': {
            // Clear all entries in parent dict using explicit _parentPath
            if (_parentPath === '') {
              return {};  // Parent is root
            }
            const parentParts = _parentPath.split('.').filter(p => p !== '' && !p.startsWith('.'));
            let current = result;
            for (let i = 0; i < parentParts.length - 1; i++) {
              current = current[parentParts[i]];
            }
            current[parentParts[parentParts.length - 1]] = {};
            break;
          }
          case 'deleteArrayItem': {
            // Delete the item from array
            let current = result;
            for (let i = 0; i < pathParts.length - 1; i++) {
              current = current[pathParts[i]];
            }
            const index = parseInt(pathParts[pathParts.length - 1]);
            current.splice(index, 1);
            break;
          }
          case 'deleteParentArray': {
            // Delete the parent array using explicit _parentPath
            if (_parentPath === '') {
              return [];  // Parent is root
            }
            const parentParts = _parentPath.split('.').filter(p => p !== '' && !p.startsWith('.'));
            let current = result;
            for (let i = 0; i < parentParts.length - 1; i++) {
              current = current[parentParts[i]];
            }
            const lastKey = parentParts[parentParts.length - 1];
            if (Array.isArray(current)) {
              current.splice(parseInt(lastKey), 1);
            } else {
              current[lastKey] = null;
            }
            break;
          }
          case 'clearParentArray': {
            // Clear all items in parent array using explicit _parentPath
            if (_parentPath === '') {
              return [];  // Parent is root
            }
            const parentParts = _parentPath.split('.').filter(p => p !== '' && !p.startsWith('.'));
            let current = result;
            for (let i = 0; i < parentParts.length - 1; i++) {
              current = current[parentParts[i]];
            }
            current[parentParts[parentParts.length - 1]] = [];
            break;
          }
          default: {
            // Handle value change
            let current = result;
            for (let i = 0; i < pathParts.length - 1; i++) {
              current = current[pathParts[i]];
            }
            
            // Determine final value
            let finalValue = newData.value;
            if (old.type === newData.type && newData.type === 'number' && typeof newData.value === 'string') {
              finalValue = !isNaN(newData.value) ? Number(newData.value) : old.value;
            } else if (old.type !== newData.type) {
              finalValue = newData.value;
            } else {
              finalValue = newData.value;
            }
            
            current[pathParts[pathParts.length - 1]] = finalValue;
          }
        }
      }
      return result;
    });

    return { code: 0 };
  }, []);

  // Handler for array data
  const handleArrayChange = useCallback(async (path, changeData) => {
    const { old, new: newData, _action, _parentPath, _itemPath } = changeData;
    console.log(`Array change: ${path}`, { _action, _parentPath, _itemPath, changeData });
    
    await new Promise(resolve => setTimeout(resolve, 200));

    setArrayData(prevData => {
      const result = JSON.parse(JSON.stringify(prevData));
      // Parse path: ..5..0 -> [5, 0]
      const pathParts = path.split('..').filter(p => p !== '').map(p => parseInt(p));
      
      if (_action === 'deleteArrayItem') {
        // Delete the item from array - navigate to parent and splice
        let current = result;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        current.splice(pathParts[pathParts.length - 1], 1);
      } else if (_action === 'deleteParentArray') {
        // Delete the parent array
        if (_parentPath === '') {
          return [];  // Parent is root
        }
        const parentParts = _parentPath.split('..').filter(p => p !== '').map(p => parseInt(p));
        let current = result;
        for (let i = 0; i < parentParts.length - 1; i++) {
          current = current[parentParts[i]];
        }
        current.splice(parentParts[parentParts.length - 1], 1);
      } else if (_action === 'clearParentArray') {
        // Clear all items in parent array
        if (_parentPath === '') {
          return [];  // Parent is root
        }
        const parentParts = _parentPath.split('..').filter(p => p !== '').map(p => parseInt(p));
        let current = result;
        for (let i = 0; i < parentParts.length - 1; i++) {
          current = current[parentParts[i]];
        }
        current[parentParts[parentParts.length - 1]] = [];
      } else {
        // Normal value change
        let finalValue = newData.value;
        if (old.type === newData.type && newData.type === 'number' && typeof newData.value === 'string') {
          finalValue = !isNaN(newData.value) ? Number(newData.value) : old.value;
        } else if (old.type !== newData.type) {
          finalValue = newData.value;
        } else {
          finalValue = newData.value;
        }
        
        // Navigate to item and set value
        let current = result;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        current[pathParts[pathParts.length - 1]] = finalValue;
      }

      return result;
    });

    return { code: 0 };
  }, []);

  // Handler for MongoDB document
  const handleMongoChange = useCallback(async (path, changeData) => {
    const { old, new: newData, _action, _parentPath, _itemPath, _keyRename, _key } = changeData;
    console.log(`MongoDB update:`, { path, _action, _parentPath, _itemPath, changeData });
    
    // For pseudo-related actions, execute immediately without delay (just UI state)
    switch (_action) {
      case 'addEntry':
      case 'addEntryAbove':
      case 'addEntryBelow':
      case 'addItem':
      case 'addItemAbove':
      case 'addItemBelow':
      case 'cancelCreate':
        setMongoDoc(prevData => {
          const result = JSON.parse(JSON.stringify(prevData));
          const pathParts = path.split('.').flatMap(part => 
            part.startsWith('.') ? [part.slice(1)] : [part]
          ).filter(part => part !== '');
          
          switch (_action) {
            case 'addEntry': {
              // Add pseudo entry to empty dict
              const targetObj = pathParts.length === 0 ? result : pathParts.reduce((obj, key) => obj[key], result);
              const pseudoKey = `__pseudo__${Date.now()}`;
              targetObj[pseudoKey] = { __pseudo__: true };
              return result;
            }
            case 'addEntryAbove':
            case 'addEntryBelow': {
              // Add pseudo entry above/below current entry
              const parentObj = pathParts.length === 1 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
              const pseudoKey = `__pseudo__${Date.now()}`;
              parentObj[pseudoKey] = { 
                __pseudo__: true,
                position: _action === 'addEntryAbove' ? 'above' : 'below', 
                referenceKey: pathParts[pathParts.length - 1]
              };
              return result;
            }
            case 'addItem':
            case 'addItemAbove':
            case 'addItemBelow': {
              // Add pseudo item to array
              const pathIsArray = path.includes('..');
              if (pathIsArray) {
                // Parse path like "tags..0" or "user.roles..2"
                const parts = path.split('..');
                let current = result;
                
                // First part: navigate through object keys
                if (parts[0]) {
                  const objKeys = parts[0].split('.').filter(k => k !== '');
                  for (const key of objKeys) {
                    current = current[key];
                  }
                }
                
                // Remaining parts: navigate through array indices (except last)
                for (let i = 1; i < parts.length - 1; i++) {
                  const index = parseInt(parts[i]);
                  current = current[index];
                }
                
                const targetIndex = parseInt(parts[parts.length - 1]);
                if (_action === 'addItemAbove') {
                  current.splice(targetIndex, 0, { isPseudo: true });
                } else if (_action === 'addItemBelow') {
                  current.splice(targetIndex + 1, 0, { isPseudo: true });
                }
              } else {
                // Empty array - add to it
                const targetArray = pathParts.length === 0 ? result : pathParts.reduce((obj, key) => obj[key], result);
                if (Array.isArray(targetArray)) {
                  targetArray.push({ isPseudo: true });
                }
              }
              return result;
            }
            case 'cancelCreate': {
              // Remove pseudo entry/item
              if (path.includes('..')) {
                // Array item - parse path like "tags..0"
                const parts = path.split('..');
                let current = result;
                
                // First part: navigate through object keys
                if (parts[0]) {
                  const objKeys = parts[0].split('.').filter(k => k !== '');
                  for (const key of objKeys) {
                    current = current[key];
                  }
                }
                
                // Remaining parts: navigate through array indices (except last)
                for (let i = 1; i < parts.length - 1; i++) {
                  const index = parseInt(parts[i]);
                  current = current[index];
                }
                
                const targetIndex = parseInt(parts[parts.length - 1]);
                current.splice(targetIndex, 1);
              } else {
                // Dict entry - delete the pseudo key
                const parentObj = pathParts.length === 0 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
                const pseudoKey = pathParts[pathParts.length - 1];
                delete parentObj[pseudoKey];
              }
              return result;
            }
          }
        });
        return { code: 0, message: 'Success' };
    }
    
    // For actual data operations, apply delay
    await new Promise(resolve => setTimeout(resolve, 200));

    setMongoDoc(prevData => {
      const result = JSON.parse(JSON.stringify(prevData));
      const pathParts = path.split('.').flatMap(part => 
        part.startsWith('.') ? [part.slice(1)] : [part]
      ).filter(part => part !== '');
      
      // Handle key rename first (special case)
      if (_keyRename) {
        let current = result;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        const oldKey = pathParts[pathParts.length - 1];
        const newKey = newData.value;
        const value = current[oldKey];
        delete current[oldKey];
        current[newKey] = value;
      } else if (_action === 'moveEntryUp' || _action === 'moveEntryDown') {
        // Move dict entry up or down
        const parentObj = pathParts.length === 0 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
        const currentKey = pathParts[pathParts.length - 1];
        const keys = Object.keys(parentObj).filter(k => !k.startsWith('__pseudo__'));
        const currentIndex = keys.indexOf(currentKey);
        const newIndex = _action === 'moveEntryUp' ? currentIndex - 1 : currentIndex + 1;
        
        if (newIndex >= 0 && newIndex < keys.length) {
          // Rebuild object with swapped order
          const newObj = {};
          keys.forEach((k, idx) => {
            if (idx === currentIndex) return; // Skip current
            if (idx === newIndex) {
              // Insert current before/after this key
              if (_action === 'moveEntryUp') {
                newObj[currentKey] = parentObj[currentKey];
                newObj[k] = parentObj[k];
              } else {
                newObj[k] = parentObj[k];
                newObj[currentKey] = parentObj[currentKey];
              }
            } else {
              newObj[k] = parentObj[k];
            }
          });
          
          // Copy back to parent
          keys.forEach(k => delete parentObj[k]);
          Object.assign(parentObj, newObj);
        }
      } else if (_action === 'moveItemUp' || _action === 'moveItemDown') {
        // Move array item up or down
        // Parse array path like "tags..1" or "author.roles..2"
        if (path.includes('..')) {
          const parts = path.split('..');
          let current = result;
          
          // First part: navigate through object keys
          if (parts[0]) {
            const objKeys = parts[0].split('.').filter(k => k !== '');
            for (const key of objKeys) {
              current = current[key];
            }
          }
          
          // Remaining parts: navigate through array indices (except last)
          for (let i = 1; i < parts.length - 1; i++) {
            const index = parseInt(parts[i]);
            current = current[index];
          }
          
          const currentIndex = parseInt(parts[parts.length - 1]);
          const newIndex = _action === 'moveItemUp' ? currentIndex - 1 : currentIndex + 1;
          
          if (Array.isArray(current) && newIndex >= 0 && newIndex < current.length) {
            // Swap items - filter out pseudo items for correct indices
            const realIndices = [];
            current.forEach((item, idx) => {
              if (!(item && typeof item === 'object' && item.isPseudo)) {
                realIndices.push(idx);
              }
            });
            
            const posInReal = realIndices.indexOf(currentIndex);
            if (posInReal >= 0) {
              const targetPos = _action === 'moveItemUp' ? posInReal - 1 : posInReal + 1;
              if (targetPos >= 0 && targetPos < realIndices.length) {
                const targetIndex = realIndices[targetPos];
                // Swap the two real items
                const temp = current[currentIndex];
                current[currentIndex] = current[targetIndex];
                current[targetIndex] = temp;
              }
            }
          }
        }
      } else if (_action === 'moveItemToTop' || _action === 'moveItemToBottom') {
        // Move array item to top or bottom
        // Parse array path like "tags..1" or "author.roles..2"
        if (path.includes('..')) {
          const parts = path.split('..');
          let current = result;
          
          // First part: navigate through object keys
          if (parts[0]) {
            const objKeys = parts[0].split('.').filter(k => k !== '');
            for (const key of objKeys) {
              current = current[key];
            }
          }
          
          // Remaining parts: navigate through array indices (except last)
          for (let i = 1; i < parts.length - 1; i++) {
            const index = parseInt(parts[i]);
            current = current[index];
          }
          
          const currentIndex = parseInt(parts[parts.length - 1]);
          
          if (Array.isArray(current)) {
            // Filter out pseudo items to get real indices
            const realIndices = [];
            current.forEach((item, idx) => {
              if (!(item && typeof item === 'object' && item.isPseudo)) {
                realIndices.push(idx);
              }
            });
            
            const posInReal = realIndices.indexOf(currentIndex);
            if (posInReal >= 0) {
              const item = current[currentIndex];
              // Remove item from current position
              current.splice(currentIndex, 1);
              
              if (_action === 'moveItemToTop') {
                // Insert at beginning
                current.unshift(item);
              } else {
                // Insert at end
                current.push(item);
              }
            }
          }
        }
      } else if (_action === 'moveEntryToTop' || _action === 'moveEntryToBottom') {
        // Move dict entry to top or bottom
        const parentObj = pathParts.length === 0 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
        const currentKey = pathParts[pathParts.length - 1];
        const keys = Object.keys(parentObj).filter(k => !k.startsWith('__pseudo__'));
        
        // Rebuild object with entry at new position
        const newObj = {};
        if (_action === 'moveEntryToTop') {
          // Add current key first
          newObj[currentKey] = parentObj[currentKey];
          // Add all other keys
          keys.forEach(k => {
            if (k !== currentKey) {
              newObj[k] = parentObj[k];
            }
          });
        } else {
          // Add all other keys first
          keys.forEach(k => {
            if (k !== currentKey) {
              newObj[k] = parentObj[k];
            }
          });
          // Add current key last
          newObj[currentKey] = parentObj[currentKey];
        }
        
        // Copy back to parent
        keys.forEach(k => delete parentObj[k]);
        Object.assign(parentObj, newObj);
      } else {
        switch (_action) {
          case 'createEntry': {
            // Convert pseudo to real entry: delete the pseudo key, add real key
            const parentObj = pathParts.length === 0 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
            const pseudoKey = pathParts[pathParts.length - 1];
            const pseudoData = parentObj[pseudoKey];
            
            // Check if pseudo has position info
            if (pseudoData && pseudoData.position && pseudoData.referenceKey) {
              // Reconstruct parent object with correct order
              const newParentObj = {};
              for (const key of Object.keys(parentObj)) {
                if (key === pseudoKey) continue; // Skip the pseudo key
                
                // Insert new key at the right position
                if (key === pseudoData.referenceKey) {
                  if (pseudoData.position === 'above') {
                    newParentObj[_key] = newData.value;
                    newParentObj[key] = parentObj[key];
                  } else {
                    newParentObj[key] = parentObj[key];
                    newParentObj[_key] = newData.value;
                  }
                } else {
                  newParentObj[key] = parentObj[key];
                }
              }
              // Replace parent object keys
              Object.keys(parentObj).forEach(k => delete parentObj[k]);
              Object.assign(parentObj, newParentObj);
            } else {
              // No position info - just delete pseudo and add at end
              delete parentObj[pseudoKey];
              parentObj[_key] = newData.value;
            }
            
            return result;
          }
          case 'createItem': {
            // Convert pseudo array item to real item - parse path like "tags..0"
            const parts = path.split('..');
            let current = result;
            
            // First part: navigate through object keys
            if (parts[0]) {
              const objKeys = parts[0].split('.').filter(k => k !== '');
              for (const key of objKeys) {
                current = current[key];
              }
            }
            
            // Remaining parts: navigate through array indices (except last)
            for (let i = 1; i < parts.length - 1; i++) {
              const index = parseInt(parts[i]);
              current = current[index];
            }
            
            const targetIndex = parseInt(parts[parts.length - 1]);
            current[targetIndex] = newData.value;
            // Remove isPseudo flag
            delete current[targetIndex].isPseudo;
            return result;
          }
          case 'deleteEntry': {
            // Delete the entry from dict
            let current = result;
            for (let i = 0; i < pathParts.length - 1; i++) {
              current = current[pathParts[i]];
            }
            delete current[pathParts[pathParts.length - 1]];
            break;
          }
          case 'deleteParentDict': {
            // Delete the parent dict using explicit _parentPath
            if (_parentPath === '') {
              return {};  // Parent is root
            }
            const parentParts = _parentPath.split('.').filter(p => p !== '' && !p.startsWith('.'));
            let current = result;
            for (let i = 0; i < parentParts.length - 1; i++) {
              current = current[parentParts[i]];
            }
            const lastKey = parentParts[parentParts.length - 1];
            if (Array.isArray(current)) {
              current.splice(parseInt(lastKey), 1);
            } else {
              current[lastKey] = null;
            }
            break;
          }
          case 'clearParentDict': {
            // Clear all entries in parent dict using explicit _parentPath
            if (_parentPath === '') {
              return {};  // Parent is root
            }
            const parentParts = _parentPath.split('.').filter(p => p !== '' && !p.startsWith('.'));
            let current = result;
            for (let i = 0; i < parentParts.length - 1; i++) {
              current = current[parentParts[i]];
            }
            current[parentParts[parentParts.length - 1]] = {};
            break;
          }
          case 'deleteArrayItem': {
            // Delete the item from array
            let current = result;
            for (let i = 0; i < pathParts.length - 1; i++) {
              current = current[pathParts[i]];
            }
            const index = parseInt(pathParts[pathParts.length - 1]);
            current.splice(index, 1);
            break;
          }
          case 'deleteParentArray': {
            // Delete the parent array using explicit _parentPath
            if (_parentPath === '') {
              return [];  // Parent is root
            }
            const parentParts = _parentPath.split('.').filter(p => p !== '' && !p.startsWith('.'));
            let current = result;
            for (let i = 0; i < parentParts.length - 1; i++) {
              current = current[parentParts[i]];
            }
            const lastKey = parentParts[parentParts.length - 1];
            if (Array.isArray(current)) {
              current.splice(parseInt(lastKey), 1);
            } else {
              current[lastKey] = null;
            }
            break;
          }
          case 'clearParentArray': {
            // Clear all items in parent array using explicit _parentPath
            if (_parentPath === '') {
              return [];  // Parent is root
            }
            const parentParts = _parentPath.split('.').filter(p => p !== '' && !p.startsWith('.'));
            let current = result;
            for (let i = 0; i < parentParts.length - 1; i++) {
              current = current[parentParts[i]];
            }
            current[parentParts[parentParts.length - 1]] = [];
            break;
          }
          default: {
            // Handle value change
            let current = result;
            for (let i = 0; i < pathParts.length - 1; i++) {
              current = current[pathParts[i]];
            }
            
            // Determine final value
            let finalValue = newData.value;
            if (old.type === newData.type && newData.type === 'number' && typeof newData.value === 'string') {
              finalValue = !isNaN(newData.value) ? Number(newData.value) : old.value;
            } else if (old.type !== newData.type) {
              finalValue = newData.value;
            } else {
              finalValue = newData.value;
            }
            
            current[pathParts[pathParts.length - 1]] = finalValue;
          }
        }
      }
      return result;
    });

    return { code: 0, message: 'MongoDB document updated' };
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '900px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '8px' }}>1. Simple Nested Object (Read-Only)</h3>
      <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '3px', marginBottom: '20px' }}>
        <JsonComp 
          data={simpleData} 
          isEditable={false}
        />
      </div>

      <h3 style={{ marginBottom: '8px' }}>2. Editable Values (Keys Read-Only)</h3>
      <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '8px' }}>
        Click on values to edit. Boolean values toggle on click. Press Enter or blur to submit. 20% simulated failure rate.
      </p>
      <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '3px', marginBottom: '20px' }}>
        <JsonComp 
          data={editableData} 
          isEditable={true}
          isKeyEditable={false}
          isValueEditable={true}
          onChange={handleEditableChange}
        />
      </div>

      <h3 style={{ marginBottom: '8px' }}>3. Complex Nested Structure with Arrays</h3>
      <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '8px' }}>
        Supports deeply nested objects and arrays. Keys and values are editable.
      </p>
      <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '3px', marginBottom: '20px' }}>
        <JsonComp 
          data={complexData} 
          isEditable={true}
          isKeyEditable={true}
          isValueEditable={true}
          onChange={handleComplexChange}
        />
      </div>

      <h3 style={{ marginBottom: '8px' }}>4. Array with Mixed Types</h3>
      <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '8px' }}>
        Root level array with various data types including nested structures.
      </p>
      <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '3px', marginBottom: '20px' }}>
        <JsonComp 
          data={arrayData} 
          isEditable={true}
          onChange={handleArrayChange}
        />
      </div>

      <h3 style={{ marginBottom: '8px' }}>5. MongoDB Document Editor</h3>
      <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '8px' }}>
        Simulates editing a MongoDB document. Try editing comments, metadata, or user information.
      </p>
      <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '3px', marginBottom: '20px' }}>
        <JsonComp 
          data={mongoDoc} 
          isEditable={true}
          isKeyEditable={false}
          isValueEditable={true}
          onChange={handleMongoChange}
        />
      </div>

      {message && (
        <div style={{ 
          marginTop: '16px', 
          padding: '8px 12px', 
          background: message.startsWith('✓') ? '#e8f5e9' : message.startsWith('✗') ? '#ffebee' : '#f5f5f5',
          border: `1px solid ${message.startsWith('✓') ? '#4caf50' : message.startsWith('✗') ? '#f44336' : '#ddd'}`,
          borderRadius: '2px', 
          fontSize: '13px' 
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '16px', padding: '10px 12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '2px', fontSize: '12px' }}>
        <strong>Features:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>
          <li>Recursively renders deeply nested JSON objects and arrays</li>
          <li>Click on text/number values to edit, booleans toggle on click (distinct monospace font)</li>
          <li>Right-click values to convert types (string ↔ number ↔ boolean ↔ null)</li>
          <li>Spinning circle shows next to value during async update</li>
          <li>Component locks during submission, doesn't update value until parent updates data</li>
          <li>No request sent if value hasn't changed</li>
          <li>Path notation: <code>user.name</code>, <code>tags..0</code>, <code>items..1.name</code> (.. for array indices)</li>
          <li>Structured change data: <code>{`{ old: { type, value }, new: { type, value } }`}</code></li>
          <li>Sans-serif font, reduced indentation (12px), no quote marks</li>
          <li>Configurable editability for keys and values separately</li>
        </ul>
      </div>
    </div>
  );
};

// Export in the format expected by examples.jsx
export const jsonExamples = {
  'JsonComp': {
    component: JsonComp,
    description: 'Display and edit deeply nested JSON-like objects with async updates',
    example: JsonExamplesPanel
  }
};
