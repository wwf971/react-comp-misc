import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { components } from './examples.jsx';
import {
  defaultComponentKey,
  getComponentKeyFromRouteSlug,
  getRoutePathForComponentKey,
} from './demoRoutes.js';
import PanelDual from '../layout/panel/PanelDual.jsx';
import ItemTree from '../app/side-list/ItemTree.jsx';
import './DevPage.css';

const devPageItems = Object.keys(components).map((name) => ({
  key: name,
  label: name,
  description: components[name].description,
}));

const CATEGORY_ORDER = [
  'layout',
  'data-structure',
  'application',
  'visualization',
  'dev',
  'ui-basics',
];

const CATEGORY_LABEL_BY_KEY = {
  layout: 'Layout',
  'data-structure': 'Data Structure',
  application: 'Application',
  visualization: 'Visualization',
  dev: 'Developement',
  'ui-basics': 'UI Basics',
};

const resolveCategoryKey = (itemKeyRaw) => {
  const itemKey = String(itemKeyRaw || '').toLowerCase();
  if (itemKey === 'html' || itemKey === 'database' || itemKey === 'metadata') return 'dev';
  if (itemKey === 'stat' || itemKey === 'radar') return 'visualization';
  if (itemKey.includes('config') || itemKey.includes('calendar') || itemKey.includes('auth') || itemKey.includes('login') || itemKey.includes('path')) {
    return 'application';
  }
  if (itemKey.includes('keyvalue') || itemKey.includes('key-value') || itemKey.includes('json') || itemKey.includes('tree') || itemKey.includes('itemlist') || itemKey.includes('itemtree') || itemKey.includes('mobx')) {
    return 'data-structure';
  }
  if (itemKey.includes('folder') || itemKey.includes('masterdetail') || itemKey.includes('tab') || itemKey.includes('panel')) {
    return 'layout';
  }
  return 'ui-basics';
};

const sideTreeItems = (() => {
  const categoryItems = CATEGORY_ORDER.map((categoryKey) => ({
    key: `cat-${categoryKey}`,
    label: CATEGORY_LABEL_BY_KEY[categoryKey],
    description: '',
    nodeType: 'group',
  }));
  const leafItems = devPageItems.map((itemData) => {
    const categoryKey = resolveCategoryKey(itemData.key);
    return {
      ...itemData,
      parentKey: `cat-${categoryKey}`,
      nodeType: 'item',
    };
  });
  return [...categoryItems, ...leafItems];
})();

function DevPage() {
  const navigate = useNavigate();
  const { componentSlug } = useParams();
  const selectedComponentKey = componentSlug
    ? getComponentKeyFromRouteSlug(componentSlug)
    : defaultComponentKey;

  if (!selectedComponentKey) {
    return <Navigate to={getRoutePathForComponentKey(defaultComponentKey)} replace />;
  }

  const CompSelected = components[selectedComponentKey]?.example;
  const selectedCompDescription = components[selectedComponentKey]?.description;

  return (
    <div className="dev-page">
      <PanelDual orientation="vertical" initialWidth={300}>
        <div className="dev-header">
          <ItemTree
            data={{
              items: sideTreeItems,
              selectedItemKey: selectedComponentKey,
            }}
            config={{
              searchPlaceholder: 'Search components...',
              titleText: 'React Components Assortment',
              headerExtraContent: (
                <a
                  href="https://github.com/wwf971/react-comp-misc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-link"
                >
                  view source code
                </a>
              ),
            }}
            onEvent={(eventType, eventData) => {
              if (eventType !== 'itemSelect') return;
              const itemKey = String(eventData.itemData?.key || '').trim();
              if (!itemKey) return;
              if (!components[itemKey]) return;
              navigate(getRoutePathForComponentKey(itemKey));
            }}
          />
        </div>
        
        <div className="dev-content">
          <div className="content-header">
            <div className="content-title">{selectedComponentKey}</div>
            <div className="content-description">{selectedCompDescription}</div>
          </div>
          <div className="comp-demo">
            {CompSelected ? <CompSelected /> : <div>No example available</div>}
          </div>
        </div>
      </PanelDual>
    </div>
  );
}

export default DevPage;

