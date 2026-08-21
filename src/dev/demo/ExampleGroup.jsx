import { Children, useContext, useEffect, useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import ExternalLinkIcon from '../../icon/ExternalLinkIcon.jsx';
import {
  DemoPanelContext,
  ExampleGroupContext,
  ExplanationPlainContext,
  createStoreExampleGroup,
  useDemoEventDispatch,
} from './demoStores.js';
import './DemoLayout.css';

// ExampleGroup: panel containing multiple examples that naturally form a group.
// Typical children: <Explanation> <Controls> <ExampleSwitcher>/<ExampleStackVertical>.
// Accepts an optional store (created via createStoreExampleGroup); creates its
// own if absent. Registers itself on the DemoPanel store, so jump requests
// targeting this group's examples can be resolved from anywhere on the page.
const ExampleGroup = ({ title, groupId, store, children }) => {
  const storeOwn = useMemo(() => (store ? null : createStoreExampleGroup({ groupId })), [store, groupId]);
  const storeGroup = store || storeOwn;
  const panelContext = useContext(DemoPanelContext);
  const storePanel = panelContext?.storePanel;
  const elRef = useRef(null);

  useEffect(() => {
    if (!storePanel) return undefined;
    storePanel.groupRegister(storeGroup, elRef.current);
    return () => storePanel.groupUnregister(storeGroup);
  }, [storePanel, storeGroup]);

  return (
    <ExampleGroupContext.Provider value={storeGroup}>
      <ExplanationPlainContext.Provider value={true}>
        <section ref={elRef} className="demo-example-group">
          {title ? <div className="demo-example-title">{title}</div> : null}
          <div className="demo-example-body">{children}</div>
        </section>
      </ExplanationPlainContext.Provider>
    </ExampleGroupContext.Provider>
  );
};

// ExampleSwitcher: shows exactly one child example at a time.
// Each child must carry an exampleId prop, and optionally labelText for switch buttons.
// All children stay mounted, stacked on the same grid cell; inactive ones are
// visibility-hidden, so the switcher keeps a stable height (no jitter on switch).
const ExampleSwitcher = observer(({ children }) => {
  const storeGroup = useContext(ExampleGroupContext);
  const childList = Children.toArray(children);
  const exampleList = childList.map((child, index) => ({
    id: String(child.props?.exampleId ?? index),
    labelText: String(child.props?.labelText ?? child.props?.title ?? child.props?.exampleId ?? `Example ${index + 1}`),
  }));
  const exampleListKey = exampleList.map((exampleMeta) => `${exampleMeta.id}:${exampleMeta.labelText}`).join('|');

  useEffect(() => {
    storeGroup?.exampleListSet(exampleList);
    // exampleListKey covers content of exampleList
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeGroup, exampleListKey]);

  return (
    <div className="demo-example-switcher">
      {childList.map((child, index) => {
        const exampleId = exampleList[index].id;
        const isActive = exampleId === storeGroup?.exampleActiveId;
        return (
          <div key={exampleId} className={`demo-example-switcher-slot${isActive ? ' is-active' : ''}`}>
            {child}
          </div>
        );
      })}
    </div>
  );
});

// ExampleSwitchButtons: one button per example registered in the group store.
// Usually placed inside <Controls> of the ExampleGroup. Clicks are emitted as
// exampleJumpRequest events, handled by the group store.
const ExampleSwitchButtons = observer(() => {
  const storeGroup = useContext(ExampleGroupContext);
  const dispatch = useDemoEventDispatch();
  if (!storeGroup) return null;
  return (
    <div className="demo-example-switch-buttons">
      {storeGroup.exampleList.map((exampleMeta) => (
        <button
          key={exampleMeta.id}
          type="button"
          className={`demo-button${exampleMeta.id === storeGroup.exampleActiveId ? ' is-active' : ''}`}
          onClick={() => dispatch('exampleJumpRequest', { exampleId: exampleMeta.id })}
        >
          {exampleMeta.labelText}
        </button>
      ))}
    </div>
  );
});

// ExampleJumpLink: inline reference inside Explanation text, like a citation
// link in an article. Clicking it emits an exampleJumpRequest event:
//   data: { exampleId, groupId?, pageKey? }
//   config: { titleText? }
//   onEvent: optional override; by default the event bubbles through the demo
//     event system (group store -> panel store -> DemoPanel onEvent).
// Targets in the nearest group switch in place; targets in other groups or
// standalone examples are activated and scrolled to by the panel store.
const ExampleJumpLink = observer(({ data = {}, config = {}, onEvent, children }) => {
  const storeGroup = useContext(ExampleGroupContext);
  const panelContext = useContext(DemoPanelContext);
  const dispatchDefault = useDemoEventDispatch();
  const dispatch = onEvent || dispatchDefault;
  const exampleId = data.exampleId;
  const groupId = data.groupId || '';

  let isActive = false;
  if (storeGroup && (!groupId || groupId === storeGroup.groupId) && storeGroup.exampleHas(exampleId)) {
    isActive = storeGroup.exampleActiveId === exampleId;
  } else if (panelContext?.storePanel) {
    isActive = panelContext.storePanel.isExampleActive(exampleId, groupId);
  }

  return (
    <button
      type="button"
      className={`demo-example-jump-link${isActive ? ' is-active' : ''}`}
      title={config.titleText || 'Jump to this example'}
      onClick={() => dispatch('exampleJumpRequest', { exampleId, groupId, pageKey: data.pageKey })}
    >
      {children}
      <ExternalLinkIcon width={10} height={10} />
    </button>
  );
});

// ExampleStackVertical: stacks examples vertically inside a group, allowing
// Explanation blocks to be interleaved between them (introduce while giving examples).
const ExampleStackVertical = ({ children }) => (
  <ExplanationPlainContext.Provider value={true}>
    <div className="demo-example-stack">{children}</div>
  </ExplanationPlainContext.Provider>
);

export {
  ExampleGroup,
  ExampleSwitcher,
  ExampleSwitchButtons,
  ExampleJumpLink,
  ExampleStackVertical,
  createStoreExampleGroup,
};
