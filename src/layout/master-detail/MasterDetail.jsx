import React, { useState } from 'react';
import './MasterDetail.css';
import MasterDetailInfiLevel from './MasterDetailInfiLevel';
import PanelDual from '../../panel/PanelDual';

const renderPanels = (
  panels,
  activeSubtabKey,
  displayedPanels
) => {
  return Object.entries(panels).map(([subtabKey, panelComponent]) => {
    const shouldRender = displayedPanels.has(subtabKey);
    
    return (
      <div
        key={subtabKey}
        style={{ display: subtabKey === activeSubtabKey ? 'block' : 'none' }}
      >
        {shouldRender ? panelComponent : null}
      </div>
    );
  });
};

const MasterDetail = ({
  title,
  initialSidebarRatio = 0.25,
  children,
  lazyRender = true
}) => {
  const maxDepth = detectMaxDepth(children);
  
  if (maxDepth > 2) {
    return (
      <MasterDetailInfiLevel
        title={title}
        initialSidebarRatio={initialSidebarRatio}
        lazyRender={lazyRender}
      >
        {children}
      </MasterDetailInfiLevel>
    );
  }
  
  const [config] = useState(() => extractTabStructure(children));
  const { tabs: initialTabs, subtabs, panels } = config;
  
  const initialActiveSubtabKey = (() => {
    for (const [subtabKey, subtab] of Object.entries(subtabs)) {
      if (subtab.isDefault) {
        return subtabKey;
      }
    }
    return initialTabs[0]?.subtabKeys[0] || null;
  })();
  
  const initialActiveTabKey = (() => {
    if (initialActiveSubtabKey) {
      const parentTab = initialTabs.find(tab => tab.subtabKeys.includes(initialActiveSubtabKey));
      if (parentTab) return parentTab.key;
    }
    return initialTabs[0]?.key || '';
  })();
  
  const [tabs, setTabs] = useState(() =>
    initialTabs.map(tab => ({
      ...tab,
      isExpanded: tab.key === initialActiveTabKey
    }))
  );
  
  const [activeTabKey, setActiveTabKey] = useState(initialActiveTabKey);
  const [activeSubtabKey, setActiveSubtabKey] = useState(initialActiveSubtabKey);
  
  const [displayedPanels, setDisplayedPanels] = useState(() => {
    if (lazyRender) {
      return new Set(activeSubtabKey ? [activeSubtabKey] : []);
    } else {
      return new Set(Object.keys(panels));
    }
  });
  
  React.useEffect(() => {
    if (activeSubtabKey) {
      setDisplayedPanels(prev => new Set([...prev, activeSubtabKey]));
    }
  }, [activeSubtabKey]);

  const onTabClicked = (tabKey) => {
    setActiveTabKey(tabKey);

    const targetTab = tabs.find(tab => tab.key === tabKey);
    if (targetTab) {
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.key === tabKey 
            ? { ...tab, isExpanded: !tab.isExpanded }
            : tab
        )
      );

      if (targetTab.subtabKeys.length > 0) {
        setActiveSubtabKey(targetTab.subtabKeys[0]);
      } else {
        setActiveSubtabKey(null);
      }
    }
  };

  const onSubtabClicked = (subtabKey) => {
    if (!subtabKey) return;
    
    const parentTab = tabs.find(tab => tab.subtabKeys.includes(subtabKey));

    if (parentTab && parentTab.key !== activeTabKey) {
      setActiveTabKey(parentTab.key);
    }

    setActiveSubtabKey(subtabKey);
  };

  const onToggleExpand = (tabKey) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.key === tabKey 
          ? { ...tab, isExpanded: !tab.isExpanded }
          : tab
      )
    );
    
    const currentTab = tabs.find(tab => tab.key === tabKey);
    if (currentTab?.isExpanded) {
    } else {
      if (activeTabKey === tabKey && currentTab && currentTab.subtabKeys.length > 0) {
        setActiveSubtabKey(currentTab.subtabKeys[0]);
      }
    }
  };


  return (
    <div className="master-detail-container">
      <PanelDual orientation="vertical" initialRatio={initialSidebarRatio}>
        <Tabs
          title={title}
          tabs={tabs}
          subtabs={subtabs}
          activeTabKey={activeTabKey}
          activeSubtabKey={activeSubtabKey}
          onTabClicked={onTabClicked}
          onSubtabClicked={onSubtabClicked}
          onToggleExpand={onToggleExpand}
        />
        <Panels
          activeSubtabKey={activeSubtabKey}
          panels={panels}
          displayedPanels={displayedPanels}
        />
      </PanelDual>
    </div>
  );
};

const Tab = ({ tabKey, label, isActive, isExpanded, onClick, onToggleExpand }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="tab-container">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand(tabKey);
        }}
        className="tab-expand-btn"
      >
        <span className={`tab-expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▶
        </span>
      </button>

      <button
        onClick={() => onClick(tabKey)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`tab-label-btn ${isActive ? 'active' : ''} ${isHovered ? 'hover' : ''}`}
      >
        {label}
      </button>
    </div>
  );
};

const SubTab = ({ subtabKey, label, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => onClick(subtabKey)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`subtab-btn ${isActive ? 'active' : ''} ${isHovered ? 'hover' : ''}`}
    >
      {label}
    </button>
  );
};

const Tabs = ({ 
  title, 
  tabs, 
  subtabs, 
  activeTabKey, 
  activeSubtabKey, 
  onTabClicked, 
  onSubtabClicked,
  onToggleExpand
}) => {
  const currentTab = tabs.find(tab => tab.key === activeTabKey);
  const currentSubTabs = currentTab?.subtabKeys || [];

  return (
    <div className="tabs-sidebar">
      <div className="tabs-header">
        <h3>
          {title}
        </h3>
      </div>

      <div className="tabs-list">
        {tabs.map(tab => (
          <div key={tab.key}>
            <Tab
              tabKey={tab.key}
              label={tab.label}
              isActive={activeTabKey === tab.key}
              isExpanded={tab.isExpanded ?? false}
              onClick={onTabClicked}
              onToggleExpand={onToggleExpand}
            />
            {tab.isExpanded && tab.subtabKeys.map(subtabKey => {
              const subTab = subtabs[subtabKey];
              return subTab ? (
                <SubTab
                  key={subtabKey}
                  subtabKey={subtabKey}
                  label={subTab.label}
                  isActive={activeSubtabKey === subtabKey}
                  onClick={onSubtabClicked}
                />
              ) : null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const Panels = ({ activeSubtabKey, panels, displayedPanels }) => {
  return (
    <div className="panels-container">
      {renderPanels(panels, activeSubtabKey, displayedPanels)}
    </div>
  );
};

let tabCounter = 0;
const genTabKey = () => `tab-${++tabCounter}`;

let subTabCounter = 0;
const genSubTabKey = () => `subtab-${++subTabCounter}`;

const detectMaxDepth = (children, currentDepth = 1) => {
  let maxDepth = currentDepth;
  
  React.Children.forEach(children, (child) => {
    if (child && child.type && (child.type.__isTabSlot || child.type.__isSubTabSlot)) {
      let childMaxDepth = currentDepth;
      
      let hasSubTabChildren = false;
      React.Children.forEach(child.props.children, (subChild) => {
        if (subChild && subChild.type && subChild.type.__isSubTabSlot) {
          hasSubTabChildren = true;
          const subDepth = detectMaxDepth(child.props.children, currentDepth + 1);
          childMaxDepth = Math.max(childMaxDepth, subDepth);
        }
      });
      
      maxDepth = Math.max(maxDepth, childMaxDepth);
    }
  });
  
  return maxDepth;
};

const extractTabStructure = (children) => {
  tabCounter = 0;
  subTabCounter = 0;
  
  const tabs = [];
  const subtabs = {};
  const panels = {};

  React.Children.forEach(children, (tabChild) => {
    if (tabChild && tabChild.type && tabChild.type.__isTabSlot) {
      const tabKey = genTabKey();
      const tabLabel = tabChild.props.label;
      const subtabKeys = [];

      React.Children.forEach(tabChild.props.children, (subtabChild) => {
        if (subtabChild && subtabChild.type && subtabChild.type.__isSubTabSlot) {
          const subtabKey = genSubTabKey();
          const subtabLabel = subtabChild.props.label;
          const isDefault = subtabChild.props.isDefault || false;

          subtabKeys.push(subtabKey);
          subtabs[subtabKey] = { label: subtabLabel, isDefault };

          let foundPanel = false;
          React.Children.forEach(subtabChild.props.children, (panelChild) => {
            if (panelChild && panelChild.type && panelChild.type.__isPanelSlot) {
              panels[subtabKey] = panelChild.props.children;
              foundPanel = true;
            }
          });
          
          if (!foundPanel) {
            panels[subtabKey] = subtabChild.props.children;
          }
        }
      });

      tabs.push({
        key: tabKey,
        label: tabLabel,
        subtabKeys: subtabKeys
      });
    }
  });
  return { tabs, subtabs, panels };
};


const TabSlot = ({ label, children }) => {
  return null;
};
TabSlot.__isTabSlot = true;

const SubTabSlot = ({ label, children }) => {
  return null;
};
SubTabSlot.__isSubTabSlot = true;

const PanelSlot = ({ children }) => {
  return null;
};
PanelSlot.__isPanelSlot = true;

const MasterDetailWithSlots = MasterDetail;

MasterDetailWithSlots.Tab = TabSlot;
MasterDetailWithSlots.SubTab = SubTabSlot;
MasterDetailWithSlots.Panel = PanelSlot;

export { TabSlot as Tab, SubTabSlot as SubTab, PanelSlot as Panel };
export default MasterDetailWithSlots;
