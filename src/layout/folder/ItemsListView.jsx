import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Menu from '../../component/menu/Menu.jsx';
import './folder.css';

const DefaultBodyCellComp = ({ data }) => <>{data}</>;

const MemoizedDefaultBodyCellComp = React.memo(DefaultBodyCellComp, (prev, next) => prev.data === next.data);

const ObservableCell = observer(({ rowId, columnId, getRowData, CustomComp, align }) => {
  const cellData = getRowData ? getRowData(rowId, columnId) : null;
  const CellComp = CustomComp || MemoizedDefaultBodyCellComp;
  return <CellComp data={cellData} columnId={columnId} rowId={rowId} align={align} />;
});

const StaticCell = ({ rowId, columnId, getRowData, CustomComp, align }) => {
  const cellData = getRowData(rowId, columnId);
  const CellComp = CustomComp || MemoizedDefaultBodyCellComp;
  return <CellComp data={cellData} columnId={columnId} rowId={rowId} align={align} />;
};

const ItemsListView = observer(({
  columns,
  columnsOrder,
  columnsSizeInit = {},
  columnWidths: externalColumnWidths,
  rows = [],
  getComponent,
  onRowClick,
  onRowDoubleClick,
  onRowContextMenu,
  selectedRowId,
  onRowInteraction,
  selectedRowIds,
  onSelectedRowIdsChange,
  selectionMode = 'single',
  dataStore,
  getRowData,
  allowRowReorder = false,
  onDataChangeRequest,
  locked = false,
  contextMenuItems = null,
}) => {
  const bodyRef = useRef(null);
  const [draggingRowId, setDraggingRowId] = useState(null);
  const [draggingRowIds, setDraggingRowIds] = useState([]);
  const [dragOverSeparatorIndex, setDragOverSeparatorIndex] = useState(null);
  const dragOffsetX = useRef(0);
  const dragOffsetY = useRef(0);
  const [contextMenu, setContextMenu] = useState(null);
  const [internalSelectedRowIds, setInternalSelectedRowIds] = useState(() => selectedRowIds || []);
  const [lastClickedRowId, setLastClickedRowId] = useState(null);

  const columnWidths = externalColumnWidths || {};

  if (!columnsOrder || !rows) return null;

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

  const effectiveGetRowData = getRowData || ((rowId, columnId) => {
    const row = rows.find(r => r.id === rowId);
    return row?.data?.[columnId];
  });

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
      // Keep shift-range anchor stable when the clicked row is toggled off.
      // Update anchor only when the row stays selected after toggle.
      if (!isAlreadySelected) {
        setLastClickedRowId(rowId);
      }
      return;
    }
    emitSelectionChange([rowId]);
    setLastClickedRowId(rowId);
  };

  const handleRowInteraction = (e, type, rowId, rowIndex) => {
    if (type === 'click') {
      handleSelectionForClick(e, rowId);
      if (onRowClick) onRowClick(rowId);
    }
    else if (type === 'double-click' && onRowDoubleClick) onRowDoubleClick(rowId);
    else if (type === 'context-menu' && onRowContextMenu) onRowContextMenu(e, rowId);
    if (onRowInteraction) {
      onRowInteraction({
        type, rowId, rowIndex, nativeEvent: e,
        modifiers: { ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey, alt: e.altKey },
      });
    }
  };

  const handleRowContextMenu = (e, rowId, rowIndex) => {
    handleRowInteraction(e, 'context-menu', rowId, rowIndex);
    if (onRowContextMenu) return;
    if (locked || !contextMenuItems || contextMenuItems.length === 0) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    requestAnimationFrame(() => {
      setContextMenu({ x: e.clientX, y: e.clientY, rowId });
    });
  };

  const handleBackdropContextMenu = (e) => {
    e.preventDefault();
    if (locked || !contextMenuItems || contextMenuItems.length === 0) return;
    const backdrop = e.currentTarget;
    backdrop.style.pointerEvents = 'none';
    const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
    backdrop.style.pointerEvents = '';
    const rowElement = clickedElement?.closest('[data-row-id]');
    if (rowElement) {
      const rowId = rowElement.getAttribute('data-row-id');
      if (rowId) {
        setContextMenu(null);
        requestAnimationFrame(() => {
          setContextMenu({ x: e.clientX, y: e.clientY, rowId });
        });
      }
    } else {
      setContextMenu(null);
    }
  };

  const handleMenuItemClick = async (item) => {
    if (!contextMenu || !onDataChangeRequest) return;
    const rowId = contextMenu.rowId;
    setContextMenu(null);
    if (item.name === 'Delete') {
      await onDataChangeRequest('delete', { rowId });
    }
  };

  const handleRowDragStart = (e, rowId, index) => {
    if (!canRowReorder) return;
    e.stopPropagation();
    const currentSelectedRowIds = resolveSelectedRowIds();
    const isDraggingSelectedRow = isMultipleSelection && currentSelectedRowIds.includes(rowId);
    const shouldDragMultipleRows = isDraggingSelectedRow && currentSelectedRowIds.length > 1;
    const nextDraggingRowIds = shouldDragMultipleRows
      ? rows.filter(row => currentSelectedRowIds.includes(row.id)).map(row => row.id)
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
    if (draggingRowIds.length === 0 || !bodyRef.current) return;
    e.preventDefault();
    if (e.clientX === 0 && e.clientY === 0) return;
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
    separators.forEach(sep => {
      const distance = Math.abs(mouseY - sep.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestSeparator = sep;
      }
    });
    if (closestSeparator) setDragOverSeparatorIndex(closestSeparator.index);
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
    const rowOrder = rows.map(row => row.id);
    if (draggingRowIds.length > 1) {
      if (!onDataChangeRequest) {
        setDraggingRowId(null);
        setDraggingRowIds([]);
        setDragOverSeparatorIndex(null);
        return;
      }
      const draggingSet = new Set(draggingRowIds);
      const draggedIndexes = draggingRowIds
        .map(rowId => rowOrder.indexOf(rowId))
        .filter(index => index >= 0);
      if (draggedIndexes.length === 0) {
        setDraggingRowId(null);
        setDraggingRowIds([]);
        setDragOverSeparatorIndex(null);
        return;
      }
      const draggedCountBeforeSeparator = draggedIndexes.filter(index => index < dragOverSeparatorIndex).length;
      const insertIndex = dragOverSeparatorIndex - draggedCountBeforeSeparator;
      const remainingOrder = rowOrder.filter(rowId => !draggingSet.has(rowId));
      const newOrder = [...remainingOrder];
      newOrder.splice(insertIndex, 0, ...draggingRowIds);
      const isSameOrder = newOrder.length === rowOrder.length && newOrder.every((id, idx) => id === rowOrder[idx]);
      if (!isSameOrder) {
        try {
          await onDataChangeRequest('reorder-multiple', {
            rowIds: draggingRowIds,
            fromIndexes: draggedIndexes,
            toIndex: insertIndex,
            newOrder,
          });
        } catch {}
      }
      setDraggingRowId(null);
      setDraggingRowIds([]);
      setDragOverSeparatorIndex(null);
      return;
    }
    if (!onDataChangeRequest || !draggingRowId) {
      setDraggingRowId(null);
      setDraggingRowIds([]);
      setDragOverSeparatorIndex(null);
      return;
    }
    const draggedIndex = rowOrder.indexOf(draggingRowId);
    if (
      draggedIndex >= 0 &&
      dragOverSeparatorIndex !== draggedIndex &&
      dragOverSeparatorIndex !== draggedIndex + 1
    ) {
      let newIndex = dragOverSeparatorIndex;
      if (dragOverSeparatorIndex > draggedIndex) newIndex = dragOverSeparatorIndex - 1;
      const newOrder = [...rowOrder];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(newIndex, 0, draggingRowId);
      try {
        await onDataChangeRequest('reorder', {
          rowId: draggingRowId,
          fromIndex: draggedIndex,
          toIndex: newIndex,
          newOrder,
        });
      } catch {}
    }
    setDraggingRowId(null);
    setDraggingRowIds([]);
    setDragOverSeparatorIndex(null);
  };

  const handleRowDragOver = (e) => {
    if (draggingRowIds.length > 0) e.preventDefault();
  };

  const getSeparatorPos = (sepIndex) => {
    if (!bodyRef.current) return 0;
    const rowElements = bodyRef.current.querySelectorAll('.folder-body-row');
    let position = 0;
    for (let i = 0; i < sepIndex && i < rowElements.length; i++) {
      position += rowElements[i].offsetHeight;
    }
    return position;
  };

  const selectionClassName = selectionMode !== 'none' ? `selection-${selectionMode}` : '';

  return (
    <div
      className={`folder-body ${locked ? 'locked' : ''} ${selectionClassName}`}
      ref={bodyRef}
      onDragOver={handleRowDragOver}
    >
      {rows.map((row, index) => {
        const effectiveSelectedRowIds = resolveSelectedRowIds();
        const isSelected = isMultipleSelection
          ? effectiveSelectedRowIds.includes(row.id)
          : (Array.isArray(selectedRowIds) ? selectedRowIds.includes(row.id) : selectedRowId === row.id);
        const isDragging = draggingRowIds.includes(row.id);
        return (
          <div
            key={row.id}
            data-row-id={row.id}
            className={`folder-body-row ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${canRowReorder ? 'reorderable' : ''}`}
            style={{ opacity: isDragging ? 0.3 : 1 }}
            onClick={(e) => handleRowInteraction(e, 'click', row.id, index)}
            onDoubleClick={(e) => handleRowInteraction(e, 'double-click', row.id, index)}
            onContextMenu={(e) => handleRowContextMenu(e, row.id, index)}
            draggable={canRowReorder}
            onDragStart={(e) => handleRowDragStart(e, row.id, index)}
            onDrag={handleRowDrag}
            onDragEnd={handleRowDragEnd}
          >
            {columnsOrder.map(colId => {
              const column = columns[colId];
              if (!column) return null;
              const align = column.align || 'left';
              const width = columnWidths?.[colId];
              const CustomComp = getComponent ? getComponent(colId, row.id) : undefined;
              const useObservableCell = !!dataStore;
              return (
                <div
                  key={colId}
                  className="folder-body-cell"
                  style={{ width: width ? `${width}px` : undefined, textAlign: align }}
                >
                  <div className="folder-body-cell-content">
                    {useObservableCell ? (
                      <ObservableCell
                        rowId={row.id}
                        columnId={colId}
                        getRowData={effectiveGetRowData}
                        CustomComp={CustomComp}
                        align={align}
                      />
                    ) : (
                      <StaticCell
                        rowId={row.id}
                        columnId={colId}
                        getRowData={effectiveGetRowData}
                        CustomComp={CustomComp}
                        align={align}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      {dragOverSeparatorIndex !== null && (
        <div
          className="folder-body-separator-indicator"
          style={{ position: 'absolute', top: `${getSeparatorPos(dragOverSeparatorIndex)}px`, left: 0, right: 0 }}
        />
      )}
      {contextMenu && contextMenuItems && (
        <Menu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onItemClick={handleMenuItemClick}
          onContextMenu={handleBackdropContextMenu}
          items={contextMenuItems}
        />
      )}
    </div>
  );
});

export default ItemsListView;
export { DefaultBodyCellComp, MemoizedDefaultBodyCellComp, ObservableCell, StaticCell };
