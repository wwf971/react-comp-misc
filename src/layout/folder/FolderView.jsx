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
 * - columnsSize: { [colId]: { width, minWidth, resizable } }
 * - rows: [{ id, data: { [colId]: value } }]
 * - getHeaderComponent: (colId) => Component (optional)
 * - getBodyComponent: (colId, rowId) => Component (optional)
 * - onColumnResize: (colId, newWidth) => void (optional)
 * - onDataChangeRequest: (type, params) => void (optional)
 *   - For column reorder: ('reorder', { columnId, fromIndex, toIndex, newOrder })
 *   - For row reorder: ('reorder', { rowId, fromIndex, toIndex })
 *   - For row delete: ('delete', { rowId })
 * - allowColumnReorder: boolean (default: false)
 * - onRowClick: (rowId) => void (optional)
 * - selectedRowId: string/number (optional)
 * - allowRowReorder: boolean (default: false)
 * - showStatusBar: boolean (default: true)
 * - loading: boolean indicating if a request is in progress (optional)
 * - loadingMessage: message to show when loading (optional)
 * - error: error object { message: string } or null (optional)
 * - bodyHeight: fixed height for body in pixels (optional, enables scrollbar)
 */
const FolderView = observer(({ 
  columns,
  columnsOrder,
  columnsSize,
  rows,
  getHeaderComponent,
  getBodyComponent,
  onColumnResize,
  onDataChangeRequest,
  allowColumnReorder = false,
  onRowClick,
  selectedRowId,
  allowRowReorder = false,
  showStatusBar = true,
  loading = false,
  loadingMessage,
  error = null,
  bodyHeight
}) => {
  
  const containerRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({});

  // Calculate column widths from columnsSize prop
  useEffect(() => {
    if (!containerRef.current || !columnsOrder) return;
    
    const totalWidth = containerRef.current.offsetWidth;
    const newWidths = {};
    
    // Calculate total defined width
    let definedWidth = 0;
    let undefinedCount = 0;
    
    columnsOrder.forEach(colId => {
      if (columnsSize[colId]?.width) {
        definedWidth += columnsSize[colId].width;
      } else {
        undefinedCount++;
      }
    });
    
    // Calculate width for undefined columns
    const remainingWidth = totalWidth - definedWidth;
    const undefinedColWidth = undefinedCount > 0 ? remainingWidth / undefinedCount : 0;
    
    columnsOrder.forEach(colId => {
      newWidths[colId] = columnsSize[colId]?.width || undefinedColWidth;
    });
    
    setColumnWidths(newWidths);
  }, [columns, columnsOrder, columnsSize]);

  // Handle column width changes during resize
  const handleColumnWidthChange = (newWidths) => {
    setColumnWidths(newWidths);
  };
  
  return (
    <div className="folder-view-container" ref={containerRef}>
      <Header 
        columns={columns}
        columnsOrder={columnsOrder}
        columnsSize={columnsSize}
        columnWidths={columnWidths}
        getComponent={getHeaderComponent}
        onColumnWidthChange={handleColumnWidthChange}
        onColumnResize={onColumnResize}
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
          columnsSize={columnsSize}
          columnWidths={columnWidths}
          rows={rows}
          getComponent={getBodyComponent}
          onRowClick={onRowClick}
          selectedRowId={selectedRowId}
          allowRowReorder={allowRowReorder && !loading}
          onDataChangeRequest={onDataChangeRequest}
          locked={loading}
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
