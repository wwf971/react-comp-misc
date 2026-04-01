import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import Header from './Header';
import ItemsListView from './ItemsListView';
import ItemsIconView from './ItemsIconView';
import './folder.css';

const VIEWS = [
  { id: 'list', label: 'List' },
  { id: 'icon', label: 'Icons' },
];

const ViewSwitcher = observer(({
  view: controlledView,
  onViewChange,
  defaultView = 'list',

  bodyHeight,

  columns,
  columnsOrder,
  columnsSizeInit,
  columnWidths,
  getHeaderComponent,
  onColumnWidthChange,
  allowColumnReorder = false,

  getIconData,

  rows,
  getComponent,
  onRowInteraction,
  selectedRowIds,
  selectionMode = 'single',
  dataStore,
  getRowData,
  onRowClick,
  onRowDoubleClick,
  onRowContextMenu,
  selectedRowId,
  allowRowReorder = false,
  onDataChangeRequest,
  locked = false,
  contextMenuItems = null,
}) => {
  const [internalView, setInternalView] = useState(defaultView);
  const activeView = controlledView !== undefined ? controlledView : internalView;

  const handleViewChange = (v) => {
    if (controlledView === undefined) setInternalView(v);
    onViewChange?.(v);
  };

  const sharedProps = {
    rows,
    onRowInteraction,
    selectedRowIds,
    selectionMode,
    dataStore,
    getRowData,
    onRowClick,
    onRowDoubleClick,
    onRowContextMenu,
    selectedRowId,
    allowRowReorder,
    onDataChangeRequest,
    locked,
    contextMenuItems,
  };

  return (
    <div className="folder-view-switcher">
      <div className="folder-view-switcher-toolbar">
        {VIEWS.map(v => (
          <button
            key={v.id}
            className={`folder-view-switcher-btn${activeView === v.id ? ' active' : ''}`}
            onClick={() => handleViewChange(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
      {activeView === 'list' && columns && (
        <Header
          columns={columns}
          columnsOrder={columnsOrder}
          columnsSizeInit={columnsSizeInit}
          columnWidths={columnWidths}
          getComponent={getHeaderComponent}
          onColumnWidthChange={onColumnWidthChange}
          onDataChangeRequest={onDataChangeRequest}
          allowColumnReorder={allowColumnReorder}
        />
      )}
      <div
        className="folder-view-switcher-content"
        style={{
          height: bodyHeight ? `${bodyHeight}px` : undefined,
          overflowY: bodyHeight ? 'auto' : undefined,
        }}
      >
        {activeView === 'list' && (
          <ItemsListView
            columns={columns}
            columnsOrder={columnsOrder}
            columnsSizeInit={columnsSizeInit}
            columnWidths={columnWidths}
            getComponent={getComponent}
            {...sharedProps}
          />
        )}
        {activeView === 'icon' && (
          <ItemsIconView
            getIconData={getIconData}
            {...sharedProps}
          />
        )}
      </div>
    </div>
  );
});

export default ViewSwitcher;
