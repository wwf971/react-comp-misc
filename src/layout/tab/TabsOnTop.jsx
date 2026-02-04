import React, { useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import './TabsOnTop.css';
import CrossIcon from '../../icon/CrossIcon';
import AddIcon from '../../icon/AddIcon';

/**
 * TabsOnTop - Layout component with horizontal tabs at the top
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Tab components
 * @param {string} props.defaultTab - Default tab key (optional)
 * @param {Function} props.onTabChange - Callback when tab changes (optional)
 * @param {boolean} props.allowCloseTab - Allow closing tabs (default: false)
 * @param {Function} props.onTabClose - Callback when tab is closed (optional)
 * @param {boolean} props.allowTabCreate - Allow creating new tabs (default: false)
 * @param {Function} props.onTabCreate - Callback when create tab button is clicked (optional)
 * @param {boolean} props.autoSwitchToNewTab - Auto-switch to new tabs when added (default: true)
 * @param {boolean} props.allowTabReorder - Allow reordering tabs via drag and drop (default: false)
 * @param {Function} props.onTabReorder - Callback when tabs are reordered, receives new tabs array (optional)
 * @param {boolean} props.defaultKeepMounted - Default behavior for inactive tabs: true = hidden with display:none, false = unmounted (default: true)
 */
const TabsOnTop = forwardRef(
  ({ 
    children, 
    defaultTab,
    onTabChange,
    allowCloseTab = false,
    onTabClose,
    allowTabCreate = false,
    onTabCreate,
    autoSwitchToNewTab = true,
    allowTabReorder = false,
    onTabReorder,
    defaultKeepMounted = true
  }, ref) => {
  // Use useMemo instead of useState so config updates when children change
  const config = useMemo(() => extractTabConfig(children), [children]);
  const { tabs, panels, tabKeyMap } = config;
  
  // Determine initial tab - prefer defaultTab, then first tab
  const getInitialTab = () => {
    if (defaultTab) {
      // Check if defaultTab is a label (lowercase) or key
      const mappedKey = tabKeyMap[defaultTab.toLowerCase()];
      if (mappedKey) return mappedKey;
      // Check if it's already a valid key
      if (panels[defaultTab]) return defaultTab;
    }
    return tabs[0]?.key || null;
  };
  
  // Initialize with first available tab, then update when config is ready
  const [activeTabKey, setActiveTabKey] = useState(() => getInitialTab());
  
  // Track tab states (click count and focus status)
  const [tabsState, setTabsState] = useState(() => {
    const initialState = {};
    tabs.forEach(tab => {
      initialState[tab.key] = { clickCount: 0, isFocused: tab.key === getInitialTab() };
    });
    return initialState;
  });

  // Tab reordering state
  const headerRef = React.useRef(null);
  const [draggingTabKey, setDraggingTabKey] = React.useState(null);
  const [dragOverSeparatorIndex, setDragOverSeparatorIndex] = React.useState(null);
  const dragOffsetX = React.useRef(0);
  const dragOffsetY = React.useRef(0);

  // Initialize tab states when tabs config changes
  React.useEffect(() => {
    setTabsState(prevState => {
      const newState = {};
      tabs.forEach(tab => {
        if (prevState[tab.key]) {
          // Preserve existing state
          newState[tab.key] = { ...prevState[tab.key], isFocused: tab.key === activeTabKey };
        } else {
          // Initialize new tab
          newState[tab.key] = { clickCount: 0, isFocused: tab.key === activeTabKey };
        }
      });
      return newState;
    });
  }, [tabs, activeTabKey]);
  
  // Update active tab if config changes and current tab is invalid
  React.useEffect(() => {
    if (!activeTabKey || !panels[activeTabKey]) {
      const newTab = getInitialTab();
      if (newTab) {
        setActiveTabKey(newTab);
      }
    }
  }, [config, activeTabKey, panels]);

  // Switch to last tab when tabs are added (controlled by autoSwitchToNewTab prop)
  React.useEffect(() => {
    if (!autoSwitchToNewTab) return; // Skip if disabled
    
    const lastTabKey = tabs[tabs.length - 1]?.key;
    if (lastTabKey && tabs.length > 0 && lastTabKey !== activeTabKey) {
      // Check if this is a new tab (not in previous render)
      const prevTabCount = Object.keys(panels).length;
      if (prevTabCount === tabs.length) {
        // New tab was added, switch to it
        setActiveTabKey(lastTabKey);
        if (onTabChange) {
          onTabChange(lastTabKey);
        }
      }
    }
  }, [tabs.length, autoSwitchToNewTab]);

  const switchToTab = (tabIdentifier) => {
    // Support both tab key (tab-1) and label (Users, JWT Tokens)
    const targetKey = tabKeyMap[tabIdentifier] || tabIdentifier;
    if (panels[targetKey]) {
      setActiveTabKey(targetKey);
      
      // Update tabs state: increment click count and update focus
      setTabsState(prevState => {
        const newState = {};
        Object.keys(prevState).forEach(key => {
          if (key === targetKey) {
            newState[key] = {
              clickCount: prevState[key].clickCount + 1,
              isFocused: true
            };
          } else {
            newState[key] = {
              ...prevState[key],
              isFocused: false
            };
          }
        });
        return newState;
      });
      
      if (onTabChange) {
        onTabChange(targetKey);
      }
    }
  };

  // Expose switchTab method via ref
  useImperativeHandle(ref, () => ({
    switchTab: switchToTab
  }));

  const handleTabClick = (tabKey) => {
    switchToTab(tabKey);
  };

  const handleCloseTab = (e, tabKey) => {
    e.stopPropagation();
    if (onTabClose) {
      onTabClose(tabKey);
    }
  };

  const handleCreateTab = () => {
    if (onTabCreate) {
      onTabCreate();
    }
  };

  // Tab reordering handlers
  const handleTabDragStart = (e, tabKey, index) => {
    if (!allowTabReorder) return;
    
    e.stopPropagation();
    
    const btnRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate drag offset for ghost image positioning
    dragOffsetX.current = e.clientX - btnRect.left;
    dragOffsetY.current = e.clientY - btnRect.top;
    
    setDraggingTabKey(tabKey);
    
    // Create a ghost image
    const ghost = e.currentTarget.cloneNode(true);
    ghost.style.opacity = '0.5';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, dragOffsetX.current, dragOffsetY.current);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleTabDrag = (e) => {
    if (!draggingTabKey || !headerRef.current) return;
    
    e.preventDefault();
    
    if (e.clientX === 0 && e.clientY === 0) return;
    
    const headerRect = headerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - headerRect.left;
    
    // Calculate separator positions
    const tabButtons = headerRef.current.querySelectorAll('.tab-on-top-btn');
    const separators = [];
    let currentLeft = 0;
    
    // Build separator positions: before each tab and after the last one
    tabButtons.forEach((btn, idx) => {
      separators.push({ index: idx, position: currentLeft });
      currentLeft += btn.offsetWidth;
    });
    // Add final separator after all tabs
    separators.push({ index: tabButtons.length, position: currentLeft });
    
    // Find closest separator
    let closestSeparator = null;
    let minDistance = Infinity;
    
    separators.forEach(sep => {
      const distance = Math.abs(mouseX - sep.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestSeparator = sep;
      }
    });
    
    if (closestSeparator) {
      setDragOverSeparatorIndex(closestSeparator.index);
    }
  };

  const handleTabDragEnd = (e) => {
    if (!draggingTabKey || !onTabReorder) {
      setDraggingTabKey(null);
      setDragOverSeparatorIndex(null);
      return;
    }
    
    const draggedIndex = tabs.findIndex(t => t.key === draggingTabKey);
    
    if (dragOverSeparatorIndex !== null && dragOverSeparatorIndex !== draggedIndex && dragOverSeparatorIndex !== draggedIndex + 1) {
      // Calculate new position
      let newIndex = dragOverSeparatorIndex;
      if (dragOverSeparatorIndex > draggedIndex) {
        newIndex = dragOverSeparatorIndex - 1;
      }
      
      // Create new order
      const newTabs = [...tabs];
      const [draggedTab] = newTabs.splice(draggedIndex, 1);
      newTabs.splice(newIndex, 0, draggedTab);
      
      onTabReorder(newTabs);
    }
    
    setDraggingTabKey(null);
    setDragOverSeparatorIndex(null);
  };

  const handleTabDragOver = (e) => {
    if (draggingTabKey) {
      e.preventDefault();
    }
  };

  // Calculate separator position for rendering
  const getSeparatorPos = (sepIndex) => {
    if (!headerRef.current) return 0;
    const tabButtons = headerRef.current.querySelectorAll('.tab-on-top-btn');
    let position = 0;
    for (let i = 0; i < sepIndex && i < tabButtons.length; i++) {
      position += tabButtons[i].offsetWidth;
    }
    return position;
  };

  return (
    <div className="tabs-on-top-container">
      <div 
        className="tabs-on-top-header" 
        ref={headerRef}
        onDragOver={handleTabDragOver}
      >
        {tabs.map((tab, index) => {
          const isDragging = draggingTabKey === tab.key;
          return (
            <button
              key={tab.key}
              className={`tab-on-top-btn ${activeTabKey === tab.key ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${allowTabReorder ? 'reorderable' : ''}`}
              onClick={() => handleTabClick(tab.key)}
              draggable={allowTabReorder}
              onDragStart={(e) => handleTabDragStart(e, tab.key, index)}
              onDrag={handleTabDrag}
              onDragEnd={handleTabDragEnd}
              style={{ opacity: isDragging ? 0.3 : 1 }}
            >
              <span className="tab-label">{tab.label}</span>
              {allowCloseTab && (
                <span 
                  className="tab-close-btn"
                  onClick={(e) => handleCloseTab(e, tab.key)}
                >
                  <CrossIcon size={12} />
                </span>
              )}
            </button>
          );
        })}
        {allowTabCreate && (
          <button
            className="tab-create-btn"
            onClick={handleCreateTab}
          >
            <AddIcon size={14} />
          </button>
        )}
        
        {/* Render separator indicator at calculated position */}
        {dragOverSeparatorIndex !== null && (
          <div 
            className="tab-separator-indicator" 
            style={{ 
              position: 'absolute',
              left: `${getSeparatorPos(dragOverSeparatorIndex)}px`,
              top: 0,
              bottom: 0
            }}
          />
        )}
      </div>
      <div className="tabs-on-top-content">
        {Object.entries(panels).map(([tabKey, panelData]) => {
          const isActive = tabKey === activeTabKey;
          const keepMounted = panelData.keepMounted !== undefined ? panelData.keepMounted : defaultKeepMounted;
          
          // If not active and not keeping mounted, don't render at all
          if (!isActive && !keepMounted) {
            return null;
          }
          
          // Clone panel content and inject tabsState and tabKey props
          // Only inject into custom components (function/class), not DOM elements (string type)
          let enhancedContent = panelData.content;
          if (React.isValidElement(panelData.content)) {
            const element = panelData.content;
            // Check if it's a custom component (not a DOM element)
            if (typeof element.type === 'function' || typeof element.type === 'object') {
              enhancedContent = React.cloneElement(element, { 
                tabsState,
                tabKey
              });
            }
          }
          
          return (
            <div
              key={tabKey}
              className={`tab-panel ${isActive ? 'active' : ''}`}
              style={{ display: isActive ? 'block' : 'none' }}
            >
              {enhancedContent}
            </div>
          );
        })}
      </div>
    </div>
  );
});

TabsOnTop.displayName = 'TabsOnTop';

/**
 * Extract tab configuration from children
 */
let tabCounter = 0;
const genTabKey = () => `tab-${++tabCounter}`;

const extractTabConfig = (children) => {
  tabCounter = 0;
  
  const tabs = [];
  const panels = {};
  const tabKeyMap = {}; // Map label to key for easy lookup

  React.Children.forEach(children, (child) => {
    if (child && child.type && child.type.__isTabOnTopSlot) {
      const tabKey = genTabKey();
      const tabLabel = child.props.label;
      const keepMounted = child.props.keepMounted;

      tabs.push({
        key: tabKey,
        label: tabLabel
      });

      panels[tabKey] = {
        content: child.props.children,
        keepMounted: keepMounted
      };
      tabKeyMap[tabLabel.toLowerCase()] = tabKey; // Map lowercase label to key
    }
  });

  return { tabs, panels, tabKeyMap };
};

/**
 * Tab slot component
 * @param {string} label - Tab label text
 * @param {boolean} keepMounted - Whether to keep tab content mounted when inactive (true = hidden with display:none, false = unmounted)
 * @param {React.ReactNode} children - Tab content
 */
const TabSlot = ({ label, keepMounted, children }) => {
  return null;
};
TabSlot.__isTabOnTopSlot = true;

// Add Tab as a property of TabsOnTop
TabsOnTop.Tab = TabSlot;

export default TabsOnTop;
export { TabSlot as Tab };
