import React, { useState } from 'react';
import TabsOnTop from './TabsOnTop';

/**
 * Example usage of TabsOnTop component
 */

// Example 1: Basic tabs without close/create
function BasicExample() {
  const [activeTab, setActiveTab] = useState('tab-1');

  return (
    <div style={{ padding: '20px' }}>
      <h2>Basic Tabs</h2>
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
    <div style={{ padding: '20px' }}>
      <h2>Tabs with Close Button</h2>
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
    <div style={{ padding: '20px' }}>
      <h2>Tabs with Close and Create</h2>
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

// Export examples in the format expected by DevPage
const tabExamples = {
  'TabsOnTop - Basic': {
    component: TabsOnTop,
    description: 'Basic tabs layout',
    example: BasicExample,
  },
  'TabsOnTop - With Close': {
    component: TabsOnTop,
    description: 'Tabs with close button',
    example: TabsWithClose,
  },
  'TabsOnTop - With Close & Create': {
    component: TabsOnTop,
    description: 'Tabs with close and create functionality',
    example: TabsWithCloseAndCreate,
  },
};

export { tabExamples };

