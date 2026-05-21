import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import ViewSwitcher from './ViewSwitcher';
import StatusBar from './StatusBar';
import './folder.css';

const resolveColumnAlign = (align) => {
  const value = `${align ?? ''}`.trim();
  if (value === 'center' || value === 'right') {
    return value;
  }
  return 'left';
};

const withResolvedColumnAlign = (columns) => {
  if (!columns) {
    return columns;
  }
  const next = {};
  Object.entries(columns).forEach(([columnId, column]) => {
    next[columnId] = {
      ...column,
      align: resolveColumnAlign(column?.align),
    };
  });
  return next;
};

const FolderView = observer(({
  columns,
  columnsOrder,
  columnsSizeInit,
  rows,
  getHeaderComponent,
  getBodyComponent,
  getIconData,
  onDataChangeRequest,
  allowColumnReorder = false,
  onRowInteraction,
  selectedRowIds,
  onSelectedRowIdsChange,
  selectionMode = 'single',
  dataStore,
  getRowData,
  onRowClick,
  onRowDoubleClick,
  onRowContextMenu,
  selectedRowId,
  allowRowReorder = false,
  showStatusBar = true,
  loading = false,
  loadingMessage,
  error = null,
  bodyHeight,
  contextMenuItems = null,
  showStatusItemCount = true,
  listOnly = false,
  isLastColumnFilled = true,
  headerPageUtils = null,
  columnResizeDragMode = 'preview',
  columnResizeWidthMode = 'natural',
}) => {
  const [columnWidths, setColumnWidths] = useState({});
  const resolvedColumns = useMemo(() => withResolvedColumnAlign(columns), [columns]);

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

  return (
    <div className="folder-view-container">
      <ViewSwitcher
        bodyHeight={bodyHeight}
        columns={resolvedColumns}
        columnsOrder={columnsOrder}
        columnsSizeInit={columnsSizeInit}
        columnWidths={columnWidths}
        getHeaderComponent={getHeaderComponent}
        onColumnWidthChange={setColumnWidths}
        allowColumnReorder={allowColumnReorder && !loading}
        listOnly={listOnly}
        isLastColumnFilled={isLastColumnFilled}
        headerPageUtils={headerPageUtils}
        columnResizeDragMode={columnResizeDragMode}
        columnResizeWidthMode={columnResizeWidthMode}
        getIconData={getIconData}
        rows={rows}
        getComponent={getBodyComponent}
        onRowInteraction={onRowInteraction}
        selectedRowIds={selectedRowIds}
        onSelectedRowIdsChange={onSelectedRowIdsChange}
        selectionMode={selectionMode}
        dataStore={dataStore}
        getRowData={getRowData}
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        onRowContextMenu={onRowContextMenu}
        selectedRowId={selectedRowId}
        allowRowReorder={allowRowReorder && !loading}
        onDataChangeRequest={onDataChangeRequest}
        isLocked={loading}
        contextMenuItems={contextMenuItems}
      />
      {showStatusBar && (
        <StatusBar
          itemCount={rows?.length || 0}
          loading={loading}
          loadingMessage={loadingMessage}
          error={error}
          showStatusItemCount={showStatusItemCount}
        />
      )}
    </div>
  );
});

export default FolderView;
