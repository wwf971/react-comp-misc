import React, { useState, useMemo } from 'react';
import { components } from './examples.jsx';
import PanelDual from '../panel/PanelDual.jsx';
import ItemsListVert from '../layout/list/ItemsListVert.jsx';
import './DevPage.css';

const devPageItems = Object.keys(components).map((name) => ({
  key: name,
  label: name,
  description: components[name].description,
}));

function DevPage() {
  const [CompSelectedStr, setCompSelectedStr] = useState('Login');

  const CompSelected = components[CompSelectedStr]?.example;

  return (
    <div className="dev-page">
      <PanelDual orientation="vertical" initialRatio={0.3}>
        <div className="dev-header">
          <div className="dev-header-flex">
            <h1>React Components Assortment</h1>
            <a 
              href="https://github.com/wwf971/react-comp-misc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
            >
              view source code
            </a>
          </div>
          <ItemsListVert
            items={devPageItems}
            searchEnabled
            searchPlaceholder="Search components..."
            getItemKey={(item) => item.key}
            onItemSelect={(data) => setCompSelectedStr(data.key)}
            itemSelectedKey={CompSelectedStr}
          />
        </div>
        
        <div className="dev-content">
          <div className="content-header">
            <h2>{CompSelectedStr}</h2>
            <p>{components[CompSelectedStr]?.description}</p>
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

