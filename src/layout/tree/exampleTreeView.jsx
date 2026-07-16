import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  folder: { id: 'folder', text: 'folder', kind: 'folder', isLeaf: false, childrenIds: ['FolderView.jsx', 'TreeView.jsx', 'exampleTreeView.jsx'] },
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
  'exampleTreeView.jsx': { id: 'exampleTreeView.jsx', text: 'exampleTreeView.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
  'TabsOnTop.jsx': { id: 'TabsOnTop.jsx', text: 'TabsOnTop.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
  'JsonComp.jsx': { id: 'JsonComp.jsx', text: 'JsonComp.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
  'ExplorerPanel.jsx': { id: 'ExplorerPanel.jsx', text: 'ExplorerPanel.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
  'NodeLabel.jsx': { id: 'NodeLabel.jsx', text: 'NodeLabel.jsx', kind: 'file', isLeaf: true, childrenIds: [] },
};

const TREE_LOAD_FAIL_ONCE_COUNT = {
  components: 1,
};

const TREE_FILTER_ROOT_ITEM_IDS = ['workspace'];

function createTreeContextMenuCatalog() {
  const catalog = {
    'ctx-workspace': {
      id: 'ctx-workspace',
      text: 'workspace',
      kind: 'folder',
      isLeaf: false,
      childrenIds: [],
    },
  };
  const moduleIds = [];
  for (let moduleIndex = 1; moduleIndex <= 24; moduleIndex += 1) {
    const moduleId = `ctx-module-${String(moduleIndex).padStart(2, '0')}`;
    const fileIds = [];
    for (let fileIndex = 1; fileIndex <= 8; fileIndex += 1) {
      const fileId = `${moduleId}-file-${String(fileIndex).padStart(2, '0')}`;
      catalog[fileId] = {
        id: fileId,
        text: `component-${String(fileIndex).padStart(2, '0')}.jsx`,
        kind: 'file',
        isLeaf: true,
        childrenIds: [],
      };
      fileIds.push(fileId);
    }
    catalog[moduleId] = {
      id: moduleId,
      text: `module-${String(moduleIndex).padStart(2, '0')}`,
      kind: 'folder',
      isLeaf: false,
      childrenIds: fileIds,
    };
    moduleIds.push(moduleId);
  }
  catalog['ctx-workspace'].childrenIds = moduleIds;
  return catalog;
}

const TREE_CONTEXT_MENU_CATALOG = createTreeContextMenuCatalog();
const TREE_CONTEXT_MENU_ROOT_ITEM_IDS = ['ctx-workspace'];

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

function createTreeViewMoveDemoStore() {
  const itemDataById = {};
  Object.values(TREE_NODE_CATALOG).forEach((source) => {
    itemDataById[source.id] = {
      ...source,
      isExpanded: source.isLeaf !== true,
      childrenIds: [...(source.childrenIds || [])],
      childrenLoadState: 'loaded',
      childrenErrorMessage: '',
      isChildrenLoaded: true,
    };
  });

  const store = {
    rootItemIds: ['workspace'],
    selectedItemId: 'workspace',
    itemDataById,
    moveLastText: 'Drag non-root items to reorder the tree.',
    getItemDataById(itemId) {
      return this.itemDataById[itemId] || null;
    },
    setSelectedItem(itemId) {
      this.selectedItemId = itemId;
    },
    getItemParentId(itemId) {
      if (this.rootItemIds.includes(itemId)) return null;
      let itemParentIdFound = null;
      Object.values(this.itemDataById).forEach((itemData) => {
        if (itemParentIdFound) return;
        if ((itemData.childrenIds || []).includes(itemId)) {
          itemParentIdFound = itemData.id;
        }
      });
      return itemParentIdFound;
    },
    getItemChildrenIds(itemParentId) {
      if (itemParentId === null || itemParentId === undefined) return this.rootItemIds;
      const parentItemData = this.getItemDataById(itemParentId);
      return parentItemData?.childrenIds || null;
    },
    getIsItemDescendantOfItem(itemId, ancestorItemId) {
      const ancestorItemData = this.getItemDataById(ancestorItemId);
      if (!ancestorItemData) return false;
      const childrenIds = ancestorItemData.childrenIds || [];
      if (childrenIds.includes(itemId)) return true;
      return childrenIds.some((childId) => this.getIsItemDescendantOfItem(itemId, childId));
    },
    getIsTreeDropAllowed(itemId, drop) {
      const itemData = this.getItemDataById(itemId);
      if (!itemData || !drop?.type) return false;
      if (itemId === 'workspace') return false;
      if (drop.itemParentId === itemId) return false;
      if (drop.itemParentId && this.getIsItemDescendantOfItem(drop.itemParentId, itemId)) return false;
      if (drop.itemBeforeId === itemId || drop.itemAfterId === itemId) return false;
      if (drop.type === 'under') {
        const parentItemData = this.getItemDataById(drop.itemParentId);
        return parentItemData?.isLeaf !== true;
      }
      return Boolean(this.getItemChildrenIds(drop.itemParentId));
    },
    removeItemFromParent(itemId) {
      const itemParentId = this.getItemParentId(itemId);
      const childrenIds = this.getItemChildrenIds(itemParentId);
      if (!childrenIds) return false;
      const itemIndex = childrenIds.indexOf(itemId);
      if (itemIndex < 0) return false;
      childrenIds.splice(itemIndex, 1);
      return true;
    },
    insertItemAtDrop(itemId, drop) {
      const childrenIds = this.getItemChildrenIds(drop.itemParentId);
      if (!childrenIds) return false;
      if (drop.type === 'under') {
        childrenIds.push(itemId);
        const parentItemData = this.getItemDataById(drop.itemParentId);
        if (parentItemData) {
          parentItemData.isExpanded = true;
        }
        return true;
      }
      let insertIndex = childrenIds.length;
      if (drop.itemAfterId && childrenIds.includes(drop.itemAfterId)) {
        insertIndex = childrenIds.indexOf(drop.itemAfterId);
      } else if (drop.itemBeforeId && childrenIds.includes(drop.itemBeforeId)) {
        insertIndex = childrenIds.indexOf(drop.itemBeforeId) + 1;
      }
      childrenIds.splice(insertIndex, 0, itemId);
      return true;
    },
    async onTreeDataChangeRequest(type, params) {
      if (type === 'toggle-expand') {
        const itemData = this.getItemDataById(params.itemId);
        if (!itemData || itemData.isLeaf === true) return { code: -1 };
        itemData.isExpanded = params.nextIsExpanded;
        return { code: 0 };
      }
      if (type !== 'move-item') return { code: 0 };
      const itemId = params?.itemId;
      const drop = params?.drop;
      if (!this.getIsTreeDropAllowed(itemId, drop)) {
        this.moveLastText = 'Move rejected.';
        return { code: -1 };
      }
      if (!this.removeItemFromParent(itemId)) return { code: -1 };
      if (!this.insertItemAtDrop(itemId, drop)) return { code: -1 };
      this.selectedItemId = itemId;
      this.moveLastText = `Moved ${this.getItemDataById(itemId)?.text || itemId} ${drop.type}.`;
      return { code: 0 };
    },
  };
  return makeAutoObservable(store, {}, { autoBind: true });
}

function createTreeViewContextMenuDemoStore() {
  const itemDataById = {};
  Object.values(TREE_CONTEXT_MENU_CATALOG).forEach((source) => {
    itemDataById[source.id] = {
      ...source,
      isExpanded: source.isLeaf !== true,
      childrenIds: [...(source.childrenIds || [])],
      childrenLoadState: 'loaded',
      childrenErrorMessage: '',
      isChildrenLoaded: true,
    };
  });

  const store = {
    rootItemIds: [...TREE_CONTEXT_MENU_ROOT_ITEM_IDS],
    selectedItemId: 'ctx-workspace',
    itemDataById,
    getItemDataById(itemId) {
      return this.itemDataById[itemId] || null;
    },
    setSelectedItem(itemId) {
      this.selectedItemId = itemId;
    },
    async onTreeDataChangeRequest(type, params) {
      const itemData = this.getItemDataById(params.itemId);
      if (!itemData) return { code: -1 };
      if (type === 'toggle-expand') {
        itemData.isExpanded = params.nextIsExpanded;
        return { code: 0 };
      }
      return { code: 0 };
    },
  };
  return makeAutoObservable(store, {}, { autoBind: true });
}

function getTreeContextScrollContainer(contextWrapElement) {
  return contextWrapElement?.querySelector?.('.tree-view') ?? null;
}

function createTreeItemContextMenuAnchor(itemId, event, contextWrapElement) {
  const rowElement = event.currentTarget;
  const rowRect = rowElement.getBoundingClientRect();
  const getTargetEl = () => (
    document.querySelector(`.tree-view-row[data-tree-item-id="${CSS.escape(itemId)}"]`)
  );
  return {
    getRect: () => getTargetEl()?.getBoundingClientRect() ?? null,
    getTargetEl,
    getVisibilityRoot: () => getTreeContextScrollContainer(contextWrapElement),
    offsetX: event.clientX - rowRect.left,
    offsetY: event.clientY - rowRect.top,
  };
}

function createTreeEmptyContextMenuAnchor(contextWrapElement, event) {
  const scrollContainer = getTreeContextScrollContainer(contextWrapElement);
  if (!scrollContainer) {
    return {
      getRect: () => ({
        left: event.clientX,
        top: event.clientY,
        width: 0,
        height: 0,
        right: event.clientX,
        bottom: event.clientY,
      }),
      offsetX: 0,
      offsetY: 0,
    };
  }

  const containerRect = scrollContainer.getBoundingClientRect();
  const offsetContentX = event.clientX - containerRect.left + scrollContainer.scrollLeft;
  const offsetContentY = event.clientY - containerRect.top + scrollContainer.scrollTop;

  return {
    getRect: () => {
      const container = getTreeContextScrollContainer(contextWrapElement);
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      const left = rect.left + offsetContentX - container.scrollLeft;
      const top = rect.top + offsetContentY - container.scrollTop;
      return {
        left,
        top,
        width: 0,
        height: 0,
        right: left,
        bottom: top,
      };
    },
    getVisibilityRoot: () => getTreeContextScrollContainer(contextWrapElement),
    offsetX: 0,
    offsetY: 0,
  };
}

const TreeExamplesPanel = observer(() => {
  const [lazyTreeStore] = useState(() => createTreeViewDemoStore());
  const [moveTreeStore] = useState(() => createTreeViewMoveDemoStore());
  const [contextTreeStore] = useState(() => createTreeViewContextMenuDemoStore());
  const [treeFilterText, setTreeFilterText] = useState('');
  const [treeFilterSelectedItemId, setTreeFilterSelectedItemId] = useState('workspace');
  const [treeFilterExpandedById, setTreeFilterExpandedById] = useState({});
  const [treeContextMenuState, setTreeContextMenuState] = useState(null);
  const treeContextWrapRef = useRef(null);

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

  const openTreeContextMenu = (nextState) => {
    setTreeContextMenuState(null);
    requestAnimationFrame(() => {
      setTreeContextMenuState(nextState);
    });
  };

  const openTreeContextMenuForItem = (itemIdRaw, event) => {
    const itemId = `${itemIdRaw ?? ''}`.trim();
    if (!itemId) return false;
    const itemData = contextTreeStore.getItemDataById(itemId);
    if (!itemData) return false;
    contextTreeStore.setSelectedItem(itemId);
    openTreeContextMenu({
      menuType: 'item',
      itemId,
      anchor: createTreeItemContextMenuAnchor(itemId, event, treeContextWrapRef.current),
    });
    return true;
  };

  const openTreeContextMenuForEmptyArea = (event) => {
    openTreeContextMenu({
      menuType: 'empty',
      anchor: createTreeEmptyContextMenuAnchor(treeContextWrapRef.current, event),
    });
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
            data={{
              itemRootIds: lazyTreeStore.rootItemIds,
              itemDataById: lazyTreeStore.itemDataById,
              itemSelectedId: lazyTreeStore.selectedItemId,
            }}
            config={{
              className: 'tree-view-fixed-height',
              getItemComp: getTreeItemComp,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'itemClick') {
                lazyTreeStore.setSelectedItem(eventData.itemId);
                return { code: 0 };
              }
              if (eventType === 'toggleExpand') {
                return lazyTreeStore.onTreeDataChangeRequest('toggle-expand', eventData);
              }
              if (eventType === 'reloadChildren') {
                return lazyTreeStore.onTreeDataChangeRequest('reload-children', eventData);
              }
              return { code: 0 };
            }}
          />
        </div>
      </div>

      <div className="tree-example-block">
        <div className="tree-example-title">Tree View with Drag Reorder</div>
        <div className="tree-example-desc">
          Drag non-root items to sibling positions or under folders. The render component only sends move requests; the store accepts or rejects them.
        </div>
        <div className="tree-example-meta">
          {moveTreeStore.moveLastText}
        </div>
        <div className="tree-example-box">
          <TreeView
            data={{
              itemRootIds: moveTreeStore.rootItemIds,
              itemDataById: moveTreeStore.itemDataById,
              itemSelectedId: moveTreeStore.selectedItemId,
            }}
            config={{
              className: 'tree-view-fixed-height',
              getItemComp: getTreeItemComp,
              isItemDragEnabled: true,
              getIsItemDraggable: (itemData) => itemData?.id !== 'workspace',
              getItemDropStatus: ({ itemId, drop }) => ({
                isDropAllowed: moveTreeStore.getIsTreeDropAllowed(itemId, drop),
              }),
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'itemClick') {
                moveTreeStore.setSelectedItem(eventData.itemId);
                return { code: 0 };
              }
              if (eventType === 'toggleExpand') {
                return moveTreeStore.onTreeDataChangeRequest('toggle-expand', eventData);
              }
              if (eventType === 'moveItem') {
                return moveTreeStore.onTreeDataChangeRequest('move-item', eventData);
              }
              return { code: 0 };
            }}
          />
        </div>
      </div>

      <div className="tree-example-block">
        <div className="tree-example-title">Tree View with Context Menus</div>
        <div className="tree-example-desc">
          Right click on row for item menu. Right click on empty area for panel menu. Right click again while menu is open repositions and retargets correctly. The tree below scrolls inside a fixed-height container: right click a row, keep the menu open, then scroll to verify the menu stays aligned with the clicked item.
        </div>
        <div className="tree-example-meta">
          Context target: {`${treeContextMenuState?.menuType ?? '-'}`}{treeContextMenuState?.itemId ? ` (${treeContextMenuState.itemId})` : ''}
        </div>
        <div
          ref={treeContextWrapRef}
          className="tree-example-box tree-context-wrap"
          data-tree-context-wrap="true"
          onContextMenu={(event) => {
            const isOnTreeRow = Boolean(event.target?.closest?.('.tree-view-row'));
            if (isOnTreeRow) return;
            event.preventDefault();
            event.stopPropagation();
            openTreeContextMenuForEmptyArea(event);
          }}
        >
          {/* Same row-highlight rule here: child/leaf rows highlight from label edge, not from toggle spacer area. */}
          <TreeView
            data={{
              itemRootIds: contextTreeStore.rootItemIds,
              itemDataById: contextTreeStore.itemDataById,
              itemSelectedId: contextTreeStore.selectedItemId,
            }}
            config={{
              className: 'tree-view-context-scroll',
              getItemComp: getTreeItemComp,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'itemClick') {
                contextTreeStore.setSelectedItem(eventData.itemId);
                return { code: 0 };
              }
              if (eventType === 'itemContextMenu') {
                openTreeContextMenuForItem(eventData.itemId, eventData.event);
                return { code: 0 };
              }
              if (eventType === 'toggleExpand') {
                return contextTreeStore.onTreeDataChangeRequest('toggle-expand', eventData);
              }
              return { code: 0 };
            }}
          />
        </div>
        {treeContextMenuState ? (
          <Menu
            data={{
              items: (() => {
                if (treeContextMenuState.menuType === 'empty') {
                  return [
                    { id: 'create-root-folder', label: 'Create Root Folder', data: { action: 'create-root-folder' } },
                    { id: 'refresh-tree', label: 'Refresh Tree', data: { action: 'refresh-tree' } },
                  ];
                }
                const itemData = contextTreeStore.getItemDataById(treeContextMenuState.itemId);
                if (!itemData) return [];
                const typeText = itemData.isLeaf ? 'File' : 'Folder';
                return [
                  { id: 'info', label: `${typeText} Info`, data: { action: 'info', itemId: itemData.id } },
                  { id: 'rename', label: `Rename ${typeText}`, data: { action: 'rename', itemId: itemData.id } },
                  { id: 'delete', label: `Delete ${typeText}`, data: { action: 'delete', itemId: itemData.id } },
                ];
              })(),
            }}
            config={{
              isOpen: true,
              posOpen: { x: 0, y: 0 },
              anchor: treeContextMenuState.anchor,
              isBackdropScrollPassThrough: true,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'closeRequest') {
                setTreeContextMenuState(null);
                return;
              }
              if (eventType === 'itemClick') {
                setTreeContextMenuState((prevState) => prevState ? { ...prevState, lastAction: eventData.item?.data?.action ?? '' } : null);
              }
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
            data={{
              itemRootIds: filteredTreeRenderData.rootItemIds,
              itemDataById: filteredTreeRenderData.itemDataById,
              itemSelectedId: treeFilterSelectedItemId,
            }}
            config={{
              className: 'tree-view-fixed-height',
              getItemComp: getTreeFilterItemComp,
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'itemClick') {
                setTreeFilterSelectedItemId(eventData.itemId);
                return { code: 0 };
              }
              if (eventType === 'toggleExpand') {
                return handleTreeFilterDataChangeRequest('toggle-expand', eventData);
              }
              return { code: 0 };
            }}
          />
        </div>
      </div>
    </div>
  );
});

export const treeViewExamples = {
  Tree: {
    component: null,
    description: 'Tree view components with lazy loading and text filter',
    example: () => <TreeExamplesPanel />,
  },
};
