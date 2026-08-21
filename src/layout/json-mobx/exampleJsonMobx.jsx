import { useMemo } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import JsonCompMobx, { createJsonCompMobxStore, createJsonOnEventAdapter } from './JsonCompMobx';
import BoolSlider from '../../component/button/BoolSlider';
import { createHandleChange } from './exampleHandleChange';
import { createStoreJsonMobxExample } from './exampleJsonMobxStore.js';
import {
  DemoPanel,
  Example,
  Explanation,
  KeyChip,
  Controls,
  ControlItem,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';

const JsonMobxExamplesPanel = observer(() => {
  const storeExample = useMemo(() => createStoreJsonMobxExample(), []);

  return (
    <DemoPanel>
      <Explanation titleText="MobX-based JSON Component">
        <ul>
          <li>
            Use <KeyChip>Right click</KeyChip> on keys, values, or empty containers to open the context menu.
          </li>
          <li>
            Use the menu for type conversion, add, delete, and related edit actions.
          </li>
          <li>
            Use <KeyChip>Shift</KeyChip> + <KeyChip>Click</KeyChip> to select, then <KeyChip>Shift</KeyChip> + drag to move the selected item.
          </li>
        </ul>
      </Explanation>

      <JsonMobxMainExample store={storeExample} />
      <JsonMobxSelectionExample store={storeExample} />
      <JsonMobxCustomValueExample />
      <JsonMobxRenderDebugExample />

      <Explanation tone="amber" titleText="Features">
        <ul>
          <li><strong>Fine-grained reactivity:</strong> Only components that read changed properties re-render</li>
          <li><strong>Editing:</strong> Click on values to edit (strings, numbers); click booleans to toggle; click keys to rename</li>
          <li><strong>Right-click menu:</strong> Type conversion, add/delete entries/items, view raw JSON, and more</li>
          <li><strong>Pseudo items:</strong> Right-click and select Add entry/item for interactive creation</li>
          <li><strong>Debug mode:</strong> Shows render counts - only changed values increment (not siblings!)</li>
          <li><strong>Selection:</strong> Shift-click a list item or object entry to select it; repeat shift-click to expand selection upward</li>
          <li><strong>Drag move:</strong> Enable the Drag move slider, shift-click an item, then hold Shift and drag it to a valid list or object target</li>
          <li><strong>Stable keys:</strong> Array items maintain identity across operations</li>
        </ul>
      </Explanation>
    </DemoPanel>
  );
});

JsonMobxExamplesPanel.displayName = 'JsonMobxExamplesPanel';

const getJsonMobxActionLabel = (changeData) => {
  if (changeData?._action === 'moveJsonItem') return 'Drag move';
  if (changeData?._action) return changeData._action;
  if (changeData?._keyRename) return 'Key rename';
  return 'Value edit';
};

// Main editable tree; ui control state and change message live in the example store.
const JsonMobxMainExample = observer(({ store }) => {
  const observableData = useMemo(() => makeAutoObservable({
    user: {
      id: 123,
      name: 'Alice Smith',
      email: 'alice@example.com',
      roles: ['admin', 'editor'],
      settings: {
        theme: 'dark',
        notifications: {
          email: true,
          push: false,
        },
      },
    },
    tags: ['important', 'verified'],
    metadata: {
      views: 1234,
      published: true,
    },
  }, {}, { deep: true }), []);

  const handleChangeBase = useMemo(() => createHandleChange(observableData), [observableData]);
  const handleOnEvent = useMemo(() => async (eventType, eventData) => {
    const { path, changeData } = eventData;
    const actionLabel = getJsonMobxActionLabel(changeData);
    if (changeData?._invalidDrop) {
      const result = { code: -1, message: 'This attempt failed because the drop place is not allowed.' };
      store.changeMessageSet('error', `${actionLabel} failed at ${path || 'root'}: ${result.message}`);
      return result;
    }
    const dragFailureRate = store.config.dragFailureRate;
    if (changeData?._action === 'moveJsonItem' && Math.random() * 100 < dragFailureRate) {
      const result = { code: -1, message: `Rejected by demo failure rate (${dragFailureRate}%)` };
      store.changeMessageSet('error', `${actionLabel} failed at ${path || 'root'}: ${result.message}`);
      return result;
    }
    const result = await handleChangeBase(path, changeData);
    const isSuccess = !result || result.code === 0;
    store.changeMessageSet(
      isSuccess ? 'success' : 'error',
      `${actionLabel} ${isSuccess ? 'accepted' : 'failed'} at ${path || 'root'}: ${result?.message || 'Success'}`,
    );
    return result;
  }, [store, handleChangeBase]);

  return (
    <Example title="Editable JSON tree">
      <Controls>
        <ControlItem labelText="Editable:">
          <BoolSlider
            checked={store.config.isEditable}
            onChange={store.editableSet}
          />
        </ControlItem>
        <ControlItem labelText="Key editable:">
          <BoolSlider
            checked={store.config.isKeyEditable}
            onChange={store.keyEditableSet}
          />
        </ControlItem>
        <ControlItem labelText="Debug mode:">
          <BoolSlider
            checked={store.config.isDebug}
            onChange={store.debugSet}
          />
        </ControlItem>
        <ControlItem labelText="Drag move:">
          <BoolSlider
            checked={store.config.isDragMoveEnabled}
            disabled={!store.config.isEditable}
            onChange={store.dragMoveSet}
          />
        </ControlItem>
        <ControlItem labelText="Drag Failure Rate:">
          <input
            type="range"
            className="json-mobx-drag-failure-slider"
            min="0"
            max="100"
            step="5"
            value={store.config.dragFailureRate}
            onChange={(event) => store.dragFailureRateSet(event.target.value)}
          />
          <span className="json-mobx-drag-failure-value">{store.config.dragFailureRate}%</span>
        </ControlItem>
      </Controls>
      <CompDemoArea>
        <JsonCompMobx
          data={observableData}
          config={{
            isEditable: store.config.isEditable,
            isKeyEditable: store.config.isKeyEditable,
            isDebug: store.config.isDebug,
            isDragMoveEnabled: store.config.isDragMoveEnabled,
            compId: 'json-mobx-main-demo',
          }}
          onEvent={handleOnEvent}
        />
      </CompDemoArea>
      <MessageAndOutputs>
        <div className={`json-mobx-change-message-bar ${store.changeMessage ? `is-${store.changeMessage.type}` : ''}`} style={{ flex: 1, marginBottom: 0 }}>
          {store.changeMessage?.text || ' '}
        </div>
      </MessageAndOutputs>
    </Example>
  );
});

JsonMobxMainExample.displayName = 'JsonMobxMainExample';

const JsonMobxSelectionStatus = observer(({ store }) => {
  const { itemSelectedMeta, isSelectionActive } = store.selection;
  const statusText = isSelectionActive && itemSelectedMeta
    ? `${itemSelectedMeta.itemKind}: ${itemSelectedMeta.path || itemSelectedMeta.label}`
    : 'No selection';
  const dragText = store.drag.isDragging && store.drag.itemDraggedMeta
    ? `${store.drag.itemDraggedMeta.itemKind}: ${store.drag.itemDraggedMeta.path}`
    : 'No drag';

  return (
    <div className="json-selection-status-line">
      <span> Current selection: {statusText}</span>
      <span> Drag: {dragText}</span>
    </div>
  );
});

// Read-only tree exposing selection/drag state via a JsonCompMobx store instance.
// The drag move flag is shared with the main example through the example store.
const JsonMobxSelectionExample = observer(({ store }) => {
  const selectionDemoStore = useMemo(() => createJsonCompMobxStore({ compId: 'json-mobx-selection-demo' }), []);
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
  const handleSelectionOnEvent = useMemo(
    () => createJsonOnEventAdapter(handleSelectionExampleChange),
    [handleSelectionExampleChange]
  );

  return (
    <Example title="Selection and drag state">
      <Explanation>
        This tree is not value-editable; <KeyChip>Shift</KeyChip> + <KeyChip>Click</KeyChip> to select, and the selection/drag state below comes from the component store.
      </Explanation>
      <CompDemoArea>
        <JsonCompMobx
          data={selectionExampleData}
          store={selectionDemoStore}
          config={{
            isEditable: false,
            isKeyEditable: false,
            isValueEditable: false,
            isDragMoveEnabled: store.config.isDragMoveEnabled,
            compId: 'json-mobx-selection-demo',
          }}
          onEvent={handleSelectionOnEvent}
        />
      </CompDemoArea>
      <MessageAndOutputs>
        <JsonMobxSelectionStatus store={selectionDemoStore} />
      </MessageAndOutputs>
    </Example>
  );
});

JsonMobxSelectionExample.displayName = 'JsonMobxSelectionExample';

const JsonMobxCustomValue = observer(({ path, value, stateExpand }) => {
  const isExpanded = stateExpand.isExpanded;
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
          onClick={() => runInAction(() => { stateExpand.isExpanded = !stateExpand.isExpanded; })}
        >
          {isExpanded ? 'Collapse' : 'Show full'}
        </button>
      ) : null}
      <span className="json-mobx-custom-value-path">{path}</span>
    </span>
  );
});

const JsonMobxCustomValueExample = () => {
  const stateExpand = useMemo(() => makeAutoObservable({ isExpanded: false }), []);
  const customValueData = useMemo(() => ({
    title: 'Tool Result',
    status: 'success',
    notes: {
      longText: 'This custom renderer demonstrates getValueComp. The normal JSON tree still comes from JsonCompMobx, but this one primitive value is rendered with a custom component that can show an abbreviated preview and expand inline.',
      shortText: 'Rendered by the default JsonCompMobx string value component.',
    },
    count: 3,
  }), []);
  const getCustomValueComp = useMemo(() => ({ path, value }) => {
    if (path !== 'notes.longText') return null;
    return <JsonMobxCustomValue path={path} value={value} stateExpand={stateExpand} />;
  }, [stateExpand]);

  return (
    <Example title="Custom primitive value renderer">
      <Explanation>
        The path notes.longText is rendered by getValueComp. Other values use the default renderers.
      </Explanation>
      <CompDemoArea>
        <JsonCompMobx
          data={customValueData}
          config={{
            isEditable: false,
            isKeyEditable: false,
            isValueEditable: false,
            getValueComp: getCustomValueComp,
            compId: 'json-mobx-custom-value-demo',
          }}
        />
      </CompDemoArea>
    </Example>
  );
};

JsonMobxCustomValueExample.displayName = 'JsonMobxCustomValueExample';

const JsonMobxRenderDebugControls = observer(({ dataExample, onRenderDebugChange }) => (
  <ControlItem labelText="Render debug:">
    <BoolSlider
      checked={dataExample.config.isRenderDebugEnabled}
      onChange={onRenderDebugChange}
    />
  </ControlItem>
));

JsonMobxRenderDebugControls.displayName = 'JsonMobxRenderDebugControls';

const JsonMobxRenderDebugPanel = ({ doc, isDebug, baseConfig, handleOnEvent }) => {
  const jsonConfig = useMemo(() => ({
    ...baseConfig,
    isDebug,
  }), [baseConfig, isDebug]);

  return (
    <JsonCompMobx
      data={doc}
      config={jsonConfig}
      onEvent={handleOnEvent}
    />
  );
};

JsonMobxRenderDebugPanel.displayName = 'JsonMobxRenderDebugPanel';

const JsonMobxRenderDebugPanelWrap = observer(({ dataExample, baseConfig, handleOnEvent }) => (
  <JsonMobxRenderDebugPanel
    doc={dataExample.doc}
    isDebug={dataExample.config.isRenderDebugEnabled}
    baseConfig={baseConfig}
    handleOnEvent={handleOnEvent}
  />
));

JsonMobxRenderDebugPanelWrap.displayName = 'JsonMobxRenderDebugPanelWrap';

const JsonMobxRenderDebugExample = () => {
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
  const baseConfig = useMemo(() => ({
    isEditable: true,
    isKeyEditable: true,
    isDragMoveEnabled: true,
    compId: 'json-mobx-render-debug',
  }), []);
  const handleChange = useMemo(() => createHandleChange(dataExample.doc), [dataExample]);
  const handleOnEvent = useMemo(() => createJsonOnEventAdapter(handleChange), [handleChange]);
  const handleRenderDebugChange = useMemo(() => (isRenderDebugEnabledNext) => {
    runInAction(() => {
      dataExample.config.isRenderDebugEnabled = isRenderDebugEnabledNext;
    });
  }, [dataExample]);

  return (
    <Example title="Render isolation debug">
      <Explanation>
        Edit or rename editingTarget.title, then check that farAwayBranch values keep their render numbers.
      </Explanation>
      <Controls>
        <JsonMobxRenderDebugControls
          dataExample={dataExample}
          onRenderDebugChange={handleRenderDebugChange}
        />
      </Controls>
      <CompDemoArea>
        <JsonMobxRenderDebugPanelWrap
          dataExample={dataExample}
          baseConfig={baseConfig}
          handleOnEvent={handleOnEvent}
        />
      </CompDemoArea>
    </Example>
  );
};

JsonMobxRenderDebugExample.displayName = 'JsonMobxRenderDebugExample';

export const jsonMobxExamples = {
  JsonCompMobx: {
    component: JsonCompMobx,
    description: 'MobX-based JSON editor with automatic dependency tracking and in-place mutations',
    example: JsonMobxExamplesPanel,
  },
};

export default JsonMobxExamplesPanel;
