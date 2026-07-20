import React, { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Menu from '../../component/menu/Menu.jsx';
import { getElementUnderMenu, isPointInsideElement } from '../../component/menu/menuContextMenuUtils.js';
import {
  calcRowIdsSelectedForClick,
  calcRowIdsSelectedForContextMenu,
  emitFolderEvent,
  DEFAULT_COL_MIN_WIDTH,
  resolveColJustifyContent,
} from './folderUtils.js';
import './folder.css';

const DefaultBodyCellComp = ({ data }) => <>{data}</>;

const MemoizedDefaultBodyCellComp = React.memo(DefaultBodyCellComp, (prev, next) => (
  prev.data === next.data
));

const ObservableCell = observer(({
  rowId,
  colId,
  getRowData,
  CustomComp,
  align,
  onEvent,
}) => {
  const cellData = getRowData ? getRowData(rowId, colId) : null;
  const CellComp = CustomComp || MemoizedDefaultBodyCellComp;
  return (
    <CellComp
      data={cellData}
      colId={colId}
      rowId={rowId}
      align={align}
      onEvent={onEvent}
    />
  );
});

const StaticCell = ({
  rowId,
  colId,
  getRowData,
  CustomComp,
  align,
  onEvent,
}) => {
  const cellData = getRowData(rowId, colId);
  const CellComp = CustomComp || MemoizedDefaultBodyCellComp;
  return (
    <CellComp
      data={cellData}
      colId={colId}
      rowId={rowId}
      align={align}
      onEvent={onEvent}
    />
  );
};

const ItemsListView = observer(({
  data = {},
  config = {},
  onEvent,
}) => {
  const columns = data?.columns || {};
  const colsOrder = data?.colsOrder || [];
  const colWidthById = data?.colWidthById || {};
  const rows = Array.isArray(data?.rows) ? data.rows : [];
  const rowIdsSelected = Array.isArray(data?.rowIdsSelected) ? data.rowIdsSelected : [];
  const getRowData = data?.getRowData;
  const contextMenuItems = data?.contextMenuItems;

  const colSizeById = config?.colSizeById || {};
  const isLastColFilled = config?.isLastColFilled !== false;
  const colResizeIndicatorLeft = config?.colResizeIndicatorLeft ?? null;
  const selectionMode = config?.selectionMode || 'single';
  const isRowReorderAllowed = config?.isRowReorderAllowed === true;
  const isLocked = config?.isLocked === true;
  const compBodyByColId = config?.compBodyByColId;
  const isRowDataObservable = config?.isRowDataObservable === true;

  const bodyRef = useRef(null);
  const [draggingRowId, setDraggingRowId] = useState(null);
  const [draggingRowIds, setDraggingRowIds] = useState([]);
  const [dragOverSeparatorIndex, setDragOverSeparatorIndex] = useState(null);
  const dragOffsetX = useRef(0);
  const dragOffsetY = useRef(0);
  const [contextMenu, setContextMenu] = useState(null);
  const [lastRowIdClicked, setLastRowIdClicked] = useState(null);

  if (!colsOrder.length || !rows) {
    return null;
  }

  const isMultipleSelection = selectionMode === 'multiple';
  const canRowReorder = isRowReorderAllowed && !isLocked;

  const effectiveGetRowData = getRowData || ((rowId, colId) => {
    const row = rows.find((item) => item.id === rowId);
    return row?.data?.[colId];
  });

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

  const handleBodyClick = (e) => {
    if (e.target.closest('[data-row-id]')) {
      return;
    }
    handleClearSelection();
  };

  const handleRowInteraction = (e, type, rowId, rowIndex) => {
    if (type === 'click') {
      handleSelectionForClick(e, rowId);
      emitFolderEvent(onEvent, 'rowClick', { rowId });
    } else if (type === 'double-click') {
      emitFolderEvent(onEvent, 'rowDoubleClick', { rowId });
    } else if (type === 'context-menu') {
      emitFolderEvent(onEvent, 'rowContextMenu', { rowId, event: e });
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

  const isContextMenuBuiltInDisabled = config?.isContextMenuBuiltInDisabled === true;

  const handleRowContextMenu = (e, rowId, rowIndex) => {
    handleSelectionForContextMenu(rowId);
    handleRowInteraction(e, 'context-menu', rowId, rowIndex);
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

  const handleBackdropContextMenu = (e) => {
    e.preventDefault();
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
        handleRowInteraction(e, 'context-menu', rowId, rowIndex >= 0 ? rowIndex : 0);
        setContextMenu(null);
        requestAnimationFrame(() => {
          setContextMenu({ x: e.clientX, y: e.clientY, rowId });
        });
        return;
      }
    }
    setContextMenu(null);
    if (isPointInsideElement(bodyRef.current, e)) {
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
        handleRowInteraction(e, 'click', rowId, rowIndex >= 0 ? rowIndex : 0);
        return;
      }
    }
    if (isPointInsideElement(bodyRef.current, e)) {
      handleClearSelection();
    }
  };

  const handleMenuItemClick = async (item) => {
    if (!contextMenu) {
      return;
    }
    const rowId = contextMenu.rowId;
    setContextMenu(null);
    await emitFolderEvent(onEvent, 'rowContextMenuItemClick', { rowId, item });
    if (item.id === 'delete') {
      await emitFolderEvent(onEvent, 'rowDelete', { rowId });
    }
  };

  const handleRowDragStart = (e, rowId) => {
    if (!canRowReorder) {
      return;
    }
    e.stopPropagation();
    const isDraggingSelectedRow = isMultipleSelection && rowIdsSelected.includes(rowId);
    const shouldDragMultipleRows = isDraggingSelectedRow && rowIdsSelected.length > 1;
    const nextDraggingRowIds = shouldDragMultipleRows
      ? rows.filter((row) => rowIdsSelected.includes(row.id)).map((row) => row.id)
      : [rowId];
    const rowRect = e.currentTarget.getBoundingClientRect();
    dragOffsetX.current = e.clientX - rowRect.left;
    dragOffsetY.current = e.clientY - rowRect.top;
    setDraggingRowId(rowId);
    setDraggingRowIds(nextDraggingRowIds);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(rowId));
    const ghost = e.currentTarget.cloneNode(true);
    ghost.style.opacity = '0.5';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, dragOffsetX.current, dragOffsetY.current);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleRowDrag = (e) => {
    if (draggingRowIds.length === 0 || !bodyRef.current) {
      return;
    }
    e.preventDefault();
    if (e.clientX === 0 && e.clientY === 0) {
      return;
    }
    const bodyRect = bodyRef.current.getBoundingClientRect();
    const mouseY = e.clientY - bodyRect.top;
    const rowElements = bodyRef.current.querySelectorAll('.folder-body-row');
    const separators = [];
    let currentTop = 0;
    rowElements.forEach((rowEl, idx) => {
      separators.push({ index: idx, position: currentTop });
      currentTop += rowEl.offsetHeight;
    });
    separators.push({ index: rowElements.length, position: currentTop });
    let closestSeparator = null;
    let minDistance = Infinity;
    separators.forEach((sep) => {
      const distance = Math.abs(mouseY - sep.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestSeparator = sep;
      }
    });
    if (closestSeparator) {
      setDragOverSeparatorIndex(closestSeparator.index);
    }
  };

  const handleRowDragEnd = async () => {
    if (draggingRowIds.length === 0) {
      setDraggingRowId(null);
      setDraggingRowIds([]);
      setDragOverSeparatorIndex(null);
      return;
    }
    if (dragOverSeparatorIndex === null) {
      setDraggingRowId(null);
      setDraggingRowIds([]);
      setDragOverSeparatorIndex(null);
      return;
    }
    const rowsOrder = rows.map((row) => row.id);
    if (draggingRowIds.length > 1) {
      const draggingSet = new Set(draggingRowIds);
      const draggedIndexes = draggingRowIds
        .map((rowId) => rowsOrder.indexOf(rowId))
        .filter((index) => index >= 0);
      if (draggedIndexes.length === 0) {
        setDraggingRowId(null);
        setDraggingRowIds([]);
        setDragOverSeparatorIndex(null);
        return;
      }
      const draggedCountBeforeSeparator = draggedIndexes.filter((index) => index < dragOverSeparatorIndex).length;
      const insertIndex = dragOverSeparatorIndex - draggedCountBeforeSeparator;
      const remainingOrder = rowsOrder.filter((rowId) => !draggingSet.has(rowId));
      const rowsOrderNext = [...remainingOrder];
      rowsOrderNext.splice(insertIndex, 0, ...draggingRowIds);
      const isSameOrder = rowsOrderNext.length === rowsOrder.length
        && rowsOrderNext.every((id, idx) => id === rowsOrder[idx]);
      if (!isSameOrder) {
        try {
          await emitFolderEvent(onEvent, 'rowReorderMultiple', {
            rowIds: draggingRowIds,
            fromIndexes: draggedIndexes,
            toIndex: insertIndex,
            rowsOrderNext,
          });
        } catch {}
      }
      setDraggingRowId(null);
      setDraggingRowIds([]);
      setDragOverSeparatorIndex(null);
      return;
    }
    if (!draggingRowId) {
      setDraggingRowId(null);
      setDraggingRowIds([]);
      setDragOverSeparatorIndex(null);
      return;
    }
    const draggedIndex = rowsOrder.indexOf(draggingRowId);
    if (
      draggedIndex >= 0
      && dragOverSeparatorIndex !== draggedIndex
      && dragOverSeparatorIndex !== draggedIndex + 1
    ) {
      let newIndex = dragOverSeparatorIndex;
      if (dragOverSeparatorIndex > draggedIndex) {
        newIndex = dragOverSeparatorIndex - 1;
      }
      const rowsOrderNext = [...rowsOrder];
      rowsOrderNext.splice(draggedIndex, 1);
      rowsOrderNext.splice(newIndex, 0, draggingRowId);
      try {
        await emitFolderEvent(onEvent, 'rowReorder', {
          rowId: draggingRowId,
          fromIndex: draggedIndex,
          toIndex: newIndex,
          rowsOrderNext,
        });
      } catch {}
    }
    setDraggingRowId(null);
    setDraggingRowIds([]);
    setDragOverSeparatorIndex(null);
  };

  const handleRowDragOver = (e) => {
    if (draggingRowIds.length > 0) {
      e.preventDefault();
    }
  };

  const getSeparatorPos = (sepIndex) => {
    if (!bodyRef.current) {
      return 0;
    }
    const rowElements = bodyRef.current.querySelectorAll('.folder-body-row');
    let position = 0;
    for (let i = 0; i < sepIndex && i < rowElements.length; i += 1) {
      position += rowElements[i].offsetHeight;
    }
    return position;
  };

  const selectionClassName = selectionMode !== 'none' ? `selection-${selectionMode}` : '';

  return (
    <div
      className={`folder-body ${isLocked ? 'locked' : ''} ${selectionClassName}`}
      ref={bodyRef}
      onClick={handleBodyClick}
      onDragOver={handleRowDragOver}
    >
      {rows.map((row, index) => {
        const isSelected = isMultipleSelection
          ? rowIdsSelected.includes(row.id)
          : rowIdsSelected.includes(row.id) || rowIdsSelected[0] === row.id;
        const isDragging = draggingRowIds.includes(row.id);
        const rowClassName = row.rowClassName ? String(row.rowClassName) : '';
        return (
          <div
            key={row.id}
            data-row-id={row.id}
            className={`folder-body-row ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${canRowReorder ? 'reorderable' : ''} ${rowClassName}`}
            style={{ opacity: isDragging ? 0.3 : 1 }}
            onClick={(e) => handleRowInteraction(e, 'click', row.id, index)}
            onDoubleClick={(e) => handleRowInteraction(e, 'double-click', row.id, index)}
            onContextMenu={(e) => handleRowContextMenu(e, row.id, index)}
            draggable={canRowReorder}
            onDragStart={(e) => handleRowDragStart(e, row.id)}
            onDrag={handleRowDrag}
            onDragEnd={handleRowDragEnd}
          >
            {colsOrder.map((colId, columnIndex) => {
              const column = columns[colId];
              if (!column) {
                return null;
              }
              const isLastCol = columnIndex === colsOrder.length - 1;
              const isLastColFillApplied = isLastColFilled && isLastCol;
              const align = column.align || 'left';
              const width = colWidthById?.[colId];
              const minWidth = colSizeById?.[colId]?.minWidth ?? DEFAULT_COL_MIN_WIDTH;
              const CustomComp = compBodyByColId ? compBodyByColId(colId, row.id) : undefined;
              const CellWrapper = isRowDataObservable ? ObservableCell : StaticCell;
              return (
                <div
                  key={colId}
                  className="folder-body-cell"
                  style={{
                    width: width ? `${width}px` : undefined,
                    minWidth: isLastColFillApplied ? `${minWidth}px` : undefined,
                    flexGrow: isLastColFillApplied ? 1 : undefined,
                    textAlign: align,
                    justifyContent: resolveColJustifyContent(align),
                  }}
                >
                  <div
                    className="folder-body-cell-content"
                    style={{
                      textAlign: align,
                      width: align === 'left' ? undefined : '100%',
                    }}
                  >
                    <CellWrapper
                      rowId={row.id}
                      colId={colId}
                      getRowData={effectiveGetRowData}
                      CustomComp={CustomComp}
                      align={align}
                      onEvent={onEvent}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      {dragOverSeparatorIndex !== null ? (
        <div
          className="folder-body-separator-indicator"
          style={{ position: 'absolute', top: `${getSeparatorPos(dragOverSeparatorIndex)}px`, left: 0, right: 0 }}
        />
      ) : null}
      {colResizeIndicatorLeft !== null ? (
        <div
          className="folder-column-resize-indicator"
          style={{ left: `${colResizeIndicatorLeft}px` }}
        />
      ) : null}
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

export default ItemsListView;
export { DefaultBodyCellComp, MemoizedDefaultBodyCellComp, ObservableCell, StaticCell };
