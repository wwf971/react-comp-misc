import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import FolderIcon from '../../icon/FolderIcon.jsx';
import FileIcon from '../../icon/FileIcon.jsx';
import PropEditor from './PropEditor.jsx';
import { createPropEditorDemoStore } from './propEditorStore.js';
import './examplePropEditor.css';

const compByName = {
  folder: FolderIcon,
  file: FileIcon,
};

const DemoPropEditor = observer(() => {
  const store = useMemo(() => createPropEditorDemoStore(), []);
  const exampleSelected = store.exampleSelected;
  const editorConfig = { ...exampleSelected.config, getComp: (compName) => compByName[compName] ?? null };
  const titleText = editorConfig.titleText ?? exampleSelected.data.titleText ?? 'Prop Editor';
  const popupWidth = editorConfig.popupWidth ?? 320;
  const embeddedWidth = editorConfig.embeddedWidth ?? 340;

  useEffect(() => {
    const move = (event) => store.dragMove(event.clientX, event.clientY);
    const up = () => store.dragEnd();
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [store]);

  return (
    <div className="demo-prop-editor-root">
      <div className="demo-prop-editor-switcher">
        {store.exampleList.map((example) => (
          <button
            key={example.id}
            type="button"
            className={`demo-prop-editor-example-btn ${example.id === store.exampleSelectedId ? 'is-selected' : ''}`}
            onClick={() => store.selectExample(example.id)}
          >
            {example.label}
          </button>
        ))}
      </div>

      <div className="demo-prop-editor-desc">{exampleSelected.description}</div>
      <div className="demo-prop-editor-message">{store.messageText}</div>

      <div className="demo-prop-editor-actions">
        <button type="button" onClick={store.popupOpen}>Open draggable popup</button>
      </div>

      <div className="demo-prop-editor-embedded" style={{ width: `min(${embeddedWidth}px, 100%)` }}>
        <PropEditor data={exampleSelected.data} config={editorConfig} onEvent={store.handleEditorEvent} />
      </div>

      {exampleSelected.secondaryData ? (
        <div className="demo-prop-editor-secondary">
          <div className="demo-prop-editor-secondary-desc">{exampleSelected.secondaryDescription}</div>
          <div
            className="demo-prop-editor-embedded"
            style={{ width: `min(${exampleSelected.secondaryConfig?.embeddedWidth ?? embeddedWidth}px, 100%)` }}
          >
            <PropEditor
              data={exampleSelected.secondaryData}
              config={{ ...exampleSelected.secondaryConfig, getComp: (compName) => compByName[compName] ?? null }}
              onEvent={store.handleSecondaryEditorEvent}
            />
          </div>
        </div>
      ) : null}

      {store.isPopupShown ? (
        <div
          className="demo-prop-editor-popup"
          style={{ left: `${store.popupPos.x}px`, top: `${store.popupPos.y}px`, width: `min(${popupWidth}px, calc(100vw - 24px))` }}
        >
          <div
            className="demo-prop-editor-popup-title"
            onMouseDown={(event) => store.dragBegin(event.clientX, event.clientY)}
          >
            <span className="demo-prop-editor-popup-title-text">{titleText}</span>
            <button type="button" className="demo-prop-editor-popup-close" onClick={store.popupClose}>Close</button>
          </div>
          <PropEditor data={exampleSelected.data} config={editorConfig} onEvent={store.handleEditorEvent} />
        </div>
      ) : null}
    </div>
  );
});

export const propEditorExamples = {
  'Prop Editor': {
    component: null,
    description: 'Data-driven property editor with tabs, groups, and typed value editors',
    example: () => <DemoPropEditor />,
  },
};

export default DemoPropEditor;
