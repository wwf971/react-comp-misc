import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import ScrollHorizontal from '../scroll-horizontal/ScrollHorizontal.jsx';
import Toolbar from './Toolbar.jsx';
import { createStoreToolbarExample } from './exampleToolbarStore.js';
import { createStoreScrollHorizontalExample } from '../scroll-horizontal/exampleScrollHorizontalStore.js';
import {
  DemoPanel,
  Example,
  Explanation,
  Controls,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
import {
  ExampleGroup,
  ExampleSwitcher,
  ExampleSwitchButtons,
  ExampleJumpLink,
} from '../../dev/demo/ExampleGroup.jsx';
import { createStoreExampleGroup } from '../../dev/demo/demoStores.js';
import '../scroll-horizontal/exampleScrollHorizontal.css';
import './exampleToolbar.css';

const LayoutToolbarExamplesPanel = () => {
  const storeGroup = useMemo(() => createStoreExampleGroup({ exampleActiveId: 'scroll-horizontal' }), []);

  return (
    <DemoPanel>
      <ExampleGroup title="Toolbar and horizontal scrolling" store={storeGroup}>
        <Explanation>
          <ul>
            <li>
              <ExampleJumpLink data={{ exampleId: 'scroll-horizontal' }}>ScrollHorizontal</ExampleJumpLink> is the primitive: hovering content and using the mouse wheel scrolls it horizontally; scroll position is committed to the store.
            </li>
            <li>
              <ExampleJumpLink data={{ exampleId: 'toolbar' }}>Toolbar</ExampleJumpLink> composes ScrollHorizontal into grouped toolbars with group headers, aside slots and bottom labels.
            </li>
          </ul>
        </Explanation>
        <Controls>
          <ExampleSwitchButtons />
        </Controls>
        <ExampleSwitcher>
          <ScrollHorizontalExample exampleId="scroll-horizontal" labelText="ScrollHorizontal" />
          <ToolbarExample exampleId="toolbar" labelText="Toolbar" />
        </ExampleSwitcher>
      </ExampleGroup>
    </DemoPanel>
  );
};

const demoActionTextList = ['Refresh', 'Duplicate', 'Archive', 'Compare', 'Export CSV', 'Export JSON', 'Open history'];
const demoItemList = Array.from({ length: 10 }, (_, index) => ({
  id: `item-${index + 1}`,
  labelText: `Result ${String(index + 1).padStart(2, '0')}`,
  detailText: `${12 + index * 3} records`,
}));
const demoToolbarButtonTextList = ['Copy', 'Cut', 'Paste', 'Undo', 'Redo', 'Find', 'Replace', 'Format', 'Comment', 'Share', 'Print', 'Preview'];

function DemoToolbarButton({ children, className = '', onClick }) {
  return (
    <button type="button" className={`toolbar-demo-button${className ? ` ${className}` : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function demoToolbarButtonListRender(actionAdd, className = '') {
  return demoToolbarButtonTextList.map((actionText) => (
    <DemoToolbarButton key={actionText} className={className} onClick={() => actionAdd(actionText)}>
      {actionText}
    </DemoToolbarButton>
  ));
}

const ScrollHorizontalExample = observer(function ScrollHorizontalExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreScrollHorizontalExample()), [store]);
  const storeUsed = store || storeLocal;
  const eventHandle = (scrollId) => (eventType, eventData) => storeUsed.handleEvent(eventType, { ...eventData, scrollId });

  return (
    <Example title="ScrollHorizontal">
      <Explanation>
        Hover a row below and use the mouse wheel: vertical wheel movement scrolls the row horizontally.
      </Explanation>
      <CompDemoArea>
        <div className="scroll-horizontal-demo">
          <section className="scroll-horizontal-demo-section" aria-label="Horizontal action list example">
            <div className="scroll-horizontal-demo-title">Button row</div>
            <ScrollHorizontal
              data={{
                scrollLeft: storeUsed.scrollStateById.action.scrollLeft,
                content: demoActionTextList.map((actionText) => (
                  <button
                    key={actionText}
                    type="button"
                    className="scroll-horizontal-demo-button"
                    onClick={() => storeUsed.handleEvent('actionSelect', { actionText })}
                  >
                    {actionText}
                  </button>
                )),
              }}
              config={{ className: 'scroll-horizontal-demo-scroll', classNameTrack: 'scroll-horizontal-demo-action-track', ariaLabel: 'Scrollable actions' }}
              onEvent={eventHandle('action')}
            />
          </section>

          <section className="scroll-horizontal-demo-section" aria-label="Horizontal arbitrary content example">
            <div className="scroll-horizontal-demo-title">Arbitrary content row</div>
            <ScrollHorizontal
              data={{
                scrollLeft: storeUsed.scrollStateById.item.scrollLeft,
                content: demoItemList.map((itemData) => (
                  <button
                    key={itemData.id}
                    type="button"
                    className={`scroll-horizontal-demo-item${itemData.id === storeUsed.itemActiveId ? ' is-active' : ''}`}
                    onClick={() => storeUsed.handleEvent('itemSelect', { itemId: itemData.id })}
                  >
                    <strong>{itemData.labelText}</strong>
                    <span>{itemData.detailText}</span>
                  </button>
                )),
              }}
              config={{ className: 'scroll-horizontal-demo-scroll', classNameTrack: 'scroll-horizontal-demo-item-track', ariaLabel: 'Scrollable result summaries' }}
              onEvent={eventHandle('item')}
            />
          </section>
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>Action: {storeUsed.actionText}</span>
        <span>Selected: {storeUsed.itemActiveId}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const ToolbarExample = observer(function ToolbarExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreToolbarExample()), [store]);
  const storeUsed = store || storeLocal;
  const toolbarEventHandle = (toolbarId) => (eventType, eventData) => storeUsed.handleEvent(eventType, { ...eventData, toolbarId });
  const actionAdd = (actionText) => storeUsed.handleEvent('actionAdd', { actionText });

  return (
    <Example title="Toolbar">
      <Explanation>
        Each variant below is narrow on purpose; hover it and use the mouse wheel to reach the overflowing groups.
      </Explanation>
      <CompDemoArea>
        <div className="toolbar-demo">
          <section className="toolbar-demo-panel is-narrow" aria-label="Dense toolbar example">
            <div className="toolbar-demo-panel-title">Dense groups with headers</div>
            <Toolbar
              data={{
                scrollLeft: storeUsed.toolbarStateById.dense.scrollLeft,
                groupList: [
                  {
                    id: 'edit',
                    labelText: 'Edit',
                    labelDetailText: 'clipboard',
                    content: demoToolbarButtonListRender(actionAdd).slice(0, 5),
                  },
                  {
                    id: 'view',
                    labelText: 'View',
                    labelDetailText: 'zoom and fit',
                    content: demoToolbarButtonListRender(actionAdd).slice(5, 9),
                  },
                  {
                    id: 'share',
                    labelText: 'Share',
                    content: demoToolbarButtonListRender(actionAdd).slice(9),
                  },
                ],
              }}
              config={{ className: 'toolbar-demo-toolbar', ariaLabel: 'Dense toolbar demo' }}
              onEvent={toolbarEventHandle('dense')}
            />
          </section>

          <section className="toolbar-demo-panel is-narrow" aria-label="Compact toolbar example">
            <div className="toolbar-demo-panel-title">Compact groups without headers</div>
            <Toolbar
              data={{
                scrollLeft: storeUsed.toolbarStateById.compact.scrollLeft,
                groupList: [
                  {
                    id: 'quick-edit',
                    content: demoToolbarButtonListRender(actionAdd).slice(0, 4),
                  },
                  {
                    id: 'quick-view',
                    content: demoToolbarButtonListRender(actionAdd).slice(4, 8),
                  },
                  {
                    id: 'quick-share',
                    content: demoToolbarButtonListRender(actionAdd).slice(8),
                  },
                ],
              }}
              config={{ className: 'toolbar-demo-toolbar', isGroupHeaderVisible: false, ariaLabel: 'Compact toolbar demo' }}
              onEvent={toolbarEventHandle('compact')}
            />
          </section>

          <section className="toolbar-demo-panel is-narrow" aria-label="Toolbar with content aside example">
            <div className="toolbar-demo-panel-title">Group with content aside</div>
            <Toolbar
              data={{
                scrollLeft: storeUsed.toolbarStateById.aside.scrollLeft,
                groupList: [
                  {
                    id: 'layout',
                    labelText: 'Layout',
                    content: (
                      <>
                        <DemoToolbarButton onClick={() => actionAdd('Align left')}>Align left</DemoToolbarButton>
                        <DemoToolbarButton onClick={() => actionAdd('Align center')}>Align center</DemoToolbarButton>
                        <DemoToolbarButton onClick={() => actionAdd('Align right')}>Align right</DemoToolbarButton>
                      </>
                    ),
                    contentAside: (
                      <button type="button" className="toolbar-demo-content-aside" onClick={() => actionAdd('Open aside panel')}>
                        <span>Aside slot</span>
                        <strong>Open panel</strong>
                      </button>
                    ),
                    classNameContent: 'toolbar-demo-content-aside-slot',
                  },
                  {
                    id: 'spacing',
                    labelText: 'Spacing',
                    content: demoToolbarButtonListRender(actionAdd).slice(0, 4),
                  },
                ],
              }}
              config={{ className: 'toolbar-demo-toolbar', ariaLabel: 'Toolbar with content aside demo' }}
              onEvent={toolbarEventHandle('aside')}
            />
          </section>

          <section className="toolbar-demo-panel is-narrow" aria-label="Toolbar with bottom labels example">
            <div className="toolbar-demo-panel-title">Bottom labels at group edges</div>
            <Toolbar
              data={{
                scrollLeft: storeUsed.toolbarStateById.edge.scrollLeft,
                groupList: [
                  {
                    id: 'page-left',
                    labelText: 'Page',
                    labelBottomText: 'Left edge label',
                    labelBottomAlign: 'left',
                    className: 'is-pagination',
                    content: (
                      <>
                        <span className="toolbar-demo-field">
                          <span className="toolbar-demo-field-label">Current</span>
                          <span className="toolbar-demo-field-value">3</span>
                        </span>
                        <DemoToolbarButton onClick={() => actionAdd('Previous page')}>&lt;</DemoToolbarButton>
                        <DemoToolbarButton onClick={() => actionAdd('Next page')}>&gt;</DemoToolbarButton>
                      </>
                    ),
                  },
                  {
                    id: 'page-right',
                    labelText: 'Status',
                    labelBottomText: 'Right edge label',
                    labelBottomAlign: 'right',
                    content: (
                      <>
                        <DemoToolbarButton className="is-active" onClick={() => actionAdd('Draft')}>Draft</DemoToolbarButton>
                        <DemoToolbarButton onClick={() => actionAdd('Published')}>Published</DemoToolbarButton>
                        <DemoToolbarButton className="is-danger" onClick={() => actionAdd('Delete')}>Delete</DemoToolbarButton>
                      </>
                    ),
                  },
                ],
              }}
              config={{ className: 'toolbar-demo-toolbar', bottomLabelEdgeGapPx: 1, ariaLabel: 'Toolbar with bottom labels demo' }}
              onEvent={toolbarEventHandle('edge')}
            />
          </section>

          <section className="toolbar-demo-panel is-narrow" aria-label="Thin toolbar example">
            <div className="toolbar-demo-panel-title">Thin toolbar</div>
            <Toolbar
              data={{
                scrollLeft: storeUsed.toolbarStateById.thin.scrollLeft,
                groupList: [
                  {
                    id: 'thin-edit',
                    content: demoToolbarButtonListRender(actionAdd).slice(0, 6),
                  },
                  {
                    id: 'thin-view',
                    content: demoToolbarButtonListRender(actionAdd).slice(6),
                  },
                ],
              }}
              config={{ className: 'toolbar-demo-toolbar', isThin: true, ariaLabel: 'Thin toolbar demo' }}
              onEvent={toolbarEventHandle('thin')}
            />
          </section>
        </div>
      </CompDemoArea>
      <MessageAndOutputs labelText="Recent actions:">
        {storeUsed.actionLogList.length
          ? storeUsed.actionLogList.map((logItem) => <span key={logItem.id}>{logItem.text}</span>)
          : <span>No actions yet</span>}
      </MessageAndOutputs>
    </Example>
  );
});

export const toolbarExamples = {
  Toolbar: {
    component: null,
    description: 'Scrollable toolbar layout and its ScrollHorizontal primitive',
    example: LayoutToolbarExamplesPanel,
  },
};
