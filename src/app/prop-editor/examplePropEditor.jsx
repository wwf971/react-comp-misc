import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import FolderIcon from '../../icon/FolderIcon.jsx';
import FileIcon from '../../icon/FileIcon.jsx';
import PropEditor from './PropEditor.jsx';
import { createPropEditorDemoStore } from './propEditorStore.js';
import {
  DemoPanel,
  Example,
  Explanation,
  Controls,
  CompDemoArea,
  MessageAndOutputs,
  JsonDisplay,
} from '../../dev/demo/DemoLayout.jsx';
import { ExampleGroup, ExampleStackVertical } from '../../dev/demo/ExampleGroup.jsx';
import './examplePropEditor.css';

const DemoCustomItem = observer(function DemoCustomItem({ data = {}, config = {}, onEvent }) {
  return (
    <div className="demo-prop-editor-custom-item">
      <span className="demo-prop-editor-custom-main">
        <strong>{data.label}</strong>
        <small>{data.detail}</small>
      </span>
      <button type="button" disabled={config.isReadOnly === true} onClick={() => onEvent?.('toggle', {})}>
        {data.isEnabled ? 'Enabled' : 'Disabled'}
      </button>
    </div>
  );
});

function DemoHeaderAction({ data = {}, config = {}, onEvent }) {
  return (
    <button
      type="button"
      className="demo-prop-editor-header-action"
      disabled={config.isReadOnly === true}
      onClick={() => onEvent?.('activate', {})}
    >
      {data.label || 'Action'}
    </button>
  );
}

function DemoInspectIcon({ width = 13, height = 13, className = '' }) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DemoLeadingFlag({ data = {}, config = {}, onEvent }) {
  return (
    <button
      type="button"
      className={`demo-prop-editor-leading-flag ${data.isActive ? 'is-active' : ''}`.trim()}
      disabled={config.isReadOnly === true}
      title={data.isActive ? 'Marked' : 'Not marked'}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onEvent?.('toggle', {});
      }}
    >
      {data.label || '*'}
    </button>
  );
}

const compByName = {
  folder: FolderIcon,
  file: FileIcon,
  demoCustomItem: DemoCustomItem,
  demoHeaderAction: DemoHeaderAction,
  demoInspectIcon: DemoInspectIcon,
  demoLeadingFlag: DemoLeadingFlag,
};

function offsetXByFieldByPropertyIdGet(propertyById) {
  const offsetXByFieldByPropertyId = {};
  Object.entries(propertyById ?? {}).forEach(([propertyId, property]) => {
    if (property?.uiState?.offsetXByField) {
      offsetXByFieldByPropertyId[propertyId] = property.uiState.offsetXByField;
    }
  });
  return offsetXByFieldByPropertyId;
}

const DemoPropEditorSection = observer(function DemoPropEditorSection({ store, example }) {
  const editorConfig = { ...example.config, getComp: (compName) => compByName[compName] ?? null };
  const embeddedWidth = editorConfig.embeddedWidth ?? 340;
  const offsetXByFieldByPropertyId = offsetXByFieldByPropertyIdGet(example.data.propertyById);
  const isOffsetShown = Object.keys(offsetXByFieldByPropertyId).length > 0;

  return (
    <Example title={example.label}>
      <Explanation>{example.description}</Explanation>
      <Controls>
        <button type="button" className="demo-button" onClick={() => store.popupOpen(example.id)}>
          Open draggable popup
        </button>
      </Controls>
      <CompDemoArea>
        <div className="demo-prop-editor-root">
          <div className="demo-prop-editor-embedded" style={{ width: `min(${embeddedWidth}px, 100%)` }}>
            <PropEditor
              data={example.data}
              config={editorConfig}
              onEvent={(eventType, eventData) => store.handleEditorEvent(eventType, eventData, example.id)}
            />
          </div>
          {example.secondaryData ? (
            <div className="demo-prop-editor-secondary">
              <div className="demo-prop-editor-secondary-desc">{example.secondaryDescription}</div>
              <div
                className="demo-prop-editor-embedded"
                style={{ width: `min(${example.secondaryConfig?.embeddedWidth ?? embeddedWidth}px, 100%)` }}
              >
                <PropEditor
                  data={example.secondaryData}
                  config={{ ...example.secondaryConfig, getComp: (compName) => compByName[compName] ?? null }}
                  onEvent={(eventType, eventData) => store.handleSecondaryEditorEvent(eventType, eventData, example.id)}
                />
              </div>
            </div>
          ) : null}
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{example.messageText}</span>
        {isOffsetShown ? <JsonDisplay data={offsetXByFieldByPropertyId} /> : null}
      </MessageAndOutputs>
    </Example>
  );
});

const DemoPropEditor = observer(function DemoPropEditor({ store }) {
  const storeOwn = useMemo(() => (store ? null : createPropEditorDemoStore()), [store]);
  const storeUsed = store || storeOwn;
  const popupExample = storeUsed.popupExample;
  const popupConfig = { ...popupExample.config, getComp: (compName) => compByName[compName] ?? null };
  const popupTitleText = popupConfig.titleText ?? popupExample.data.titleText ?? 'Prop Editor';
  const popupWidth = popupConfig.popupWidth ?? 320;

  useEffect(() => {
    const move = (event) => storeUsed.dragMove(event.clientX, event.clientY);
    const up = () => storeUsed.dragEnd();
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [storeUsed]);

  return (
    <DemoPanel>
      <Explanation titleText="Prop Editor">
        Data-driven property editor with tabs, groups, and typed value editors.
      </Explanation>
      <ExampleGroup title="Layouts">
        <ExampleStackVertical>
          {storeUsed.exampleList.map((example) => (
            <DemoPropEditorSection key={example.id} store={storeUsed} example={example} />
          ))}
        </ExampleStackVertical>
      </ExampleGroup>
      {storeUsed.isPopupShown ? (
        <div
          className="demo-prop-editor-popup"
          style={{ left: `${storeUsed.popupPos.x}px`, top: `${storeUsed.popupPos.y}px`, width: `min(${popupWidth}px, calc(100vw - 24px))` }}
        >
          <div
            className="demo-prop-editor-popup-title"
            onMouseDown={(event) => storeUsed.dragBegin(event.clientX, event.clientY)}
          >
            <span className="demo-prop-editor-popup-title-text">{popupTitleText}</span>
            <button type="button" className="demo-prop-editor-popup-close" onClick={storeUsed.popupClose}>Close</button>
          </div>
          <PropEditor
            data={popupExample.data}
            config={popupConfig}
            onEvent={(eventType, eventData) => storeUsed.handleEditorEvent(eventType, eventData, popupExample.id)}
          />
        </div>
      ) : null}
    </DemoPanel>
  );
});

export const propEditorExamples = {
  'Prop Editor': {
    component: null,
    description: 'Data-driven property editor with tabs, groups, and typed value editors',
    example: DemoPropEditor,
  },
};

export default DemoPropEditor;
