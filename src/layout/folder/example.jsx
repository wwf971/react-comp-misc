import React, { useRef, useState } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import Header from './Header';
import FolderView from './FolderView';
import TreeView from './TreeView';
import PathBar from '../../path/PathBar.jsx';
import { createFolderExplorerDemoStore } from './folderExplorerDemoModel';
import InfoIconWithTooltip from '../../icon/InfoIconWithTooltip';
import InfoIcon from '../../icon/InfoIcon';
import FolderIcon from '../../icon/FolderIcon';
import FileIcon from '../../icon/FileIcon';
import './folder.css';

const SHARED_COLUMNS = {
  name: { data: 'Name', align: 'left' },
  size: { data: 'Size', align: 'right' },
  type: { data: 'Type', align: 'left' },
  modified: { data: 'Modified', align: 'left' },
};

const CATALOG = [
  { id: 1,  name: 'Documents',   size: '4 items',  type: 'folder' },
  { id: 2,  name: 'Pictures',    size: '12 items', type: 'folder' },
  { id: 3,  name: 'Music',       size: '8 items',  type: 'folder' },
  { id: 4,  name: 'Projects',    size: '5 items',  type: 'folder' },
  { id: 5,  name: 'Downloads',   size: '15 items', type: 'folder' },
  { id: 6,  name: 'Photos',      size: '42 items', type: 'folder' },
  { id: 7,  name: 'App.jsx',     size: '4.2 KB',   type: 'file' },
  { id: 8,  name: 'styles.css',  size: '1.8 KB',   type: 'file' },
  { id: 9,  name: 'README.md',   size: '2.1 KB',   type: 'file' },
  { id: 10, name: 'config.json', size: '856 B',    type: 'file' },
  { id: 11, name: 'notes.txt',   size: '1 KB',     type: 'file' },
  { id: 12, name: 'logo.png',    size: '24.5 KB',  type: 'file' },
];

const CATALOG_MAP = new Map(CATALOG.map(item => [item.id, item]));

function makeCatalogBase(ids) {
  const base = {
    rowsById: new Map(ids.map(id => [id, CATALOG_MAP.get(id)])),
    rowsOrder: ids,
    selectedRowIds: [],
    getRowData(rowId, columnId) {
      return this.rowsById.get(rowId)?.[columnId];
    },
  };
  Object.defineProperty(base, 'rows', {
    get() { return this.rowsOrder.map(id => ({ id, data: this.rowsById.get(id) })); },
    enumerable: true,
    configurable: true,
  });
  return base;
}

const TextWithInfoIconComp = observer(({ data }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
    <span>{data.text}</span>
    <InfoIconWithTooltip tooltipText={data.tooltip} width={14} height={14} color="#999" />
  </span>
));

const FileNameCell = observer(({ data }) => {
  const iconSize = 16;
  const icon = data.type === 'folder'
    ? <FolderIcon width={iconSize} height={iconSize} />
    : <FileIcon width={iconSize} height={iconSize} />;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ display: 'flex', flexShrink: 0, alignItems: 'center' }}>{icon}</span>
      <span>{data.name}</span>
    </span>
  );
});

const TREE_NODE_CATALOG = {
  workspace: { id: 'workspace', text: 'workspace', kind: 'folder', isLeaf: false, childrenIds: ['src', 'public', 'package-json', 'readme-md'] },
  src: { id: 'src', text: 'src', kind: 'folder', isLeaf: false, childrenIds: ['layout', 'components', 'index-js'] },
  layout: { id: 'layout', text: 'layout', kind: 'folder', isLeaf: false, childrenIds: ['folder', 'tab', 'json'] },
  folder: { id: 'folder', text: 'folder', kind: 'folder', isLeaf: false, childrenIds: ['FolderView.jsx', 'TreeView.jsx', 'example.jsx'] },
  tab: { id: 'tab', text: 'tab', kind: 'folder', isLeaf: false, childrenIds: ['TabsOnTop.jsx'] },
  json: { id: 'json', text: 'json', kind: 'folder', isLeaf: false, childrenIds: ['JsonComp.jsx'] },
  components: { id: 'components', text: 'components', kind: 'folder', isLeaf: false, childrenIds: ['ExplorerPanel.jsx', 'NodeLabel.jsx'] },
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
      workspaceItemData.childrenIds.forEach(childId => this.ensureItemDataExists(childId));
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
      await new Promise(resolve => setTimeout(resolve, 700));

      if ((this.loadFailCountByItemId[itemId] || 0) > 0) {
        this.loadFailCountByItemId[itemId] -= 1;
        itemData.childrenLoadState = 'load-failed';
        itemData.childrenErrorMessage = 'Load failed. Retry';
        return { code: -1 };
      }

      const source = TREE_NODE_CATALOG[itemId];
      const childIds = source?.childrenIds || [];
      childIds.forEach(childId => this.ensureItemDataExists(childId));
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

const FolderExamplesPanel = observer(() => {
  const [basicData] = useState(() => makeAutoObservable({
    columns: {
      name: { data: 'Name', align: 'left' },
      size: { data: 'Size', align: 'right' },
      type: { data: 'Type', align: 'left' },
      modified: { data: 'Modified', align: 'left' },
    },
    columnsOrder: ['name', 'size', 'type', 'modified'],
    columnsSize: {
      name: { width: 200, minWidth: 80, resizable: true },
      size: { width: 100, minWidth: 60, resizable: true },
      type: { width: 150, resizable: true },
      modified: { width: 150, resizable: true },
    },
  }));

  const [customData] = useState(() => makeAutoObservable({
    columns: {
      name: { data: { text: 'File Name', tooltip: 'The name of the file or folder' }, align: 'left' },
      size: { data: { text: 'Size', tooltip: 'File size in bytes' }, align: 'right' },
      modified: { data: { text: 'Last Modified', tooltip: 'Date and time of last modification' }, align: 'left' },
    },
    columnsOrder: ['name', 'size', 'modified'],
    columnsSize: {
      name: { width: 200, minWidth: 100, resizable: true },
      size: { width: 120, minWidth: 80, resizable: true },
      modified: { width: 200, minWidth: 100, resizable: true },
    },
  }));

  const [fileExplorerStore] = useState(() => createFolderExplorerDemoStore());
  const [treeViewStore] = useState(() => createTreeViewDemoStore());

  const [basicColWidths, setBasicColWidths] = useState(() =>
    Object.fromEntries(basicData.columnsOrder.map(id => [id, basicData.columnsSize[id]?.width ?? 40]))
  );

  const [customColWidths, setCustomColWidths] = useState(() =>
    Object.fromEntries(customData.columnsOrder.map(id => [id, customData.columnsSize[id]?.width ?? 40]))
  );

  const [rowReorderDemo] = useState(() => makeAutoObservable({
    columns: { label: { data: 'Item', align: 'left' } },
    columnsOrder: ['label'],
    columnsSize: { label: { width: 280, minWidth: 120, resizable: true } },
    rows: [
      { id: 'a', data: { label: 'Alpha' } },
      { id: 'b', data: { label: 'Bravo' } },
      { id: 'c', data: { label: 'Charlie' } },
      { id: 'd', data: { label: 'Delta' } },
    ],
    selectedRowIds: [],
    lastReorderNote: '',
  }));

  const [singleSelectStore] = useState(() => {
    const store = makeCatalogBase([1, 2, 7, 8, 3]);
    store.allowedTypes = ['folder'];
    store.handleRowInteraction = function(event) {
      if (event.type !== 'click') return;
      const row = this.rowsById.get(event.rowId);
      if (!this.allowedTypes.includes(row.type)) return;
      this.selectedRowIds = this.selectedRowIds.includes(event.rowId) ? [] : [event.rowId];
    };
    return makeAutoObservable(store);
  });

  const [multiSelectStore] = useState(() => {
    const store = makeCatalogBase([7, 8, 9, 10, 11, 12]);
    store.handleRowInteraction = function(event) {
      if (event.type !== 'click') return;
      const { rowId, modifiers } = event;
      if (modifiers.ctrl || modifiers.meta) {
        if (this.selectedRowIds.includes(rowId)) {
          this.selectedRowIds = this.selectedRowIds.filter(id => id !== rowId);
        } else {
          this.selectedRowIds.push(rowId);
        }
      } else if (modifiers.shift && this.selectedRowIds.length > 0) {
        const lastIndex = this.rowsOrder.indexOf(this.selectedRowIds[this.selectedRowIds.length - 1]);
        const currentIndex = this.rowsOrder.indexOf(rowId);
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        this.selectedRowIds = [...new Set([...this.selectedRowIds, ...this.rowsOrder.slice(start, end + 1)])];
      } else {
        this.selectedRowIds = [rowId];
      }
    };
    return makeAutoObservable(store);
  });

  const [mixedSelectStore] = useState(() => {
    const store = makeCatalogBase([4, 9, 5, 10, 6]);
    store.allowMixed = false;
    store.handleRowInteraction = function(event) {
      if (event.type !== 'click') return;
      const { rowId, modifiers } = event;
      const row = this.rowsById.get(rowId);
      if (!this.allowMixed && this.selectedRowIds.length > 0) {
        if (this.rowsById.get(this.selectedRowIds[0]).type !== row.type) return;
      }
      if (modifiers.ctrl || modifiers.meta) {
        if (this.selectedRowIds.includes(rowId)) {
          this.selectedRowIds = this.selectedRowIds.filter(id => id !== rowId);
        } else {
          this.selectedRowIds.push(rowId);
        }
      } else {
        this.selectedRowIds = [rowId];
      }
    };
    store.clearSelection = function() { this.selectedRowIds = []; };
    store.getSelectedItems = function() { return this.selectedRowIds.map(id => this.rowsById.get(id)); };
    return makeAutoObservable(store);
  });

  const [viewSwitchStore] = useState(() => {
    const store = makeCatalogBase([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    store.handleRowInteraction = function(event) {
      if (event.type !== 'click') return;
      const { rowId } = event;
      this.selectedRowIds = this.selectedRowIds.includes(rowId) ? [] : [rowId];
    };
    return makeAutoObservable(store);
  });

  const [viewSwitchLoading, setViewSwitchLoading] = useState(false);
  const [viewSwitchFeedback, setViewSwitchFeedback] = useState(null);
  const viewSwitchFeedbackTimer = useRef(null);

  const showViewSwitchFeedback = (feedback) => {
    if (viewSwitchFeedbackTimer.current) clearTimeout(viewSwitchFeedbackTimer.current);
    setViewSwitchFeedback(feedback);
    viewSwitchFeedbackTimer.current = setTimeout(() => {
      viewSwitchFeedbackTimer.current = null;
      setViewSwitchFeedback(null);
    }, 3000);
  };

  const handleViewSwitchDataChangeRequest = async (type, params) => {
    if (type !== 'reorder' && type !== 'reorder-multiple') return { code: 0 };
    if (type === 'reorder' && params.rowId === undefined) return { code: 0 };
    if (type === 'reorder-multiple' && (!Array.isArray(params.rowIds) || params.rowIds.length === 0)) return { code: 0 };
    setViewSwitchLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const isSuccess = Math.random() > 0.3;
    setViewSwitchLoading(false);
    if (isSuccess) {
      const byId = new Map(viewSwitchStore.rowsOrder.map(id => [id, id]));
      viewSwitchStore.rowsOrder.replace(params.newOrder.map(id => byId.get(id)).filter(id => id !== undefined));
      showViewSwitchFeedback({ ok: true, text: type === 'reorder-multiple' ? 'Multiple rows reordered.' : 'Reordered.' });
      return { code: 0 };
    }
    showViewSwitchFeedback({ ok: false, text: 'Reorder rejected.' });
    return { code: -1 };
  };

  const [mixedSelectionSummary, setMixedSelectionSummary] = useState('');

  const getComponent = () => TextWithInfoIconComp;

  const getBodyComponent = (columnId) => columnId === 'name' ? FileNameCell : undefined;

  const TreeInfoItemComp = ({ itemData }) => (
    <span className="folder-tree-item-label">
      <span className="folder-tree-item-text">{itemData.text}</span>
      <span className="folder-tree-item-icon">
        <InfoIcon width={12} height={12} />
      </span>
    </span>
  );
  const getTreeItemComp = (itemData) => {
    if (itemData.compKey === 'with-info-icon') return TreeInfoItemComp;
    return null;
  };

  const handleBasicDataChangeRequest = async (type, params) => {
    if (type === 'reorder') {
      await new Promise(resolve => setTimeout(resolve, 200));
      if (Math.random() > 0.05) {
        basicData.columnsOrder.replace(params.newOrder);
        return { code: 0, message: 'Column reordered successfully' };
      }
      return { code: -1, message: 'Failed to reorder column' };
    }
  };

  const handleExplorerFolderDataChangeRequest = async (type, params) => {
    const ex = fileExplorerStore;
    if (type === 'reorder') {
      if (params.columnId !== undefined) {
        ex.loading = true;
        ex.loadingMessage = 'Reordering column';
        ex.error = null;
        await new Promise(resolve => setTimeout(resolve, 800));
        if (Math.random() > 0.1) {
          ex.columnsOrder.replace(params.newOrder);
          ex.loading = false;
          return { code: 0, message: 'Column reordered successfully' };
        }
        ex.loading = false;
        ex.error = { message: 'Failed to reorder column' };
        setTimeout(() => { ex.error = null; }, 1000);
        return { code: -1, message: 'Failed to reorder column' };
      }
      if (params.rowId !== undefined) {
        const folder = ex.currentFolder;
        if (!folder) return { code: -1, message: 'No folder' };
        ex.loading = true;
        ex.loadingMessage = 'Reordering row';
        ex.error = null;
        await new Promise(resolve => setTimeout(resolve, 800));
        if (Math.random() > 0.1) {
          if (params.newOrder && Array.isArray(params.newOrder)) {
            const byId = new Map(folder.children.map(c => [c.id, c]));
            folder.children.replace(params.newOrder.map(id => byId.get(id)).filter(Boolean));
          } else {
            const next = [...folder.children];
            const [moved] = next.splice(params.fromIndex, 1);
            next.splice(params.toIndex, 0, moved);
            folder.children.replace(next);
          }
          ex.loading = false;
          return { code: 0, message: 'Row reordered successfully' };
        }
        ex.loading = false;
        ex.error = { message: 'Failed to reorder row' };
        setTimeout(() => { ex.error = null; }, 1000);
        return { code: -1, message: 'Failed to reorder row' };
      }
    } else if (type === 'delete') {
      const folder = ex.currentFolder;
      if (!folder) return { code: -1, message: 'No folder' };
      ex.loading = true;
      ex.loadingMessage = 'Deleting row';
      ex.error = null;
      await new Promise(resolve => setTimeout(resolve, 600));
      if (Math.random() > 0.05) {
        const idx = folder.children.findIndex(c => c.id === params.rowId);
        if (idx >= 0) folder.children.splice(idx, 1);
        if (ex.selectedRowId === params.rowId) ex.selectedRowId = null;
        ex.loading = false;
        return { code: 0, message: 'Row deleted successfully' };
      }
      ex.loading = false;
      ex.error = { message: 'Failed to delete row' };
      setTimeout(() => { ex.error = null; }, 1000);
      return { code: -1, message: 'Failed to delete row' };
    } else if (type === 'resize') {
      if (!ex.columnsSize[params.columnId]) ex.columnsSize[params.columnId] = {};
      ex.columnsSize[params.columnId].width = params.newWidth;
      return { code: 0, message: 'Column resized' };
    }
  };

  const handleExplorerPathChangeCommit = async (pathData) => {
    const ex = fileExplorerStore;
    ex.loading = true;
    ex.loadingMessage = 'Resolving path';
    ex.error = null;
    ex.clearPathFeedbackTimer();
    ex.pathFeedback = null;
    await new Promise(resolve => setTimeout(resolve, 450));
    const result = ex.trySetPathFromParsed(pathData);
    ex.loading = false;
    if (!result.ok) {
      ex.showPathFeedbackBriefly({ ok: false, text: result.reason });
      return false;
    }
    ex.showPathFeedbackBriefly({ ok: true, text: 'Opened folder.' });
    return true;
  };

  const handleExplorerRowClick = rowId => fileExplorerStore.setSelectedRow(rowId);

  const handleExplorerRowDoubleClick = rowId => {
    const row = fileExplorerStore.rows.find(r => r.id === rowId);
    if (!row) return;
    if (row.data.name.type === 'folder') fileExplorerStore.openChildFolderByName(row.data.name.name);
  };

  const handleRowReorderDemoRequest = async (type, params) => {
    if (type !== 'reorder' && type !== 'reorder-multiple') return { code: 0, message: 'noop' };
    await new Promise(resolve => setTimeout(resolve, 120));
    if (params.newOrder && Array.isArray(params.newOrder)) {
      const byId = new Map(rowReorderDemo.rows.map(r => [r.id, r]));
      rowReorderDemo.rows.replace(params.newOrder.map(id => byId.get(id)).filter(Boolean));
    } else {
      if (type !== 'reorder' || params.rowId === undefined) return { code: 0, message: 'noop' };
      const next = [...rowReorderDemo.rows];
      const [moved] = next.splice(params.fromIndex, 1);
      next.splice(params.toIndex, 0, moved);
      rowReorderDemo.rows.replace(next);
    }
    rowReorderDemo.selectedRowIds = rowReorderDemo.selectedRowIds.filter(id => rowReorderDemo.rows.some(r => r.id === id));
    if (type === 'reorder-multiple') {
      rowReorderDemo.lastReorderNote = `rowIds=${(params.rowIds || []).join(',')} toIndex=${params.toIndex}`;
      return { code: 0, message: 'Rows reordered' };
    }
    rowReorderDemo.lastReorderNote = `rowId=${params.rowId} toIndex=${params.toIndex}`;
    return { code: 0, message: 'Row reordered' };
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Basic Header</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Drag column cells to reorder. Drag separators to resize. Blue line shows drop position.
        </div>
        <div style={{ border: '1px solid #d0d0d0', borderRadius: '2px' }}>
          <Header
            columns={basicData.columns}
            columnsOrder={basicData.columnsOrder}
            columnsSizeInit={basicData.columnsSize}
            columnWidths={basicColWidths}
            allowColumnReorder={true}
            onColumnWidthChange={setBasicColWidths}
            onDataChangeRequest={handleBasicDataChangeRequest}
          />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Header with Custom Components</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          All columns use custom component with info icon tooltips. Hover over icons to see descriptions.
        </div>
        <div style={{ border: '1px solid #d0d0d0', borderRadius: '2px' }}>
          <Header
            columns={customData.columns}
            columnsOrder={customData.columnsOrder}
            columnsSizeInit={customData.columnsSize}
            columnWidths={customColWidths}
            getComponent={getComponent}
            onColumnWidthChange={setCustomColWidths}
          />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Complete FolderView with Body</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          MobX tree drives the listing. PathBar shows the folder path; click a segment or edit the path (invalid paths are rejected). Double-click a folder row to open it. Drag rows to reorder; right-click to delete. Body locks during async requests.
        </div>
        <div style={{ border: '1px solid #d0d0d0', borderRadius: '2px' }}>
          <PathBar
            pathData={fileExplorerStore.pathDataForBar}
            onPathSegClicked={index => fileExplorerStore.trimPathToSegmentIndex(index)}
            onPathChangeCommit={handleExplorerPathChangeCommit}
            addSlashBeforeFirstSeg={true}
            appendTrailingSlash={true}
            allowEditText={true}
          />
          <div className="folder-explorer-under-path-line">
            {fileExplorerStore.pathFeedback ? (
              <span className={fileExplorerStore.pathFeedback.ok ? 'folder-explorer-under-path-line-success' : 'folder-explorer-under-path-line-failure'}>
                {fileExplorerStore.pathFeedback.text}
              </span>
            ) : (
              <span className="folder-explorer-under-path-line-default">
                {fileExplorerStore.rows.length}{' '}{fileExplorerStore.rows.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <FolderView
            columns={fileExplorerStore.columns}
            columnsOrder={fileExplorerStore.columnsOrder}
            columnsSizeInit={fileExplorerStore.columnsSize}
            rows={fileExplorerStore.rows}
            getBodyComponent={getBodyComponent}
            getIconData={rowId => {
              const row = fileExplorerStore.rows.find(r => r.id === rowId);
              const nameData = row?.data?.name;
              return { label: nameData?.name ?? '', kind: nameData?.type ?? 'file' };
            }}
            allowColumnReorder={true}
            allowRowReorder={true}
            onDataChangeRequest={handleExplorerFolderDataChangeRequest}
            onRowClick={handleExplorerRowClick}
            onRowDoubleClick={handleExplorerRowDoubleClick}
            selectedRowId={fileExplorerStore.selectedRowId}
            loading={fileExplorerStore.loading}
            loadingMessage={fileExplorerStore.loadingMessage}
            error={fileExplorerStore.error}
            bodyHeight={300}
            showStatusItemCount={false}
            contextMenuItems={[{ type: 'item', name: 'Delete' }]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Multiple selection with row reorder</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Click to select, Ctrl+Click to toggle, Shift+Click for range. Drag selected rows to reorder as a group. Parent receives onDataChangeRequest(&apos;reorder&apos; | &apos;reorder-multiple&apos;, params).
        </div>
        <div style={{ fontSize: '12px', color: '#444', marginBottom: '6px' }}>
          Order: {rowReorderDemo.rows.map(r => r.data.label).join(' → ')}
        </div>
        <div style={{ fontSize: '12px', color: '#444', marginBottom: '6px' }}>
          Selected: {rowReorderDemo.selectedRowIds.length > 0 ? rowReorderDemo.selectedRowIds.join(', ') : 'None'}
        </div>
        {rowReorderDemo.lastReorderNote ? (
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>
            Last: {rowReorderDemo.lastReorderNote}
          </div>
        ) : null}
        <FolderView
          columns={rowReorderDemo.columns}
          columnsOrder={rowReorderDemo.columnsOrder}
          columnsSizeInit={rowReorderDemo.columnsSize}
          rows={rowReorderDemo.rows}
          allowColumnReorder={false}
          allowRowReorder={true}
          selectionMode="multiple"
          selectedRowIds={rowReorderDemo.selectedRowIds}
          onSelectedRowIdsChange={(nextIds) => rowReorderDemo.selectedRowIds.replace(nextIds)}
          onDataChangeRequest={handleRowReorderDemoRequest}
          bodyHeight={200}
          showStatusBar={false}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Single Selection with Type Filter</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          MobX pattern with type validation. Only folders can be selected. Try clicking files vs folders.
        </div>
        <div style={{ marginBottom: '8px', fontSize: '12px' }}>
          <strong>Selected:</strong> {singleSelectStore.selectedRowIds.length > 0
            ? singleSelectStore.selectedRowIds.map(id => singleSelectStore.rowsById.get(id).name).join(', ')
            : 'None'}
        </div>
        <FolderView
          columns={{ name: SHARED_COLUMNS.name, size: SHARED_COLUMNS.size, type: SHARED_COLUMNS.type }}
          columnsOrder={['name', 'size', 'type']}
          columnsSizeInit={{
            name: { width: 200, minWidth: 100, resizable: true },
            size: { width: 120, minWidth: 80, resizable: true },
            type: { width: 100, minWidth: 80, resizable: true },
          }}
          rows={singleSelectStore.rows}
          dataStore={singleSelectStore}
          getRowData={(rowId, colId) => singleSelectStore.getRowData(rowId, colId)}
          selectedRowIds={singleSelectStore.selectedRowIds}
          selectionMode="single"
          onRowInteraction={event => singleSelectStore.handleRowInteraction(event)}
          bodyHeight={200}
          showStatusBar={false}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Multiple Selection with Ctrl/Shift Click</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Click to select. Ctrl+Click to toggle. Shift+Click for range selection. Notice the blue indicator on selected items.
        </div>
        <div style={{ marginBottom: '8px', fontSize: '12px' }}>
          <strong>Selected:</strong> {multiSelectStore.selectedRowIds.length} item(s)
          {multiSelectStore.selectedRowIds.length > 0 && ` - ${multiSelectStore.selectedRowIds.join(', ')}`}
        </div>
        <FolderView
          columns={{ name: SHARED_COLUMNS.name, size: SHARED_COLUMNS.size }}
          columnsOrder={['name', 'size']}
          columnsSizeInit={{
            name: { width: 250, minWidth: 150, resizable: true },
            size: { width: 150, minWidth: 100, resizable: true },
          }}
          rows={multiSelectStore.rows}
          dataStore={multiSelectStore}
          getRowData={(rowId, colId) => multiSelectStore.getRowData(rowId, colId)}
          selectedRowIds={multiSelectStore.selectedRowIds}
          selectionMode="multiple"
          onRowInteraction={event => multiSelectStore.handleRowInteraction(event)}
          bodyHeight={220}
          showStatusBar={false}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Multiple Selection with Type Validation</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Multiple selection but all selected must be same type. Try selecting a folder then a file with Ctrl+Click.
        </div>
        <div style={{ marginBottom: '8px', fontSize: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div>
            <strong>Selected:</strong> {mixedSelectStore.selectedRowIds.length > 0
              ? mixedSelectStore.selectedRowIds.map(id => mixedSelectStore.rowsById.get(id).name).join(', ')
              : 'None'}
          </div>
          <button
            onClick={() => mixedSelectStore.clearSelection()}
            style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear Selection
          </button>
          <button
            type="button"
            onClick={() => {
              const items = mixedSelectStore.getSelectedItems();
              setMixedSelectionSummary(items.map(i => i.name).join(', ') || '(none)');
            }}
            style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Get Selected
          </button>
        </div>
        {mixedSelectionSummary ? (
          <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px' }}>
            {mixedSelectionSummary}
          </div>
        ) : null}
        <FolderView
          columns={{ name: SHARED_COLUMNS.name, size: SHARED_COLUMNS.size, type: SHARED_COLUMNS.type }}
          columnsOrder={['name', 'size', 'type']}
          columnsSizeInit={{
            name: { width: 200, minWidth: 120, resizable: true },
            size: { width: 120, minWidth: 80, resizable: true },
            type: { width: 100, minWidth: 80, resizable: true },
          }}
          rows={mixedSelectStore.rows}
          dataStore={mixedSelectStore}
          getRowData={(rowId, colId) => mixedSelectStore.getRowData(rowId, colId)}
          selectedRowIds={mixedSelectStore.selectedRowIds}
          selectionMode="multiple"
          onRowInteraction={event => mixedSelectStore.handleRowInteraction(event)}
          bodyHeight={200}
          showStatusBar={false}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>View Switching via FolderView</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Toggle between List and Icons views. Ctrl/Shift select multiple rows, then drag selected rows to reorder as a group.
        </div>
        <div style={{ marginBottom: '6px', fontSize: '12px' }}>
          <strong>Selected:</strong> {viewSwitchStore.selectedRowIds.length > 0
            ? viewSwitchStore.selectedRowIds.map(id => viewSwitchStore.rowsById.get(id).name).join(', ')
            : 'None'}
        </div>
        <div className="folder-explorer-under-path-line">
          {viewSwitchFeedback ? (
            <span className={viewSwitchFeedback.ok ? 'folder-explorer-under-path-line-success' : 'folder-explorer-under-path-line-failure'}>
              {viewSwitchFeedback.text}
            </span>
          ) : (
            <span className="folder-explorer-under-path-line-default">
              {viewSwitchStore.rows.length} {viewSwitchStore.rows.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
        <FolderView
          columns={{ name: SHARED_COLUMNS.name, size: SHARED_COLUMNS.size, type: SHARED_COLUMNS.type }}
          columnsOrder={['name', 'size', 'type']}
          columnsSizeInit={{
            name: { width: 200, minWidth: 100, resizable: true },
            size: { width: 120, minWidth: 80, resizable: true },
            type: { width: 100, minWidth: 80, resizable: true },
          }}
          rows={viewSwitchStore.rows}
          dataStore={viewSwitchStore}
          getRowData={(rowId, colId) => viewSwitchStore.getRowData(rowId, colId)}
          getIconData={rowId => {
            const item = viewSwitchStore.rowsById.get(rowId);
            return { label: item?.name ?? '', kind: item?.type ?? 'file' };
          }}
          selectedRowIds={viewSwitchStore.selectedRowIds}
          onSelectedRowIdsChange={(nextIds) => viewSwitchStore.selectedRowIds.replace(nextIds)}
          selectionMode="multiple"
          allowRowReorder={true}
          onDataChangeRequest={handleViewSwitchDataChangeRequest}
          loading={viewSwitchLoading}
          bodyHeight={260}
          showStatusBar={false}
        />
      </div>

      <div className="folder-tree-example-block">
        <div className="folder-tree-example-title">Tree View with Lazy Loading</div>
        <div className="folder-tree-example-desc">
          Expand/collapse requests are sent upward, store decides state changes, and MobX triggers re-render. Expanding components fails once to show load-failed with retry.
        </div>
        <div className="folder-tree-example-meta">
          Selected: {treeViewStore.getItemDataById(treeViewStore.selectedItemId)?.text || '(none)'}
        </div>
        <div className="folder-tree-example-box">
          <TreeView
            rootItemIds={treeViewStore.rootItemIds}
            getItemDataById={treeViewStore.getItemDataById}
            onDataChangeRequest={treeViewStore.onTreeDataChangeRequest}
            selectedItemId={treeViewStore.selectedItemId}
            onItemClick={(itemId) => treeViewStore.setSelectedItem(itemId)}
            getItemComp={getTreeItemComp}
          />
        </div>
      </div>


    </div>
  );
});

export const folderExamples = {
  'Folder': {
    component: null,
    description: 'Folder view components with resizable headers',
    example: () => <FolderExamplesPanel />
  }
};
