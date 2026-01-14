import React, { useState } from 'react';
import TabsOnTop from './TabsOnTop';

/**
 * Example usage of TabsOnTop component
 */

/**
 * Consolidated TabsOnTop examples in a single panel
 */
const TabsOnTopExamplesPanel = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px' }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>TabsOnTop Component Examples</h2>
      
      {/* Example 1 */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '8px' }}>1. Basic Tabs</h3>
        <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '12px' }}>
          Simple tabs without close or create functionality.
        </p>
        <BasicExample />
      </div>

      {/* Example 2 */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '8px' }}>2. Tabs with Close Button</h3>
        <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '12px' }}>
          Tabs that can be closed by clicking the × button.
        </p>
        <TabsWithClose />
      </div>

      {/* Example 3 */}
      <div>
        <h3 style={{ marginBottom: '8px' }}>3. Tabs with Close and Create</h3>
        <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '12px' }}>
          Tabs with both close functionality and ability to create new tabs.
        </p>
        <TabsWithCloseAndCreate />
      </div>
    </div>
  );
};

// Example 1: Basic tabs without close/create
function BasicExample() {
  const [activeTab, setActiveTab] = useState('tab-1');

  return (
    <div>
      <TabsOnTop 
        defaultTab="users"
        onTabChange={(key) => {
          console.log('Tab changed to:', key);
          setActiveTab(key);
        }}
      >
        <TabsOnTop.Tab label="Users">
          <div style={{ padding: '20px' }}>
            <h3>Users Panel</h3>
            <p>User management content here...</p>
          </div>
        </TabsOnTop.Tab>
        
        <TabsOnTop.Tab label="Settings">
          <div style={{ padding: '20px' }}>
            <h3>Settings Panel</h3>
            <p>Settings content here...</p>
          </div>
        </TabsOnTop.Tab>
        
        <TabsOnTop.Tab label="Profile">
          <div style={{ padding: '20px' }}>
            <h3>Profile Panel</h3>
            <p>Profile content here...</p>
          </div>
        </TabsOnTop.Tab>
      </TabsOnTop>
    </div>
  );
}

// Example 2: Tabs with close functionality
function TabsWithClose() {
  const [tabs, setTabs] = useState([
    { id: '1', label: 'Tab 1', content: 'Content for Tab 1' },
    { id: '2', label: 'Tab 2', content: 'Content for Tab 2' },
    { id: '3', label: 'Tab 3', content: 'Content for Tab 3' },
  ]);

  const handleClose = (tabKey) => {
    console.log('Close tab:', tabKey);
    // Extract the index from tab key (e.g., "tab-1" -> 1)
    const tabIndex = parseInt(tabKey.split('-')[1]) - 1;
    setTabs(tabs.filter((_, idx) => idx !== tabIndex));
  };

  return (
    <div>
      <TabsOnTop 
        allowCloseTab={true}
        onTabClose={handleClose}
      >
        {tabs.map(tab => (
          <TabsOnTop.Tab key={tab.id} label={tab.label}>
            <div style={{ padding: '20px' }}>
              <h3>{tab.label}</h3>
              <p>{tab.content}</p>
            </div>
          </TabsOnTop.Tab>
        ))}
      </TabsOnTop>
      {tabs.length === 0 && (
        <div style={{ padding: '20px', color: '#999' }}>
          No tabs available
        </div>
      )}
    </div>
  );
}

// Example 3: Tabs with close and create functionality
function TabsWithCloseAndCreate() {
  const [tabs, setTabs] = useState([
    { id: '1', label: 'Tab 1', content: 'Content for Tab 1' },
    { id: '2', label: 'Tab 2', content: 'Content for Tab 2' },
  ]);
  const [nextId, setNextId] = useState(3);

  const handleClose = (tabKey) => {
    const tabIndex = parseInt(tabKey.split('-')[1]) - 1;
    setTabs(tabs.filter((_, idx) => idx !== tabIndex));
  };

  const handleCreate = () => {
    const newTab = {
      id: nextId.toString(),
      label: `Tab ${nextId}`,
      content: `Content for Tab ${nextId}`
    };
    setTabs([...tabs, newTab]);
    setNextId(nextId + 1);
  };

  return (
    <div>
      <TabsOnTop 
        allowCloseTab={true}
        onTabClose={handleClose}
        allowTabCreate={true}
        onTabCreate={handleCreate}
      >
        {tabs.map(tab => (
          <TabsOnTop.Tab key={tab.id} label={tab.label}>
            <div style={{ padding: '20px' }}>
              <h3>{tab.label}</h3>
              <p>{tab.content}</p>
            </div>
          </TabsOnTop.Tab>
        ))}
      </TabsOnTop>
    </div>
  );
}

// Export in the format expected by examples.jsx
export const tabExamples = {
  'TabsOnTop': {
    component: TabsOnTop,
    description: 'Tabs component with basic, closeable, and create functionality',
    example: TabsOnTopExamplesPanel,
  },
};

