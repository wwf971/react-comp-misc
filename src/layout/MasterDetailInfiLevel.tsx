import React, { useState, ReactNode } from 'react';
import './MasterDetail.css';

// Type definitions
interface TreeNode {
  key: string;
  label: string;
  level: number;
  children: TreeNode[];
  isExpanded?: boolean;
  panelContent?: ReactNode;
  isLeaf: boolean; // true if this node has a panel (no more children)
}

interface MasterDetailInfiLevelProps {
  title: string;
  sidebarWidth?: string;
  children: ReactNode;
  lazyRender?: boolean;
}

interface TreeItemProps {
  node: TreeNode;
  activePath: string[];
  onNodeClick: (nodeKey: string) => void;
  onToggleExpand: (nodeKey: string) => void;
}

interface SlotProps {
  label?: string;
  children?: ReactNode;
  isDefault?: boolean;
}

/**
 * MasterDetailInfiLevel - Supports infinite levels of nested SubTabs
 */
const MasterDetailInfiLevel: React.FC<MasterDetailInfiLevelProps> = ({
  title,
  sidebarWidth = '200px',
  children,
  lazyRender = true
}) => {
  // Extract tree structure from children
  const [tree] = useState(() => parseTreeStructure(children));
  const [panels] = useState(() => extractAllPanels(tree));
  
  // Find default node or use first leaf
  const defaultNode = findDefaultNode(tree) || findFirstLeaf(tree);
  const defaultPath = defaultNode ? getPathToNode(tree, defaultNode.key) : [];
  
  // Initialize with default node expanded all the way down
  const [treeWithExpansion] = useState(() => expandPath(tree, defaultPath));
  
  const [activeNodeKey, setActiveNodeKey] = useState<string>(defaultNode?.key || '');
  const [activePath, setActivePath] = useState<string[]>(defaultPath);
  
  // Track displayed panels for lazy rendering
  const [displayedPanels, setDisplayedPanels] = useState(() => {
    if (lazyRender && defaultNode) {
      return new Set([defaultNode.key]);
    }
    return new Set(Object.keys(panels));
  });
  
  const onNodeClick = (nodeKey: string) => {
    const node = findNodeByKey(treeWithExpansion, nodeKey);
    if (!node) return;
    
    if (node.isLeaf) {
      // Clicking on a leaf node - select it directly
      setActiveNodeKey(nodeKey);
      const path = getPathToNode(treeWithExpansion, nodeKey);
      setActivePath(path);
      
      // Add to displayed panels
      if (lazyRender) {
        setDisplayedPanels(prev => new Set([...prev, nodeKey]));
      }
    } else {
      // Clicking on a non-leaf node - find first leaf in its subtree
      const firstLeaf = findFirstLeaf([node]);
      if (firstLeaf) {
        // Expand this node and all nodes in path to first leaf
        const pathToLeaf = getPathToNode(treeWithExpansion, firstLeaf.key);
        const newTree = expandPath(treeWithExpansion, pathToLeaf);
        treeWithExpansion.splice(0, treeWithExpansion.length, ...newTree);
        
        // Select the first leaf
        setActiveNodeKey(firstLeaf.key);
        setActivePath(pathToLeaf);
        
        // Add to displayed panels
        if (lazyRender) {
          setDisplayedPanels(prev => new Set([...prev, firstLeaf.key]));
        }
      } else {
        // No leaf found, just toggle expansion
        onToggleExpand(nodeKey);
      }
    }
  };
  
  const onToggleExpand = (nodeKey: string) => {
    const toggleNodeExpansion = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.key === nodeKey) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children.length > 0) {
          return { ...node, children: toggleNodeExpansion(node.children) };
        }
        return node;
      });
    };
    
    treeWithExpansion.splice(0, treeWithExpansion.length, ...toggleNodeExpansion(treeWithExpansion));
    // Force re-render
    setActivePath([...activePath]);
  };

  return (
    <div className="master-detail-container">
      <div className="tabs-sidebar" style={{ width: sidebarWidth }}>
        <div className="tabs-header">
          <h3>{title}</h3>
        </div>
        <div className="tabs-list">
          {treeWithExpansion.map(node => (
            <TreeItem
              key={node.key}
              node={node}
              activePath={activePath}
              onNodeClick={onNodeClick}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      </div>
      <div className="panels-container">
        {Object.entries(panels).map(([nodeKey, panelContent]) => {
          const shouldRender = displayedPanels.has(nodeKey);
          return (
            <div
              key={nodeKey}
              style={{ display: nodeKey === activeNodeKey ? 'block' : 'none' }}
            >
              {shouldRender ? panelContent : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Recursive tree item component
 */
const TreeItem: React.FC<TreeItemProps> = ({ node, activePath, onNodeClick, onToggleExpand }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = activePath.includes(node.key);
  const isActiveLeaf = activePath[activePath.length - 1] === node.key;
  const hasChildren = node.children.length > 0;
  
  return (
    <div>
      <div className="tab-container" style={{ paddingLeft: `${node.level * 12}px` }}>
        {/* Triangle for expand/collapse (only show if has children) */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.key);
            }}
            className="tab-expand-btn"
          >
            <span className={`tab-expand-icon ${node.isExpanded ? 'expanded' : ''}`}>
              ▶
            </span>
          </button>
        )}
        {!hasChildren && <span style={{ width: '5px', display: 'inline-block' }}></span>}
        
        {/* Node label */}
        <button
          onClick={() => onNodeClick(node.key)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`tab-label-btn ${isActiveLeaf ? 'active' : ''} ${isHovered ? 'hover' : ''}`}
          style={{ 
            fontWeight: isActive ? 'bold' : 'normal',
            opacity: node.isLeaf ? 1 : 0.8
          }}
        >
          {node.label}
        </button>
      </div>
      
      {/* Render children recursively if expanded */}
      {node.isExpanded && node.children.map(childNode => (
        <TreeItem
          key={childNode.key}
          node={childNode}
          activePath={activePath}
          onNodeClick={onNodeClick}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </div>
  );
};

// Counter for unique keys
let nodeCounter = 0;
const genNodeKey = () => `node-${++nodeCounter}`;

/**
 * Parse children into tree structure
 */
const parseTreeStructure = (children: ReactNode, level: number = 0): TreeNode[] => {
  const nodes: TreeNode[] = [];
  
  React.Children.forEach(children, (child: any) => {
    if (child && child.type && (child.type.__isTabSlot || child.type.__isSubTabSlot)) {
      const nodeKey = genNodeKey();
      const label = child.props.label || 'Untitled';
      const isDefault = child.props.isDefault || false;
      
      // Check if this node has a Panel or more SubTabs
      let panelContent: ReactNode = null;
      let childSubTabs: ReactNode[] = [];
      
      React.Children.forEach(child.props.children, (subChild: any) => {
        if (subChild && subChild.type && subChild.type.__isPanelSlot) {
          panelContent = subChild.props.children;
        } else if (subChild && subChild.type && subChild.type.__isSubTabSlot) {
          childSubTabs.push(subChild);
        }
      });
      
      // If no explicit Panel found but has non-SubTab children, use them as panel
      if (!panelContent && childSubTabs.length === 0) {
        panelContent = child.props.children;
      }
      
      const isLeaf = childSubTabs.length === 0;
      const childNodes = childSubTabs.length > 0 
        ? parseTreeStructure(childSubTabs, level + 1) 
        : [];
      
      nodes.push({
        key: nodeKey,
        label,
        level,
        children: childNodes,
        isExpanded: false,
        panelContent: isLeaf ? panelContent : null,
        isLeaf,
        ...(isDefault && { isDefault })
      } as TreeNode & { isDefault?: boolean });
    }
  });
  
  return nodes;
};

/**
 * Extract all panels from tree
 */
const extractAllPanels = (tree: TreeNode[]): Record<string, ReactNode> => {
  const panels: Record<string, ReactNode> = {};
  
  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      if (node.isLeaf && node.panelContent) {
        panels[node.key] = node.panelContent;
      }
      if (node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  
  traverse(tree);
  return panels;
};

/**
 * Find default node (marked with isDefault)
 */
const findDefaultNode = (tree: TreeNode[]): TreeNode | null => {
  for (const node of tree) {
    if ((node as any).isDefault && node.isLeaf) {
      return node;
    }
    if (node.children.length > 0) {
      const found = findDefaultNode(node.children);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Find first leaf node
 */
const findFirstLeaf = (tree: TreeNode[]): TreeNode | null => {
  for (const node of tree) {
    if (node.isLeaf) {
      return node;
    }
    if (node.children.length > 0) {
      const found = findFirstLeaf(node.children);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Get path from root to a specific node
 */
const getPathToNode = (tree: TreeNode[], targetKey: string, currentPath: string[] = []): string[] => {
  for (const node of tree) {
    const newPath = [...currentPath, node.key];
    if (node.key === targetKey) {
      return newPath;
    }
    if (node.children.length > 0) {
      const found = getPathToNode(node.children, targetKey, newPath);
      if (found.length > 0 && found[found.length - 1] === targetKey) {
        return found;
      }
    }
  }
  return [];
};

/**
 * Expand all nodes in a path
 */
const expandPath = (tree: TreeNode[], path: string[]): TreeNode[] => {
  const expandNode = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map(node => {
      if (path.includes(node.key)) {
        return {
          ...node,
          isExpanded: true,
          children: expandNode(node.children)
        };
      }
      return {
        ...node,
        children: expandNode(node.children)
      };
    });
  };
  
  return expandNode(tree);
};

/**
 * Find node by key
 */
const findNodeByKey = (tree: TreeNode[], key: string): TreeNode | null => {
  for (const node of tree) {
    if (node.key === key) {
      return node;
    }
    if (node.children.length > 0) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Slot components (reuse from MasterDetail)
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

// Extend component with slots
const MasterDetailInfiLevelWithSlots = MasterDetailInfiLevel as typeof MasterDetailInfiLevel & {
  Tab: typeof TabSlot;
  SubTab: typeof SubTabSlot;
  Panel: typeof PanelSlot;
};

MasterDetailInfiLevelWithSlots.Tab = TabSlot;
MasterDetailInfiLevelWithSlots.SubTab = SubTabSlot;
MasterDetailInfiLevelWithSlots.Panel = PanelSlot;

export { TabSlot as Tab, SubTabSlot as SubTab, PanelSlot as Panel };
export default MasterDetailInfiLevelWithSlots;

