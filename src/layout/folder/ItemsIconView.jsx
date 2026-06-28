import React, { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import FolderIcon from '../../icon/FolderIcon';
import FileIcon from '../../icon/FileIcon';
import Menu from '../../component/menu/Menu.jsx';
import { getElementUnderMenu, isPointInsideElement } from '../../component/menu/menuContextMenuUtils.js';
import {
  calcRowIdsSelectedForClick,
  calcRowIdsSelectedForContextMenu,
  emitFolderEvent,
} from './folderUtils.js';
import './folder.css';

const ICON_SIZE = 40;

const ItemsIconView = observer(({
  data = {},
  config = {},
  onEvent,
}) => {
  const rows = Array.isArray(data?.rows) ? data.rows : [];
  const rowIdsSelected = Array.isArray(data?.rowIdsSelected) ? data.rowIdsSelected : [];
  const getRowIconData = data?.getRowIconData;
  const contextMenuItems = data?.contextMenuItems;

  const selectionMode = config?.selectionMode || 'single';
  const isRowReorderAllowed = config?.isRowReorderAllowed === true;
  const isLocked = config?.isLocked === true;
  const isContextMenuBuiltInDisabled = config?.isContextMenuBuiltInDisabled === true;

  const containerRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [draggingIds, setDraggingIds] = useState([]);
  const [insertBeforeIndex, setInsertBeforeIndex] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [lastRowIdClicked, setLastRowIdClicked] = useState(null);

  const isMultipleSelection = selectionMode === 'multiple';
  const canRowReorder = isRowReorderAllowed && !isLocked;

  const handleRowIdsSelectedChange = (nextRowIdsSelected, nextLastRowIdClicked) => {
    if (nextLastRowIdClicked !== undefined) {
      setLastRowIdClicked(nextLastRowIdClicked);
    }
    emitFolderEvent(onEvent, 'rowIdsSelectedChange', {
      rowIdsSelected: nextRowIdsSelected,
    });
  };

  const handleSelectionForClick = (e, rowId) => {
    if (selectionMode === 'none') {
      return;
    }
    if (!isMultipleSelection) {
      handleRowIdsSelectedChange([rowId], rowId);
      return;
    }
    const nextRowIdsSelected = calcRowIdsSelectedForClick({
      rows,
      rowIdsSelected,
      rowId,
      lastRowIdClicked,
      isShiftPressed: e.shiftKey,
      isCtrlPressed: e.ctrlKey || e.metaKey,
    });
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const isAlreadySelected = rowIdsSelected.includes(rowId);
    const nextLastRowIdClicked = isCtrlPressed && isAlreadySelected
      ? lastRowIdClicked
      : rowId;
    handleRowIdsSelectedChange(nextRowIdsSelected, nextLastRowIdClicked);
  };

  const handleSelectionForContextMenu = (rowId) => {
    if (selectionMode === 'none') {
      return;
    }
    const nextRowIdsSelected = calcRowIdsSelectedForContextMenu({
      rowIdsSelected,
      rowId,
      isMultipleSelection,
    });
    if (nextRowIdsSelected === rowIdsSelected) {
      return;
    }
    handleRowIdsSelectedChange(nextRowIdsSelected, rowId);
  };

  const handleClearSelection = () => {
    if (selectionMode === 'none' || rowIdsSelected.length === 0) {
      return;
    }
    handleRowIdsSelectedChange([], null);
  };

  const handleContainerClick = (e) => {
    if (e.target.closest('[data-row-id]')) {
      return;
    }
    handleClearSelection();
  };

  const handleBackdropContextMenu = (e) => {
    e.preventDefault();
    if (isContextMenuBuiltInDisabled) {
      return;
    }
    if (isLocked || !contextMenuItems || contextMenuItems.length === 0) {
      return;
    }
    const clickedEl = getElementUnderMenu(e);
    const rowElement = clickedEl?.closest?.('[data-row-id]');
    if (rowElement) {
      const rowId = rowElement.getAttribute('data-row-id');
      if (rowId) {
        handleSelectionForContextMenu(rowId);
        const rowIndex = rows.findIndex((row) => row.id === rowId);
        handleInteraction(e, 'context-menu', rowId, rowIndex >= 0 ? rowIndex : 0);
        setContextMenu(null);
        requestAnimationFrame(() => {
          setContextMenu({ x: e.clientX, y: e.clientY, rowId });
        });
        return;
      }
    }
    setContextMenu(null);
    if (isPointInsideElement(containerRef.current, e)) {
      handleClearSelection();
    }
  };

  const handleBackdropClick = (e) => {
    if (isLocked) {
      return;
    }
    const elementClicked = getElementUnderMenu(e);
    const elementRow = elementClicked?.closest?.('[data-row-id]');
    setContextMenu(null);
    if (elementRow) {
      const rowId = elementRow.getAttribute('data-row-id');
      if (rowId) {
        const rowIndex = rows.findIndex((row) => row.id === rowId);
        handleInteraction(e, 'click', rowId, rowIndex >= 0 ? rowIndex : 0);
        return;
      }
    }
    if (isPointInsideElement(containerRef.current, e)) {
      handleClearSelection();
    }
  };

  const handleInteraction = (e, type, rowId, rowIndex) => {
    if (type === 'click') {
      handleSelectionForClick(e, rowId);
      emitFolderEvent(onEvent, 'rowClick', { rowId });
    }
    if (type === 'double-click') {
      emitFolderEvent(onEvent, 'rowDoubleClick', { rowId });
    }
    emitFolderEvent(onEvent, 'rowInteraction', {
      type,
      rowId,
      rowIndex,
      nativeEvent: e,
      modifiers: {
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        meta: e.metaKey,
        alt: e.altKey,
      },
    });
  };

  const handleContextMenu = (e, rowId, rowIndex) => {
    handleSelectionForContextMenu(rowId);
    handleInteraction(e, 'context-menu', rowId, rowIndex);
    emitFolderEvent(onEvent, 'rowContextMenu', { rowId, event: e });
    if (isContextMenuBuiltInDisabled) {
      return;
    }
    if (isLocked || !contextMenuItems || contextMenuItems.length === 0) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    requestAnimationFrame(() => {
      setContextMenu({ x: e.clientX, y: e.clientY, rowId });
    });
  };

  const handleMenuItemClick = async (item) => {
    if (!contextMenu) {
      return;
    }
    const rowId = contextMenu.rowId;
    setContextMenu(null);
    if (item.id === 'delete') {
      await emitFolderEvent(onEvent, 'rowDelete', { rowId });
    }
  };

  const handleDragStart = (e, rowId) => {
    if (!canRowReorder) {
      return;
    }
    e.stopPropagation();
    const isDraggingSelectedRow = isMultipleSelection && rowIdsSelected.includes(rowId);
    const shouldDragMultipleRows = isDraggingSelectedRow && rowIdsSelected.length > 1;
    const nextDraggingIds = shouldDragMultipleRows
      ? rows.filter((row) => rowIdsSelected.includes(row.id)).map((row) => row.id)
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
    if (!canRowReorder || draggingIds.length === 0) {
      return;
    }
    e.preventDefault();
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const tileEls = [...container.querySelectorAll('.folder-icon-tile')];
    for (let i = 0; i < tileEls.length; i += 1) {
      const rect = tileEls[i].getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right
        && e.clientY >= rect.top && e.clientY <= rect.bottom
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
    const rowsOrder = rows.map((row) => row.id);
    const fromIndex = rowsOrder.findIndex((id) => id === draggingId);
    const capturedInsertIndex = insertBeforeIndex;
    setDraggingId(null);
    setDraggingIds([]);
    setInsertBeforeIndex(null);

    if (capturedInsertIndex === null || draggingIds.length === 0) {
      return;
    }
    if (draggingIds.length > 1) {
      const draggingSet = new Set(draggingIds);
      const draggedIndexes = draggingIds
        .map((rowId) => rowsOrder.indexOf(rowId))
        .filter((index) => index >= 0);
      if (draggedIndexes.length === 0) {
        return;
      }
      const draggedCountBeforeInsert = draggedIndexes.filter((index) => index < capturedInsertIndex).length;
      const toIndex = capturedInsertIndex - draggedCountBeforeInsert;
      const remainingOrder = rowsOrder.filter((rowId) => !draggingSet.has(rowId));
      const rowsOrderNext = [...remainingOrder];
      rowsOrderNext.splice(toIndex, 0, ...draggingIds);
      const isSameOrder = rowsOrderNext.length === rowsOrder.length
        && rowsOrderNext.every((id, idx) => id === rowsOrder[idx]);
      if (isSameOrder) {
        return;
      }
      try {
        await emitFolderEvent(onEvent, 'rowReorderMultiple', {
          rowIds: draggingIds,
          fromIndexes: draggedIndexes,
          toIndex,
          rowsOrderNext,
        });
      } catch {}
      return;
    }
    if (fromIndex < 0) {
      return;
    }
    const toIndex = capturedInsertIndex > fromIndex ? capturedInsertIndex - 1 : capturedInsertIndex;
    if (toIndex === fromIndex) {
      return;
    }
    const rowsOrderNext = [...rowsOrder];
    rowsOrderNext.splice(fromIndex, 1);
    rowsOrderNext.splice(toIndex, 0, rowsOrder[fromIndex]);
    try {
      await emitFolderEvent(onEvent, 'rowReorder', {
        rowId: rowsOrder[fromIndex],
        fromIndex,
        toIndex,
        rowsOrderNext,
      });
    } catch {}
  };

  return (
    <div
      className={`folder-icon-view ${isLocked ? 'locked' : ''}`}
      ref={containerRef}
      onClick={handleContainerClick}
      onDragOver={handleContainerDragOver}
      onDragLeave={handleContainerDragLeave}
    >
      {rows.map((row, index) => {
        const isSelected = rowIdsSelected.includes(row.id);
        const isDragging = draggingIds.includes(row.id);
        const isInsertBefore = canRowReorder && insertBeforeIndex === index;
        const isInsertAfter = canRowReorder && insertBeforeIndex === rows.length && index === rows.length - 1;
        const { label, kind } = getRowIconData
          ? getRowIconData(row.id)
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
                : <FileIcon width={ICON_SIZE} height={ICON_SIZE} />}
            </div>
            <div className="folder-icon-tile-label">{label}</div>
          </div>
        );
      })}
      {isLocked ? <div className="folder-icon-view-overlay" /> : null}
      {contextMenu && contextMenuItems ? (
        <Menu
          data={{ items: contextMenuItems }}
          config={{
            isOpen: true,
            posOpen: { x: contextMenu.x, y: contextMenu.y },
          }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'closeRequest') {
              setContextMenu(null);
              return;
            }
            if (eventType === 'itemClick') {
              handleMenuItemClick(eventData.item);
              return;
            }
            if (eventType === 'backdropContextMenu') {
              handleBackdropContextMenu(eventData.event);
              return;
            }
            if (eventType === 'backdropClick') {
              handleBackdropClick(eventData.event);
            }
          }}
        />
      ) : null}
    </div>
  );
});

export default ItemsIconView;
