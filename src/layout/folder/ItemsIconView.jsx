import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import FolderIcon from '../../icon/FolderIcon';
import FileIcon from '../../icon/FileIcon';
import Menu from '../../menu/Menu.jsx';
import './folder.css';

const ICON_SIZE = 40;

const ItemsIconView = observer(({
  rows = [],
  getIconData,
  onRowInteraction,
  selectedRowIds,
  selectionMode = 'single',
  onRowClick,
  onRowDoubleClick,
  selectedRowId,
  locked = false,
  contextMenuItems = null,
  onDataChangeRequest,
}) => {
  const [contextMenu, setContextMenu] = useState(null);

  const handleInteraction = (e, type, rowId, rowIndex) => {
    if (onRowInteraction) {
      onRowInteraction({
        type, rowId, rowIndex, nativeEvent: e,
        modifiers: { ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey, alt: e.altKey },
      });
    }
    if (type === 'click' && onRowClick) onRowClick(rowId);
    if (type === 'double-click' && onRowDoubleClick) onRowDoubleClick(rowId);
  };

  const handleContextMenu = (e, rowId, rowIndex) => {
    handleInteraction(e, 'context-menu', rowId, rowIndex);
    if (locked || !contextMenuItems || contextMenuItems.length === 0) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    requestAnimationFrame(() => {
      setContextMenu({ x: e.clientX, y: e.clientY, rowId });
    });
  };

  const handleMenuItemClick = async (item) => {
    if (!contextMenu || !onDataChangeRequest) return;
    const rowId = contextMenu.rowId;
    setContextMenu(null);
    if (item.name === 'Delete') {
      await onDataChangeRequest('delete', { rowId });
    }
  };

  return (
    <div className={`folder-icon-view ${locked ? 'locked' : ''}`}>
      {rows.map((row, index) => {
        const isSelected = selectedRowIds
          ? selectedRowIds.includes(row.id)
          : selectedRowId === row.id;
        const { label, kind } = getIconData
          ? getIconData(row.id)
          : { label: String(row.id), kind: 'file' };
        return (
          <div
            key={row.id}
            data-row-id={row.id}
            className={`folder-icon-tile ${isSelected ? 'selected' : ''}`}
            onClick={(e) => handleInteraction(e, 'click', row.id, index)}
            onDoubleClick={(e) => handleInteraction(e, 'double-click', row.id, index)}
            onContextMenu={(e) => handleContextMenu(e, row.id, index)}
          >
            <div className="folder-icon-tile-icon">
              {kind === 'folder'
                ? <FolderIcon width={ICON_SIZE} height={ICON_SIZE} />
                : <FileIcon width={ICON_SIZE} height={ICON_SIZE} />
              }
            </div>
            <div className="folder-icon-tile-label">{label}</div>
          </div>
        );
      })}
      {contextMenu && contextMenuItems && (
        <Menu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onItemClick={handleMenuItemClick}
          items={contextMenuItems}
        />
      )}
    </div>
  );
});

export default ItemsIconView;
