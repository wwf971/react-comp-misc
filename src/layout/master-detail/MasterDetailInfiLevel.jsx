import React, { useState } from 'react';
import './MasterDetail.css';
import PanelDual from '../panel/PanelDual';
import PlusIcon from '../../icon/PlusIcon';
import MinusIcon from '../../icon/MinusIcon';

const MasterDetailInfiLevel = ({
  title,
  initialSidebarRatio = 0.25,
  children,
  lazyRender = true,
  isToggleExpandOnItemClick = true,
}) => {
  const [tree] = useState(() => parseTreeStructure(children));
  const [panels] = useState(() => extractAllPanels(tree));
  
  const defaultNode = findDefaultNode(tree) || findFirstLeaf(tree);
  const defaultPath = defaultNode ? getPathToNode(tree, defaultNode.key) : [];
  
  const [treeWithExpansion] = useState(() => expandPath(tree, defaultPath));
  
  const [activeNodeKey, setActiveNodeKey] = useState(defaultNode?.key || '');
  const [activePath, setActivePath] = useState(defaultPath);
  
  const [displayedPanels, setDisplayedPanels] = useState(() => {
    if (lazyRender && defaultNode) {
      return new Set([defaultNode.key]);
    }
    return new Set(Object.keys(panels));
  });
  
  const onNodeClick = (nodeKey) => {
    const node = findNodeByKey(treeWithExpansion, nodeKey);
    if (!node) return;
    
    if (node.isLeaf) {
      setActiveNodeKey(nodeKey);
      const path = getPathToNode(treeWithExpansion, nodeKey);
      setActivePath(path);
      
      if (lazyRender) {
        setDisplayedPanels(prev => new Set([...prev, nodeKey]));
      }
    } else {
      if (!isToggleExpandOnItemClick) {
        return;
      }
      onToggleExpand(nodeKey);
    }
  };
  
  const onToggleExpand = (nodeKey) => {
    const toggleNodeExpansion = (nodes) => {
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
    setActivePath([...activePath]);
  };

  return (
    <div className="master-detail-container">
      <PanelDual orientation="vertical" initialRatio={initialSidebarRatio}>
        <div className="tabs-sidebar">
          <div className="tabs-header">
            <div className="tabs-header-title">{title}</div>
          </div>
          <div className="tabs-list">
            {treeWithExpansion.map(node => (
              <TreeItem
                key={node.key}
                node={node}
                activePath={activePath}
                onNodeClick={onNodeClick}
                onToggleExpand={onToggleExpand}
                isToggleExpandOnItemClick={isToggleExpandOnItemClick}
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
      </PanelDual>
    </div>
  );
};

const TreeItem = ({ node, activePath, onNodeClick, onToggleExpand, isToggleExpandOnItemClick }) => {
  const isActive = activePath.includes(node.key);
  const isActiveLeaf = activePath[activePath.length - 1] === node.key;
  const hasChildren = node.children.length > 0;
  
  return (
    <div className="master-detail-tree-item">
      <div className="master-detail-tree-row">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!hasChildren) return;
            onToggleExpand(node.key);
          }}
          className={`master-detail-tree-toggle-btn ${hasChildren ? '' : 'is-empty'}`}
          disabled={!hasChildren}
          aria-label={!hasChildren ? 'No children' : (node.isExpanded ? 'Collapse' : 'Expand')}
        >
          {hasChildren ? (
            node.isExpanded
              ? <MinusIcon width={12} height={12} color="#666" />
              : <PlusIcon width={12} height={12} color="#666" />
          ) : null}
        </button>

        <button
          onClick={() => onNodeClick(node.key)}
          type="button"
          className={`master-detail-tree-label-btn ${isActiveLeaf ? 'active' : ''} ${isActive ? 'is-in-path' : ''} ${node.isLeaf ? 'is-leaf' : 'is-branch'}`}
        >
          {node.label}
        </button>
      </div>
      
      {node.isExpanded && node.children.map(childNode => (
        <div key={childNode.key} className="master-detail-tree-children">
          <TreeItem
            node={childNode}
            activePath={activePath}
            onNodeClick={onNodeClick}
            onToggleExpand={onToggleExpand}
            isToggleExpandOnItemClick={isToggleExpandOnItemClick}
          />
        </div>
      ))}
    </div>
  );
};

let nodeCounter = 0;
const genNodeKey = () => `node-${++nodeCounter}`;

const parseTreeStructure = (children, level = 0) => {
  const nodes = [];
  
  React.Children.forEach(children, (child) => {
    if (child && child.type && (child.type.__isTabSlot || child.type.__isSubTabSlot)) {
      const nodeKey = genNodeKey();
      const label = child.props.label || 'Untitled';
      const isDefault = child.props.isDefault || false;
      
      let panelContent = null;
      let childSubTabs = [];
      
      React.Children.forEach(child.props.children, (subChild) => {
        if (subChild && subChild.type && subChild.type.__isPanelSlot) {
          panelContent = subChild.props.children;
        } else if (subChild && subChild.type && subChild.type.__isSubTabSlot) {
          childSubTabs.push(subChild);
        }
      });
      
      if (!panelContent && childSubTabs.length === 0) {
        panelContent = child.props.children;
      }
      
      const isLeaf = childSubTabs.length === 0;
      const childNodes = childSubTabs.length > 0 
        ? parseTreeStructure(childSubTabs, level + 1) 
        : [];
      
      const node = {
        key: nodeKey,
        label,
        level,
        children: childNodes,
        isExpanded: false,
        panelContent: isLeaf ? panelContent : null,
        isLeaf
      };
      
      if (isDefault) {
        node.isDefault = isDefault;
      }
      
      nodes.push(node);
    }
  });
  
  return nodes;
};

const extractAllPanels = (tree) => {
  const panels = {};
  
  const traverse = (nodes) => {
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

const findDefaultNode = (tree) => {
  for (const node of tree) {
    if (node.isDefault && node.isLeaf) {
      return node;
    }
    if (node.children.length > 0) {
      const found = findDefaultNode(node.children);
      if (found) return found;
    }
  }
  return null;
};

const findFirstLeaf = (tree) => {
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

const getPathToNode = (tree, targetKey, currentPath = []) => {
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

const expandPath = (tree, path) => {
  const expandNode = (nodes) => {
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

const findNodeByKey = (tree, key) => {
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

const MasterDetailInfiLevelWithSlots = MasterDetailInfiLevel;

MasterDetailInfiLevelWithSlots.Tab = TabSlot;
MasterDetailInfiLevelWithSlots.SubTab = SubTabSlot;
MasterDetailInfiLevelWithSlots.Panel = PanelSlot;

export { TabSlot as Tab, SubTabSlot as SubTab, PanelSlot as Panel };
export default MasterDetailInfiLevelWithSlots;
