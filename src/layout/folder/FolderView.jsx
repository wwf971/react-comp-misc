import React, { useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Header from './Header';
import Body from './Body';
import StatusBar from './StatusBar';
import './folder.css';

/**
 * FolderView - Combines Header and Body components for a file explorer-like layout
 * 
 * Props:
 * - columns: { [colId]: { data, align } }
 * - columnsOrder: [colId1, colId2, ...]
 * - columnsSizeInit: { [colId]: { width, minWidth, resizable } } - Initial column sizes (not updated by FolderView)
 * - rows: [{ id, data: { [colId]: value } }]
 * - getHeaderComponent: (colId) => Component (optional)
 * - getBodyComponent: (colId, rowId) => Component (optional)
 * - onDataChangeRequest: (type, params) => void (optional)
 *   - For column reorder: ('reorder', { columnId, fromIndex, toIndex, newOrder })
 *   - For row reorder: ('reorder', { rowId, fromIndex, toIndex })
 *   - For row delete: ('delete', { rowId })
 * - allowColumnReorder: boolean (default: false)
 * 
 * Selection (New Unified API):
 * - onRowInteraction: (event) => void - Unified interaction handler
 *   event: { type: 'click' | 'double-click' | 'context-menu', rowId, rowIndex, nativeEvent, modifiers }
 * - selectedRowIds: array - Controlled selection state (new)
 * - selectionMode: 'none' | 'single' | 'multiple' (default: 'single')
 * 
 * MobX Pattern Support:
 * - dataStore: object - MobX observable store
 * - getRowData: (rowId, columnId) => any - Function to extract cell data from store
 * 
 * Legacy Props (deprecated but supported):
 * - onRowClick: (rowId) => void (optional)
 * - onRowDoubleClick: (rowId) => void (optional)
 * - onRowContextMenu: (event, rowId) => void (optional)
 * - selectedRowId: string/number (optional, use selectedRowIds instead)
 * 
 * Other:
 * - allowRowReorder: boolean (default: false)
 * - showStatusBar: boolean (default: true)
 * - loading: boolean indicating if a request is in progress (optional)
 * - loadingMessage: message to show when loading (optional)
 * - error: error object { message: string } or null (optional)
 * - bodyHeight: fixed height for body in pixels (optional, enables scrollbar)
 * - contextMenuItems: array of menu items for row right-click (optional, e.g., [{ type: 'item', name: 'Delete' }])
 */
const FolderView = observer(({ 
  columns,
  columnsOrder,
  columnsSizeInit,
  rows,
  getHeaderComponent,
  getBodyComponent,
  onDataChangeRequest,
  allowColumnReorder = false,
  // New unified interaction
  onRowInteraction,
  selectedRowIds,
  selectionMode = 'single',
  // MobX pattern
  dataStore,
  getRowData,
  // Legacy (deprecated)
  onRowClick,
  onRowDoubleClick,
  onRowContextMenu,
  selectedRowId,
  // Other
  allowRowReorder = false,
  showStatusBar = true,
  loading = false,
  loadingMessage,
  error = null,
  bodyHeight,
  contextMenuItems = null // Optional: context menu items for row right-click
}) => {
  
  const containerRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({});

  // Calculate column widths from columnsSizeInit - run on every render of deps
  useEffect(() => {
    if (!columnsOrder || columnsOrder.length === 0) return;
    
    const newWidths = {};
    const DEFAULT_MIN_WIDTH = 40;
    
    columnsOrder.forEach(colId => {
      const width = columnsSizeInit?.[colId]?.width;
      const minWidth = columnsSizeInit?.[colId]?.minWidth ?? DEFAULT_MIN_WIDTH;
      
      if (width !== undefined && width !== null && width > 0) {
        newWidths[colId] = Math.max(width, minWidth);
      } else {
        newWidths[colId] = minWidth;
      }
    });
    
    setColumnWidths(newWidths);
  }, [columnsOrder, columnsSizeInit]);

  // Handle column width changes during resize
  const handleColumnWidthChange = (newWidths) => {
    setColumnWidths(newWidths);
  };
  
  return (
    <div className="folder-view-container" ref={containerRef}>
      <Header 
        columns={columns}
        columnsOrder={columnsOrder}
        columnsSizeInit={columnsSizeInit}
        columnWidths={columnWidths}
        getComponent={getHeaderComponent}
        onColumnWidthChange={handleColumnWidthChange}
        onDataChangeRequest={onDataChangeRequest}
        allowColumnReorder={allowColumnReorder && !loading}
      />
      <div 
        className="folder-body-wrapper"
        style={{ 
          height: bodyHeight ? `${bodyHeight}px` : undefined,
          overflowY: bodyHeight ? 'auto' : undefined
        }}
      >
        <Body 
          columns={columns}
          columnsOrder={columnsOrder}
          columnsSizeInit={columnsSizeInit}
          columnWidths={columnWidths}
          rows={rows}
          getComponent={getBodyComponent}
          // New unified interaction
          onRowInteraction={onRowInteraction}
          selectedRowIds={selectedRowIds}
          selectionMode={selectionMode}
          // MobX pattern
          dataStore={dataStore}
          getRowData={getRowData}
          // Legacy (deprecated but supported)
          onRowClick={onRowClick}
          onRowDoubleClick={onRowDoubleClick}
          onRowContextMenu={onRowContextMenu}
          selectedRowId={selectedRowId}
          // Other
          allowRowReorder={allowRowReorder && !loading}
          onDataChangeRequest={onDataChangeRequest}
          locked={loading}
          contextMenuItems={contextMenuItems}
        />
      </div>
      {showStatusBar && (
        <StatusBar 
          itemCount={rows?.length || 0}
          loading={loading}
          loadingMessage={loadingMessage}
          error={error}
        />
      )}
    </div>
  );
});

export default FolderView;
