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

  // Example 2: Values editable, keys read-only
  const [valueOnlyEditableData, setValueOnlyEditableData] = useState({
    username: "johndoe",
    email: "john@example.com",
    age: 30,
    active: true,
    verified: false
  });

  // Example 3: Complex nested structure - fully editable
  const [fullyEditableData, setFullyEditableData] = useState({
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

  // Unified handler factory function
  const createUnifiedHandler = useCallback((setData, options = {}) => {
    const {
      simulateDelay = true,
      delayMs = 200,
      simulateErrors = false,
      errorRate = 0.2,
      logPrefix = 'Change'
    } = options;

    return async (path, changeData) => {
      const { old, new: newData, _action, _parentPath, _itemPath, _keyRename, _key } = changeData;
      console.log(`${logPrefix}:`, { path, _action, _parentPath, _itemPath, changeData });
      
      // For pseudo-related actions, execute immediately without delay/errors (just UI state)
      switch (_action) {
        case 'addEntry':
        case 'addEntryAbove':
        case 'addEntryBelow':
        case 'addItem':
        case 'addItemAbove':
        case 'addItemBelow':
        case 'cancelCreate':
          setData(prevData => {
            const result = JSON.parse(JSON.stringify(prevData));
            
            // Helper to parse path (handles both dict paths and array paths)
            const parsePath = (path) => {
              if (path.includes('..')) {
                // Array path - keep it for later processing
                return path;
              } else {
                // Dict path - split and filter
                return path.split('.').filter(p => p !== '');
              }
            };
            
            const pathParts = parsePath(path);
            
            switch (_action) {
              case 'addEntry': {
                // Add pseudo entry to empty dict
                const isSimplePath = Array.isArray(pathParts);
                const targetObj = isSimplePath 
                  ? (pathParts.length === 0 ? result : pathParts.reduce((obj, key) => obj[key], result))
                  : result;
                const pseudoKey = `__pseudo__${Date.now()}`;
                targetObj[pseudoKey] = { __pseudo__: true };
                return result;
              }
              case 'addEntryAbove':
              case 'addEntryBelow': {
                // Add pseudo entry above/below current entry
                const isSimplePath = Array.isArray(pathParts);
                const parentObj = isSimplePath && pathParts.length === 1 
                  ? result 
                  : (isSimplePath ? pathParts.slice(0, -1).reduce((obj, key) => obj[key], result) : result);
                const pseudoKey = `__pseudo__${Date.now()}`;
                const referenceKey = isSimplePath ? pathParts[pathParts.length - 1] : pathParts;
                parentObj[pseudoKey] = { 
                  __pseudo__: true,
                  position: _action === 'addEntryAbove' ? 'above' : 'below', 
                  referenceKey: referenceKey
                };
                return result;
              }
              case 'addItem':
              case 'addItemAbove':
              case 'addItemBelow': {
                // Add pseudo item to array
                const pathIsArray = typeof pathParts === 'string' && pathParts.includes('..');
                if (pathIsArray) {
                  // Parse path like "tags..0" or "user.roles..2"
                  const parts = pathParts.split('..');
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
                  // Empty array or root array - add to it
                  const targetArray = Array.isArray(pathParts) && pathParts.length === 0 
                    ? result 
                    : (Array.isArray(pathParts) ? pathParts.reduce((obj, key) => obj[key], result) : result);
                  if (Array.isArray(targetArray)) {
                    targetArray.push({ isPseudo: true });
                  }
                }
                return result;
              }
              case 'cancelCreate': {
                // Remove pseudo entry/item
                if (typeof pathParts === 'string' && pathParts.includes('..')) {
                  // Array item - parse path like "tags..0"
                  const parts = pathParts.split('..');
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
                  const parentObj = Array.isArray(pathParts) && pathParts.length === 0 
                    ? result 
                    : (Array.isArray(pathParts) ? pathParts.slice(0, -1).reduce((obj, key) => obj[key], result) : result);
                  const pseudoKey = Array.isArray(pathParts) ? pathParts[pathParts.length - 1] : pathParts;
                  delete parentObj[pseudoKey];
                }
                return result;
              }
            }
          });
          return { code: 0, message: 'Success' };
      }
      
      // For actual data operations, apply delay and optional error simulation
      if (simulateErrors) {
        setMessage(`Updating ${path}...`);
      }
      
      if (simulateDelay) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      // Simulate random errors if enabled
      if (simulateErrors) {
        const success = Math.random() > errorRate;
        if (!success) {
          setMessage(`✗ Failed to update ${path} (simulated error)`);
          setTimeout(() => setMessage(''), 3000);
          return { code: -1, message: 'Failed to update (simulated error)' };
        }
      }

      setData(prevData => {
        const result = JSON.parse(JSON.stringify(prevData));
        
        // Helper to parse path into parts
        const parsePathParts = (path) => {
          if (path.includes('..')) {
            // Mixed path - keep for special handling
            return { type: 'array', path };
          } else {
            // Object path
            return { type: 'object', parts: path.split('.').filter(p => p !== '') };
          }
        };
        
        const parsedPath = parsePathParts(path);
        
        // Handle key rename (special case)
        if (_keyRename) {
          const pathParts = parsedPath.type === 'object' ? parsedPath.parts : path.split('.').filter(p => p !== '');
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
          const pathParts = parsedPath.type === 'object' ? parsedPath.parts : path.split('.').filter(p => p !== '');
          const parentObj = pathParts.length === 0 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
          const currentKey = pathParts[pathParts.length - 1];
          const keys = Object.keys(parentObj).filter(k => !k.startsWith('__pseudo__'));
          const currentIndex = keys.indexOf(currentKey);
          const newIndex = _action === 'moveEntryUp' ? currentIndex - 1 : currentIndex + 1;
          
          if (newIndex >= 0 && newIndex < keys.length) {
            // Rebuild object with swapped order
            const newObj = {};
            keys.forEach((k, idx) => {
              if (idx === currentIndex) return;
              if (idx === newIndex) {
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
            
            keys.forEach(k => delete parentObj[k]);
            Object.assign(parentObj, newObj);
          }
        } else if (_action === 'moveEntryToTop' || _action === 'moveEntryToBottom') {
          // Move dict entry to top or bottom
          const pathParts = parsedPath.type === 'object' ? parsedPath.parts : path.split('.').filter(p => p !== '');
          const parentObj = pathParts.length === 0 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
          const currentKey = pathParts[pathParts.length - 1];
          const keys = Object.keys(parentObj).filter(k => !k.startsWith('__pseudo__'));
          
          const newObj = {};
          if (_action === 'moveEntryToTop') {
            newObj[currentKey] = parentObj[currentKey];
            keys.forEach(k => {
              if (k !== currentKey) {
                newObj[k] = parentObj[k];
              }
            });
          } else {
            keys.forEach(k => {
              if (k !== currentKey) {
                newObj[k] = parentObj[k];
              }
            });
            newObj[currentKey] = parentObj[currentKey];
          }
          
          keys.forEach(k => delete parentObj[k]);
          Object.assign(parentObj, newObj);
        } else if (_action === 'moveItemUp' || _action === 'moveItemDown') {
          // Move array item up or down
          if (parsedPath.type === 'array') {
            const parts = parsedPath.path.split('..');
            let current = result;
            
            if (parts[0]) {
              const objKeys = parts[0].split('.').filter(k => k !== '');
              for (const key of objKeys) {
                current = current[key];
              }
            }
            
            for (let i = 1; i < parts.length - 1; i++) {
              const index = parseInt(parts[i]);
              current = current[index];
            }
            
            const currentIndex = parseInt(parts[parts.length - 1]);
            
            if (Array.isArray(current)) {
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
                  const temp = current[currentIndex];
                  current[currentIndex] = current[targetIndex];
                  current[targetIndex] = temp;
                }
              }
            }
          }
        } else if (_action === 'moveItemToTop' || _action === 'moveItemToBottom') {
          // Move array item to top or bottom
          if (parsedPath.type === 'array') {
            const parts = parsedPath.path.split('..');
            let current = result;
            
            if (parts[0]) {
              const objKeys = parts[0].split('.').filter(k => k !== '');
              for (const key of objKeys) {
                current = current[key];
              }
            }
            
            for (let i = 1; i < parts.length - 1; i++) {
              const index = parseInt(parts[i]);
              current = current[index];
            }
            
            const currentIndex = parseInt(parts[parts.length - 1]);
            
            if (Array.isArray(current)) {
              const realIndices = [];
              current.forEach((item, idx) => {
                if (!(item && typeof item === 'object' && item.isPseudo)) {
                  realIndices.push(idx);
                }
              });
              
              const posInReal = realIndices.indexOf(currentIndex);
              if (posInReal >= 0) {
                const item = current[currentIndex];
                current.splice(currentIndex, 1);
                
                if (_action === 'moveItemToTop') {
                  current.unshift(item);
                } else {
                  current.push(item);
                }
              }
            }
          }
        } else {
          // Handle specific actions
          switch (_action) {
            case 'createEntry': {
              // Convert pseudo to real entry
              const pathParts = parsedPath.type === 'object' ? parsedPath.parts : path.split('.').filter(p => p !== '');
              const parentObj = pathParts.length === 0 ? result : pathParts.slice(0, -1).reduce((obj, key) => obj[key], result);
              const pseudoKey = pathParts[pathParts.length - 1];
              const pseudoData = parentObj[pseudoKey];
              
              if (pseudoData && pseudoData.position && pseudoData.referenceKey) {
                const newParentObj = {};
                for (const key of Object.keys(parentObj)) {
                  if (key === pseudoKey) continue;
                  
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
                Object.keys(parentObj).forEach(k => delete parentObj[k]);
                Object.assign(parentObj, newParentObj);
              } else {
                delete parentObj[pseudoKey];
                parentObj[_key] = newData.value;
              }
              
              return result;
            }
            case 'createItem': {
              // Convert pseudo array item to real item
              const parts = parsedPath.path.split('..');
              let current = result;
              
              if (parts[0]) {
                const objKeys = parts[0].split('.').filter(k => k !== '');
                for (const key of objKeys) {
                  current = current[key];
                }
              }
              
              for (let i = 1; i < parts.length - 1; i++) {
                const index = parseInt(parts[i]);
                current = current[index];
              }
              
              const targetIndex = parseInt(parts[parts.length - 1]);
              current[targetIndex] = newData.value;
              if (current[targetIndex] && typeof current[targetIndex] === 'object') {
                delete current[targetIndex].isPseudo;
              }
              return result;
            }
            case 'deleteEntry': {
              const pathParts = parsedPath.type === 'object' ? parsedPath.parts : path.split('.').filter(p => p !== '');
              let current = result;
              for (let i = 0; i < pathParts.length - 1; i++) {
                current = current[pathParts[i]];
              }
              delete current[pathParts[pathParts.length - 1]];
              break;
            }
            case 'deleteParentDict': {
              if (_parentPath === '') {
                return {};
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
              if (_parentPath === '') {
                return {};
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
              if (parsedPath.type === 'array') {
                const parts = parsedPath.path.split('..');
                let current = result;
                
                if (parts[0]) {
                  const objKeys = parts[0].split('.').filter(k => k !== '');
                  for (const key of objKeys) {
                    current = current[key];
                  }
                }
                
                for (let i = 1; i < parts.length - 1; i++) {
                  const index = parseInt(parts[i]);
                  current = current[index];
                }
                
                const targetIndex = parseInt(parts[parts.length - 1]);
                current.splice(targetIndex, 1);
              } else {
                // Handle simple array at root
                const pathParts = path.split('..').filter(p => p !== '').map(p => parseInt(p));
                let current = result;
                for (let i = 0; i < pathParts.length - 1; i++) {
                  current = current[pathParts[i]];
                }
                current.splice(pathParts[pathParts.length - 1], 1);
              }
              break;
            }
            case 'deleteParentArray': {
              if (_parentPath === '') {
                return [];
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
              if (_parentPath === '') {
                return [];
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
              // Normal value change
              if (parsedPath.type === 'array') {
                const parts = parsedPath.path.split('..');
                let current = result;
                
                if (parts[0]) {
                  const objKeys = parts[0].split('.').filter(k => k !== '');
                  for (const key of objKeys) {
                    current = current[key];
                  }
                }
                
                for (let i = 1; i < parts.length - 1; i++) {
                  const index = parseInt(parts[i]);
                  current = current[index];
                }
                
                const targetIndex = parseInt(parts[parts.length - 1]);
                
                let finalValue = newData.value;
                if (old.type === newData.type && newData.type === 'number' && typeof newData.value === 'string') {
                  finalValue = !isNaN(newData.value) ? Number(newData.value) : old.value;
                } else if (old.type !== newData.type) {
                  finalValue = newData.value;
                } else {
                  finalValue = newData.value;
                }
                
                current[targetIndex] = finalValue;
              } else {
                // Object path
                const pathParts = parsedPath.parts;
                let current = result;
                for (let i = 0; i < pathParts.length - 1; i++) {
                  current = current[pathParts[i]];
                }
                
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
        }
        
        return result;
      });

      if (simulateErrors) {
        setMessage(`✓ Updated ${path} successfully`);
        setTimeout(() => setMessage(''), 3000);
      }
      
      return { code: 0, message: 'Success' };
    };
  }, [setMessage]);

  // Create handlers using the unified function
  const handleValueOnlyEditableChange = useCallback(
    createUnifiedHandler(setValueOnlyEditableData, { 
      simulateErrors: true, 
      errorRate: 0.2,
      delayMs: 300,
      logPrefix: 'Value-only edit'
    }),
    [createUnifiedHandler]
  );

  const handleFullyEditableChange = useCallback(
    createUnifiedHandler(setFullyEditableData, { 
      delayMs: 200,
      logPrefix: 'Fully editable'
    }),
    [createUnifiedHandler]
  );

  const handleArrayChange = useCallback(
    createUnifiedHandler(setArrayData, { 
      delayMs: 200,
      logPrefix: 'Array'
    }),
    [createUnifiedHandler]
  );

  const handleMongoChange = useCallback(
    createUnifiedHandler(setMongoDoc, { 
      delayMs: 200,
      logPrefix: 'MongoDB'
    }),
    [createUnifiedHandler]
  );

  // Old handlers removed - using unified handler above

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
          data={valueOnlyEditableData} 
          isEditable={true}
          isKeyEditable={false}
          isValueEditable={true}
          onChange={handleValueOnlyEditableChange}
        />
      </div>

      <h3 style={{ marginBottom: '8px' }}>3. Complex Nested Structure with Arrays</h3>
      <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '8px' }}>
        Supports deeply nested objects and arrays. Keys and values are editable.
      </p>
      <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '3px', marginBottom: '20px' }}>
        <JsonComp 
          data={fullyEditableData} 
          isEditable={true}
          isKeyEditable={true}
          isValueEditable={true}
          onChange={handleFullyEditableChange}
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
