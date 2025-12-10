import React, { useState, useMemo } from 'react';
import { components } from './examples.jsx';
import './DevPage.css';

function DevPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [CompSelectedStr, setCompSelectedStr] = useState('Login');

  // Filter components based on search term
  const filteredComponents = useMemo(() => {
    if (!searchTerm) return Object.keys(components);
    
    const term = searchTerm.toLowerCase();
    return Object.keys(components).filter(name => 
      name.toLowerCase().includes(term) ||
      components[name].description.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const CompSelected = components[CompSelectedStr]?.example;

  return (
      <div className="dev-page">
        <div className="dev-header">
          <div>
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
          <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-button"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>
        <div className="component-list">
          {filteredComponents.map(name => (
            <button
              key={name}
              className={`component-item ${CompSelectedStr === name ? 'selected' : ''}`}
              onClick={() => setCompSelectedStr(name)}
            >
              <div className="component-name">{name}</div>
              <div className="component-description">{components[name].description}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="dev-content">
        <div className="content-header">
          <h2>{CompSelectedStr}</h2>
          <p>{components[CompSelectedStr]?.description}</p>
        </div>
          <div className="component-demo">
            {CompSelected ? <CompSelected /> : <div>No example available</div>}
          </div>
        </div>
      </div>
    );
  }
  
  export default DevPage;

