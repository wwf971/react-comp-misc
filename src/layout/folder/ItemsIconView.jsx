import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import FolderIcon from '../../icon/FolderIcon';
import FileIcon from '../../icon/FileIcon';
import Menu from '../../component/menu/Menu.jsx';
import './folder.css';

const ICON_SIZE = 40;

const ItemsIconView = observer(({
  rows = [],
  getIconData,
  onRowInteraction,
  selectedRowIds,
  onSelectedRowIdsChange,
  selectionMode = 'single',
  onRowClick,
  onRowDoubleClick,
  selectedRowId,
  locked = false,
  contextMenuItems = null,
  onDataChangeRequest,
  allowRowReorder = false,
}) => {
  const containerRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [draggingIds, setDraggingIds] = useState([]);
  const [insertBeforeIndex, setInsertBeforeIndex] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [internalSelectedRowIds, setInternalSelectedRowIds] = useState(() => selectedRowIds || []);
  const [lastClickedRowId, setLastClickedRowId] = useState(null);

  const isMultipleSelection = selectionMode === 'multiple';
  const canRowReorder = allowRowReorder;
  const isSelectionControlled = isMultipleSelection
    && Array.isArray(selectedRowIds)
    && typeof onSelectedRowIdsChange === 'function';

  useEffect(() => {
    if (isSelectionControlled) {
      setInternalSelectedRowIds(selectedRowIds);
    }
  }, [isSelectionControlled, selectedRowIds]);

  const resolveSelectedRowIds = () => {
    if (isSelectionControlled) return selectedRowIds;
    return internalSelectedRowIds;
  };

  const emitSelectionChange = (nextSelectedRowIds) => {
    if (!isMultipleSelection) return;
    if (!isSelectionControlled) {
      setInternalSelectedRowIds(nextSelectedRowIds);
    }
    if (onSelectedRowIdsChange) {
      onSelectedRowIdsChange(nextSelectedRowIds);
    }
  };

  const getRowRangeById = (fromRowId, toRowId) => {
    const fromIndex = rows.findIndex(row => row.id === fromRowId);
    const toIndex = rows.findIndex(row => row.id === toRowId);
    if (fromIndex < 0 || toIndex < 0) return [];
    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);
    return rows.slice(startIndex, endIndex + 1).map(row => row.id);
  };

  const handleSelectionForClick = (e, rowId) => {
    if (selectionMode === 'none') return;
    if (!isMultipleSelection) {
      return;
    }
    const isShiftPressed = e.shiftKey;
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const currentSelectedRowIds = resolveSelectedRowIds();
    if (isCtrlPressed && isShiftPressed && lastClickedRowId) {
      const range = getRowRangeById(lastClickedRowId, rowId);
      const mergedSelection = [...new Set([...currentSelectedRowIds, ...range])];
      emitSelectionChange(mergedSelection);
      setLastClickedRowId(rowId);
      return;
    }
    if (isShiftPressed && lastClickedRowId) {
      const range = getRowRangeById(lastClickedRowId, rowId);
      emitSelectionChange(range);
      setLastClickedRowId(rowId);
      return;
    }
    if (isCtrlPressed) {
      const isAlreadySelected = currentSelectedRowIds.includes(rowId);
      const nextSelectedRowIds = isAlreadySelected
        ? currentSelectedRowIds.filter(id => id !== rowId)
        : [...currentSelectedRowIds, rowId];
      emitSelectionChange(nextSelectedRowIds);
      if (!isAlreadySelected) {
        setLastClickedRowId(rowId);
      }
      return;
    }
    emitSelectionChange([rowId]);
    setLastClickedRowId(rowId);
  };

  const handleInteraction = (e, type, rowId, rowIndex) => {
    if (type === 'click') {
      handleSelectionForClick(e, rowId);
      if (onRowClick) onRowClick(rowId);
    }
    if (type === 'double-click' && onRowDoubleClick) onRowDoubleClick(rowId);
    if (onRowInteraction) {
      onRowInteraction({
        type, rowId, rowIndex, nativeEvent: e,
        modifiers: { ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey, alt: e.altKey },
      });
    }
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

  const handleDragStart = (e, rowId) => {
    if (!canRowReorder) return;
    e.stopPropagation();
    const currentSelectedRowIds = resolveSelectedRowIds();
    const isDraggingSelectedRow = isMultipleSelection && currentSelectedRowIds.includes(rowId);
    const shouldDragMultipleRows = isDraggingSelectedRow && currentSelectedRowIds.length > 1;
    const nextDraggingIds = shouldDragMultipleRows
      ? rows.filter(row => currentSelectedRowIds.includes(row.id)).map(row => row.id)
      : [rowId];
    setDraggingId(rowId);
    setDraggingIds(nextDraggingIds);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(rowId));
    const ghost = e.currentTarget.cloneNode(true);
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleContainerDragOver = (e) => {
    if (!canRowReorder) return;
    if (draggingIds.length === 0) return;
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const tileEls = [...container.querySelectorAll('.folder-icon-tile')];
    for (let i = 0; i < tileEls.length; i++) {
      const rect = tileEls[i].getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        setInsertBeforeIndex(e.clientX < rect.left + rect.width / 2 ? i : i + 1);
        return;
      }
    }
  };

  const handleContainerDragLeave = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
      setInsertBeforeIndex(null);
    }
  };

  const handleDragEnd = async () => {
    const rowOrder = rows.map(r => r.id);
    const fromIndex = rowOrder.findIndex(id => id === draggingId);
    const capturedInsertIndex = insertBeforeIndex;
    setDraggingId(null);
    setDraggingIds([]);
    setInsertBeforeIndex(null);

    if (capturedInsertIndex === null || !onDataChangeRequest || draggingIds.length === 0) return;
    if (draggingIds.length > 1) {
      const draggingSet = new Set(draggingIds);
      const draggedIndexes = draggingIds
        .map(rowId => rowOrder.indexOf(rowId))
        .filter(index => index >= 0);
      if (draggedIndexes.length === 0) return;
      const draggedCountBeforeInsert = draggedIndexes.filter(index => index < capturedInsertIndex).length;
      const toIndex = capturedInsertIndex - draggedCountBeforeInsert;
      const remainingOrder = rowOrder.filter(rowId => !draggingSet.has(rowId));
      const newOrder = [...remainingOrder];
      newOrder.splice(toIndex, 0, ...draggingIds);
      const isSameOrder = newOrder.length === rowOrder.length && newOrder.every((id, idx) => id === rowOrder[idx]);
      if (isSameOrder) return;
      try {
        await onDataChangeRequest('reorder-multiple', {
          rowIds: draggingIds,
          fromIndexes: draggedIndexes,
          toIndex,
          newOrder,
        });
      } catch {}
      return;
    }
    if (fromIndex < 0) return;
    const toIndex = capturedInsertIndex > fromIndex ? capturedInsertIndex - 1 : capturedInsertIndex;
    if (toIndex === fromIndex) return;

    const newOrder = [...rowOrder];
    newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, rowOrder[fromIndex]);
    try {
      await onDataChangeRequest('reorder', {
        rowId: rowOrder[fromIndex],
        fromIndex,
        toIndex,
        newOrder,
      });
    } catch {}
  };

  return (
    <div
      className={`folder-icon-view ${locked ? 'locked' : ''}`}
      ref={containerRef}
      onDragOver={handleContainerDragOver}
      onDragLeave={handleContainerDragLeave}
    >
      {rows.map((row, index) => {
        const effectiveSelectedRowIds = resolveSelectedRowIds();
        const isSelected = isMultipleSelection
          ? effectiveSelectedRowIds.includes(row.id)
          : (Array.isArray(selectedRowIds) ? selectedRowIds.includes(row.id) : selectedRowId === row.id);
        const isDragging = draggingIds.includes(row.id);
        const isInsertBefore = canRowReorder && insertBeforeIndex === index;
        const isInsertAfter = canRowReorder && insertBeforeIndex === rows.length && index === rows.length - 1;
        const { label, kind } = getIconData
          ? getIconData(row.id)
          : { label: String(row.id), kind: 'file' };
        return (
          <div
            key={row.id}
            data-row-id={row.id}
            className={[
              'folder-icon-tile',
              isSelected ? 'selected' : '',
              isDragging ? 'dragging' : '',
              canRowReorder ? 'reorderable' : '',
              isInsertBefore ? 'insert-before' : '',
              isInsertAfter ? 'insert-after' : '',
            ].filter(Boolean).join(' ')}
            style={{ opacity: isDragging ? 0.3 : 1 }}
            onClick={(e) => handleInteraction(e, 'click', row.id, index)}
            onDoubleClick={(e) => handleInteraction(e, 'double-click', row.id, index)}
            onContextMenu={(e) => handleContextMenu(e, row.id, index)}
            draggable={canRowReorder}
            onDragStart={(e) => handleDragStart(e, row.id)}
            onDragEnd={handleDragEnd}
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
      {locked && <div className="folder-icon-view-overlay" />}
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
