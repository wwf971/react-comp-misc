import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import Header from './Header';
import ItemsListView from './ItemsListView';
import ItemsIconView from './ItemsIconView';
import { emitFolderEvent } from './folderUtils.js';
import './folder.css';

const VIEWS = [
  { id: 'list', label: 'List' },
  { id: 'icon', label: 'Icons' },
];

const ViewSwitcher = observer(({
  data = {},
  config = {},
  onEvent,
}) => {
  const viewCurrentFromData = data?.viewCurrent;
  const viewDefault = config?.viewDefault || 'list';
  const isListOnly = config?.isListOnly === true;
  const bodyHeight = config?.bodyHeight;

  const [internalViewCurrent, setInternalViewCurrent] = useState(viewDefault);
  const [colResizeIndicatorLeft, setColResizeIndicatorLeft] = useState(null);

  const viewCurrent = isListOnly
    ? 'list'
    : (viewCurrentFromData !== undefined ? viewCurrentFromData : internalViewCurrent);

  const handleViewChange = (nextViewCurrent) => {
    if (viewCurrentFromData === undefined) {
      setInternalViewCurrent(nextViewCurrent);
    }
    emitFolderEvent(onEvent, 'viewChange', { viewCurrent: nextViewCurrent });
  };

  const handleChildEvent = (eventType, eventData) => {
    if (eventType === 'colResizeIndicatorChange') {
      setColResizeIndicatorLeft(eventData?.left ?? null);
      return null;
    }
    return emitFolderEvent(onEvent, eventType, eventData);
  };

  const headerData = {
    columns: data.columns,
    colsOrder: data.colsOrder,
    colWidthById: data.colWidthById,
  };

  const headerConfig = {
    colSizeById: config.colSizeById,
    isColReorderAllowed: config.isColReorderAllowed,
    isLastColFilled: config.isLastColFilled,
    compByColId: config.compHeaderByColId,
    headerPageUtils: config.headerPageUtils,
    colResizeDragMode: config.colResizeDragMode,
    colResizeWidthMode: config.colResizeWidthMode,
  };

  const listData = {
    columns: data.columns,
    colsOrder: data.colsOrder,
    colWidthById: data.colWidthById,
    rows: data.rows,
    rowIdsSelected: data.rowIdsSelected,
    getRowData: data.getRowData,
    contextMenuItems: data.contextMenuItems,
  };

  const listConfig = {
    colSizeById: config.colSizeById,
    isLastColFilled: config.isLastColFilled,
    colResizeIndicatorLeft,
    selectionMode: config.selectionMode,
    isRowReorderAllowed: config.isRowReorderAllowed,
    isLocked: config.isLocked,
    compBodyByColId: config.compBodyByColId,
    isRowDataObservable: config.isRowDataObservable,
    isContextMenuBuiltInDisabled: config.isContextMenuBuiltInDisabled,
  };

  const iconData = {
    rows: data.rows,
    rowIdsSelected: data.rowIdsSelected,
    getRowIconData: data.getRowIconData,
    contextMenuItems: data.contextMenuItems,
  };

  const iconConfig = {
    selectionMode: config.selectionMode,
    isRowReorderAllowed: config.isRowReorderAllowed,
    isLocked: config.isLocked,
    isContextMenuBuiltInDisabled: config.isContextMenuBuiltInDisabled,
  };

  return (
    <div className="folder-view-switcher">
      {!isListOnly ? (
        <div className="folder-view-switcher-toolbar">
          {VIEWS.map((viewItem) => (
            <button
              key={viewItem.id}
              type="button"
              className={`folder-view-switcher-btn${viewCurrent === viewItem.id ? ' active' : ''}`}
              onClick={() => handleViewChange(viewItem.id)}
            >
              {viewItem.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className={`folder-view-switcher-scroll${bodyHeight ? ' has-body-height' : ''}`}>
        <div
          className={`folder-view-switcher-content${bodyHeight ? ' has-body-height' : ''}`}
          style={bodyHeight ? { height: `${bodyHeight}px` } : undefined}
        >
          {viewCurrent === 'list' && data.columns ? (
            <div className="folder-header-wrapper">
              <Header
                data={headerData}
                config={headerConfig}
                onEvent={handleChildEvent}
              />
            </div>
          ) : null}
          {viewCurrent === 'list' ? (
            <ItemsListView
              data={listData}
              config={listConfig}
              onEvent={handleChildEvent}
            />
          ) : null}
          {viewCurrent === 'icon' ? (
            <ItemsIconView
              data={iconData}
              config={iconConfig}
              onEvent={handleChildEvent}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
});

export default ViewSwitcher;
