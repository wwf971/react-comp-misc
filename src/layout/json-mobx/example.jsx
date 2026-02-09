import React, { useState, useCallback, useMemo } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import JsonCompMobx from './JsonCompMobx';
import BoolSlider from '../../button/BoolSlider';
import { createHandleChange } from './exampleHandleChange';

/**
 * Example demonstrating MobX-based JSON component with in-place mutations
 */
const JsonMobxExample = observer(() => {
  // Create observable data - MobX will track all changes
  const [observableData] = useState(() => {
    const data = {
      user: {
        id: 123,
        name: "Alice Smith",
        email: "alice@example.com",
        roles: ["admin", "editor"],
        settings: {
          theme: "dark",
          notifications: {
            email: true,
            push: false
          }
        }
      },
      tags: ["important", "verified"],
      metadata: {
        views: 1234,
        published: true
      }
    };
    
    // Make the entire tree observable with deep option
    return makeAutoObservable(data, {}, { deep: true });
  });

  const [isEditable, setIsEditable] = useState(true);
  const [isKeyEditable, setIsKeyEditable] = useState(true);
  const [isDebug, setIsDebug] = useState(false);

  // Create the onChange handler using the helper function
  const handleChange = useMemo(() => createHandleChange(observableData), [observableData]);

  return (
    <div style={{ maxWidth: '900px', padding: '20px' }}>
      <div style={{ marginBottom: '16px', padding: '12px', background: '#e8f5e9', borderRadius: '3px' }}>
        <strong>MobX-based JSON Component</strong>
        <div style={{ fontSize: '13px', marginTop: '6px', color: '#555' }}>
          Right-click on keys, values, or empty objects/arrays to access the context menu.
          Supports type conversions, add/delete operations, and more.
        </div>
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px' }}>Editable:</span>
          <BoolSlider 
            checked={isEditable}
            onChange={setIsEditable}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px' }}>Key editable:</span>
          <BoolSlider 
            checked={isKeyEditable}
            onChange={setIsKeyEditable}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px' }}>Debug mode:</span>
          <BoolSlider 
            checked={isDebug}
            onChange={setIsDebug}
          />
        </div>
      </div>

      <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '3px', marginBottom: '16px' }}>
        <JsonCompMobx 
          data={observableData}
          isEditable={isEditable}
          isKeyEditable={isKeyEditable}
          isDebug={isDebug}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginTop: '0', padding: '10px 12px', background: '#fff3e0', border: '1px solid #ff9800', borderRadius: '2px', fontSize: '12px' }}>
        <strong>Features:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>
          <li><strong>Fine-grained reactivity:</strong> Only components that read changed properties re-render</li>
          <li><strong>Editing:</strong> Click on values to edit (strings, numbers); click booleans to toggle; click keys to rename</li>
          <li><strong>Right-click menu:</strong> Type conversion, add/delete entries/items, view raw JSON, and more</li>
          <li><strong>Pseudo items:</strong> Right-click and select "Add entry/item" for interactive creation</li>
          <li><strong>Debug mode:</strong> Shows render counts - only changed values increment (not siblings!)</li>
          <li><strong>Stable keys:</strong> Array items maintain identity across operations</li>
        </ul>
      </div>
    </div>
  );
});

JsonMobxExample.displayName = 'JsonMobxExample';

// Export in the format expected by examples.jsx
export const jsonMobxExamples = {
  'JsonCompMobx': {
    component: JsonCompMobx,
    description: 'MobX-based JSON editor with automatic dependency tracking and in-place mutations',
    example: JsonMobxExample
  }
};

export default JsonMobxExample;
