import React, { useRef, useState } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import Header from './Header';
import FolderView from './FolderView';
import CellDropdown from './CellEditable.jsx';
import PathBar from '../../component/path/PathBar.jsx';
import { createFolderExplorerDemoStore } from './folderExplorerDemoModel';
import { buildColWidthByIdFromSize } from './folderUtils.js';
import InfoIconWithTooltip from '../../icon/InfoIconWithTooltip';
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
  { id: 1, name: 'Documents', size: '4 items', type: 'folder' },
  { id: 2, name: 'Pictures', size: '12 items', type: 'folder' },
  { id: 3, name: 'Music', size: '8 items', type: 'folder' },
  { id: 4, name: 'Projects', size: '5 items', type: 'folder' },
  { id: 5, name: 'Downloads', size: '15 items', type: 'folder' },
  { id: 6, name: 'Photos', size: '42 items', type: 'folder' },
  { id: 7, name: 'App.jsx', size: '4.2 KB', type: 'file' },
  { id: 8, name: 'styles.css', size: '1.8 KB', type: 'file' },
  { id: 9, name: 'README.md', size: '2.1 KB', type: 'file' },
  { id: 10, name: 'config.json', size: '856 B', type: 'file' },
  { id: 11, name: 'notes.txt', size: '1 KB', type: 'file' },
  { id: 12, name: 'logo.png', size: '24.5 KB', type: 'file' },
];

const CATALOG_MAP = new Map(CATALOG.map((item) => [item.id, item]));

function makeCatalogBase(ids) {
  const base = {
    rowsById: new Map(ids.map((id) => [id, CATALOG_MAP.get(id)])),
    rowsOrder: ids,
    rowIdsSelected: [],
    getRowData(rowId, colId) {
      return this.rowsById.get(rowId)?.[colId];
    },
  };
  Object.defineProperty(base, 'rows', {
    get() {
      return this.rowsOrder.map((id) => ({ id, data: this.rowsById.get(id) }));
    },
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

const FolderExamplesPanel = observer(() => {
  const [basicData] = useState(() => makeAutoObservable({
    columns: {
      name: { data: 'Name', align: 'left' },
      size: { data: 'Size', align: 'right' },
      type: { data: 'Type', align: 'left' },
      modified: { data: 'Modified', align: 'left' },
    },
    colsOrder: ['name', 'size', 'type', 'modified'],
    colSizeById: {
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
    colsOrder: ['name', 'size', 'modified'],
    colSizeById: {
      name: { width: 200, minWidth: 100, resizable: true },
      size: { width: 120, minWidth: 80, resizable: true },
      modified: { width: 200, minWidth: 100, resizable: true },
    },
  }));

  const [fileExplorerStore] = useState(() => createFolderExplorerDemoStore());

  const [basicColWidthById, setBasicColWidthById] = useState(() => (
    buildColWidthByIdFromSize(basicData.colsOrder, basicData.colSizeById)
  ));

  const [customColWidthById, setCustomColWidthById] = useState(() => (
    buildColWidthByIdFromSize(customData.colsOrder, customData.colSizeById)
  ));

  const [lastColumnFillDemo] = useState(() => makeAutoObservable({
    columns: {
      name: { data: 'Name', align: 'left' },
      owner: { data: 'Owner', align: 'left' },
      modified: { data: 'Modified', align: 'left' },
    },
    colsOrder: ['name', 'owner', 'modified'],
    colSizeById: {
      name: { width: 180, minWidth: 120, resizable: true },
      owner: { width: 120, minWidth: 80, resizable: true },
      modified: { width: 130, minWidth: 100, resizable: true },
    },
    rows: [
      { id: 'r1', data: { name: 'orders', owner: 'db-team', modified: '2026-03-19' } },
      { id: 'r2', data: { name: 'users', owner: 'backend', modified: '2026-03-17' } },
      { id: 'r3', data: { name: 'payments', owner: 'infra', modified: '2026-03-16' } },
    ],
  }));

  const [rowReorderDemo] = useState(() => makeAutoObservable({
    columns: { label: { data: 'Item', align: 'left' } },
    colsOrder: ['label'],
    colSizeById: { label: { width: 280, minWidth: 120, resizable: true } },
    rows: [
      { id: 'a', data: { label: 'Alpha' } },
      { id: 'b', data: { label: 'Bravo' } },
      { id: 'c', data: { label: 'Charlie' } },
      { id: 'd', data: { label: 'Delta' } },
    ],
    rowIdsSelected: [],
    lastReorderNote: '',
  }));

  const [cellDropdownDemo] = useState(() => makeAutoObservable({
    columns: {
      room: { data: 'Room', align: 'left' },
      lockState: { data: 'is_locked', align: 'left' },
    },
    colsOrder: ['room', 'lockState'],
    colSizeById: {
      room: { width: 220, minWidth: 120, resizable: true },
      lockState: { width: 150, minWidth: 100, resizable: true },
    },
    rowsById: new Map([
      ['room-a', { id: 'room-a', room: 'Tokyo-101', is_locked: false }],
      ['room-b', { id: 'room-b', room: 'Osaka-203', is_locked: true }],
      ['room-c', { id: 'room-c', room: 'Naha-08', is_locked: false }],
    ]),
    rowsOrder: ['room-a', 'room-b', 'room-c'],
    isEditable: true,
    isBusyByRowId: {},
    get rows() {
      return this.rowsOrder.map((rowId) => {
        const row = this.rowsById.get(rowId);
        return {
          id: rowId,
          data: {
            room: row?.room || '',
            lockState: {
              value: row?.is_locked ? 'locked' : 'unlocked',
              isEditable: this.isEditable,
              isBusy: Boolean(this.isBusyByRowId[rowId]),
              options: [
                { value: 'locked', label: 'locked' },
                { value: 'unlocked', label: 'unlocked' },
              ],
            },
          },
        };
      });
    },
  }));

  const [singleSelectStore] = useState(() => {
    const store = makeCatalogBase([1, 2, 7, 8, 3]);
    store.allowedTypes = ['folder'];
    store.handleRowInteraction = function handleRowInteraction(event) {
      if (event.type !== 'click') return;
      const row = this.rowsById.get(event.rowId);
      if (!this.allowedTypes.includes(row.type)) return;
      this.rowIdsSelected = this.rowIdsSelected.includes(event.rowId) ? [] : [event.rowId];
    };
    return makeAutoObservable(store);
  });

  const [multiSelectStore] = useState(() => {
    const store = makeCatalogBase([7, 8, 9, 10, 11, 12]);
    store.handleRowInteraction = function handleRowInteraction(event) {
      if (event.type !== 'click') return;
      const { rowId, modifiers } = event;
      if (modifiers.ctrl || modifiers.meta) {
        if (this.rowIdsSelected.includes(rowId)) {
          this.rowIdsSelected = this.rowIdsSelected.filter((id) => id !== rowId);
        } else {
          this.rowIdsSelected.push(rowId);
        }
      } else if (modifiers.shift && this.rowIdsSelected.length > 0) {
        const lastIndex = this.rowsOrder.indexOf(this.rowIdsSelected[this.rowIdsSelected.length - 1]);
        const currentIndex = this.rowsOrder.indexOf(rowId);
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        this.rowIdsSelected = [...new Set([...this.rowIdsSelected, ...this.rowsOrder.slice(start, end + 1)])];
      } else {
        this.rowIdsSelected = [rowId];
      }
    };
    return makeAutoObservable(store);
  });

  const [mixedSelectStore] = useState(() => {
    const store = makeCatalogBase([4, 9, 5, 10, 6]);
    store.allowMixed = false;
    store.handleRowInteraction = function handleRowInteraction(event) {
      if (event.type !== 'click') return;
      const { rowId, modifiers } = event;
      const row = this.rowsById.get(rowId);
      if (!this.allowMixed && this.rowIdsSelected.length > 0) {
        if (this.rowsById.get(this.rowIdsSelected[0]).type !== row.type) return;
      }
      if (modifiers.ctrl || modifiers.meta) {
        if (this.rowIdsSelected.includes(rowId)) {
          this.rowIdsSelected = this.rowIdsSelected.filter((id) => id !== rowId);
        } else {
          this.rowIdsSelected.push(rowId);
        }
      } else {
        this.rowIdsSelected = [rowId];
      }
    };
    store.clearSelection = function clearSelection() { this.rowIdsSelected = []; };
    store.getSelectedItems = function getSelectedItems() {
      return this.rowIdsSelected.map((id) => this.rowsById.get(id));
    };
    return makeAutoObservable(store);
  });

  const [viewSwitchStore] = useState(() => {
    const store = makeCatalogBase([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    store.handleRowInteraction = function handleRowInteraction(event) {
      if (event.type !== 'click') return;
      const { rowId } = event;
      this.rowIdsSelected = this.rowIdsSelected.includes(rowId) ? [] : [rowId];
    };
    return makeAutoObservable(store);
  });

  const [viewSwitchIsLocked, setViewSwitchIsLocked] = useState(false);
  const [viewSwitchFeedback, setViewSwitchFeedback] = useState(null);
  const [colResizeDragMode, setColResizeDragMode] = useState('preview');
  const [colResizeWidthMode, setColResizeWidthMode] = useState('natural');
  const viewSwitchFeedbackTimer = useRef(null);

  const sharedColResizeConfig = {
    colResizeDragMode,
    colResizeWidthMode,
  };

  const showViewSwitchFeedback = (feedback) => {
    if (viewSwitchFeedbackTimer.current) clearTimeout(viewSwitchFeedbackTimer.current);
    setViewSwitchFeedback(feedback);
    viewSwitchFeedbackTimer.current = setTimeout(() => {
      viewSwitchFeedbackTimer.current = null;
      setViewSwitchFeedback(null);
    }, 3000);
  };

  const compHeaderByColId = () => TextWithInfoIconComp;
  const compBodyByColId = (colId) => (colId === 'name' ? FileNameCell : undefined);
  const compCellDropdownByColId = (colId) => (colId === 'lockState' ? CellDropdown : undefined);

  const handleBasicHeaderEvent = async (eventType, eventData) => {
    if (eventType === 'colResize') {
      setBasicColWidthById(eventData.colWidthByIdNext);
      return { code: 0 };
    }
    if (eventType === 'colReorder') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (Math.random() > 0.05) {
        basicData.colsOrder.replace(eventData.colsOrderNext);
        return { code: 0, message: 'Column reordered successfully' };
      }
      return { code: -1, message: 'Failed to reorder column' };
    }
    return { code: 0 };
  };

  const handleCustomHeaderEvent = async (eventType, eventData) => {
    if (eventType === 'colResize') {
      setCustomColWidthById(eventData.colWidthByIdNext);
      return { code: 0 };
    }
    return { code: 0 };
  };

  const handleCellDropdownEvent = async (eventType, eventData) => {
    if (eventType !== 'cellValueChange' || eventData?.colId !== 'lockState') {
      return { code: 0 };
    }
    const rowId = eventData?.rowId;
    const nextLockState = eventData?.valueNext;
    if (!rowId || (nextLockState !== 'locked' && nextLockState !== 'unlocked')) {
      return { code: -1, message: 'invalid params' };
    }
    const targetRow = cellDropdownDemo.rowsById.get(rowId);
    if (!targetRow) {
      return { code: -1, message: 'row not found' };
    }
    cellDropdownDemo.isBusyByRowId = {
      ...cellDropdownDemo.isBusyByRowId,
      [rowId]: true,
    };
    await new Promise((resolve) => setTimeout(resolve, 240));
    cellDropdownDemo.rowsById.set(rowId, {
      ...targetRow,
      is_locked: nextLockState === 'locked',
    });
    cellDropdownDemo.isBusyByRowId = {
      ...cellDropdownDemo.isBusyByRowId,
      [rowId]: false,
    };
    return { code: 0 };
  };

  const handleExplorerFolderEvent = async (eventType, eventData) => {
    const ex = fileExplorerStore;
    if (eventType === 'rowClick') {
      ex.setRowIdsSelected([eventData.rowId]);
      return { code: 0 };
    }
    if (eventType === 'rowDoubleClick') {
      const row = ex.rows.find((item) => item.id === eventData.rowId);
      if (row?.data?.name?.type === 'folder') {
        ex.openChildFolderByName(row.data.name.name);
      }
      return { code: 0 };
    }
    if (eventType === 'colResize') {
      if (eventData.colWidthByIdNext) {
        ex.colWidthById = eventData.colWidthByIdNext;
      }
      return { code: 0 };
    }
    if (eventType === 'colReorder') {
      ex.messageState = { status: 'loading', messageText: 'Reordering column' };
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (Math.random() > 0.1) {
        ex.colsOrder.replace(eventData.colsOrderNext);
        ex.messageState = null;
        return { code: 0 };
      }
      ex.messageState = { status: 'error', messageText: 'Failed to reorder column' };
      setTimeout(() => { ex.messageState = null; }, 1000);
      return { code: -1 };
    }
    if (eventType === 'rowReorder' || eventType === 'rowReorderMultiple') {
      const folder = ex.currentFolder;
      if (!folder) return { code: -1, message: 'No folder' };
      ex.messageState = { status: 'loading', messageText: 'Reordering row' };
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (Math.random() > 0.1) {
        const byId = new Map(folder.children.map((child) => [child.id, child]));
        folder.children.replace(
          eventData.rowsOrderNext.map((id) => byId.get(id)).filter(Boolean)
        );
        ex.messageState = null;
        return { code: 0 };
      }
      ex.messageState = { status: 'error', messageText: 'Failed to reorder row' };
      setTimeout(() => { ex.messageState = null; }, 1000);
      return { code: -1 };
    }
    if (eventType === 'rowDelete') {
      const folder = ex.currentFolder;
      if (!folder) return { code: -1, message: 'No folder' };
      ex.messageState = { status: 'loading', messageText: 'Deleting row' };
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (Math.random() > 0.05) {
        const idx = folder.children.findIndex((child) => child.id === eventData.rowId);
        if (idx >= 0) folder.children.splice(idx, 1);
        if (ex.rowIdsSelected.includes(eventData.rowId)) {
          ex.rowIdsSelected = ex.rowIdsSelected.filter((id) => id !== eventData.rowId);
        }
        ex.messageState = null;
        return { code: 0 };
      }
      ex.messageState = { status: 'error', messageText: 'Failed to delete row' };
      setTimeout(() => { ex.messageState = null; }, 1000);
      return { code: -1 };
    }
    return { code: 0 };
  };

  const handleExplorerPathChangeCommit = async (pathData) => {
    const ex = fileExplorerStore;
    ex.messageState = { status: 'loading', messageText: 'Resolving path' };
    ex.clearPathFeedbackTimer();
    ex.pathFeedback = null;
    await new Promise((resolve) => setTimeout(resolve, 450));
    const result = ex.trySetPathFromParsed(pathData);
    ex.messageState = null;
    if (!result.ok) {
      ex.showPathFeedbackBriefly({ ok: false, text: result.reason });
      return false;
    }
    ex.showPathFeedbackBriefly({ ok: true, text: 'Opened folder.' });
    return true;
  };

  const handleRowReorderDemoEvent = async (eventType, eventData) => {
    if (eventType === 'rowIdsSelectedChange') {
      rowReorderDemo.rowIdsSelected.replace(eventData.rowIdsSelected);
      return { code: 0 };
    }
    if (eventType !== 'rowReorder' && eventType !== 'rowReorderMultiple') {
      return { code: 0, message: 'noop' };
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
    if (eventData.rowsOrderNext && Array.isArray(eventData.rowsOrderNext)) {
      const byId = new Map(rowReorderDemo.rows.map((row) => [row.id, row]));
      rowReorderDemo.rows.replace(
        eventData.rowsOrderNext.map((id) => byId.get(id)).filter(Boolean)
      );
    }
    rowReorderDemo.rowIdsSelected = rowReorderDemo.rowIdsSelected.filter((id) => (
      rowReorderDemo.rows.some((row) => row.id === id)
    ));
    if (eventType === 'rowReorderMultiple') {
      rowReorderDemo.lastReorderNote = `rowIds=${(eventData.rowIds || []).join(',')} toIndex=${eventData.toIndex}`;
      return { code: 0, message: 'Rows reordered' };
    }
    rowReorderDemo.lastReorderNote = `rowId=${eventData.rowId} toIndex=${eventData.toIndex}`;
    return { code: 0, message: 'Row reordered' };
  };

  const handleViewSwitchEvent = async (eventType, eventData) => {
    if (eventType === 'rowIdsSelectedChange') {
      viewSwitchStore.rowIdsSelected.replace(eventData.rowIdsSelected);
      return { code: 0 };
    }
    if (eventType !== 'rowReorder' && eventType !== 'rowReorderMultiple') {
      return { code: 0 };
    }
    setViewSwitchIsLocked(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const isSuccess = Math.random() > 0.3;
    setViewSwitchIsLocked(false);
    if (isSuccess) {
      const byId = new Map(viewSwitchStore.rowsOrder.map((id) => [id, id]));
      viewSwitchStore.rowsOrder.replace(
        eventData.rowsOrderNext.map((id) => byId.get(id)).filter((id) => id !== undefined)
      );
      showViewSwitchFeedback({
        ok: true,
        text: eventType === 'rowReorderMultiple' ? 'Multiple rows reordered.' : 'Reordered.',
      });
      return { code: 0 };
    }
    showViewSwitchFeedback({ ok: false, text: 'Reorder rejected.' });
    return { code: -1 };
  };

  const [mixedSelectionSummary, setMixedSelectionSummary] = useState('');

  const catalogColSizeById = {
    name: { width: 200, minWidth: 100, resizable: true },
    size: { width: 120, minWidth: 80, resizable: true },
    type: { width: 100, minWidth: 80, resizable: true },
  };

  return (
    <div>
      <div style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={() => setColResizeDragMode((prev) => (prev === 'preview' ? 'immediate' : 'preview'))}
          style={{
            minHeight: '24px',
            padding: '2px 8px',
            border: '1px solid #d0d0d0',
            borderRadius: '2px',
            background: '#ffffff',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {colResizeDragMode === 'preview' ? 'resize mode: preview-on-release' : 'resize mode: immediate'}
        </button>
        <button
          type="button"
          onClick={() => setColResizeWidthMode((prev) => (prev === 'natural' ? 'local' : 'natural'))}
          style={{
            minHeight: '24px',
            padding: '2px 8px',
            border: '1px solid #d0d0d0',
            borderRadius: '2px',
            background: '#ffffff',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {colResizeWidthMode === 'natural' ? 'width mode: natural' : 'width mode: local'}
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Basic Header</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Drag column cells to reorder. Drag separators to resize. Blue line shows drop position.
        </div>
        <div style={{ border: '1px solid #d0d0d0', borderRadius: '2px' }}>
          <Header
            data={{
              columns: basicData.columns,
              colsOrder: basicData.colsOrder,
              colWidthById: basicColWidthById,
            }}
            config={{
              colSizeById: basicData.colSizeById,
              isColReorderAllowed: true,
              ...sharedColResizeConfig,
            }}
            onEvent={handleBasicHeaderEvent}
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
            data={{
              columns: customData.columns,
              colsOrder: customData.colsOrder,
              colWidthById: customColWidthById,
            }}
            config={{
              colSizeById: customData.colSizeById,
              compByColId: compHeaderByColId,
              ...sharedColResizeConfig,
            }}
            onEvent={handleCustomHeaderEvent}
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
            onPathSegClicked={(index) => fileExplorerStore.trimPathToSegmentIndex(index)}
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
                {fileExplorerStore.rows.length} {fileExplorerStore.rows.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <FolderView
            data={{
              columns: fileExplorerStore.columns,
              colsOrder: fileExplorerStore.colsOrder,
              rows: fileExplorerStore.rows,
              rowIdsSelected: fileExplorerStore.rowIdsSelected,
              contextMenuItems: [{ id: 'delete', label: 'Delete' }],
              statusBar: fileExplorerStore.statusBarData,
              getRowIconData: (rowId) => {
                const row = fileExplorerStore.rows.find((item) => item.id === rowId);
                const nameData = row?.data?.name;
                return { label: nameData?.name ?? '', kind: nameData?.type ?? 'file' };
              },
            }}
            config={{
              colSizeById: fileExplorerStore.colSizeById,
              colWidthById: fileExplorerStore.colWidthById,
              isColReorderAllowed: true,
              isRowReorderAllowed: true,
              isLocked: fileExplorerStore.isLocked,
              bodyHeight: 300,
              isStatusItemCountVisible: false,
              compBodyByColId: compBodyByColId,
              ...sharedColResizeConfig,
            }}
            onEvent={handleExplorerFolderEvent}
          />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Last Column Fill Mode</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Enable isLastColFilled to let the final column consume remaining horizontal space.
        </div>
        <FolderView
          data={{
            columns: lastColumnFillDemo.columns,
            colsOrder: lastColumnFillDemo.colsOrder,
            rows: lastColumnFillDemo.rows,
          }}
          config={{
            colSizeById: lastColumnFillDemo.colSizeById,
            isLastColFilled: true,
            bodyHeight: 140,
            isStatusBarVisible: false,
            isListOnly: true,
            ...sharedColResizeConfig,
          }}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Multiple selection with row reorder</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Click to select, Ctrl+Click to toggle, Shift+Click for range. Drag selected rows to reorder as a group. Parent receives rowReorder / rowReorderMultiple events.
        </div>
        <div style={{ fontSize: '12px', color: '#444', marginBottom: '6px' }}>
          Order: {rowReorderDemo.rows.map((row) => row.data.label).join(' -> ')}
        </div>
        <div style={{ fontSize: '12px', color: '#444', marginBottom: '6px' }}>
          Selected: {rowReorderDemo.rowIdsSelected.length > 0 ? rowReorderDemo.rowIdsSelected.join(', ') : 'None'}
        </div>
        {rowReorderDemo.lastReorderNote ? (
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>
            Last: {rowReorderDemo.lastReorderNote}
          </div>
        ) : null}
        <FolderView
          data={{
            columns: rowReorderDemo.columns,
            colsOrder: rowReorderDemo.colsOrder,
            rows: rowReorderDemo.rows,
            rowIdsSelected: rowReorderDemo.rowIdsSelected,
          }}
          config={{
            colSizeById: rowReorderDemo.colSizeById,
            isRowReorderAllowed: true,
            selectionMode: 'multiple',
            bodyHeight: 200,
            isStatusBarVisible: false,
            ...sharedColResizeConfig,
          }}
          onEvent={handleRowReorderDemoEvent}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>CellDropdown</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Left icon opens dropdown only when editable. Updates go through onEvent cellValueChange and are applied only after accepted.
        </div>
        <div style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => {
              cellDropdownDemo.isEditable = !cellDropdownDemo.isEditable;
            }}
            style={{
              minHeight: '24px',
              padding: '2px 8px',
              border: '1px solid #d0d0d0',
              borderRadius: '2px',
              background: '#ffffff',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {cellDropdownDemo.isEditable ? 'editable' : 'readonly'}
          </button>
        </div>
        <FolderView
          data={{
            columns: cellDropdownDemo.columns,
            colsOrder: cellDropdownDemo.colsOrder,
            rows: cellDropdownDemo.rows,
          }}
          config={{
            colSizeById: cellDropdownDemo.colSizeById,
            compBodyByColId: compCellDropdownByColId,
            bodyHeight: 140,
            isStatusBarVisible: false,
            isListOnly: true,
            ...sharedColResizeConfig,
          }}
          onEvent={handleCellDropdownEvent}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Single Selection with Type Filter</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          MobX pattern with type validation. Only folders can be selected. Try clicking files vs folders.
        </div>
        <div style={{ marginBottom: '8px', fontSize: '12px' }}>
          <strong>Selected:</strong> {singleSelectStore.rowIdsSelected.length > 0
            ? singleSelectStore.rowIdsSelected.map((id) => singleSelectStore.rowsById.get(id).name).join(', ')
            : 'None'}
        </div>
        <FolderView
          data={{
            columns: { name: SHARED_COLUMNS.name, size: SHARED_COLUMNS.size, type: SHARED_COLUMNS.type },
            colsOrder: ['name', 'size', 'type'],
            rows: singleSelectStore.rows,
            rowIdsSelected: singleSelectStore.rowIdsSelected,
            getRowData: (rowId, colId) => singleSelectStore.getRowData(rowId, colId),
          }}
          config={{
            colSizeById: catalogColSizeById,
            selectionMode: 'single',
            isRowDataObservable: true,
            bodyHeight: 200,
            isStatusBarVisible: false,
            ...sharedColResizeConfig,
          }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'rowInteraction') {
              singleSelectStore.handleRowInteraction(eventData);
            }
            return { code: 0 };
          }}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Multiple Selection with Ctrl/Shift Click</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Click to select. Ctrl+Click to toggle. Shift+Click for range selection. Notice the blue indicator on selected items.
        </div>
        <div style={{ marginBottom: '8px', fontSize: '12px' }}>
          <strong>Selected:</strong> {multiSelectStore.rowIdsSelected.length} item(s)
          {multiSelectStore.rowIdsSelected.length > 0 && ` - ${multiSelectStore.rowIdsSelected.join(', ')}`}
        </div>
        <FolderView
          data={{
            columns: { name: SHARED_COLUMNS.name, size: SHARED_COLUMNS.size },
            colsOrder: ['name', 'size'],
            rows: multiSelectStore.rows,
            rowIdsSelected: multiSelectStore.rowIdsSelected,
            getRowData: (rowId, colId) => multiSelectStore.getRowData(rowId, colId),
          }}
          config={{
            colSizeById: {
              name: { width: 250, minWidth: 150, resizable: true },
              size: { width: 150, minWidth: 100, resizable: true },
            },
            selectionMode: 'multiple',
            isRowDataObservable: true,
            bodyHeight: 220,
            isStatusBarVisible: false,
            ...sharedColResizeConfig,
          }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'rowInteraction') {
              multiSelectStore.handleRowInteraction(eventData);
            }
            return { code: 0 };
          }}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Multiple Selection with Type Validation</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Multiple selection but all selected must be same type. Try selecting a folder then a file with Ctrl/Cmd+Click.
        </div>
        <div style={{ marginBottom: '8px', fontSize: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div>
            <strong>Selected:</strong> {mixedSelectStore.rowIdsSelected.length > 0
              ? mixedSelectStore.rowIdsSelected.map((id) => mixedSelectStore.rowsById.get(id).name).join(', ')
              : 'None'}
          </div>
          <button
            type="button"
            onClick={() => mixedSelectStore.clearSelection()}
            style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear Selection
          </button>
          <button
            type="button"
            onClick={() => {
              const items = mixedSelectStore.getSelectedItems();
              setMixedSelectionSummary(items.map((item) => item.name).join(', ') || '(none)');
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
          data={{
            columns: { name: SHARED_COLUMNS.name, size: SHARED_COLUMNS.size, type: SHARED_COLUMNS.type },
            colsOrder: ['name', 'size', 'type'],
            rows: mixedSelectStore.rows,
            rowIdsSelected: mixedSelectStore.rowIdsSelected,
            getRowData: (rowId, colId) => mixedSelectStore.getRowData(rowId, colId),
          }}
          config={{
            colSizeById: {
              name: { width: 200, minWidth: 120, resizable: true },
              size: { width: 120, minWidth: 80, resizable: true },
              type: { width: 100, minWidth: 80, resizable: true },
            },
            selectionMode: 'multiple',
            isRowDataObservable: true,
            bodyHeight: 200,
            isStatusBarVisible: false,
            ...sharedColResizeConfig,
          }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'rowIdsSelectedChange') {
              const nextIds = eventData.rowIdsSelected;
              if (mixedSelectStore.allowMixed || nextIds.length <= 1) {
                mixedSelectStore.rowIdsSelected.replace(nextIds);
                return { code: 0 };
              }
              const firstType = mixedSelectStore.rowsById.get(nextIds[0])?.type;
              const isSameTypeOnly = nextIds.every((rowId) => (
                mixedSelectStore.rowsById.get(rowId)?.type === firstType
              ));
              if (isSameTypeOnly) {
                mixedSelectStore.rowIdsSelected.replace(nextIds);
              }
              return { code: 0 };
            }
            return { code: 0 };
          }}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>View Switching via FolderView</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Toggle between List and Icons views. Ctrl/Shift select multiple rows, then drag selected rows to reorder as a group.
        </div>
        <div style={{ marginBottom: '6px', fontSize: '12px' }}>
          <strong>Selected:</strong> {viewSwitchStore.rowIdsSelected.length > 0
            ? viewSwitchStore.rowIdsSelected.map((id) => viewSwitchStore.rowsById.get(id).name).join(', ')
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
          data={{
            columns: { name: SHARED_COLUMNS.name, size: SHARED_COLUMNS.size, type: SHARED_COLUMNS.type },
            colsOrder: ['name', 'size', 'type'],
            rows: viewSwitchStore.rows,
            rowIdsSelected: viewSwitchStore.rowIdsSelected,
            getRowData: (rowId, colId) => viewSwitchStore.getRowData(rowId, colId),
            getRowIconData: (rowId) => {
              const item = viewSwitchStore.rowsById.get(rowId);
              return { label: item?.name ?? '', kind: item?.type ?? 'file' };
            },
          }}
          config={{
            colSizeById: catalogColSizeById,
            selectionMode: 'multiple',
            isRowReorderAllowed: true,
            isRowDataObservable: true,
            isLocked: viewSwitchIsLocked,
            bodyHeight: 260,
            isStatusBarVisible: false,
            ...sharedColResizeConfig,
          }}
          onEvent={handleViewSwitchEvent}
        />
      </div>
    </div>
  );
});

export const folderExamples = {
  Folder: {
    component: null,
    description: 'Folder view components with resizable headers',
    example: () => <FolderExamplesPanel />,
  },
};
