import React, { useState } from 'react';
import ItemList from './ItemList.jsx';
import ItemTree from './ItemTree.jsx';
import './side-list.css';

const DEMO_ITEMS = [
  { key: 'layout', label: 'Layout', description: 'Folder, tree, and panel examples' },
  { key: 'data', label: 'Data Structure', description: 'Json and key-value examples' },
  { key: 'application', label: 'Application', description: 'Config, calendar, and auth examples' },
  { key: 'visualization', label: 'Visualization', description: 'Chart and visual examples' },
];

const DEMO_TREE_ITEMS = [
  { key: 'cat-layout', label: 'Layout' },
  { key: 'cat-layout-folder', parentKey: 'cat-layout', label: 'Folder', description: 'Resizable folder view' },
  { key: 'cat-layout-tree', parentKey: 'cat-layout', label: 'Tree', description: 'Tree view and filter' },
  { key: 'cat-data', label: 'Data Structure' },
  { key: 'cat-data-json', parentKey: 'cat-data', label: 'Json', description: 'Json rendering' },
  { key: 'cat-data-json-mobx', parentKey: 'cat-data', label: 'Json Mobx', description: 'Mobx-driven json rendering' },
  { key: 'cat-app', label: 'Application' },
  { key: 'cat-app-auth', parentKey: 'cat-app', label: 'Auth', description: 'Login component examples' },
  { key: 'cat-app-calendar', parentKey: 'cat-app', label: 'Calendar', description: 'Date selector examples' },
];

const SideListExamplesPanel = ({ initialMode = 'list' }) => {
  const [mode, setMode] = useState(initialMode);
  const [selectedListKey, setSelectedListKey] = useState('layout');
  const [selectedTreeKey, setSelectedTreeKey] = useState('cat-layout-folder');

  return (
    <div className="side-list-demo-root">
      <div className="side-list-demo-toolbar">
        <button
          type="button"
          className={`side-list-demo-btn ${mode === 'list' ? 'is-selected' : ''}`}
          onClick={() => setMode('list')}
        >
          ItemList
        </button>
        <button
          type="button"
          className={`side-list-demo-btn ${mode === 'tree' ? 'is-selected' : ''}`}
          onClick={() => setMode('tree')}
        >
          ItemTree
        </button>
      </div>
      <div className="side-list-demo-body">
        {mode === 'list' ? (
          <ItemList
            items={DEMO_ITEMS}
            selectedItemKey={selectedListKey}
            titleText="Demo ItemList"
            searchPlaceholder="Search list items..."
            onItemSelect={(itemData) => setSelectedListKey(itemData.key)}
          />
        ) : (
          <ItemTree
            data={{
              items: DEMO_TREE_ITEMS,
              selectedItemKey: selectedTreeKey,
            }}
            config={{
              titleText: 'Demo ItemTree',
              searchPlaceholder: 'Search tree leaves...',
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'itemSelect' && eventData.itemData?.parentKey) {
                setSelectedTreeKey(eventData.itemData.key);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export const sideListExamples = {
  ItemList: {
    component: null,
    description: 'Searchable side list component for selecting demo entries',
    example: () => <SideListExamplesPanel initialMode="list" />,
    routeAliases: ['item-list', 'side-list'],
  },
  ItemTree: {
    component: null,
    description: 'Tree-style side list with branch toggle and leaf filtering',
    example: () => <SideListExamplesPanel initialMode="tree" />,
    routeAliases: ['item-tree', 'side-tree'],
  },
};
