import React, { useState, useImperativeHandle, forwardRef, useMemo, ReactNode } from 'react';
import './TabsOnTop.css';
import CrossIcon from '@/icon/CrossIcon';
import AddIcon from '@/icon/AddIcon';

// Type definitions
interface TabsOnTopProps {
  children: ReactNode;
  defaultTab?: string;
  onTabChange?: (tabKey: string) => void;
  allowCloseTab?: boolean;
  onTabClose?: (tabKey: string) => void;
  allowTabCreate?: boolean;
  onTabCreate?: () => void;
}

interface TabsOnTopRef {
  switchTab: (tabIdentifier: string) => void;
}

interface Tab {
  key: string;
  label: string;
}

interface TabConfig {
  tabs: Tab[];
  panels: Record<string, ReactNode>;
  tabKeyMap: Record<string, string>;
}

/**
 * TabsOnTop - Layout component with horizontal tabs at the top
 * All tab contents are rendered (for lazy render control), but only active one is visible
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Tab components
 * @param {string} props.defaultTab - Default tab key (optional)
 * @param {Function} props.onTabChange - Callback when tab changes (optional)
 */
const TabsOnTop = forwardRef<TabsOnTopRef, TabsOnTopProps>(
  ({ 
    children, 
    defaultTab,
    onTabChange,
    allowCloseTab = false,
    onTabClose,
    allowTabCreate = false,
    onTabCreate
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
  const [activeTabKey, setActiveTabKey] = useState<string | null>(() => getInitialTab());
  
  // Update active tab if config changes and current tab is invalid
  React.useEffect(() => {
    if (!activeTabKey || !panels[activeTabKey]) {
      const newTab = getInitialTab();
      if (newTab) {
        setActiveTabKey(newTab);
      }
    }
  }, [config]);

  const switchToTab = (tabIdentifier: string) => {
    // Support both tab key (tab-1) and label (Users, JWT Tokens)
    const targetKey = tabKeyMap[tabIdentifier] || tabIdentifier;
    if (panels[targetKey]) {
      setActiveTabKey(targetKey);
      if (onTabChange) {
        onTabChange(targetKey);
      }
    }
  };

  // Expose switchTab method via ref
  useImperativeHandle(ref, () => ({
    switchTab: switchToTab
  }));

  const handleTabClick = (tabKey: string) => {
    switchToTab(tabKey);
  };

  const handleCloseTab = (e: React.MouseEvent, tabKey: string) => {
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

  return (
    <div className="tabs-on-top-container">
      <div className="tabs-on-top-header">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-on-top-btn ${activeTabKey === tab.key ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.key)}
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
        ))}
        {allowTabCreate && (
          <button
            className="tab-create-btn"
            onClick={handleCreateTab}
          >
            <AddIcon size={14} />
          </button>
        )}
      </div>
      <div className="tabs-on-top-content">
        {Object.entries(panels).map(([tabKey, panelContent]) => (
          <div
            key={tabKey}
            className={`tab-panel ${tabKey === activeTabKey ? 'active' : ''}`}
            style={{ display: tabKey === activeTabKey ? 'block' : 'none' }}
          >
            {panelContent}
          </div>
        ))}
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

const extractTabConfig = (children: ReactNode): TabConfig => {
  tabCounter = 0;
  
  const tabs: Tab[] = [];
  const panels: Record<string, ReactNode> = {};
  const tabKeyMap: Record<string, string> = {}; // Map label to key for easy lookup

  React.Children.forEach(children, (child: any) => {
    if (child && child.type && child.type.__isTabOnTopSlot) {
      const tabKey = genTabKey();
      const tabLabel = child.props.label;

      tabs.push({
        key: tabKey,
        label: tabLabel
      });

      panels[tabKey] = child.props.children;
      tabKeyMap[tabLabel.toLowerCase()] = tabKey; // Map lowercase label to key
    }
  });

  return { tabs, panels, tabKeyMap };
};

/**
 * Tab slot component
 */
interface TabSlotProps {
  label?: string;
  children?: ReactNode;
}

const TabSlot: React.FC<TabSlotProps> & { __isTabOnTopSlot: boolean } = ({ label, children }) => {
  return null;
};
TabSlot.__isTabOnTopSlot = true;

// Add Tab as a property of TabsOnTop
const TabsOnTopWithSlots = TabsOnTop as typeof TabsOnTop & {
  Tab: typeof TabSlot;
};

TabsOnTopWithSlots.Tab = TabSlot;

export default TabsOnTopWithSlots;
export { TabSlot as Tab };
export type { TabsOnTopRef, TabsOnTopProps };

