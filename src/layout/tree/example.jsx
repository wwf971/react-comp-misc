import React, { useEffect, useMemo, useState } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import TreeView, { TreeTextItemComp } from './TreeView';
import InfoIcon from '../../icon/InfoIcon';
import Menu from '../../component/menu/Menu';
import './tree.css';

const TREE_NODE_CATALOG = {
  workspace: { id: 'workspace', text: 'workspace', kind: 'folder', isLeaf: false, childrenIds: ['src', 'public', 'package-json', 'readme-md'] },
  src: { id: 'src', text: 'src', kind: 'folder', isLeaf: false, childrenIds: ['layout', 'components', 'index-js'] },
  layout: { id: 'layout', text: 'layout', kind: 'folder', isLeaf: false, childrenIds: ['folder', 'tab', 'json'] },
  folder: { id: 'folder', text: 'folder', kind: 'folder', isLeaf: false, childrenIds: ['FolderView.jsx', 'TreeView.jsx', 'example.jsx'] },
  tab: { id: 'tab', text: 'tab', kind: 'folder', isLeaf: false, childrenIds: ['TabsOnTop.jsx'] },
  json: { id: 'json', text: 'json', kind: 'folder', isLeaf: false, childrenIds: ['JsonComp.jsx'] },
  components: { id: 'components', text: 'Components', kind: 'folder', isLeaf: false, childrenIds: ['ExplorerPanel.jsx', 'NodeLabel.jsx'] },
  'index-js': { id: 'index-js', text: 'index.js', kind: 'file', isLeaf: true, childrenIds: [] },
  public: { id: 'public', text: 'public', kind: 'folder', isLeaf: false, childrenIds: ['favicon-ico', 'robots-txt'] },
  'favicon-ico': { id: 'favicon-ico', text: 'favicon.ico', kind: 'file', isLeaf: true, childrenIds: [] },
  'robots-txt': { id: 'robots-txt', text: 'robots.txt', kind: 'file', isLeaf: true, childrenIds: [] },
  'package-json': { id: 'package-json', text: 'package.json', kind: 'file', isLeaf: true, childrenIds: [] },
  'readme-md': { id: 'readme-md', text: 'README.md', kind: 'file', type: 'comp', compKey: 'with-info-icon', infoText: 'project guide', isLeaf: true, childrenIds: [] },
  'FolderView.jsx': { id: 'FolderView.jsx', text: 'FolderView.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
  'TreeView.jsx': { id: 'TreeView.jsx', text: 'TreeView.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
  'example.jsx': { id: 'example.jsx', text: 'example.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
  'TabsOnTop.jsx': { id: 'TabsOnTop.jsx', text: 'TabsOnTop.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
  'JsonComp.jsx': { id: 'JsonComp.jsx', text: 'JsonComp.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
  'ExplorerPanel.jsx': { id: 'ExplorerPanel.jsx', text: 'ExplorerPanel.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
  'NodeLabel.jsx': { id: 'NodeLabel.jsx', text: 'NodeLabel.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
};

const TREE_LOAD_FAIL_ONCE_COUNT = {
  components: 1,
};

const TREE_FILTER_ROOT_ITEM_IDS = ['workspace'];

function createTreeParentIdById(nodeCatalog) {
  const parentIdById = {};
  Object.values(nodeCatalog).forEach((node) => {
    const childrenIds = Array.isArray(node.childrenIds) ? node.childrenIds : [];
    childrenIds.forEach((childId) => {
      parentIdById[childId] = node.id;
    });
  });
  return parentIdById;
}

const TREE_PARENT_ID_BY_ID = createTreeParentIdById(TREE_NODE_CATALOG);

function createLeafFilteredTreeData(filterText) {
  const normalizedFilterText = filterText.trim().toLowerCase();
  const nodeIds = Object.keys(TREE_NODE_CATALOG);
  const visibleItemIds = new Set();
  const matchedLeafItemIds = [];
  nodeIds.forEach((nodeId) => {
    const node = TREE_NODE_CATALOG[nodeId];
    if (!node || node.isLeaf !== true) return;
    const text = (node.text || '').toLowerCase();
    const isMatched = normalizedFilterText.length === 0 || text.includes(normalizedFilterText);
    if (!isMatched) return;
    matchedLeafItemIds.push(nodeId);
    let currentItemId = nodeId;
    while (currentItemId) {
      visibleItemIds.add(currentItemId);
      currentItemId = TREE_PARENT_ID_BY_ID[currentItemId];
    }
  });
  const rootItemIds = TREE_FILTER_ROOT_ITEM_IDS.filter((rootId) => visibleItemIds.has(rootId));
  const itemDataById = {};
  visibleItemIds.forEach((nodeId) => {
    const source = TREE_NODE_CATALOG[nodeId];
    if (!source) return;
    itemDataById[nodeId] = {
      ...source,
      isExpanded: source.isLeaf !== true,
      childrenIds: (source.childrenIds || []).filter((childId) => visibleItemIds.has(childId)),
      childrenLoadState: 'loaded',
      childrenErrorMessage: '',
      isChildrenLoaded: true,
    };
  });
  return {
    rootItemIds,
    itemDataById,
    matchedLeafItemIds,
  };
}

function createTreeViewDemoStore() {
  const store = {
    rootItemIds: ['workspace'],
    selectedItemId: 'workspace',
    itemDataById: {},
    loadFailCountByItemId: { ...TREE_LOAD_FAIL_ONCE_COUNT },
    init() {
      this.ensureItemDataExists('workspace');
      const workspaceItemData = this.itemDataById.workspace;
      workspaceItemData.childrenIds = [...TREE_NODE_CATALOG.workspace.childrenIds];
      workspaceItemData.childrenLoadState = 'loaded';
      workspaceItemData.isChildrenLoaded = true;
      workspaceItemData.isExpanded = true;
      workspaceItemData.childrenIds.forEach((childId) => this.ensureItemDataExists(childId));
    },
    ensureItemDataExists(itemId) {
      if (this.itemDataById[itemId]) return this.itemDataById[itemId];
      const source = TREE_NODE_CATALOG[itemId];
      if (!source) return null;
      const itemData = {
        ...source,
        isExpanded: false,
        childrenIds: [],
        childrenLoadState: 'loaded',
        childrenErrorMessage: '',
        isChildrenLoaded: false,
      };
      if (source.isLeaf) {
        itemData.isChildrenLoaded = true;
      }
      this.itemDataById[itemId] = itemData;
      return itemData;
    },
    getItemDataById(itemId) {
      return this.itemDataById[itemId] || null;
    },
    setSelectedItem(itemId) {
      this.selectedItemId = itemId;
    },
    async loadChildrenForItem(itemId, isForceReload) {
      const itemData = this.getItemDataById(itemId);
      if (!itemData || itemData.isLeaf) return { code: 0 };
      if (itemData.isChildrenLoaded && !isForceReload) return { code: 0 };

      itemData.childrenLoadState = 'loading';
      itemData.childrenErrorMessage = '';
      await new Promise((resolve) => setTimeout(resolve, 700));

      if ((this.loadFailCountByItemId[itemId] || 0) > 0) {
        this.loadFailCountByItemId[itemId] -= 1;
        itemData.childrenLoadState = 'load-failed';
        itemData.childrenErrorMessage = 'Load failed. Retry';
        return { code: -1 };
      }

      const source = TREE_NODE_CATALOG[itemId];
      const childIds = source?.childrenIds || [];
      childIds.forEach((childId) => this.ensureItemDataExists(childId));
      itemData.childrenIds = [...childIds];
      itemData.childrenLoadState = 'loaded';
      itemData.childrenErrorMessage = '';
      itemData.isChildrenLoaded = true;
      return { code: 0 };
    },
    async onTreeDataChangeRequest(type, params) {
      const itemData = this.getItemDataById(params.itemId);
      if (!itemData) return { code: -1 };

      if (type === 'toggle-expand') {
        itemData.isExpanded = params.nextIsExpanded;
        if (itemData.isExpanded) {
          return this.loadChildrenForItem(itemData.id, false);
        }
        return { code: 0 };
      }
      if (type === 'reload-children') {
        return this.loadChildrenForItem(itemData.id, true);
      }
      return { code: 0 };
    },
  };
  const observableStore = makeAutoObservable(store, {}, { autoBind: true });
  observableStore.init();
  return observableStore;
}

const TreeExamplesPanel = observer(() => {
  const [lazyTreeStore] = useState(() => createTreeViewDemoStore());
  const [contextTreeStore] = useState(() => createTreeViewDemoStore());
  const [treeFilterText, setTreeFilterText] = useState('');
  const [treeFilterSelectedItemId, setTreeFilterSelectedItemId] = useState('workspace');
  const [treeFilterExpandedById, setTreeFilterExpandedById] = useState({});
  const [treeContextMenuState, setTreeContextMenuState] = useState(null);

  const filteredTreeData = useMemo(
    () => createLeafFilteredTreeData(treeFilterText),
    [treeFilterText]
  );
  const filteredTreeRenderData = useMemo(() => {
    const itemDataById = {};
    Object.entries(filteredTreeData.itemDataById).forEach(([itemId, itemData]) => {
      if (itemData.isLeaf === true) {
        itemDataById[itemId] = itemData;
        return;
      }
      const isExpanded = treeFilterExpandedById[itemId] !== undefined
        ? treeFilterExpandedById[itemId]
        : true;
      itemDataById[itemId] = {
        ...itemData,
        isExpanded,
      };
    });
    return {
      rootItemIds: filteredTreeData.rootItemIds,
      itemDataById,
      matchedLeafItemIds: filteredTreeData.matchedLeafItemIds,
    };
  }, [filteredTreeData, treeFilterExpandedById]);
  const normalizedTreeFilterText = treeFilterText.trim().toLowerCase();

  useEffect(() => {
    if (filteredTreeRenderData.itemDataById[treeFilterSelectedItemId]) return;
    setTreeFilterSelectedItemId(filteredTreeRenderData.rootItemIds[0] || '');
  }, [filteredTreeRenderData, treeFilterSelectedItemId]);

  useEffect(() => {
    setTreeFilterExpandedById((prev) => {
      const next = {};
      Object.entries(filteredTreeData.itemDataById).forEach(([itemId, itemData]) => {
        if (itemData.isLeaf === true) return;
        next[itemId] = prev[itemId] !== undefined ? prev[itemId] : true;
      });
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      if (prevKeys.length === nextKeys.length) {
        const isSame = nextKeys.every((key) => prev[key] === next[key]);
        if (isSame) return prev;
      }
      return next;
    });
  }, [filteredTreeData]);

  const TreeInfoItemComp = ({ itemData }) => (
    <span className="tree-item-label">
      <span className="tree-item-text">{itemData.text}</span>
      <span className="tree-item-icon">
        <InfoIcon width={12} height={12} />
      </span>
    </span>
  );
  const getTreeItemComp = (itemData) => {
    if (itemData.compKey === 'with-info-icon') return TreeInfoItemComp;
    return TreeTextItemComp;
  };

  const TreeFilterItemComp = ({ itemData }) => {
    const itemText = itemData.text || itemData.name || String(itemData.id || '');
    const matchedIndex = itemText.toLowerCase().indexOf(normalizedTreeFilterText);
    if (matchedIndex < 0 || normalizedTreeFilterText.length === 0) {
      return <span className="tree-item-text">{itemText}</span>;
    }
    const beforeText = itemText.slice(0, matchedIndex);
    const matchedText = itemText.slice(matchedIndex, matchedIndex + normalizedTreeFilterText.length);
    const afterText = itemText.slice(matchedIndex + normalizedTreeFilterText.length);
    return (
      <span className="tree-item-text">
        {beforeText}
        <span className="tree-match-highlight">{matchedText}</span>
        {afterText}
      </span>
    );
  };

  const getTreeFilterItemComp = (itemData) => {
    if (itemData.isLeaf !== true || normalizedTreeFilterText.length === 0) return TreeTextItemComp;
    const itemText = itemData.text || itemData.name || String(itemData.id || '');
    if (!itemText.toLowerCase().includes(normalizedTreeFilterText)) return TreeTextItemComp;
    return TreeFilterItemComp;
  };

  const handleTreeFilterDataChangeRequest = async (type, params) => {
    if (type !== 'toggle-expand') return { code: 0 };
    const itemId = params?.itemId;
    if (!itemId) return { code: -1 };
    const itemData = filteredTreeRenderData.itemDataById[itemId];
    if (!itemData || itemData.isLeaf === true) return { code: -1 };
    const isExpanded = params?.nextIsExpanded === true;
    setTreeFilterExpandedById((prev) => ({
      ...prev,
      [itemId]: isExpanded,
    }));
    return { code: 0 };
  };

  const openTreeContextMenuAt = (x, y, nextState) => {
    setTreeContextMenuState(null);
    requestAnimationFrame(() => {
      setTreeContextMenuState({
        x,
        y,
        ...nextState,
      });
    });
  };

  const openTreeContextMenuForItem = (itemIdRaw, x, y) => {
    const itemId = `${itemIdRaw ?? ''}`.trim();
    if (!itemId) return false;
    const itemData = contextTreeStore.getItemDataById(itemId);
    if (!itemData) return false;
    contextTreeStore.setSelectedItem(itemId);
    openTreeContextMenuAt(x, y, {
      menuType: 'item',
      itemId,
    });
    return true;
  };

  return (
    <div>
      <div className="tree-example-block">
        <div className="tree-example-title">Tree View with Lazy Loading</div>
        <div className="tree-example-desc">
          Expand/collapse requests are sent upward, store decides state changes, and MobX triggers re-render. Expanding components fails once to show load-failed with retry.
        </div>
        <div className="tree-example-meta">
          Selected: {lazyTreeStore.getItemDataById(lazyTreeStore.selectedItemId)?.text || '(none)'}
        </div>
        <div className="tree-example-box">
          {/* Fixed-height viewport avoids panel jitter while tree branches expand/collapse. */}
          {/* Leaf rows keep the hidden toggle spacer for indentation, but visual highlight starts at the label area. */}
          <TreeView
            className="tree-view-fixed-height"
            rootItemIds={lazyTreeStore.rootItemIds}
            getItemDataById={lazyTreeStore.getItemDataById}
            onDataChangeRequest={lazyTreeStore.onTreeDataChangeRequest}
            selectedItemId={lazyTreeStore.selectedItemId}
            onItemClick={(itemId) => lazyTreeStore.setSelectedItem(itemId)}
            getItemComp={getTreeItemComp}
          />
        </div>
      </div>

      <div className="tree-example-block">
        <div className="tree-example-title">Tree View with Context Menus</div>
        <div className="tree-example-desc">
          Right click on row for item menu. Right click on empty area for panel menu. Right click again while menu is open repositions and retargets correctly.
        </div>
        <div className="tree-example-meta">
          Context target: {`${treeContextMenuState?.menuType ?? '-'}`}{treeContextMenuState?.itemId ? ` (${treeContextMenuState.itemId})` : ''}
        </div>
        <div
          className="tree-example-box tree-context-wrap"
          data-tree-context-wrap="true"
          onContextMenu={(event) => {
            const isOnTreeRow = Boolean(event.target?.closest?.('.tree-view-row'));
            if (isOnTreeRow) return;
            event.preventDefault();
            event.stopPropagation();
            openTreeContextMenuAt(event.clientX, event.clientY, {
              menuType: 'empty',
            });
          }}
        >
          {/* Same row-highlight rule here: child/leaf rows highlight from label edge, not from toggle spacer area. */}
          <TreeView
            className="tree-view-fixed-height"
            rootItemIds={contextTreeStore.rootItemIds}
            getItemDataById={contextTreeStore.getItemDataById}
            onDataChangeRequest={contextTreeStore.onTreeDataChangeRequest}
            selectedItemId={contextTreeStore.selectedItemId}
            onItemClick={(itemId) => contextTreeStore.setSelectedItem(itemId)}
            onItemContextMenu={async (itemId, _itemData, event) => {
              openTreeContextMenuForItem(itemId, event.clientX, event.clientY);
            }}
            getItemComp={getTreeItemComp}
          />
        </div>
        {treeContextMenuState ? (
          <Menu
            items={(() => {
              if (treeContextMenuState.menuType === 'empty') {
                return [
                  { type: 'item', name: 'Create Root Folder', data: { action: 'create-root-folder' } },
                  { type: 'item', name: 'Refresh Tree', data: { action: 'refresh-tree' } },
                ];
              }
              const itemData = contextTreeStore.getItemDataById(treeContextMenuState.itemId);
              if (!itemData) return [];
              const typeText = itemData.isLeaf ? 'File' : 'Folder';
              return [
                { type: 'item', name: `${typeText} Info`, data: { action: 'info', itemId: itemData.id } },
                { type: 'item', name: `Rename ${typeText}`, data: { action: 'rename', itemId: itemData.id } },
                { type: 'item', name: `Delete ${typeText}`, data: { action: 'delete', itemId: itemData.id } },
              ];
            })()}
            position={{ x: treeContextMenuState.x, y: treeContextMenuState.y }}
            onClose={() => setTreeContextMenuState(null)}
            onContextMenu={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const backdropElement = event.currentTarget;
              backdropElement.style.pointerEvents = 'none';
              const clickedElement = document.elementFromPoint(event.clientX, event.clientY);
              backdropElement.style.pointerEvents = '';

              const rowElement = clickedElement?.closest?.('.tree-view-row[data-tree-item-id]');
              if (rowElement) {
                const rowItemId = `${rowElement.getAttribute('data-tree-item-id') ?? ''}`.trim();
                if (openTreeContextMenuForItem(rowItemId, event.clientX, event.clientY)) return;
              }
              const isInContextWrap = Boolean(clickedElement?.closest?.('[data-tree-context-wrap="true"]'));
              if (isInContextWrap) {
                openTreeContextMenuAt(event.clientX, event.clientY, {
                  menuType: 'empty',
                });
                return;
              }
              setTreeContextMenuState(null);
            }}
            onItemClick={(item) => {
              setTreeContextMenuState((prevState) => prevState ? { ...prevState, lastAction: item?.data?.action ?? '' } : null);
            }}
          />
        ) : null}
        <div className="tree-example-desc">
          Gap-safe behavior: avoid external row margins, keep spacing inside row hit area, and bind row-level onContextMenu.
        </div>
      </div>

      <div className="tree-example-block">
        <div className="tree-example-title">Tree View with Leaf Text Filter</div>
        <div className="tree-example-desc">
          Filter matches only leaf items by substring. Ancestors of each matched leaf stay visible to preserve the path.
        </div>
        <div className="tree-filter-toolbar">
          <input
            className="tree-filter-input"
            value={treeFilterText}
            onChange={(event) => setTreeFilterText(event.target.value)}
            placeholder="Filter leaf text, for example: jsx or readme"
          />
          <div className="tree-filter-count">
            Matched leaf count: {filteredTreeData.matchedLeafItemIds.length}
          </div>
        </div>
        <div className="tree-example-meta">
          Selected: {filteredTreeRenderData.itemDataById[treeFilterSelectedItemId]?.text || '(none)'}
        </div>
        <div className="tree-example-box">
          {/* Filter demo follows the same background-area rule so leaf highlight behavior stays consistent across examples. */}
          <TreeView
            className="tree-view-fixed-height"
            rootItemIds={filteredTreeRenderData.rootItemIds}
            getItemDataById={(itemId) => filteredTreeRenderData.itemDataById[itemId] || null}
            selectedItemId={treeFilterSelectedItemId}
            onItemClick={(itemId) => setTreeFilterSelectedItemId(itemId)}
            onDataChangeRequest={handleTreeFilterDataChangeRequest}
            getItemComp={getTreeFilterItemComp}
          />
        </div>
      </div>
    </div>
  );
});

export const treeExamples = {
  Tree: {
    component: null,
    description: 'Tree view components with lazy loading and text filter',
    example: () => <TreeExamplesPanel />,
  },
};
