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
  const handleEditableChange = useCallback(async (path, newValue) => {
    console.log(`Change: ${path} = ${newValue}`);
    setMessage(`Updating ${path}...`);
    
    // Simulate network delay (optional - comment out for instant updates)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Random success/failure (80% success rate)
    const success = Math.random() > 0.2;

    if (success) {
      setEditableData(prevData => {
        const newData = { ...prevData };
        const keys = path.split('.');
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        // Parse value to correct type
        let parsedValue = newValue;
        if (newValue === 'true') parsedValue = true;
        else if (newValue === 'false') parsedValue = false;
        else if (!isNaN(newValue) && newValue.trim() !== '') parsedValue = Number(newValue);
        
        current[keys[keys.length - 1]] = parsedValue;
        return newData;
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
  const handleComplexChange = useCallback(async (path, newValue) => {
    console.log(`Complex change: ${path} = ${newValue}`);
    
    await new Promise(resolve => setTimeout(resolve, 200));

    setComplexData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const pathRegex = /([^\[\].]+)|\[(\d+)\]/g;
      const pathParts = [];
      let match;
      
      while ((match = pathRegex.exec(path)) !== null) {
        pathParts.push(match[1] || match[2]);
      }

      let current = newData;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      // Parse value to correct type
      let parsedValue = newValue;
      if (newValue === 'true') parsedValue = true;
      else if (newValue === 'false') parsedValue = false;
      else if (!isNaN(newValue) && newValue.trim() !== '') parsedValue = Number(newValue);
      
      current[pathParts[pathParts.length - 1]] = parsedValue;
      return newData;
    });

    return { code: 0 };
  }, []);

  // Handler for array data
  const handleArrayChange = useCallback(async (path, newValue) => {
    console.log(`Array change: ${path} = ${newValue}`);
    
    await new Promise(resolve => setTimeout(resolve, 200));

    setArrayData(prevData => {
      const newData = [...prevData];
      const pathRegex = /\[(\d+)\]/g;
      const indices = [];
      let match;
      
      while ((match = pathRegex.exec(path)) !== null) {
        indices.push(parseInt(match[1]));
      }

      // Parse value to correct type
      let parsedValue = newValue;
      if (newValue === 'true') parsedValue = true;
      else if (newValue === 'false') parsedValue = false;
      else if (!isNaN(newValue) && newValue.trim() !== '') parsedValue = Number(newValue);
      
      if (indices.length === 1) {
        newData[indices[0]] = parsedValue;
      } else if (indices.length === 2) {
        newData[indices[0]][indices[1]] = parsedValue;
      }

      return newData;
    });

    return { code: 0 };
  }, []);

  // Handler for MongoDB document
  const handleMongoChange = useCallback(async (path, newValue) => {
    console.log(`MongoDB update: ${path} = ${newValue}`);
    
    await new Promise(resolve => setTimeout(resolve, 200));

    setMongoDoc(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const pathRegex = /([^\[\].]+)|\[(\d+)\]/g;
      const pathParts = [];
      let match;
      
      while ((match = pathRegex.exec(path)) !== null) {
        pathParts.push(match[1] || match[2]);
      }

      let current = newData;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      // Parse value to correct type
      let parsedValue = newValue;
      if (newValue === 'true') parsedValue = true;
      else if (newValue === 'false') parsedValue = false;
      else if (!isNaN(newValue) && newValue.trim() !== '') parsedValue = Number(newValue);
      
      current[pathParts[pathParts.length - 1]] = parsedValue;
      return newData;
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
        Supports deeply nested objects and arrays. Click on primitive values to edit.
      </p>
      <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '3px', marginBottom: '20px' }}>
        <JsonComp 
          data={complexData} 
          isEditable={true}
          isKeyEditable={false}
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
          <li>Spinning circle shows next to value during async update</li>
          <li>Component locks during submission, doesn't update value until parent updates data</li>
          <li>No request sent if value hasn't changed</li>
          <li>Path notation: <code>user.name</code>, <code>tags[0]</code>, <code>comments[1].text</code></li>
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
