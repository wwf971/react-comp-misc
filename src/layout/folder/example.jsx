import React, { useState } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import Header from './Header';
import FolderView from './FolderView';
import PathBar from '../../path/PathBar.jsx';
import { createFolderExplorerDemoStore } from './folderExplorerDemoModel';
import InfoIconWithTooltip from '../../icon/InfoIconWithTooltip';
import FolderIcon from '../../icon/FolderIcon';
import FileIcon from '../../icon/FileIcon';
import './folder.css';

/**
 * Example custom component with text and info icon with tooltip
 */
const TextWithInfoIconComp = observer(({ data }) => {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span>{data.text}</span>
      <InfoIconWithTooltip 
        tooltipText={data.tooltip}
        width={14}
        height={14}
        color="#999"
      />
    </span>
  );
});

/**
 * Example file icon component
 */
const FileNameCell = observer(({ data }) => {
  const iconSize = 16;
  const icon =
    data.type === 'folder' ? (
      <FolderIcon width={iconSize} height={iconSize} />
    ) : (
      <FileIcon width={iconSize} height={iconSize} />
    );

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ display: 'flex', flexShrink: 0, alignItems: 'center' }}>{icon}</span>
      <span>{data.name}</span>
    </span>
  );
});

/**
 * Shared example component for all folder components
 */
const FolderExamplesPanel = observer(() => {
  // Example 1: Basic header without custom components
  const [basicData] = useState(() => {
    return makeAutoObservable({
      columns: {
        name: { data: 'Name', align: 'left' },
        size: { data: 'Size', align: 'right' },
        createAt: { data: 'Created', align: 'left' },
        modifyAt: { data: 'Modified', align: 'left' }
      },
      columnsOrder: ['name', 'size', 'createAt', 'modifyAt'],
      columnsSize: {
        name: { width: 200, minWidth: 80, resizable: true },
        size: { width: 100, minWidth: 60, resizable: true },
        createAt: { width: 150, resizable: true },
        modifyAt: { width: 150, resizable: true }
      }
    });
  });

  // Example 2: Header with custom components (info icon tooltips)
  const [customData] = useState(() => {
    return makeAutoObservable({
      columns: {
        name: { 
          data: { text: 'File Name', tooltip: 'The name of the file or folder' },
          align: 'left' 
        },
        size: { 
          data: { text: 'Size', tooltip: 'File size in bytes' },
          align: 'right' 
        },
        modified: { 
          data: { text: 'Last Modified', tooltip: 'Date and time of last modification' },
          align: 'left' 
        }
      },
      columnsOrder: ['name', 'size', 'modified'],
      columnsSize: {
        name: { width: 200, minWidth: 100, resizable: true },
        size: { width: 120, minWidth: 80, resizable: true },
        modified: { width: 200, minWidth: 100, resizable: true }
      }
    });
  });

  const [fileExplorerStore] = useState(() => createFolderExplorerDemoStore());

  const [rowReorderDemo] = useState(() => {
    return makeAutoObservable({
      columns: {
        label: { data: 'Item', align: 'left' }
      },
      columnsOrder: ['label'],
      columnsSize: {
        label: { width: 280, minWidth: 120, resizable: true }
      },
      rows: [
        { id: 'a', data: { label: 'Alpha' } },
        { id: 'b', data: { label: 'Bravo' } },
        { id: 'c', data: { label: 'Charlie' } },
        { id: 'd', data: { label: 'Delta' } }
      ],
      lastReorderNote: ''
    });
  });

  const [mixedSelectionSummary, setMixedSelectionSummary] = useState('');

  const getComponent = (columnId, rowId) => {
    // All columns use the same custom component with tooltip
    // rowId is available but not used in this header example
    return TextWithInfoIconComp;
  };

  const getBodyComponent = (columnId, rowId) => {
    if (columnId === 'name') {
      return FileNameCell;
    }
    return undefined;
  };

  const handleColumnResize = (columnId, newWidth) => {
    console.log(`Column ${columnId} resized to ${newWidth}px`);
    // Update columnsSize in MobX store
    if (!basicData.columnsSize[columnId]) {
      basicData.columnsSize[columnId] = {};
    }
    basicData.columnsSize[columnId].width = newWidth;
  };

  const handleCustomColumnResize = (columnId, newWidth) => {
    console.log(`Custom column ${columnId} resized to ${newWidth}px`);
    // Update columnsSize in MobX store for customData
    if (!customData.columnsSize[columnId]) {
      customData.columnsSize[columnId] = {};
    }
    customData.columnsSize[columnId].width = newWidth;
  };

  const handleBasicDataChangeRequest = async (type, params) => {
    if (type === 'reorder') {
      // Column reorder for basic header
      console.log(`Column reorder: colId=${params.columnId}, from=${params.fromIndex}, to=${params.toIndex}`);
      
      // Simulate async API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simulate 95% success rate
      if (Math.random() > 0.05) {
        // Success - update the MobX observable array
        basicData.columnsOrder.replace(params.newOrder);
        
        console.log('Column reorder successful');
        return { code: 0, message: 'Column reordered successfully' };
      } else {
        // Simulate error
        console.error('Column reorder failed');
        return { code: -1, message: 'Failed to reorder column' };
      }
    } else if (type === 'resize') {
      // Column resize - persist the new width immediately
      console.log(`Column resize: colId=${params.columnId}, newWidth=${params.newWidth}`);
      
      if (!basicData.columnsSize[params.columnId]) {
        basicData.columnsSize[params.columnId] = {};
      }
      basicData.columnsSize[params.columnId].width = params.newWidth;
      
      return { code: 0, message: 'Column resized' };
    }
  };

  const handleExplorerFolderDataChangeRequest = async (type, params) => {
    const ex = fileExplorerStore;
    if (type === 'reorder') {
      if (params.columnId !== undefined) {
        ex.loading = true;
        ex.loadingMessage = 'Reordering column';
        ex.error = null;
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (Math.random() > 0.1) {
          ex.columnsOrder.replace(params.newOrder);
          ex.loading = false;
          return { code: 0, message: 'Column reordered successfully' };
        }
        ex.loading = false;
        ex.error = { message: 'Failed to reorder column' };
        setTimeout(() => {
          ex.error = null;
        }, 1000);
        return { code: -1, message: 'Failed to reorder column' };
      }
      if (params.rowId !== undefined) {
        const folder = ex.currentFolder;
        if (!folder) {
          return { code: -1, message: 'No folder' };
        }
        ex.loading = true;
        ex.loadingMessage = 'Reordering row';
        ex.error = null;
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (Math.random() > 0.1) {
          if (params.newOrder && Array.isArray(params.newOrder)) {
            const byId = new Map(folder.children.map((c) => [c.id, c]));
            folder.children.replace(params.newOrder.map((id) => byId.get(id)).filter(Boolean));
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
        setTimeout(() => {
          ex.error = null;
        }, 1000);
        return { code: -1, message: 'Failed to reorder row' };
      }
    } else if (type === 'delete') {
      const folder = ex.currentFolder;
      if (!folder) {
        return { code: -1, message: 'No folder' };
      }
      ex.loading = true;
      ex.loadingMessage = 'Deleting row';
      ex.error = null;
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (Math.random() > 0.05) {
        const idx = folder.children.findIndex((c) => c.id === params.rowId);
        if (idx >= 0) {
          folder.children.splice(idx, 1);
        }
        if (ex.selectedRowId === params.rowId) {
          ex.selectedRowId = null;
        }
        ex.loading = false;
        return { code: 0, message: 'Row deleted successfully' };
      }
      ex.loading = false;
      ex.error = { message: 'Failed to delete row' };
      setTimeout(() => {
        ex.error = null;
      }, 1000);
      return { code: -1, message: 'Failed to delete row' };
    } else if (type === 'resize') {
      if (!ex.columnsSize[params.columnId]) {
        ex.columnsSize[params.columnId] = {};
      }
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
    await new Promise((resolve) => setTimeout(resolve, 450));
    const result = ex.trySetPathFromParsed(pathData);
    ex.loading = false;
    if (!result.ok) {
      ex.showPathFeedbackBriefly({ ok: false, text: result.reason });
      return false;
    }
    ex.showPathFeedbackBriefly({ ok: true, text: 'Opened folder.' });
    return true;
  };

  const handleExplorerRowClick = (rowId) => {
    fileExplorerStore.setSelectedRow(rowId);
  };

  const handleExplorerRowDoubleClick = (rowId) => {
    const row = fileExplorerStore.rows.find((r) => r.id === rowId);
    if (!row) return;
    const cell = row.data.name;
    if (cell.type === 'folder') {
      fileExplorerStore.openChildFolderByName(cell.name);
    }
  };

  const handleRowReorderDemoRequest = async (type, params) => {
    if (type !== 'reorder' || params.rowId === undefined) return { code: 0, message: 'noop' };
    await new Promise((resolve) => setTimeout(resolve, 120));
    if (params.newOrder && Array.isArray(params.newOrder)) {
      const byId = new Map(rowReorderDemo.rows.map((r) => [r.id, r]));
      rowReorderDemo.rows.replace(params.newOrder.map((id) => byId.get(id)).filter(Boolean));
    } else {
      const next = [...rowReorderDemo.rows];
      const [moved] = next.splice(params.fromIndex, 1);
      next.splice(params.toIndex, 0, moved);
      rowReorderDemo.rows.replace(next);
    }
    rowReorderDemo.lastReorderNote = `rowId=${params.rowId} toIndex=${params.toIndex}`;
    return { code: 0, message: 'Row reordered' };
  };

  // Example 4: Single selection with type filtering
  const [singleSelectStore] = useState(() => {
    return makeAutoObservable({
      rowsById: new Map([
        [1, { name: 'Documents', size: '4 items', type: 'folder' }],
        [2, { name: 'Pictures', size: '12 items', type: 'folder' }],
        [3, { name: 'App.jsx', size: '4.2 KB', type: 'file' }],
        [4, { name: 'styles.css', size: '1.8 KB', type: 'file' }],
        [5, { name: 'Music', size: '8 items', type: 'folder' }],
      ]),
      rowsOrder: [1, 2, 3, 4, 5],
      selectedRowIds: [],
      allowedTypes: ['folder'], // Only folders can be selected
      
      get rows() {
        return this.rowsOrder.map(id => ({ id, data: this.rowsById.get(id) }));
      },
      
      getRowData(rowId, columnId) {
        const row = this.rowsById.get(rowId);
        return row?.[columnId];
      },
      
      handleRowInteraction(event) {
        if (event.type !== 'click') return;
        
        const row = this.rowsById.get(event.rowId);
        
        // Validation: only allow folder selection
        if (!this.allowedTypes.includes(row.type)) {
          console.log(`Cannot select ${row.type}, only folders allowed`);
          return;
        }
        
        // Toggle selection
        if (this.selectedRowIds.includes(event.rowId)) {
          this.selectedRowIds = [];
        } else {
          this.selectedRowIds = [event.rowId];
        }
      }
    });
  });

  // Example 5: Multiple selection with Ctrl/Shift
  const [multiSelectStore] = useState(() => {
    return makeAutoObservable({
      rowsById: new Map([
        [1, { name: 'File1.txt', size: '2.1 KB', type: 'file' }],
        [2, { name: 'File2.txt', size: '3.5 KB', type: 'file' }],
        [3, { name: 'File3.txt', size: '1.2 KB', type: 'file' }],
        [4, { name: 'File4.txt', size: '5.8 KB', type: 'file' }],
        [5, { name: 'File5.txt', size: '2.9 KB', type: 'file' }],
        [6, { name: 'File6.txt', size: '4.1 KB', type: 'file' }],
      ]),
      rowsOrder: [1, 2, 3, 4, 5, 6],
      selectedRowIds: [],
      
      get rows() {
        return this.rowsOrder.map(id => ({ id, data: this.rowsById.get(id) }));
      },
      
      getRowData(rowId, columnId) {
        const row = this.rowsById.get(rowId);
        return row?.[columnId];
      },
      
      handleRowInteraction(event) {
        if (event.type !== 'click') return;
        
        const { rowId, modifiers } = event;
        
        if (modifiers.ctrl || modifiers.meta) {
          // Ctrl: toggle in selection
          if (this.selectedRowIds.includes(rowId)) {
            this.selectedRowIds = this.selectedRowIds.filter(id => id !== rowId);
          } else {
            this.selectedRowIds.push(rowId);
          }
        } else if (modifiers.shift && this.selectedRowIds.length > 0) {
          // Shift: range selection
          const lastSelectedId = this.selectedRowIds[this.selectedRowIds.length - 1];
          const lastIndex = this.rowsOrder.indexOf(lastSelectedId);
          const currentIndex = this.rowsOrder.indexOf(rowId);
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          
          const rangeIds = this.rowsOrder.slice(start, end + 1);
          
          // Add range to selection (union)
          const newSelection = [...new Set([...this.selectedRowIds, ...rangeIds])];
          this.selectedRowIds = newSelection;
        } else {
          // No modifier: replace selection
          this.selectedRowIds = [rowId];
        }
      }
    });
  });

  // Example 6: MobX pattern with mixed types
  const [mixedSelectStore] = useState(() => {
    return makeAutoObservable({
      rowsById: new Map([
        [1, { name: 'Projects', size: '8 items', type: 'folder' }],
        [2, { name: 'README.md', size: '2.1 KB', type: 'file' }],
        [3, { name: 'Downloads', size: '15 items', type: 'folder' }],
        [4, { name: 'config.json', size: '856 B', type: 'file' }],
        [5, { name: 'Photos', size: '42 items', type: 'folder' }],
      ]),
      rowsOrder: [1, 2, 3, 4, 5],
      selectedRowIds: [],
      allowMixed: false, // If false, can only select all same type
      
      get rows() {
        return this.rowsOrder.map(id => ({ id, data: this.rowsById.get(id) }));
      },
      
      getRowData(rowId, columnId) {
        const row = this.rowsById.get(rowId);
        return row?.[columnId];
      },
      
      handleRowInteraction(event) {
        if (event.type !== 'click') return;
        
        const { rowId, modifiers } = event;
        const row = this.rowsById.get(rowId);
        
        // Check type compatibility if mixed not allowed
        if (!this.allowMixed && this.selectedRowIds.length > 0) {
          const firstSelectedId = this.selectedRowIds[0];
          const firstSelectedRow = this.rowsById.get(firstSelectedId);
          if (firstSelectedRow.type !== row.type) {
            console.log(`Cannot mix types: already selected ${firstSelectedRow.type}, trying to select ${row.type}`);
            return;
          }
        }
        
        if (modifiers.ctrl || modifiers.meta) {
          // Ctrl: toggle
          if (this.selectedRowIds.includes(rowId)) {
            this.selectedRowIds = this.selectedRowIds.filter(id => id !== rowId);
          } else {
            this.selectedRowIds.push(rowId);
          }
        } else {
          // Replace selection
          this.selectedRowIds = [rowId];
        }
      },
      
      clearSelection() {
        this.selectedRowIds = [];
      },
      
      getSelectedItems() {
        return this.selectedRowIds.map(id => this.rowsById.get(id));
      }
    });
  });

  return (
    <div>
      {/* Basic Example */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Basic Header</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Drag column cells to reorder. Drag separators to resize. Blue line shows drop position.
        </div>
        <div style={{ border: '1px solid #d0d0d0', borderRadius: '2px' }}>
          <Header 
            columns={basicData.columns}
            columnsOrder={basicData.columnsOrder}
            columnsSize={basicData.columnsSize}
            allowColumnReorder={true}
            onColumnResize={handleColumnResize}
            onDataChangeRequest={handleBasicDataChangeRequest}
          />
        </div>
      </div>

      {/* Custom Components Example */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Header with Custom Components</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          All columns use custom component with info icon tooltips. Hover over icons to see descriptions.
        </div>
        <div style={{ border: '1px solid #d0d0d0', borderRadius: '2px' }}>
          <Header 
            columns={customData.columns}
            columnsOrder={customData.columnsOrder}
            columnsSize={customData.columnsSize}
            getComponent={getComponent}
            onColumnResize={handleCustomColumnResize}
          />
        </div>
      </div>

      {/* Full FolderView Example */}
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
              <span
                className={
                  fileExplorerStore.pathFeedback.ok
                    ? 'folder-explorer-under-path-line-success'
                    : 'folder-explorer-under-path-line-failure'
                }
              >
                {fileExplorerStore.pathFeedback.text}
              </span>
            ) : (
              <span className="folder-explorer-under-path-line-default">
                {fileExplorerStore.rows.length}{' '}
                {fileExplorerStore.rows.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <FolderView
            columns={fileExplorerStore.columns}
            columnsOrder={fileExplorerStore.columnsOrder}
            columnsSizeInit={fileExplorerStore.columnsSize}
            rows={fileExplorerStore.rows}
            getBodyComponent={getBodyComponent}
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
            contextMenuItems={[
              {
                type: 'item',
                name: 'Delete',
              },
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Row reorder only</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Drag rows to change order. Parent receives onDataChangeRequest(&apos;reorder&apos;, {'{'} rowId, fromIndex, toIndex, newOrder {'}'}). Blue line shows drop position.
        </div>
        <div style={{ fontSize: '12px', color: '#444', marginBottom: '6px' }}>
          Order: {rowReorderDemo.rows.map((r) => r.data.label).join(' → ')}
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
          selectionMode="none"
          onDataChangeRequest={handleRowReorderDemoRequest}
          bodyHeight={200}
          showStatusBar={false}
        />
      </div>

      {/* Example 4: Single Selection with Type Filtering */}
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
          columns={{ 
            name: { data: 'Name', align: 'left' }, 
            size: { data: 'Size', align: 'left' },
            type: { data: 'Type', align: 'left' }
          }}
          columnsOrder={['name', 'size', 'type']}
          columnsSizeInit={{
            name: { width: 200, minWidth: 100, resizable: true },
            size: { width: 120, minWidth: 80, resizable: true },
            type: { width: 100, minWidth: 80, resizable: true }
          }}
          rows={singleSelectStore.rows}
          dataStore={singleSelectStore}
          getRowData={(rowId, colId) => singleSelectStore.getRowData(rowId, colId)}
          selectedRowIds={singleSelectStore.selectedRowIds}
          selectionMode="single"
          onRowInteraction={(event) => singleSelectStore.handleRowInteraction(event)}
          bodyHeight={200}
          showStatusBar={false}
        />
      </div>

      {/* Example 5: Multiple Selection */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Multiple Selection with Ctrl/Shift</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Click to select. Ctrl+Click to toggle. Shift+Click for range selection. Notice the blue indicator on selected items.
        </div>
        <div style={{ marginBottom: '8px', fontSize: '12px' }}>
          <strong>Selected:</strong> {multiSelectStore.selectedRowIds.length} item(s)
          {multiSelectStore.selectedRowIds.length > 0 && ` - ${multiSelectStore.selectedRowIds.join(', ')}`}
        </div>
        <FolderView
          columns={{ 
            name: { data: 'Name', align: 'left' }, 
            size: { data: 'Size', align: 'left' }
          }}
          columnsOrder={['name', 'size']}
          columnsSizeInit={{
            name: { width: 250, minWidth: 150, resizable: true },
            size: { width: 150, minWidth: 100, resizable: true }
          }}
          rows={multiSelectStore.rows}
          dataStore={multiSelectStore}
          getRowData={(rowId, colId) => multiSelectStore.getRowData(rowId, colId)}
          selectedRowIds={multiSelectStore.selectedRowIds}
          selectionMode="multiple"
          onRowInteraction={(event) => multiSelectStore.handleRowInteraction(event)}
          bodyHeight={220}
          showStatusBar={false}
        />
      </div>

      {/* Example 6: Mixed Types with Validation */}
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
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Selection
          </button>
          <button
            type="button"
            onClick={() => {
              const items = mixedSelectStore.getSelectedItems();
              setMixedSelectionSummary(items.map((i) => i.name).join(', ') || '(none)');
            }}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
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
          columns={{ 
            name: { data: 'Name', align: 'left' }, 
            size: { data: 'Size', align: 'left' },
            type: { data: 'Type', align: 'left' }
          }}
          columnsOrder={['name', 'size', 'type']}
          columnsSizeInit={{
            name: { width: 200, minWidth: 120, resizable: true },
            size: { width: 120, minWidth: 80, resizable: true },
            type: { width: 100, minWidth: 80, resizable: true }
          }}
          rows={mixedSelectStore.rows}
          dataStore={mixedSelectStore}
          getRowData={(rowId, colId) => mixedSelectStore.getRowData(rowId, colId)}
          selectedRowIds={mixedSelectStore.selectedRowIds}
          selectionMode="multiple"
          onRowInteraction={(event) => mixedSelectStore.handleRowInteraction(event)}
          bodyHeight={200}
          showStatusBar={false}
        />
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
