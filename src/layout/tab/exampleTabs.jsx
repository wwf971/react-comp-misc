import React, { useEffect, useMemo, useState } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import TabsOnTop from './TabsOnTop';
import CrossIcon from '../../icon/CrossIcon';
import {
  DemoPanel,
  Example,
  Explanation,
  Controls,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
import { ExampleGroup, ExampleStackVertical } from '../../dev/demo/ExampleGroup.jsx';

function Counter({ label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '8px', background: '#e8f5e9', borderRadius: '4px', marginTop: '8px' }}>
      <strong>{label}</strong> Counter: {count}s (updates every second even when tab is not active)
    </div>
  );
}

const CustomTabWithIndicator = ({ label, isActive, onClick, onClose, isDragging, draggable, onDragStart, onDrag, onDragEnd }) => {
  const colorMap = {
    'Home': '#4caf50',
    'Settings': '#2196f3',
    'Profile': '#ff9800'
  };
  
  return (
    <button
      className={`tab-on-top-btn ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${draggable ? 'reorderable' : ''}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      style={{ opacity: isDragging ? 0.3 : 1, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
    >
      <span style={{ 
        width: '8px', 
        height: '8px', 
        borderRadius: '50%', 
        background: colorMap[label] || '#999',
        flexShrink: 0
      }} />
      <span className="tab-label">{label}</span>
      {onClose && (
        <span 
          className="tab-close-btn"
          onClick={onClose}
        >
          <CrossIcon size={12} />
        </span>
      )}
    </button>
  );
};

const CustomTabWithBadge = ({ label, isActive, onClick, onClose, isDragging, draggable, onDragStart, onDrag, onDragEnd, badge }) => {
  return (
    <button
      className={`tab-on-top-btn ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${draggable ? 'reorderable' : ''}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      style={{ opacity: isDragging ? 0.3 : 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
    >
      <span className="tab-label">{label}</span>
      {badge != null && badge !== 0 && (
        <span style={{
          background: '#ff4444',
          color: '#fff',
          fontSize: '11px',
          padding: '2px 6px',
          borderRadius: '10px',
          fontWeight: 'bold',
          minWidth: '18px',
          textAlign: 'center'
        }}>
          {badge}
        </span>
      )}
      {onClose && (
        <span 
          className="tab-close-btn"
          onClick={onClose}
        >
          <CrossIcon size={12} />
        </span>
      )}
    </button>
  );
};

function TabDemoPanel({ title, text }) {
  return (
    <div style={{ padding: '12px' }}>
      <div style={{ fontSize: '14px', fontWeight: '650', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#555' }}>{text}</div>
    </div>
  );
}

function OrderPreview({ tabs }) {
  return (
    <span>
      <strong>Order:</strong> {tabs.map((tab) => tab.label).join(', ')}
    </span>
  );
}

const createTabDeferDemoStore = () => makeAutoObservable({
  isServerDataReady: false,
  isServerLoadStarted: false,
  serverLoadTimer: null,
  isCrashForced: true,
  revisionReset: 0,
  serverLoadBegin() {
    if (this.isServerLoadStarted) return;
    this.isServerLoadStarted = true;
    this.serverLoadTimer = window.setTimeout(this.markServerDataReady, 1800);
  },
  markServerDataReady() {
    this.serverLoadTimer = null;
    this.isServerDataReady = true;
  },
  toggleCrashForced() {
    this.isCrashForced = !this.isCrashForced;
  },
  reset() {
    if (this.serverLoadTimer !== null) {
      window.clearTimeout(this.serverLoadTimer);
      this.serverLoadTimer = null;
    }
    this.isServerDataReady = false;
    this.isServerLoadStarted = false;
    this.isCrashForced = true;
    this.revisionReset += 1;
  },
}, {}, { autoBind: true });

function createStoreTabsAllFeatures() {
  return makeAutoObservable({
    tabs: [
      { id: '1', label: 'First', content: 'Content 1' },
      { id: '2', label: 'Second', content: 'Content 2' },
      { id: '3', label: 'Third', content: 'Content 3' },
    ],
    nextId: 4,
    reorder(newTabsConfig) {
      this.tabs = newTabsConfig.map((tabConfig) => {
        const tabIndex = parseInt(tabConfig.key.split('-')[1]) - 1;
        return this.tabs[tabIndex];
      });
    },
    close(tabKey) {
      const tabIndex = parseInt(tabKey.split('-')[1]) - 1;
      this.tabs = this.tabs.filter((_, idx) => idx !== tabIndex);
    },
    create() {
      const newTab = {
        id: this.nextId.toString(),
        label: `Tab ${this.nextId}`,
        content: `Content ${this.nextId}`,
      };
      this.tabs = [...this.tabs, newTab];
      this.nextId += 1;
    },
  }, {}, { autoBind: true });
}

function createStoreTabsCustom() {
  return makeAutoObservable({
    tabs: [
      { id: 'home', label: 'Home', useIndicator: true },
      { id: 'settings', label: 'Settings', useIndicator: true },
      { id: 'profile', label: 'Profile', useBadge: true },
      { id: 'plain', label: 'Plain Tab', useIndicator: false },
    ],
    notificationCount: 5,
    increment() {
      this.notificationCount += 1;
    },
    reset() {
      this.notificationCount = 0;
    },
    reorder(newTabsConfig) {
      this.tabs = newTabsConfig.map((tabConfig) => {
        const tabIndex = parseInt(tabConfig.key.split('-')[1]) - 1;
        return this.tabs[tabIndex];
      });
    },
  }, {}, { autoBind: true });
}

function createStoreTabOrder(tabDataList) {
  return makeAutoObservable({
    tabs: tabDataList.slice(),
    reorder(tabConfigList) {
      this.tabs = reorderByTabConfig(this.tabs, tabConfigList);
    },
  }, {}, { autoBind: true });
}

function createStoreTabsSwitchable() {
  return makeAutoObservable({
    tabs: tabLongDefaultList.slice(0, 8),
    actionMessage: 'No header action clicked yet.',
    reorder(tabConfigList) {
      this.tabs = reorderByTabConfig(this.tabs, tabConfigList);
    },
    actionMessageSet(action, actionData) {
      this.actionMessage = `${action}: ${actionData.itemId}`;
    },
  }, {}, { autoBind: true });
}

function PanelHeavyMount() {
  useMemo(() => {
    const timeStart = performance.now();
    while (performance.now() - timeStart < 500) { /* simulate expensive first render */ }
  }, []);
  return (
    <TabDemoPanel
      title="Heavy Mount"
      text="This panel blocks around 500ms on first render. With deferMount, the spinner paints first so the tab switch itself stays instant."
    />
  );
}

const PanelServerData = observer(({ store }) => (
  <TabDemoPanel
    title="Server Data"
    text={`Simulated fetch finished. isServerDataReady=${String(store.isServerDataReady)}. The spinner was shown while isReady stayed false.`}
  />
));

const PanelCrash = observer(({ store }) => {
  if (store.isCrashForced) {
    throw new Error('Simulated render crash: force crash is on.');
  }
  return (
    <TabDemoPanel
      title="Crash Recovery"
      text="Render succeeded. Turn force crash back on and press Retry to see the failure again."
    />
  );
});

const tabLongDefaultList = [
  { id: 'overview', label: 'Overview' },
  { id: 'orders', label: 'Orders' },
  { id: 'customers', label: 'Customers' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'fulfillment', label: 'Fulfillment' },
  { id: 'pricing', label: 'Pricing Rules' },
  { id: 'reports', label: 'Reports' },
  { id: 'automation', label: 'Automation' },
  { id: 'audit', label: 'Audit Log' },
  { id: 'settings', label: 'Settings' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'experiments', label: 'Experiments' },
];

function reorderByTabConfig(tabDataList, tabConfigList) {
  const dataById = Object.fromEntries(tabDataList.map((item) => [item.id, item]));
  return tabConfigList.map((tabConfig) => dataById[tabConfig.key]).filter(Boolean);
}

function BasicExample() {
  return (
    <Example title="Tab Mount Behavior">
      <CompDemoArea>
        <TabsOnTop defaultTab="tab-1" defaultKeepMounted={true}>
          <TabsOnTop.Tab label="Always Mounted" keepMounted={true}>
            <div style={{ padding: '12px' }}>
              <div>This tab stays mounted (hidden with display:none)</div>
              <Counter label="Always Mounted" />
            </div>
          </TabsOnTop.Tab>
          
          <TabsOnTop.Tab label="Unmounts" keepMounted={false}>
            <div style={{ padding: '12px' }}>
              <div>This tab unmounts when inactive (counter resets)</div>
              <Counter label="Unmounts" />
            </div>
          </TabsOnTop.Tab>
          
          <TabsOnTop.Tab label="Default Behavior">
            <div style={{ padding: '12px' }}>
              <div>Uses defaultKeepMounted (true in this example)</div>
              <Counter label="Default" />
            </div>
          </TabsOnTop.Tab>
        </TabsOnTop>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>Switch between tabs: &quot;Always Mounted&quot; keeps counting, &quot;Unmounts&quot; resets to 0</span>
      </MessageAndOutputs>
    </Example>
  );
}

const TabsWithAllFeatures = observer(function TabsWithAllFeatures({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreTabsAllFeatures()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="All Features: Close, Create, Reorder">
      <Explanation>
        Drag tabs to reorder, close with x, create with +. Blue line shows drop position.
      </Explanation>
      <CompDemoArea>
        <TabsOnTop
          allowTabReorder={true}
          onTabReorder={storeUsed.reorder}
          allowCloseTab={true}
          onTabClose={storeUsed.close}
          allowTabCreate={true}
          onTabCreate={storeUsed.create}
        >
          {storeUsed.tabs.map((tab) => (
            <TabsOnTop.Tab key={tab.id} label={tab.label}>
              <div style={{ padding: '12px' }}>
                <div>{tab.content}</div>
                <Counter label={tab.label} />
              </div>
            </TabsOnTop.Tab>
          ))}
        </TabsOnTop>
      </CompDemoArea>
      <MessageAndOutputs>
        <OrderPreview tabs={storeUsed.tabs} />
      </MessageAndOutputs>
    </Example>
  );
});

const TabsWithCustomComponents = observer(function TabsWithCustomComponents({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreTabsCustom()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="Custom Tab Components">
      <Explanation>
        Custom tab buttons with icons and badges
      </Explanation>
      <CompDemoArea>
        <TabsOnTop defaultTab="home" allowTabReorder onTabReorder={storeUsed.reorder}>
          {storeUsed.tabs.map((tab) => (
            <React.Fragment key={tab.id}>
              {tab.useIndicator && (
                <TabsOnTop.TabLabel>
                  {CustomTabWithIndicator}
                </TabsOnTop.TabLabel>
              )}
              {tab.useBadge && (
                <TabsOnTop.TabLabel>
                  {(props) => <CustomTabWithBadge {...props} badge={storeUsed.notificationCount} />}
                </TabsOnTop.TabLabel>
              )}
              <TabsOnTop.Tab label={tab.label}>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{tab.label}</div>
                  {tab.useBadge ? (
                    <>
                      <div style={{ marginBottom: '8px' }}>Tab with notification badge</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={storeUsed.increment}
                          style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', borderRadius: '2px' }}
                        >
                          Add Notification
                        </button>
                        <button
                          onClick={storeUsed.reset}
                          style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', borderRadius: '2px' }}
                        >
                          Clear Notifications
                        </button>
                      </div>
                    </>
                  ) : tab.useIndicator ? (
                    <div>Tab with custom colored indicator</div>
                  ) : (
                    <div>Regular tab without custom component</div>
                  )}
                </div>
              </TabsOnTop.Tab>
            </React.Fragment>
          ))}
        </TabsOnTop>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>Tabs with custom TabLabel use the custom component. Drag tabs to reorder.</span>
        <OrderPreview tabs={storeUsed.tabs} />
      </MessageAndOutputs>
    </Example>
  );
});

const TabsOneLineOverflow = observer(function TabsOneLineOverflow({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreTabOrder(tabLongDefaultList)), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="One-line Overflow Tabs">
      <Explanation>
        A fixed one-line tab row. Use mouse wheel to scroll horizontally; drag tabs near the edge to reveal scroll zones.
      </Explanation>
      <CompDemoArea>
        <div style={{ width: '520px', maxWidth: '100%' }}>
          <TabsOnTop
            lineMode="single"
            allowTabReorder={true}
            onTabReorder={storeUsed.reorder}
          >
            {storeUsed.tabs.map((tab) => (
              <TabsOnTop.Tab key={tab.id} tabKey={tab.id} label={tab.label}>
                <TabDemoPanel title={tab.label} text="Fixed one-line mode keeps the header compact and horizontally scrollable." />
              </TabsOnTop.Tab>
            ))}
          </TabsOnTop>
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <OrderPreview tabs={storeUsed.tabs} />
      </MessageAndOutputs>
    </Example>
  );
});

const TabsMultiLine = observer(function TabsMultiLine({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreTabOrder(tabLongDefaultList)), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="Multi-line Tabs">
      <Explanation>
        A fixed multi-line tab row. Dragging uses nearest-row slot geometry.
      </Explanation>
      <CompDemoArea>
        <div style={{ width: '560px', maxWidth: '100%' }}>
          <TabsOnTop
            lineMode="wrap"
            allowTabReorder={true}
            onTabReorder={storeUsed.reorder}
          >
            {storeUsed.tabs.map((tab) => (
              <TabsOnTop.Tab key={tab.id} tabKey={tab.id} label={tab.label}>
                <TabDemoPanel title={tab.label} text="Fixed multi-line mode exposes all tabs without horizontal scrolling." />
              </TabsOnTop.Tab>
            ))}
          </TabsOnTop>
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <OrderPreview tabs={storeUsed.tabs} />
      </MessageAndOutputs>
    </Example>
  );
});

const TabsSwitchableWithActions = observer(function TabsSwitchableWithActions({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreTabsSwitchable()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="Switchable Line Mode With Header Actions">
      <Explanation>
        The right side of the tab header can host the built-in line mode switch and custom action buttons.
      </Explanation>
      <CompDemoArea>
        <div style={{ width: '620px', maxWidth: '100%' }}>
          <TabsOnTop
            defaultLineMode="single"
            allowLineModeSwitch={true}
            allowTabReorder={true}
            onTabReorder={storeUsed.reorder}
            headerRightItems={[
              { id: 'refresh', label: 'Refresh', action: 'refreshClick' },
              { id: 'save', label: 'Save', action: 'saveClick' },
            ]}
            onHeaderRightItemAction={(action, actionData) => storeUsed.actionMessageSet(action, actionData)}
          >
            {storeUsed.tabs.map((tab) => (
              <TabsOnTop.Tab key={tab.id} tabKey={tab.id} label={tab.label}>
                <TabDemoPanel title={tab.label} text="Switchable mode lets the user choose compact or expanded tab display." />
              </TabsOnTop.Tab>
            ))}
          </TabsOnTop>
        </div>
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.actionMessage}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const TabsDeferredDemo = observer(function TabsDeferredDemo({ store }) {
  const storeLocal = useMemo(() => (store ? null : createTabDeferDemoStore()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="Deferred Tab Panels">
      <Explanation>
        deferMount paints a spinner before mounting heavy content, isReady gates on external data, withErrorBoundary catches render crashes with retry. Reset returns to Plain and clears all mounted/loading state. Crash Recovery throws while force crash is on.
      </Explanation>
      <Controls>
        <div className="tab-example-defer-controls">
          <button type="button" className="tab-example-defer-toggle" onClick={storeUsed.reset}>
            Reset deferred demo
          </button>
          <button type="button" className="tab-example-defer-toggle" onClick={storeUsed.toggleCrashForced}>
            {storeUsed.isCrashForced ? 'Force crash: on' : 'Force crash: off'}
          </button>
        </div>
      </Controls>
      <CompDemoArea>
        <div style={{ width: '620px', maxWidth: '100%' }}>
          <TabsOnTop
            key={storeUsed.revisionReset}
            defaultTab="plain"
            onTabChange={(tabKey) => {
              if (tabKey === 'server-data') storeUsed.serverLoadBegin();
            }}
          >
            <TabsOnTop.Tab tabKey="plain" label="Plain">
              <TabDemoPanel title="Plain" text="Normal tab without defer, mounts immediately with all sibling panels." />
            </TabsOnTop.Tab>
            <TabsOnTop.Tab tabKey="heavy" label="Heavy Mount" deferMount={true} deferMountDelayMs={800}>
              <PanelHeavyMount />
            </TabsOnTop.Tab>
            <TabsOnTop.Tab tabKey="server-data" label="Server Data" deferMount={true} isReady={storeUsed.isServerDataReady}>
              <PanelServerData store={storeUsed} />
            </TabsOnTop.Tab>
            <TabsOnTop.Tab tabKey="crash" label="Crash Recovery" deferMount={true} withErrorBoundary={true}>
              <PanelCrash store={storeUsed} />
            </TabsOnTop.Tab>
          </TabsOnTop>
        </div>
      </CompDemoArea>
    </Example>
  );
});

const TabsOnTopExamplesPanel = () => {
  return (
    <DemoPanel>
      <Explanation titleText="TabsOnTop">
        Control whether inactive tabs stay mounted or unmount. Watch counters to see the difference.
      </Explanation>
      <ExampleGroup title="Variants">
        <ExampleStackVertical>
          <BasicExample />
          <TabsWithAllFeatures />
          <TabsWithCustomComponents />
          <TabsOneLineOverflow />
          <TabsMultiLine />
          <TabsSwitchableWithActions />
          <TabsDeferredDemo />
        </ExampleStackVertical>
      </ExampleGroup>
    </DemoPanel>
  );
};

export const tabExamples = {
  'TabsOnTop': {
    component: TabsOnTop,
    description: 'Tabs with close, create, reorder, custom tab components, overflow, multi-line mode, header actions, and deferred panels',
    example: TabsOnTopExamplesPanel,
  },
};

export default TabsOnTopExamplesPanel;
