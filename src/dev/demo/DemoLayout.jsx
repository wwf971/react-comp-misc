import { useContext, useEffect, useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { DemoPanelContext, ExampleGroupContext, ExplanationPlainContext, createStoreDemoPanel, createStoreJsonDisplay } from './demoStores.js';
import './DemoLayout.css';

// DemoPanel: root container of one dev page entry.
// Stacks global Explanation blocks and Example/ExampleGroup panels vertically.
// Holds a StoreDemoPanel resolving jump requests that groups cannot handle;
// events unhandled by the panel store bubble to the onEvent prop.
const DemoPanel = ({ store, onEvent, children }) => {
  const storeOwn = useMemo(() => (store ? null : createStoreDemoPanel()), [store]);
  const storePanel = store || storeOwn;
  const contextValue = useMemo(() => ({ storePanel, onEvent }), [storePanel, onEvent]);
  return (
    <DemoPanelContext.Provider value={contextValue}>
      <div className="demo-panel">{children}</div>
    </DemoPanelContext.Provider>
  );
};

// Example: one visually isolated panel demonstrating one component/behavior.
// Typical children order: <Explanation> <Controls> <CompDemoArea> <MessageAndOutputs>.
// When placed inside ExampleSwitcher/ExampleStackVertical, the panel border is
// flattened by css to avoid card-in-card-in-card nesting.
// An exampleId on an example placed directly under DemoPanel registers it as a
// jump target; examples inside a group are jump targets through the group store.
const Example = ({ title, exampleId, children }) => {
  const elRef = useRef(null);
  const panelContext = useContext(DemoPanelContext);
  const storeGroup = useContext(ExampleGroupContext);
  const storePanel = panelContext?.storePanel;

  useEffect(() => {
    if (!exampleId || !storePanel || storeGroup) return undefined;
    storePanel.exampleRegister(exampleId, elRef.current);
    return () => storePanel.exampleUnregister(exampleId);
  }, [exampleId, storePanel, storeGroup]);

  return (
    <ExplanationPlainContext.Provider value={true}>
      <section ref={elRef} className="demo-example">
        {title ? <div className="demo-example-title">{title}</div> : null}
        <div className="demo-example-body">{children}</div>
      </section>
    </ExplanationPlainContext.Provider>
  );
};

// Explanation: introduction/usage notes. Content is plain text for one-liners,
// or ul/li/strong for lists, styled by css.
// tone applies only at DemoPanel top level: 'green'(default) | 'amber' | 'plain'.
// Inside Example, ExampleGroup, or ExampleStackVertical, tone is ignored.
const Explanation = ({ titleText, tone = 'green', children }) => {
  const isPlain = useContext(ExplanationPlainContext);
  const className = isPlain ? 'demo-explanation' : `demo-explanation tone-${tone}`;
  return (
    <div className={className}>
      {titleText ? <strong className="demo-explanation-title">{titleText}</strong> : null}
      {children}
    </div>
  );
};

// KeyChip: inline chip for keyboard keys/mouse actions inside Explanation text.
const KeyChip = ({ children }) => (
  <span className="demo-key-chip">{children}</span>
);

// Controls: row of ui controls manipulating the demonstrated component.
// Overflow content wraps to the next row (no horizontal scrolling).
const Controls = ({ children }) => (
  <div className="demo-controls">{children}</div>
);

// ControlGroup: labeled group of controls, styled after Toolbar groups.
const ControlGroup = ({ labelText, children }) => (
  <div className="demo-control-group">
    {labelText ? <span className="demo-control-group-label">{labelText}</span> : null}
    <div className="demo-control-group-content">{children}</div>
  </div>
);

// ControlItem: one label + one control (e.g. a BoolSlider) placed inline.
const ControlItem = ({ labelText, children }) => (
  <span className="demo-control-item">
    {labelText ? <span className="demo-control-item-label">{labelText}</span> : null}
    {children}
  </span>
);

// CompDemoArea: the area holding the demonstrated component itself.
// Optional footText renders a short note under the component, inside the area.
const CompDemoArea = ({ footText, children }) => (
  <div className="demo-comp-area">
    {children}
    {footText ? <div className="demo-comp-area-foot">{footText}</div> : null}
  </div>
);

// MessageAndOutputs: selectable area for change messages, action logs, state dumps.
const MessageAndOutputs = ({ labelText, children }) => (
  <div className="demo-message-outputs">
    {labelText ? <span className="demo-message-outputs-label">{labelText}</span> : null}
    <div className="demo-message-outputs-content">{children}</div>
  </div>
);

// JsonDisplay: standard block for showing json data (state dumps, payloads),
// typically inside MessageAndOutputs. Pass the value itself via the data prop;
// the component stringifies and renders it in the unified sans-serif style.
// config sets the initial display state: { indentSize, isCollapsed }.
// The controls in the top right corner switch pretty/one-line mode and tune
// the indent width; this ui state lives in a StoreJsonDisplay, created locally
// when the store prop is absent. Accepted changes are reported through onEvent.
const JsonDisplay = observer(({ data, config = {}, store, onEvent }) => {
  const storeOwn = useMemo(
    () => (store ? null : createStoreJsonDisplay({ indentSize: config.indentSize, isCollapsed: config.isCollapsed })),
    [store],
  );
  const storeUsed = store || storeOwn;
  const controlEventHandle = (eventType, eventData = {}) => {
    const result = storeUsed.handleEvent(eventType, eventData);
    if (result.code === 0) onEvent?.(eventType, eventData);
    return result;
  };
  const jsonText = storeUsed.isCollapsed
    ? JSON.stringify(data)
    : JSON.stringify(data, null, storeUsed.indentSize);
  return (
    <div className="demo-json-display">
      <div className="demo-json-display-controls">
        <button
          type="button"
          className={`demo-json-display-control-button${storeUsed.isCollapsed ? '' : ' is-active'}`}
          title="Pretty print with indent"
          onClick={() => controlEventHandle('jsonCollapsedSet', { isCollapsed: false })}
        >
          pretty
        </button>
        <button
          type="button"
          className={`demo-json-display-control-button${storeUsed.isCollapsed ? ' is-active' : ''}`}
          title="Collapse to one line"
          onClick={() => controlEventHandle('jsonCollapsedSet', { isCollapsed: true })}
        >
          1 line
        </button>
        <span className="demo-json-display-indent">
          <span className="demo-json-display-indent-label">indent</span>
          <button
            type="button"
            className="demo-json-display-control-button"
            title="Decrease indent"
            disabled={storeUsed.isCollapsed || storeUsed.indentSize <= 1}
            onClick={() => controlEventHandle('jsonIndentSizeSet', { indentSize: storeUsed.indentSize - 1 })}
          >
            -
          </button>
          <span className={`demo-json-display-indent-count${storeUsed.isCollapsed ? ' is-disabled' : ''}`}>
            {storeUsed.indentSize}
          </span>
          <button
            type="button"
            className="demo-json-display-control-button"
            title="Increase indent"
            disabled={storeUsed.isCollapsed || storeUsed.indentSize >= 8}
            onClick={() => controlEventHandle('jsonIndentSizeSet', { indentSize: storeUsed.indentSize + 1 })}
          >
            +
          </button>
        </span>
      </div>
      <pre className="demo-json-display-text">{jsonText}</pre>
    </div>
  );
});

export {
  DemoPanel,
  Example,
  Explanation,
  KeyChip,
  Controls,
  ControlGroup,
  ControlItem,
  CompDemoArea,
  MessageAndOutputs,
  JsonDisplay,
};
