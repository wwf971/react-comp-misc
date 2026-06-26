import React, { useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DEFAULT_COL_MIN_WIDTH, emitFolderEvent } from './folderUtils.js';
import './folder.css';

const DefaultHeaderTextComp = ({ data }) => <>{data}</>;

const MemoizedDefaultHeaderTextComp = React.memo(DefaultHeaderTextComp, (prev, next) => (
  prev.data === next.data
));

const Header = observer(({
  data = {},
  config = {},
  onEvent,
}) => {
  const columns = data?.columns || {};
  const colsOrder = data?.colsOrder || [];
  const colWidthById = data?.colWidthById || {};

  const colSizeById = config?.colSizeById || {};
  const isColReorderAllowed = config?.isColReorderAllowed === true;
  const isLastColFilled = config?.isLastColFilled !== false;
  const compByColId = config?.compByColId;
  const headerPageUtils = config?.headerPageUtils;
  const colResizeDragMode = config?.colResizeDragMode || 'preview';
  const colResizeWidthMode = config?.colResizeWidthMode || 'natural';

  const headerRef = useRef(null);
  const [resizing, setResizing] = useState(null);
  const resizeStartX = useRef(0);
  const edgePosesInitial = useRef([]);
  const edgePosesCurrent = useRef([]);
  const resizingColIndex = useRef(-1);
  const pendingColWidthById = useRef(null);
  const colWidthByIdInitial = useRef({});
  const [colResizeIndicatorLeft, setColResizeIndicatorLeft] = useState(null);

  const [draggingColId, setDraggingColId] = useState(null);
  const [dragOverSeparatorIndex, setDragOverSeparatorIndex] = useState(null);
  const dragOffsetX = useRef(0);
  const dragOffsetY = useRef(0);
  const isColResizePreview = colResizeDragMode !== 'immediate';
  const isColResizeNaturalMode = colResizeWidthMode !== 'local';

  const handleColResizeIndicatorLeftChange = (left) => {
    setColResizeIndicatorLeft(left);
    emitFolderEvent(onEvent, 'colResizeIndicatorChange', { left });
  };

  const handleResizeStart = (e, colId, colIndex) => {
    e.preventDefault();
    if (!headerRef.current) {
      return;
    }

    const headerRect = headerRef.current.getBoundingClientRect();
    const edges = [];
    let currentLeft = 0;
    colsOrder.forEach((currentColId, index) => {
      const isLastCol = index === colsOrder.length - 1;
      const width = colWidthById[currentColId] || 0;
      currentLeft += width;
      edges.push(isLastColFilled && isLastCol ? Math.max(currentLeft, headerRect.width) : currentLeft);
    });

    edgePosesInitial.current = [...edges];
    edgePosesCurrent.current = [...edges];
    colWidthByIdInitial.current = colsOrder.reduce((acc, currentColId, index) => {
      const prevEdge = index > 0 ? edges[index - 1] : 0;
      const currentEdge = edges[index] || 0;
      const isLastCol = index === colsOrder.length - 1;
      acc[currentColId] = isLastColFilled && isLastCol
        ? Math.max(0, currentEdge - prevEdge)
        : (colWidthById[currentColId] || 0);
      return acc;
    }, {});
    resizeStartX.current = e.clientX - headerRect.left;
    resizingColIndex.current = colIndex;
    pendingColWidthById.current = null;
    handleColResizeIndicatorLeftChange(edges[colIndex]);
    setResizing(colId);
  };

  const handleResizeMove = (e) => {
    if (!resizing || resizingColIndex.current < 0 || !headerRef.current) {
      return;
    }

    const headerRect = headerRef.current.getBoundingClientRect();
    const currentMouseX = e.clientX - headerRect.left;
    const mouseDelta = currentMouseX - resizeStartX.current;
    const colIdx = resizingColIndex.current;
    const edgePosInitial = edgePosesInitial.current[colIdx];
    let edgePosNew = edgePosInitial + mouseDelta;

    const colId = colsOrder[colIdx];
    const minWidth = colSizeById?.[colId]?.minWidth ?? DEFAULT_COL_MIN_WIDTH;
    const leftEdge = colIdx > 0 ? edgePosesInitial.current[colIdx - 1] : 0;
    let maxPos;
    if (isColResizeNaturalMode && colIdx < colsOrder.length - 1) {
      const lastColId = colsOrder[colsOrder.length - 1];
      const lastMinWidth = colSizeById?.[lastColId]?.minWidth ?? DEFAULT_COL_MIN_WIDTH;
      const lastWidthInitial = colWidthByIdInitial.current[lastColId] || 0;
      maxPos = edgePosInitial + Math.max(0, lastWidthInitial - lastMinWidth);
    } else {
      const rightEdge = colIdx < edgePosesInitial.current.length - 1
        ? edgePosesInitial.current[colIdx + 1]
        : headerRect.width;
      const nextColId = colIdx < colsOrder.length - 1 ? colsOrder[colIdx + 1] : null;
      const nextMinWidth = nextColId ? (colSizeById?.[nextColId]?.minWidth ?? DEFAULT_COL_MIN_WIDTH) : 0;
      maxPos = colIdx < colsOrder.length - 1 ? rightEdge - nextMinWidth : rightEdge;
    }
    const minPos = leftEdge + minWidth;
    edgePosNew = Math.max(minPos, Math.min(maxPos, edgePosNew));

    const newEdges = [...edgePosesInitial.current];
    newEdges[colIdx] = edgePosNew;
    edgePosesCurrent.current = newEdges;

    let nextColWidthById = {};
    if (isColResizeNaturalMode && colIdx < colsOrder.length - 1) {
      const colIdCurrent = colsOrder[colIdx];
      const colIdLast = colsOrder[colsOrder.length - 1];
      const deltaWidth = edgePosNew - edgePosInitial;
      colsOrder.forEach((currentColId) => {
        nextColWidthById[currentColId] = colWidthByIdInitial.current[currentColId] || 0;
      });
      nextColWidthById[colIdCurrent] = (colWidthByIdInitial.current[colIdCurrent] || 0) + deltaWidth;
      nextColWidthById[colIdLast] = (colWidthByIdInitial.current[colIdLast] || 0) - deltaWidth;
    } else {
      let prevEdge = 0;
      colsOrder.forEach((currentColId, index) => {
        const currentEdge = newEdges[index];
        nextColWidthById[currentColId] = currentEdge - prevEdge;
        prevEdge = currentEdge;
      });
    }

    handleColResizeIndicatorLeftChange(edgePosNew);

    if (isColResizePreview) {
      pendingColWidthById.current = nextColWidthById;
      return;
    }

    emitFolderEvent(onEvent, 'colResize', {
      colId,
      colWidthByIdNext: nextColWidthById,
    });
  };

  const handleResizeEnd = () => {
    if (isColResizePreview && pendingColWidthById.current) {
      emitFolderEvent(onEvent, 'colResize', {
        colId: resizing,
        colWidthByIdNext: pendingColWidthById.current,
      });
    }
    setResizing(null);
    resizingColIndex.current = -1;
    edgePosesInitial.current = [];
    edgePosesCurrent.current = [];
    colWidthByIdInitial.current = {};
    pendingColWidthById.current = null;
    handleColResizeIndicatorLeftChange(null);
  };

  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
    return undefined;
  }, [resizing]);

  const handleColumnDragStart = (e, colId) => {
    if (!isColReorderAllowed) {
      return;
    }
    e.stopPropagation();
    const cellRect = e.currentTarget.getBoundingClientRect();
    dragOffsetX.current = e.clientX - cellRect.left;
    dragOffsetY.current = e.clientY - cellRect.top;
    setDraggingColId(colId);
    const ghost = e.currentTarget.cloneNode(true);
    ghost.style.opacity = '0.5';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, dragOffsetX.current, dragOffsetY.current);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleColumnDrag = (e) => {
    if (!draggingColId || !headerRef.current) {
      return;
    }
    e.preventDefault();
    if (e.clientX === 0 && e.clientY === 0) {
      return;
    }
    const headerRect = headerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - headerRect.left;
    const cells = headerRef.current.querySelectorAll('.folder-header-cell');
    const separators = [];
    let currentLeft = 0;
    cells.forEach((cell, idx) => {
      separators.push({ index: idx, position: currentLeft });
      currentLeft += cell.offsetWidth;
    });
    separators.push({ index: cells.length, position: currentLeft });
    let closestSeparator = null;
    let minDistance = Infinity;
    separators.forEach((sep) => {
      const distance = Math.abs(mouseX - sep.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestSeparator = sep;
      }
    });
    if (closestSeparator) {
      setDragOverSeparatorIndex(closestSeparator.index);
    }
  };

  const handleColumnDragEnd = async () => {
    if (!draggingColId || !onEvent) {
      setDraggingColId(null);
      setDragOverSeparatorIndex(null);
      return;
    }

    const draggedIndex = colsOrder.indexOf(draggingColId);
    if (
      dragOverSeparatorIndex !== null
      && dragOverSeparatorIndex !== draggedIndex
      && dragOverSeparatorIndex !== draggedIndex + 1
    ) {
      let newIndex = dragOverSeparatorIndex;
      if (dragOverSeparatorIndex > draggedIndex) {
        newIndex = dragOverSeparatorIndex - 1;
      }
      const colsOrderNext = [...colsOrder];
      colsOrderNext.splice(draggedIndex, 1);
      colsOrderNext.splice(newIndex, 0, draggingColId);
      try {
        await emitFolderEvent(onEvent, 'colReorder', {
          colId: draggingColId,
          fromIndex: draggedIndex,
          toIndex: newIndex,
          colsOrderNext,
        });
      } catch {}
    }

    setDraggingColId(null);
    setDragOverSeparatorIndex(null);
  };

  const handleColumnDragOver = (e) => {
    if (draggingColId) {
      e.preventDefault();
    }
  };

  const isPageUtilsVisible = Boolean(headerPageUtils?.isVisible);

  const requestPageUtilAction = async (actionType) => {
    await emitFolderEvent(onEvent, 'headerPageUtilAction', { actionType });
  };

  if (!colsOrder.length) {
    return null;
  }

  const getSeparatorPos = (sepIndex) => {
    if (!headerRef.current) {
      return 0;
    }
    const cells = headerRef.current.querySelectorAll('.folder-header-cell');
    let position = 0;
    for (let i = 0; i < sepIndex && i < cells.length; i += 1) {
      position += cells[i].offsetWidth;
    }
    return position;
  };

  return (
    <div className="folder-header-root">
      {isPageUtilsVisible ? (
        <div className="folder-header-page-utils">
          <button
            type="button"
            className="folder-header-page-util-btn"
            disabled={headerPageUtils?.isLocked || headerPageUtils?.canCreatePageBefore === false}
            onClick={() => requestPageUtilAction('create-before')}
          >
            +Before
          </button>
          <div className="folder-header-page-util-sep" />
          <button
            type="button"
            className="folder-header-page-util-btn"
            disabled={headerPageUtils?.isLocked || headerPageUtils?.canCreatePageAfter === false}
            onClick={() => requestPageUtilAction('create-after')}
          >
            +After
          </button>
          <button
            type="button"
            className="folder-header-page-util-btn"
            disabled={headerPageUtils?.isLocked || headerPageUtils?.canMoveCurrentPagePrev === false}
            onClick={() => requestPageUtilAction('move-prev')}
          >
            Move Prev
          </button>
          <button
            type="button"
            className="folder-header-page-util-btn"
            disabled={headerPageUtils?.isLocked || headerPageUtils?.canMoveCurrentPageNext === false}
            onClick={() => requestPageUtilAction('move-next')}
          >
            Move Next
          </button>
        </div>
      ) : null}
      <div
        className="folder-header"
        ref={headerRef}
        onDragOver={handleColumnDragOver}
      >
        {colsOrder.map((colId, index) => {
          const column = columns[colId];
          if (!column) {
            return null;
          }

          const isResizable = colSizeById?.[colId]?.resizable !== false;
          const align = column.align || 'left';
          const width = colWidthById?.[colId];
          const isLastCol = index === colsOrder.length - 1;
          const isLastColFillApplied = isLastColFilled && isLastCol;
          const minWidth = colSizeById?.[colId]?.minWidth ?? DEFAULT_COL_MIN_WIDTH;
          const isDragging = draggingColId === colId;
          const CustomComp = compByColId ? compByColId(colId) : undefined;
          const CellComp = CustomComp || MemoizedDefaultHeaderTextComp;

          return (
            <div
              key={colId}
              className={`folder-header-cell ${isDragging ? 'dragging' : ''} ${isColReorderAllowed ? 'reorderable' : ''}`}
              style={{
                width: width ? `${width}px` : undefined,
                minWidth: isLastColFillApplied ? `${minWidth}px` : undefined,
                flexGrow: isLastColFillApplied ? 1 : undefined,
                textAlign: align,
                opacity: isDragging ? 0.3 : 1,
              }}
              draggable={isColReorderAllowed}
              onDragStart={(e) => handleColumnDragStart(e, colId)}
              onDrag={handleColumnDrag}
              onDragEnd={handleColumnDragEnd}
            >
              <div className="folder-header-content">
                <CellComp data={column.data} colId={colId} align={align} />
              </div>
              {isResizable ? (
                <div
                  className="folder-header-resize-handle"
                  onMouseDown={(e) => handleResizeStart(e, colId, index)}
                />
              ) : null}
            </div>
          );
        })}

        {colResizeIndicatorLeft !== null ? (
          <div
            className="folder-column-resize-indicator"
            style={{ left: `${colResizeIndicatorLeft}px` }}
          />
        ) : null}
        {dragOverSeparatorIndex !== null ? (
          <div
            className="folder-header-separator-indicator"
            style={{
              position: 'absolute',
              left: `${getSeparatorPos(dragOverSeparatorIndex)}px`,
              top: 0,
              bottom: 0,
            }}
          />
        ) : null}
      </div>
    </div>
  );
});

export default Header;
export { DefaultHeaderTextComp, MemoizedDefaultHeaderTextComp };
