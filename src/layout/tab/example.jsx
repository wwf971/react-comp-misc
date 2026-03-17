import React, { useState, useEffect } from 'react';
import TabsOnTop from './TabsOnTop';
import CrossIcon from '../../icon/CrossIcon';

/**
 * Counter component that increases every second to demonstrate continuous rendering
 */
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

/**
 * Custom tab button with colored dot indicator
 */
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

/**
 * Custom tab button with badge
 */
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

/**
 * Consolidated TabsOnTop examples in a single panel
 */
const TabsOnTopExamplesPanel = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>TabsOnTop Examples</div>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
        Control whether inactive tabs stay mounted or unmount. Watch counters to see the difference.
      </div>
      
      {/* Example 1: Keep mounted behavior demo */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Tab Mount Behavior</div>
        <BasicExample />
      </div>

      {/* Example 2: All features combined */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>All Features: Close, Create, Reorder</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Drag tabs to reorder, close with ×, create with +. Blue line shows drop position.
        </div>
        <TabsWithAllFeatures />
      </div>

      {/* Example 3: Custom tab components */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Custom Tab Components</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Custom tab buttons with icons and badges
        </div>
        <TabsWithCustomComponents />
      </div>
    </div>
  );
};

// Example 1: Basic tabs with counter to show rendering behavior
function BasicExample() {
  return (
    <div>
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
      <div style={{ marginTop: '8px', padding: '6px', background: '#fff3e0', borderRadius: '2px', fontSize: '12px' }}>
        Switch between tabs: "Always Mounted" keeps counting, "Unmounts" resets to 0
      </div>
    </div>
  );
}

// Example 2: All features combined - close, create, and reorder
function TabsWithAllFeatures() {
  const [tabs, setTabs] = useState([
    { id: '1', label: 'First', content: 'Content 1' },
    { id: '2', label: 'Second', content: 'Content 2' },
    { id: '3', label: 'Third', content: 'Content 3' },
  ]);
  const [nextId, setNextId] = useState(4);

  const handleReorder = (newTabsConfig) => {
    const reorderedTabs = newTabsConfig.map(tabConfig => {
      const tabIndex = parseInt(tabConfig.key.split('-')[1]) - 1;
      return tabs[tabIndex];
    });
    setTabs(reorderedTabs);
  };

  const handleClose = (tabKey) => {
    const tabIndex = parseInt(tabKey.split('-')[1]) - 1;
    setTabs(tabs.filter((_, idx) => idx !== tabIndex));
  };

  const handleCreate = () => {
    const newTab = {
      id: nextId.toString(),
      label: `Tab ${nextId}`,
      content: `Content ${nextId}`
    };
    setTabs([...tabs, newTab]);
    setNextId(nextId + 1);
  };

  return (
    <div>
      <TabsOnTop 
        allowTabReorder={true}
        onTabReorder={handleReorder}
        allowCloseTab={true}
        onTabClose={handleClose}
        allowTabCreate={true}
        onTabCreate={handleCreate}
      >
        {tabs.map(tab => (
          <TabsOnTop.Tab key={tab.id} label={tab.label}>
            <div style={{ padding: '12px' }}>
              <div>{tab.content}</div>
              <Counter label={tab.label} />
            </div>
          </TabsOnTop.Tab>
        ))}
      </TabsOnTop>
      <div style={{ marginTop: '8px', padding: '6px', background: '#f0f0f0', borderRadius: '2px', fontSize: '12px' }}>
        <strong>Order:</strong> {tabs.map(t => t.label).join(' → ')}
      </div>
    </div>
  );
}

// Example 3: Custom tab components
function TabsWithCustomComponents() {
  const [tabs, setTabs] = useState([
    { id: 'home', label: 'Home', useIndicator: true },
    { id: 'settings', label: 'Settings', useIndicator: true },
    { id: 'profile', label: 'Profile', useBadge: true },
    { id: 'plain', label: 'Plain Tab', useIndicator: false }
  ]);
  
  const [notificationCount, setNotificationCount] = useState(5);

  const handleIncrement = () => {
    setNotificationCount(prev => prev + 1);
  };

  const handleReset = () => {
    setNotificationCount(0);
  };

  const handleReorder = (newTabsConfig) => {
    const reorderedTabs = newTabsConfig.map(tabConfig => {
      const tabIndex = parseInt(tabConfig.key.split('-')[1]) - 1;
      return tabs[tabIndex];
    });
    setTabs(reorderedTabs);
  };

  return (
    <div>
      <TabsOnTop defaultTab="home" allowTabReorder onTabReorder={handleReorder}>
        {tabs.map(tab => (
          <React.Fragment key={tab.id}>
            {tab.useIndicator && (
              <TabsOnTop.TabLabel>
                {CustomTabWithIndicator}
              </TabsOnTop.TabLabel>
            )}
            {tab.useBadge && (
              <TabsOnTop.TabLabel>
                {(props) => <CustomTabWithBadge {...props} badge={notificationCount} />}
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
                        onClick={handleIncrement}
                        style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', borderRadius: '2px' }}
                      >
                        Add Notification
                      </button>
                      <button
                        onClick={handleReset}
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
      <div style={{ marginTop: '8px', padding: '6px', background: '#f0f0f0', borderRadius: '2px', fontSize: '12px' }}>
        <div>Tabs with custom TabLabel use the custom component. Drag tabs to reorder.</div>
        <div style={{ marginTop: '4px' }}><strong>Order:</strong> {tabs.map(t => t.label).join(' → ')}</div>
      </div>
    </div>
  );
}

// Export in the format expected by examples.jsx
export const tabExamples = {
  'TabsOnTop': {
    component: TabsOnTop,
    description: 'Tabs with close, create, reorder, and custom tab components',
    example: () => <TabsOnTopExamplesPanel />
  },
};

