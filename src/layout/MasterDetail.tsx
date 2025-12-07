import React, { useState, ReactNode } from 'react';
import './MasterDetail.css';

// Type definitions
interface Tab {
  key: string;
  label: string;
  subtabKeys: string[];
  isExpanded?: boolean;
}

interface Subtab {
  label: string;
  isDefault?: boolean;
}

interface TabStructure {
  tabs: Tab[];
  subtabs: Record<string, Subtab>;
  panels: Record<string, ReactNode>;
}

interface MasterDetailProps {
  title: string;
  sidebarWidth?: string;
  children: ReactNode;
  lazyRender?: boolean;
}

interface TabProps {
  tabKey: string;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: (tabKey: string) => void;
  onToggleExpand: (tabKey: string) => void;
}

interface SubTabProps {
  subtabKey: string;
  label: string;
  isActive: boolean;
  onClick: (subtabKey: string | null) => void;
}

interface TabsProps {
  title: string;
  tabs: Tab[];
  subtabs: Record<string, Subtab>;
  activeTabKey: string;
  activeSubtabKey: string | null;
  onTabClicked: (tabKey: string) => void;
  onSubtabClicked: (subtabKey: string | null) => void;
  onToggleExpand: (tabKey: string) => void;
  sidebarWidth?: string;
}

interface PanelsProps {
  activeSubtabKey: string | null;
  panels: Record<string, ReactNode>;
  displayedPanels: Set<string>;
}

interface SlotProps {
  label?: string;
  children?: ReactNode;
  isDefault?: boolean;
}

/**
 * Render all panels with visibility control and lazy rendering
 */
const renderPanels = (
  panels: Record<string, ReactNode>,
  activeSubtabKey: string | null,
  displayedPanels: Set<string>
): React.JSX.Element[] => {
  return Object.entries(panels).map(([subtabKey, panelComponent]) => {
    // lazy rendering: only render if panel has been displayed before
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

/**
 * MasterDetail - Reusable component with tabs on left (master), panels on right (detail)
 */
const MasterDetail: React.FC<MasterDetailProps> = ({
  title,
  sidebarWidth = '200px',
  children,
  lazyRender = true
}) => {
  // Extract configuration from children - only run once
  const [config] = useState(() => extractTabStructure(children));
  const { tabs: initialTabs, subtabs, panels } = config;
  
  // Find default subtab or use first one
  const initialActiveSubtabKey = (() => {
    // Look for a subtab with isDefault=true
    for (const [subtabKey, subtab] of Object.entries(subtabs)) {
      if (subtab.isDefault) {
        return subtabKey;
      }
    }
    // Fallback to first subtab
    return initialTabs[0]?.subtabKeys[0] || null;
  })();
  
  // Find which tab contains the default/active subtab
  const initialActiveTabKey = (() => {
    if (initialActiveSubtabKey) {
      const parentTab = initialTabs.find(tab => tab.subtabKeys.includes(initialActiveSubtabKey));
      if (parentTab) return parentTab.key;
    }
    return initialTabs[0]?.key || '';
  })();
  
  // add isExpanded property to initialTabs - expand the tab containing default subtab
  const [tabs, setTabs] = useState(() =>
    initialTabs.map(tab => ({
      ...tab,
      isExpanded: tab.key === initialActiveTabKey
    }))
  );
  
  const [activeTabKey, setActiveTabKey] = useState<string>(initialActiveTabKey);
  const [activeSubtabKey, setActiveSubtabKey] = useState<string | null>(initialActiveSubtabKey);
  
  // track which panels have been displayed (for lazy rendering)
  const [displayedPanels, setDisplayedPanels] = useState(() => {
    if (lazyRender) {
      // Start with the active subtab (which may be the default one)
      return new Set(activeSubtabKey ? [activeSubtabKey] : []);
    } else {
      // all panels
      return new Set(Object.keys(panels));
    }
  });
  
  // update displayed panels when activeSubtabKey changes
  React.useEffect(() => {
    if (activeSubtabKey) {
      setDisplayedPanels(prev => new Set([...prev, activeSubtabKey]));
    }
  }, [activeSubtabKey]);

  const onTabClicked = (tabKey: string) => {
    // switch to new tab
    setActiveTabKey(tabKey);

    // toggle expand state
    const targetTab = tabs.find(tab => tab.key === tabKey);
    if (targetTab) {
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.key === tabKey 
            ? { ...tab, isExpanded: !tab.isExpanded }
            : tab
        )
      );

      // set first subtab as active if tab has subtabs
      if (targetTab.subtabKeys.length > 0) {
        setActiveSubtabKey(targetTab.subtabKeys[0]);
      } else {
        setActiveSubtabKey(null);
      }
    }
  };

  const onSubtabClicked = (subtabKey: string | null) => {
    if (!subtabKey) return;
    
    // find the parent tab that contains this subtab
    const parentTab = tabs.find(tab => tab.subtabKeys.includes(subtabKey));

    // set the parent tab as active if found and not already active
    if (parentTab && parentTab.key !== activeTabKey) {
      setActiveTabKey(parentTab.key);
    }

    setActiveSubtabKey(subtabKey);
  };

  const onToggleExpand = (tabKey: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.key === tabKey 
          ? { ...tab, isExpanded: !tab.isExpanded }
          : tab
      )
    );
    
    // handle subtab state when toggling
    const currentTab = tabs.find(tab => tab.key === tabKey);
    if (currentTab?.isExpanded) {
      // active subtab won't be cleared, even if parent tab is collapsed
    } else {
      // if expanding and this is the active tab, set first subtab as active
      if (activeTabKey === tabKey && currentTab && currentTab.subtabKeys.length > 0) {
        setActiveSubtabKey(currentTab.subtabKeys[0]);
      }
    }
  };


  return (
    <div className="master-detail-container">
      <Tabs
        title={title}
        tabs={tabs}
        subtabs={subtabs}
        activeTabKey={activeTabKey}
        activeSubtabKey={activeSubtabKey}
        onTabClicked={onTabClicked}
        onSubtabClicked={onSubtabClicked}
        onToggleExpand={onToggleExpand}
        sidebarWidth={sidebarWidth}
      />
      <Panels
        activeSubtabKey={activeSubtabKey}
        panels={panels}
        displayedPanels={displayedPanels}
      />
    </div>
  );
};

/**
 * Individual Tab component
 */
const Tab: React.FC<TabProps> = ({ tabKey, label, isActive, isExpanded, onClick, onToggleExpand }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="tab-container">
      {/* Triangle icon for expand/collapse */}
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

      {/* Tab label */}
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

/**
 * Individual SubTab component
 */
const SubTab: React.FC<SubTabProps> = ({ subtabKey, label, isActive, onClick }) => {
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

/**
 * Tabs container component with subtabs
 */
const Tabs: React.FC<TabsProps> = ({ 
  title, 
  tabs, 
  subtabs, 
  activeTabKey, 
  activeSubtabKey, 
  onTabClicked, 
  onSubtabClicked,
  onToggleExpand,
  sidebarWidth = '200px'
}) => {
  const currentTab = tabs.find(tab => tab.key === activeTabKey);
  const currentSubTabs = currentTab?.subtabKeys || [];

  return (
    <div className="tabs-sidebar" style={{ width: sidebarWidth }}>
      {/* Header */}
      <div className="tabs-header">
        <h3>
          {title}
        </h3>
      </div>

      {/* Tab List */}
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
            {/* Render subtabs if this tab is expanded */}
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

/**
 * Panels container component
 */
const Panels: React.FC<PanelsProps> = ({ activeSubtabKey, panels, displayedPanels }) => {
  return (
    <div className="panels-container">
      {renderPanels(panels, activeSubtabKey, displayedPanels)}
    </div>
  );
};

// Generate unique tab keys
let tabCounter = 0;
const genTabKey = () => `tab-${++tabCounter}`;

// Generate unique subtab keys
let subTabCounter = 0;
const genSubTabKey = () => `subtab-${++subTabCounter}`;

/**
 * Helper function to extract tab/subtab/panel configuration from children
 */
const extractTabStructure = (children: ReactNode): TabStructure => {
  // Reset counters for each extraction
  tabCounter = 0;
  subTabCounter = 0;
  
  const tabs: Tab[] = [];
  const subtabs: Record<string, Subtab> = {};
  const panels: Record<string, ReactNode> = {};

  React.Children.forEach(children, (tabChild: any) => {
    if (tabChild && tabChild.type && tabChild.type.__isTabSlot) {
      const tabKey = genTabKey();
      const tabLabel = tabChild.props.label;
      const subtabKeys: string[] = [];

      React.Children.forEach(tabChild.props.children, (subtabChild: any) => {
        if (subtabChild && subtabChild.type && subtabChild.type.__isSubTabSlot) {
          const subtabKey = genSubTabKey();
          const subtabLabel = subtabChild.props.label;
          const isDefault = subtabChild.props.isDefault || false;

          subtabKeys.push(subtabKey);
          subtabs[subtabKey] = { label: subtabLabel, isDefault };

          // Extract panel content
          // Check if there's an explicit <Panel> component, otherwise use all children
          let foundPanel = false;
          React.Children.forEach(subtabChild.props.children, (panelChild: any) => {
            if (panelChild && panelChild.type && panelChild.type.__isPanelSlot) {
              panels[subtabKey] = panelChild.props.children;
              foundPanel = true;
            }
          });
          
          // If no <Panel> component found, use all children as panel content
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


/**
 * Tab slot component - defines a tab and its subtabs
 */
const TabSlot: React.FC<SlotProps> & { __isTabSlot: boolean } = ({ label, children }) => {
  return null;
};
TabSlot.__isTabSlot = true;

const SubTabSlot: React.FC<SlotProps> & { __isSubTabSlot: boolean } = ({ label, children }) => {
  return null;
};
SubTabSlot.__isSubTabSlot = true;

const PanelSlot: React.FC<SlotProps> & { __isPanelSlot: boolean } = ({ children }) => {
  return null;
};
PanelSlot.__isPanelSlot = true;

// Extend the component with slot properties
const MasterDetailWithSlots = MasterDetail as typeof MasterDetail & {
  Tab: typeof TabSlot;
  SubTab: typeof SubTabSlot;
  Panel: typeof PanelSlot;
};

MasterDetailWithSlots.Tab = TabSlot;
MasterDetailWithSlots.SubTab = SubTabSlot;
MasterDetailWithSlots.Panel = PanelSlot;

// Export components individually for cleaner imports
export { TabSlot as Tab, SubTabSlot as SubTab, PanelSlot as Panel };
export default MasterDetailWithSlots;
