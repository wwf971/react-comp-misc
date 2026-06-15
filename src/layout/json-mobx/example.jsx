import React, { useState, useCallback, useMemo, useRef } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import JsonCompMobx, { createJsonDragOperationStore, createJsonSelectionOperationStore } from './JsonCompMobx';
import BoolSlider from '../../component/button/BoolSlider';
import { createHandleChange } from './exampleHandleChange';

const JsonMobxCustomValue = ({ path, value }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const valueText = String(value ?? '');
  const previewText = valueText.length > 96 ? `${valueText.slice(0, 96)}...` : valueText;

  return (
    <span className="json-mobx-custom-value">
      <span className="json-mobx-custom-value-text">
        {isExpanded ? valueText : previewText}
      </span>
      {valueText.length > 96 ? (
        <button
          type="button"
          className="json-mobx-custom-value-button"
          onClick={() => setIsExpanded((valuePrev) => !valuePrev)}
        >
          {isExpanded ? 'Collapse' : 'Show full'}
        </button>
      ) : null}
      <span className="json-mobx-custom-value-path">{path}</span>
    </span>
  );
};

const JsonMobxSelectionStatus = observer(({ dragOperationStore, selectionOperationStore }) => {
  const { selectedItemMeta, isSelectionActive } = selectionOperationStore;
  const statusText = isSelectionActive && selectedItemMeta
    ? `${selectedItemMeta.itemKind}: ${selectedItemMeta.path || selectedItemMeta.label}`
    : 'No selection';
  const dragText = dragOperationStore.isDragging && dragOperationStore.itemDraggedMeta
    ? `${dragOperationStore.itemDraggedMeta.itemKind}: ${dragOperationStore.itemDraggedMeta.path}`
    : 'No drag';

  return (
    <div className="json-selection-status-line">
      <span> Current selection: {statusText}</span>
      <span> Drag: {dragText}</span>
    </div>
  );
});

const getJsonMobxActionLabel = (changeData) => {
  if (changeData?._action === 'moveJsonItem') return 'Drag move';
  if (changeData?._action) return changeData._action;
  if (changeData?._keyRename) return 'Key rename';
  return 'Value edit';
};

const JsonMobxRenderDebugExample = observer(() => {
  const dataExample = useMemo(() => makeAutoObservable({
    config: {
      isRenderDebugEnabled: true,
    },
    doc: {
      editingTarget: {
        title: 'Edit this title',
        count: 12,
        isPublished: true,
      },
      nearbySibling: {
        title: 'Nearby branch',
        count: 3,
        isPublished: false,
      },
      farAwayBranch: {
        owner: 'Render counter should stay still',
        version: 7,
        isLocked: false,
      },
      listBranch: [
        'first item',
        'second item',
        42,
      ],
    },
  }, {}, { deep: true }), []);
  const handleChange = useMemo(() => createHandleChange(dataExample.doc), [dataExample]);
  const handleRenderDebugChange = useCallback((isRenderDebugEnabledNext) => {
    runInAction(() => {
      dataExample.config.isRenderDebugEnabled = isRenderDebugEnabledNext;
    });
  }, [dataExample]);

  return (
    <div className="json-mobx-example-section">
      <div className="json-mobx-example-title">Render isolation debug</div>
      <div className="json-mobx-example-note">
        Edit or rename editingTarget.title, then check that farAwayBranch values keep their render numbers.
      </div>
      <div className="json-mobx-debug-control">
        <span className="json-mobx-debug-label">Render debug:</span>
        <BoolSlider
          checked={dataExample.config.isRenderDebugEnabled}
          onChange={handleRenderDebugChange}
        />
      </div>
      <div className="json-mobx-example-panel">
        <JsonCompMobx
          data={dataExample.doc}
          isEditable
          isKeyEditable
          isDragMoveEnabled
          isDebug={dataExample.config.isRenderDebugEnabled}
          onChange={handleChange}
        />
      </div>
    </div>
  );
});

JsonMobxRenderDebugExample.displayName = 'JsonMobxRenderDebugExample';

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
  const [isDebug, setIsDebug] = useState(true);
  const [isDragMoveEnabled, setIsDragMoveEnabled] = useState(true);
  const [dragFailureRate, setDragFailureRate] = useState(30);
  const [changeMessage, setChangeMessage] = useState(null);
  const dragFailureRateRef = useRef(dragFailureRate);
  dragFailureRateRef.current = dragFailureRate;
  const dragOperationStore = useMemo(() => createJsonDragOperationStore(), []);
  const selectionOperationStore = useMemo(() => createJsonSelectionOperationStore(), []);
  const selectionExampleData = useMemo(() => makeAutoObservable({
    account: {
      name: 'Alice Smith',
      teams: [
        {
          name: 'Product',
          role: 'owner',
        },
        {
          name: 'Support',
          role: 'reviewer',
        },
      ],
      emptyDict: {},
    },
    tags: ['important', 'verified'],
    archive: [],
  }, {}, { deep: true }), []);
  const handleSelectionExampleChange = useMemo(() => createHandleChange(selectionExampleData), [selectionExampleData]);
  const customValueData = useMemo(() => ({
    title: 'Tool Result',
    status: 'success',
    notes: {
      longText: 'This custom renderer demonstrates getValueComp. The normal JSON tree still comes from JsonCompMobx, but this one primitive value is rendered with a custom component that can show an abbreviated preview and expand inline.',
      shortText: 'Rendered by the default JsonCompMobx string value component.'
    },
    count: 3
  }), []);

  const handleChangeBase = useMemo(() => createHandleChange(observableData), [observableData]);
  const handleChange = useCallback(async (path, changeData) => {
    const actionLabel = getJsonMobxActionLabel(changeData);
    if (changeData?._invalidDrop) {
      const result = { code: -1, message: 'This attempt failed because the drop place is not allowed.' };
      setChangeMessage({
        type: 'error',
        text: `${actionLabel} failed at ${path || 'root'}: ${result.message}`,
      });
      return result;
    }
    const dragFailureRateCurrent = dragFailureRateRef.current;
    if (changeData?._action === 'moveJsonItem' && Math.random() * 100 < dragFailureRateCurrent) {
      const result = { code: -1, message: `Rejected by demo failure rate (${dragFailureRateCurrent}%)` };
      setChangeMessage({
        type: 'error',
        text: `${actionLabel} failed at ${path || 'root'}: ${result.message}`,
      });
      return result;
    }
    const result = await handleChangeBase(path, changeData);
    const isSuccess = !result || result.code === 0;
    setChangeMessage({
      type: isSuccess ? 'success' : 'error',
      text: `${actionLabel} ${isSuccess ? 'accepted' : 'failed'} at ${path || 'root'}: ${result?.message || 'Success'}`,
    });
    return result;
  }, [handleChangeBase]);
  const handleDragFailureRateChange = useCallback((event) => {
    setDragFailureRate(Number(event.target.value));
  }, []);
  const getCustomValueComp = useCallback(({ path, value }) => {
    if (path !== 'notes.longText') return null;
    return <JsonMobxCustomValue path={path} value={value} />;
  }, []);
  const handleEditableChange = useCallback((isEditableNext) => {
    setIsEditable(isEditableNext);
    if (!isEditableNext) {
      setIsDragMoveEnabled(false);
    }
  }, []);

  return (
    <div style={{ maxWidth: '900px', padding: '20px' }}>
      <div style={{ marginBottom: '16px', padding: '12px', background: '#e8f5e9', borderRadius: '3px' }}>
        <strong>MobX-based JSON Component</strong>
        <ul className="json-mobx-guidance-list">
          <li>
            Use <span className="json-mobx-key-chip">Right click</span> on keys, values, or empty containers to open the context menu.
          </li>
          <li>
            Use the menu for type conversion, add, delete, and related edit actions.
          </li>
          <li>
            Use <span className="json-mobx-key-chip">Shift</span> + <span className="json-mobx-key-chip">Click</span> to select, then <span className="json-mobx-key-chip">Shift</span> + drag to move the selected item.
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px' }}>Editable:</span>
          <BoolSlider 
            checked={isEditable}
            onChange={handleEditableChange}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px' }}>Drag move:</span>
          <BoolSlider
            checked={isDragMoveEnabled}
            disabled={!isEditable}
            onChange={setIsDragMoveEnabled}
          />
        </div>
        <div className="json-mobx-drag-failure-control">
          <span className="json-mobx-control-label">Drag Failure Rate:</span>
          <input
            type="range"
            className="json-mobx-drag-failure-slider"
            min="0"
            max="100"
            step="5"
            value={dragFailureRate}
            onChange={handleDragFailureRateChange}
          />
          <span className="json-mobx-drag-failure-value">{dragFailureRate}%</span>
        </div>
      </div>

      <div className={`json-mobx-change-message-bar ${changeMessage ? `is-${changeMessage.type}` : ''}`}>
        {changeMessage?.text || ' '}
      </div>

      <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '3px', marginBottom: '16px' }}>
        <JsonCompMobx 
          data={observableData}
          isEditable={isEditable}
          isKeyEditable={isKeyEditable}
          isDebug={isDebug}
          isDragMoveEnabled={isDragMoveEnabled}
          onChange={handleChange}
        />
      </div>

      <div className="json-selection-demo-panel">
        <JsonCompMobx
          data={selectionExampleData}
          isEditable={false}
          isKeyEditable={false}
          isValueEditable={false}
          onChange={handleSelectionExampleChange}
          dragOperationStore={dragOperationStore}
          isDragMoveEnabled={isDragMoveEnabled}
          selectionOperationStore={selectionOperationStore}
        />
        <JsonMobxSelectionStatus
          dragOperationStore={dragOperationStore}
          selectionOperationStore={selectionOperationStore}
        />
      </div>

      <div className="json-mobx-example-section">
        <strong>Custom primitive value renderer</strong>
        <div className="json-mobx-example-note">
          The path notes.longText is rendered by getValueComp. Other values use the default renderers.
        </div>
        <div className="json-mobx-example-panel">
          <JsonCompMobx
            data={customValueData}
            isEditable={false}
            isKeyEditable={false}
            isValueEditable={false}
            getValueComp={getCustomValueComp}
          />
        </div>
      </div>

      <JsonMobxRenderDebugExample />

      <div style={{ marginTop: '0', padding: '10px 12px', background: '#fff3e0', border: '1px solid #ff9800', borderRadius: '2px', fontSize: '12px' }}>
        <strong>Features:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>
          <li><strong>Fine-grained reactivity:</strong> Only components that read changed properties re-render</li>
          <li><strong>Editing:</strong> Click on values to edit (strings, numbers); click booleans to toggle; click keys to rename</li>
          <li><strong>Right-click menu:</strong> Type conversion, add/delete entries/items, view raw JSON, and more</li>
          <li><strong>Pseudo items:</strong> Right-click and select "Add entry/item" for interactive creation</li>
          <li><strong>Debug mode:</strong> Shows render counts - only changed values increment (not siblings!)</li>
          <li><strong>Selection:</strong> Shift-click a list item or object entry to select it; repeat shift-click to expand selection upward</li>
          <li><strong>Drag move:</strong> Enable the Drag move slider, shift-click an item, then hold Shift and drag it to a valid list or object target</li>
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
