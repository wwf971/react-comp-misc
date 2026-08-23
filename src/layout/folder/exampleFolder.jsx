import { useMemo } from 'react';
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
import {
  DemoPanel,
  Example,
  Explanation,
  KeyChip,
  Controls,
  ControlItem,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
import { ExampleGroup, ExampleStackVertical } from '../../dev/demo/ExampleGroup.jsx';
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

const COL_RESIZE_DEMO_COLS_ORDER = ['name', 'size', 'type', 'modified'];

const COL_RESIZE_DEMO_COL_SIZE_BY_ID = {
  name: { width: 160, minWidth: 80, resizable: true },
  size: { width: 100, minWidth: 60, resizable: true },
  type: { width: 100, minWidth: 60, resizable: true },
  modified: { width: 140, minWidth: 80, resizable: true },
};

const createColResizeDemoStore = (rows) => makeAutoObservable({
  columns: {
    name: { data: 'Name', align: 'left' },
    size: { data: 'Size', align: 'right' },
    type: { data: 'Type', align: 'left' },
    modified: { data: 'Modified', align: 'left' },
  },
  colsOrder: [...COL_RESIZE_DEMO_COLS_ORDER],
  colSizeById: { ...COL_RESIZE_DEMO_COL_SIZE_BY_ID },
  colWidthById: buildColWidthByIdFromSize(COL_RESIZE_DEMO_COLS_ORDER, COL_RESIZE_DEMO_COL_SIZE_BY_ID),
  rows: rows || [
    { id: 'r1', data: { name: 'report.pdf', size: '120 KB', type: 'file', modified: '2026-07-20' } },
    { id: 'r2', data: { name: 'photos', size: '34 items', type: 'folder', modified: '2026-07-18' } },
    { id: 'r3', data: { name: 'notes.txt', size: '2 KB', type: 'file', modified: '2026-07-15' } },
  ],
  applyColResize(colWidthByIdNext) {
    this.colWidthById = colWidthByIdNext;
  },
});

const makeColResizePerfDemoRows = (rowCount) => (
  Array.from({ length: rowCount }, (unused, index) => {
    const num = index + 1;
    return {
      id: `perf-r${num}`,
      data: {
        name: `file-${String(num).padStart(3, '0')}.txt`,
        size: `${((num * 7) % 900) + 1} KB`,
        type: num % 5 === 0 ? 'folder' : 'file',
        modified: `2026-0${(num % 9) + 1}-${String((num % 28) + 1).padStart(2, '0')}`,
      },
    };
  })
);

const colResizeWidthsText = (store) => (
  store.colsOrder.map((colId) => `${colId}=${Math.round(store.colWidthById[colId] || 0)}`).join('  ')
);

const ColResizeDemoFolder = observer(({ store, colResizeDragMode, colResizeWidthMode, bodyHeight = 90 }) => (
  <FolderView
    data={{
      columns: store.columns,
      colsOrder: store.colsOrder,
      rows: store.rows,
    }}
    config={{
      colSizeById: store.colSizeById,
      colWidthById: store.colWidthById,
      colResizeDragMode,
      colResizeWidthMode,
      bodyHeight,
      isStatusBarVisible: false,
      isListOnly: true,
    }}
    onEvent={(eventType, eventData) => {
      if (eventType === 'colResize') {
        store.applyColResize(eventData.colWidthByIdNext);
        return { code: 0 };
      }
      return { code: 0 };
    }}
  />
));

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

function createBasicHeaderStore() {
  const colSizeById = {
    name: { width: 200, minWidth: 80, resizable: true },
    size: { width: 100, minWidth: 60, resizable: true },
    type: { width: 150, resizable: true },
    modified: { width: 150, resizable: true },
  };
  const colsOrder = ['name', 'size', 'type', 'modified'];
  return makeAutoObservable({
    columns: {
      name: { data: 'Name', align: 'left' },
      size: { data: 'Size', align: 'right' },
      type: { data: 'Type', align: 'left' },
      modified: { data: 'Modified', align: 'left' },
    },
    colsOrder,
    colSizeById,
    colWidthById: buildColWidthByIdFromSize(colsOrder, colSizeById),
  });
}

function createCustomHeaderStore() {
  const colSizeById = {
    name: { width: 200, minWidth: 100, resizable: true },
    size: { width: 120, minWidth: 80, resizable: true },
    modified: { width: 200, minWidth: 100, resizable: true },
  };
  const colsOrder = ['name', 'size', 'modified'];
  return makeAutoObservable({
    columns: {
      name: { data: { text: 'File Name', tooltip: 'The name of the file or folder' }, align: 'left' },
      size: { data: { text: 'Size', tooltip: 'File size in bytes' }, align: 'right' },
      modified: { data: { text: 'Last Modified', tooltip: 'Date and time of last modification' }, align: 'left' },
    },
    colsOrder,
    colSizeById,
    colWidthById: buildColWidthByIdFromSize(colsOrder, colSizeById),
  });
}

function createLastColumnFillStore() {
  return makeAutoObservable({
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
  });
}

function createRowReorderStore() {
  return makeAutoObservable({
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
  });
}

function createCellDropdownStore() {
  return makeAutoObservable({
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
  });
}

function createSingleSelectStore() {
  const store = makeCatalogBase([1, 2, 7, 8, 3]);
  store.allowedTypes = ['folder'];
  store.handleRowInteraction = function handleRowInteraction(event) {
    if (event.type !== 'click') return;
    const row = this.rowsById.get(event.rowId);
    if (!this.allowedTypes.includes(row.type)) return;
    this.rowIdsSelected = this.rowIdsSelected.includes(event.rowId) ? [] : [event.rowId];
  };
  return makeAutoObservable(store);
}

function createMultiSelectStore() {
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
}

function createMixedSelectStore() {
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
  store.selectionSummary = '';
  store.summaryFromSelected = function summaryFromSelected() {
    const items = this.getSelectedItems();
    this.selectionSummary = items.map((item) => item.name).join(', ') || '(none)';
  };
  return makeAutoObservable(store);
}

function createViewSwitchStore() {
  const store = makeCatalogBase([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  store.handleRowInteraction = function handleRowInteraction(event) {
    if (event.type !== 'click') return;
    const { rowId } = event;
    this.rowIdsSelected = this.rowIdsSelected.includes(rowId) ? [] : [rowId];
  };
  store.isLocked = false;
  store.feedback = null;
  let feedbackTimer = null;
  store.showFeedback = function showFeedback(feedback) {
    if (feedbackTimer) clearTimeout(feedbackTimer);
    this.feedback = feedback;
    feedbackTimer = setTimeout(() => {
      feedbackTimer = null;
      this.feedback = null;
    }, 3000);
  };
  return makeAutoObservable(store);
}

const FolderExamplesPanel = observer(() => {
  const basicData = useMemo(() => createBasicHeaderStore(), []);
  const customData = useMemo(() => createCustomHeaderStore(), []);
  const fileExplorerStore = useMemo(() => createFolderExplorerDemoStore(), []);
  const lastColumnFillDemo = useMemo(() => createLastColumnFillStore(), []);
  const rowReorderDemo = useMemo(() => createRowReorderStore(), []);
  const cellDropdownDemo = useMemo(() => createCellDropdownStore(), []);
  const singleSelectStore = useMemo(() => createSingleSelectStore(), []);
  const multiSelectStore = useMemo(() => createMultiSelectStore(), []);
  const mixedSelectStore = useMemo(() => createMixedSelectStore(), []);
  const viewSwitchStore = useMemo(() => createViewSwitchStore(), []);
  const colResizeDemoStoreByLabel = useMemo(() => ({
    dragModePreview: createColResizeDemoStore(),
    dragModeImmediate: createColResizeDemoStore(),
    widthModeNatural: createColResizeDemoStore(),
    widthModeLocal: createColResizeDemoStore(),
    perfManyRows: createColResizeDemoStore(makeColResizePerfDemoRows(200)),
  }), []);

  const compHeaderByColId = () => TextWithInfoIconComp;
  const compBodyByColId = (colId) => (colId === 'name' ? FileNameCell : undefined);
  const compCellDropdownByColId = (colId) => (colId === 'lockState' ? CellDropdown : undefined);

  const handleBasicHeaderEvent = async (eventType, eventData) => {
    if (eventType === 'colResize') {
      basicData.colWidthById = eventData.colWidthByIdNext;
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
      customData.colWidthById = eventData.colWidthByIdNext;
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
    viewSwitchStore.isLocked = true;
    await new Promise((resolve) => setTimeout(resolve, 600));
    const isSuccess = Math.random() > 0.3;
    viewSwitchStore.isLocked = false;
    if (isSuccess) {
      const byId = new Map(viewSwitchStore.rowsOrder.map((id) => [id, id]));
      viewSwitchStore.rowsOrder.replace(
        eventData.rowsOrderNext.map((id) => byId.get(id)).filter((id) => id !== undefined)
      );
      viewSwitchStore.showFeedback({
        ok: true,
        text: eventType === 'rowReorderMultiple' ? 'Multiple rows reordered.' : 'Reordered.',
      });
      return { code: 0 };
    }
    viewSwitchStore.showFeedback({ ok: false, text: 'Reorder rejected.' });
    return { code: -1 };
  };

  const catalogColSizeById = {
    name: { width: 200, minWidth: 100, resizable: true },
    size: { width: 120, minWidth: 80, resizable: true },
    type: { width: 100, minWidth: 80, resizable: true },
  };

  return (
    <DemoPanel>
      <Explanation titleText="Folder">
        Folder view components with resizable headers. Demos cover column resize (drag mode, width mode, performance), headers, a path-driven explorer, last-column fill, row reorder, cell dropdowns, and selection.
      </Explanation>

      <ExampleGroup title="Column resize">
        <ExampleStackVertical>
          <Example title="Column Resize Drag Mode: preview vs immediate">
            <Explanation>
              Drag a column border in each folder below. In preview mode, only the blue indicator
              line moves while dragging, and column widths update on mouse release. In immediate mode, column
              widths update while dragging. Watch the widths line above each folder to see when the store updates.
            </Explanation>
            <Explanation>colResizeDragMode: preview (default)</Explanation>
            <MessageAndOutputs labelText="widths in store:">
              <span>{colResizeWidthsText(colResizeDemoStoreByLabel.dragModePreview)}</span>
            </MessageAndOutputs>
            <CompDemoArea>
              <ColResizeDemoFolder
                store={colResizeDemoStoreByLabel.dragModePreview}
                colResizeDragMode="preview"
              />
            </CompDemoArea>
            <Explanation>colResizeDragMode: immediate</Explanation>
            <MessageAndOutputs labelText="widths in store:">
              <span>{colResizeWidthsText(colResizeDemoStoreByLabel.dragModeImmediate)}</span>
            </MessageAndOutputs>
            <CompDemoArea>
              <ColResizeDemoFolder
                store={colResizeDemoStoreByLabel.dragModeImmediate}
                colResizeDragMode="immediate"
              />
            </CompDemoArea>
          </Example>

          <Example title="Column Resize Performance: 200 rows">
            <Explanation>
              This folder has 200 rows. In preview mode, dragging a column border must stay as smooth
              as with a few rows: while dragging, only the indicator line moves and no row re-renders,
              so row count must not affect drag smoothness.
            </Explanation>
            <Explanation>200 rows, colResizeDragMode: preview</Explanation>
            <MessageAndOutputs labelText="widths in store:">
              <span>{colResizeWidthsText(colResizeDemoStoreByLabel.perfManyRows)}</span>
            </MessageAndOutputs>
            <CompDemoArea>
              <ColResizeDemoFolder
                store={colResizeDemoStoreByLabel.perfManyRows}
                colResizeDragMode="preview"
                bodyHeight={240}
              />
            </CompDemoArea>
          </Example>

          <Example title="Column Resize Width Mode: natural vs local">
            <Explanation>
              Drag the border between Name and Size in each folder below. In natural mode, the dragged column
              takes space from or gives space to the last column, and columns in between keep their widths.
              In local mode, only the two columns adjacent to the dragged border change width.
            </Explanation>
            <Explanation>colResizeWidthMode: natural (default)</Explanation>
            <MessageAndOutputs labelText="widths in store:">
              <span>{colResizeWidthsText(colResizeDemoStoreByLabel.widthModeNatural)}</span>
            </MessageAndOutputs>
            <CompDemoArea>
              <ColResizeDemoFolder
                store={colResizeDemoStoreByLabel.widthModeNatural}
                colResizeWidthMode="natural"
              />
            </CompDemoArea>
            <Explanation>colResizeWidthMode: local</Explanation>
            <MessageAndOutputs labelText="widths in store:">
              <span>{colResizeWidthsText(colResizeDemoStoreByLabel.widthModeLocal)}</span>
            </MessageAndOutputs>
            <CompDemoArea>
              <ColResizeDemoFolder
                store={colResizeDemoStoreByLabel.widthModeLocal}
                colResizeWidthMode="local"
              />
            </CompDemoArea>
          </Example>
        </ExampleStackVertical>
      </ExampleGroup>

      <ExampleGroup title="Header">
        <ExampleStackVertical>
          <Example title="Basic Header">
            <Explanation>
              Drag column cells to reorder. Drag separators to resize. Blue line shows drop position.
            </Explanation>
            <CompDemoArea>
              <Header
                data={{
                  columns: basicData.columns,
                  colsOrder: basicData.colsOrder,
                  colWidthById: basicData.colWidthById,
                }}
                config={{
                  colSizeById: basicData.colSizeById,
                  isColReorderAllowed: true,
                }}
                onEvent={handleBasicHeaderEvent}
              />
            </CompDemoArea>
          </Example>

          <Example title="Header with Custom Components">
            <Explanation>
              All columns use custom component with info icon tooltips. Hover over icons to see descriptions.
            </Explanation>
            <CompDemoArea>
              <Header
                data={{
                  columns: customData.columns,
                  colsOrder: customData.colsOrder,
                  colWidthById: customData.colWidthById,
                }}
                config={{
                  colSizeById: customData.colSizeById,
                  compByColId: compHeaderByColId,
                }}
                onEvent={handleCustomHeaderEvent}
              />
            </CompDemoArea>
          </Example>
        </ExampleStackVertical>
      </ExampleGroup>

      <ExampleGroup title="Explorer">
        <ExampleStackVertical>
          <Example title="Complete FolderView with Body">
            <Explanation>
              MobX tree drives the listing. PathBar shows the folder path; click a segment or edit the path (invalid paths are rejected). Double-click a folder row to open it. Drag rows to reorder; right-click to delete. Body locks during async requests.
            </Explanation>
            <CompDemoArea>
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
                }}
                onEvent={handleExplorerFolderEvent}
              />
            </CompDemoArea>
          </Example>

          <Example title="Last Column Fill Mode">
            <Explanation>
              Enable isLastColFilled to let the final column consume remaining horizontal space.
            </Explanation>
            <CompDemoArea>
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
                }}
              />
            </CompDemoArea>
          </Example>
        </ExampleStackVertical>
      </ExampleGroup>

      <ExampleGroup title="Selection and cells">
        <ExampleStackVertical>
          <Example title="Multiple selection with row reorder">
            <Explanation>
              <KeyChip>Click</KeyChip> to select, <KeyChip>Ctrl</KeyChip>+<KeyChip>Click</KeyChip> to toggle, <KeyChip>Shift</KeyChip>+<KeyChip>Click</KeyChip> for range. Drag selected rows to reorder as a group. Parent receives rowReorder / rowReorderMultiple events.
            </Explanation>
            <CompDemoArea>
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
                }}
                onEvent={handleRowReorderDemoEvent}
              />
            </CompDemoArea>
            <MessageAndOutputs labelText="Order:">
              <span>{rowReorderDemo.rows.map((row) => row.data.label).join(' -> ')}</span>
            </MessageAndOutputs>
            <MessageAndOutputs labelText="Selected:">
              <span>{rowReorderDemo.rowIdsSelected.length > 0 ? rowReorderDemo.rowIdsSelected.join(', ') : 'None'}</span>
            </MessageAndOutputs>
            {rowReorderDemo.lastReorderNote ? (
              <MessageAndOutputs labelText="Last:">
                <span>{rowReorderDemo.lastReorderNote}</span>
              </MessageAndOutputs>
            ) : null}
          </Example>

          <Example title="CellDropdown">
            <Explanation>
              Left icon opens dropdown only when editable. Updates go through onEvent cellValueChange and are applied only after accepted.
            </Explanation>
            <Controls>
              <ControlItem>
                <button
                  type="button"
                  className="demo-button"
                  onClick={() => {
                    cellDropdownDemo.isEditable = !cellDropdownDemo.isEditable;
                  }}
                >
                  {cellDropdownDemo.isEditable ? 'editable' : 'readonly'}
                </button>
              </ControlItem>
            </Controls>
            <CompDemoArea>
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
                }}
                onEvent={handleCellDropdownEvent}
              />
            </CompDemoArea>
          </Example>

          <Example title="Single Selection with Type Filter">
            <Explanation>
              MobX pattern with type validation. Only folders can be selected. Try clicking files vs folders.
            </Explanation>
            <CompDemoArea>
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
                }}
                onEvent={(eventType, eventData) => {
                  if (eventType === 'rowInteraction') {
                    singleSelectStore.handleRowInteraction(eventData);
                  }
                  return { code: 0 };
                }}
              />
            </CompDemoArea>
            <MessageAndOutputs labelText="Selected:">
              <span>
                {singleSelectStore.rowIdsSelected.length > 0
                  ? singleSelectStore.rowIdsSelected.map((id) => singleSelectStore.rowsById.get(id).name).join(', ')
                  : 'None'}
              </span>
            </MessageAndOutputs>
          </Example>

          <Example title="Multiple Selection with Ctrl/Shift Click">
            <Explanation>
              <KeyChip>Click</KeyChip> to select. <KeyChip>Ctrl</KeyChip>+<KeyChip>Click</KeyChip> to toggle. <KeyChip>Shift</KeyChip>+<KeyChip>Click</KeyChip> for range selection. Notice the blue indicator on selected items.
            </Explanation>
            <CompDemoArea>
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
                }}
                onEvent={(eventType, eventData) => {
                  if (eventType === 'rowInteraction') {
                    multiSelectStore.handleRowInteraction(eventData);
                  }
                  return { code: 0 };
                }}
              />
            </CompDemoArea>
            <MessageAndOutputs labelText="Selected:">
              <span>
                {multiSelectStore.rowIdsSelected.length} item(s)
                {multiSelectStore.rowIdsSelected.length > 0 && ` - ${multiSelectStore.rowIdsSelected.join(', ')}`}
              </span>
            </MessageAndOutputs>
          </Example>

          <Example title="Multiple Selection with Type Validation">
            <Explanation>
              Multiple selection but all selected must be same type. Try selecting a folder then a file with <KeyChip>Ctrl</KeyChip>/<KeyChip>Cmd</KeyChip>+<KeyChip>Click</KeyChip>.
            </Explanation>
            <Controls>
              <ControlItem>
                <button
                  type="button"
                  className="demo-button"
                  onClick={() => mixedSelectStore.clearSelection()}
                >
                  Clear Selection
                </button>
              </ControlItem>
              <ControlItem>
                <button
                  type="button"
                  className="demo-button"
                  onClick={() => mixedSelectStore.summaryFromSelected()}
                >
                  Get Selected
                </button>
              </ControlItem>
            </Controls>
            <CompDemoArea>
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
            </CompDemoArea>
            <MessageAndOutputs labelText="Selected:">
              <span>
                {mixedSelectStore.rowIdsSelected.length > 0
                  ? mixedSelectStore.rowIdsSelected.map((id) => mixedSelectStore.rowsById.get(id).name).join(', ')
                  : 'None'}
              </span>
            </MessageAndOutputs>
            {mixedSelectStore.selectionSummary ? (
              <MessageAndOutputs>
                <span>{mixedSelectStore.selectionSummary}</span>
              </MessageAndOutputs>
            ) : null}
          </Example>

          <Example title="View Switching via FolderView">
            <Explanation>
              Toggle between List and Icons views. <KeyChip>Ctrl</KeyChip>/<KeyChip>Shift</KeyChip> select multiple rows, then drag selected rows to reorder as a group.
            </Explanation>
            <CompDemoArea>
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
                  isLocked: viewSwitchStore.isLocked,
                  bodyHeight: 260,
                  isStatusBarVisible: false,
                }}
                onEvent={handleViewSwitchEvent}
              />
            </CompDemoArea>
            <MessageAndOutputs labelText="Selected:">
              <span>
                {viewSwitchStore.rowIdsSelected.length > 0
                  ? viewSwitchStore.rowIdsSelected.map((id) => viewSwitchStore.rowsById.get(id).name).join(', ')
                  : 'None'}
              </span>
            </MessageAndOutputs>
            <MessageAndOutputs>
              {viewSwitchStore.feedback ? (
                <span className={viewSwitchStore.feedback.ok ? 'folder-explorer-under-path-line-success' : 'folder-explorer-under-path-line-failure'}>
                  {viewSwitchStore.feedback.text}
                </span>
              ) : (
                <span>
                  {viewSwitchStore.rows.length} {viewSwitchStore.rows.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </MessageAndOutputs>
          </Example>
        </ExampleStackVertical>
      </ExampleGroup>
    </DemoPanel>
  );
});

export const folderExamples = {
  Folder: {
    component: null,
    description: 'Folder view components with resizable headers',
    example: FolderExamplesPanel,
  },
};
