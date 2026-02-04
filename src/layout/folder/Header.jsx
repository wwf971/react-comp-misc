import React, { useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import './Header.css';

/**
 * Default component for rendering plain text in header cells
 */
const DefaultHeaderTextComp = ({ data }) => {
  return <>{data}</>;
};

// Memoize to prevent unnecessary re-renders
const MemoizedDefaultHeaderTextComp = React.memo(DefaultHeaderTextComp, (prev, next) => {
  return prev.data === next.data;
});

const Header = observer(({ columns, columnsOrder, columnsSize = {}, getComponent, onColumnResize, allowColumnReorder = false, onColumnReorder }) => {
  
  const headerRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({});
  const [resizing, setResizing] = useState(null);
  const resizeStartX = useRef(0);
  const initialEdgePositions = useRef([]);
  const currentEdgePositions = useRef([]);
  const resizingColIndex = useRef(-1);
  
  // Column reordering state
  const [draggingColId, setDraggingColId] = useState(null);
  const [dragOverSeparatorIndex, setDragOverSeparatorIndex] = useState(null);
  const dragOffsetX = useRef(0);
  const dragOffsetY = useRef(0);

  // Initialize column widths from columnsSize prop
  useEffect(() => {
    if (!headerRef.current || !columnsOrder) return;
    
    const totalWidth = headerRef.current.offsetWidth;
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

  const handleResizeStart = (e, columnId, colIndex) => {
    e.preventDefault();
    
    if (!headerRef.current) return;
    
    const headerRect = headerRef.current.getBoundingClientRect();
    const cells = headerRef.current.querySelectorAll('.folder-header-cell');
    
    // Capture all edge positions relative to header
    const edges = [];
    let currentLeft = 0;
    cells.forEach((cell) => {
      currentLeft += cell.offsetWidth;
      edges.push(currentLeft);
    });
    
    initialEdgePositions.current = [...edges];
    currentEdgePositions.current = [...edges];
    resizeStartX.current = e.clientX - headerRect.left;
    resizingColIndex.current = colIndex;
    
    setResizing(columnId);
  };

  const handleResizeMove = (e) => {
    if (!resizing || resizingColIndex.current < 0 || !headerRef.current) return;
    
    const headerRect = headerRef.current.getBoundingClientRect();
    const currentMouseX = e.clientX - headerRect.left;
    const mouseDelta = currentMouseX - resizeStartX.current;
    
    const colIdx = resizingColIndex.current;
    const initialEdgePos = initialEdgePositions.current[colIdx];
    let newEdgePos = initialEdgePos + mouseDelta;
    
    // Get column config
    const colId = columnsOrder[colIdx];
    const minWidth = columnsSize[colId]?.minWidth || 40;
    
    // Get adjacent edge positions to prevent crossing
    const leftEdge = colIdx > 0 ? initialEdgePositions.current[colIdx - 1] : 0;
    const rightEdge = colIdx < initialEdgePositions.current.length - 1 
      ? initialEdgePositions.current[colIdx + 1] 
      : headerRect.width;
    
    // Constrain to prevent crossing edges
    const minPos = leftEdge + minWidth;
    const maxPos = colIdx < columnsOrder.length - 1 ? rightEdge - minWidth : rightEdge;
    newEdgePos = Math.max(minPos, Math.min(maxPos, newEdgePos));
    
    // Update current edge positions
    const newEdges = [...initialEdgePositions.current];
    newEdges[colIdx] = newEdgePos;
    currentEdgePositions.current = newEdges;
    
    // Calculate new widths from edge positions
    const newWidths = {};
    let prevEdge = 0;
    columnsOrder.forEach((colId, index) => {
      const currentEdge = newEdges[index];
      newWidths[colId] = currentEdge - prevEdge;
      prevEdge = currentEdge;
    });
    
    setColumnWidths(newWidths);
  };

  const handleResizeEnd = () => {
    if (resizing && onColumnResize) {
      const colId = columnsOrder[resizingColIndex.current];
      const newWidth = columnWidths[colId];
      onColumnResize(colId, newWidth);
    }
    
    setResizing(null);
    resizingColIndex.current = -1;
    initialEdgePositions.current = [];
    currentEdgePositions.current = [];
  };

  // Add/remove mouse event listeners for column resizing
  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing, columnWidths]);

  // Column reordering handlers
  const handleColumnDragStart = (e, colId, index) => {
    if (!allowColumnReorder) return;
    
    e.stopPropagation();
    
    const cellRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate drag offset for ghost image positioning
    dragOffsetX.current = e.clientX - cellRect.left;
    dragOffsetY.current = e.clientY - cellRect.top;
    
    setDraggingColId(colId);
    
    // Create a ghost image
    const ghost = e.currentTarget.cloneNode(true);
    ghost.style.opacity = '0.5';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, dragOffsetX.current, dragOffsetY.current);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleColumnDrag = (e) => {
    if (!draggingColId || !headerRef.current) return;
    
    e.preventDefault();
    
    if (e.clientX === 0 && e.clientY === 0) return; // Ignore invalid drag events
    
    const headerRect = headerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - headerRect.left;
    
    // Calculate separator positions
    const cells = headerRef.current.querySelectorAll('.folder-header-cell');
    const separators = [];
    let currentLeft = 0;
    
    // Build separator positions: before each column and after the last one
    cells.forEach((cell, idx) => {
      separators.push({ index: idx, position: currentLeft });
      currentLeft += cell.offsetWidth;
    });
    // Add final separator after all columns
    separators.push({ index: cells.length, position: currentLeft });
    
    // Find closest separator
    let closestSeparator = null;
    let minDistance = Infinity;
    
    separators.forEach(sep => {
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

  const handleColumnDragEnd = (e) => {
    if (!draggingColId || !onColumnReorder) {
      setDraggingColId(null);
      setDragOverSeparatorIndex(null);
      return;
    }
    
    const draggedIndex = columnsOrder.indexOf(draggingColId);
    
    if (dragOverSeparatorIndex !== null && dragOverSeparatorIndex !== draggedIndex && dragOverSeparatorIndex !== draggedIndex + 1) {
      // Calculate new position
      let newIndex = dragOverSeparatorIndex;
      if (dragOverSeparatorIndex > draggedIndex) {
        newIndex = dragOverSeparatorIndex - 1;
      }
      
      // Create new order
      const newOrder = [...columnsOrder];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(newIndex, 0, draggingColId);
      
      onColumnReorder(newOrder);
    }
    
    setDraggingColId(null);
    setDragOverSeparatorIndex(null);
  };

  const handleColumnDragOver = (e) => {
    if (draggingColId) {
      e.preventDefault();
    }
  };

  if (!columnsOrder) return null;

  // Calculate separator positions for rendering
  const getSeparatorPos = (sepIndex) => {
    if (!headerRef.current) return 0;
    const cells = headerRef.current.querySelectorAll('.folder-header-cell');
    let position = 0;
    for (let i = 0; i < sepIndex && i < cells.length; i++) {
      position += cells[i].offsetWidth;
    }
    return position;
  };

  return (
    <div 
      className="folder-header" 
      ref={headerRef}
      onDragOver={handleColumnDragOver}
    >
      {columnsOrder.map((colId, index) => {
        const column = columns[colId];
        if (!column) return null;
        
        const isResizable = columnsSize[colId]?.resizable !== false;
        const align = column.align || 'left';
        const width = columnWidths[colId];
        const isDragging = draggingColId === colId;
        
        // Get custom component via callback or use default text component
        const CustomComp = getComponent ? getComponent(colId) : undefined;
        const CellComp = CustomComp || MemoizedDefaultHeaderTextComp;
        
        return (
          <div 
            key={colId}
            className={`folder-header-cell ${isDragging ? 'dragging' : ''} ${allowColumnReorder ? 'reorderable' : ''}`}
            style={{ 
              width: width ? `${width}px` : undefined,
              textAlign: align,
              opacity: isDragging ? 0.3 : 1
            }}
            draggable={allowColumnReorder}
            onDragStart={(e) => handleColumnDragStart(e, colId, index)}
            onDrag={handleColumnDrag}
            onDragEnd={handleColumnDragEnd}
          >
            <div className="folder-header-content">
              <CellComp 
                data={column.data}
                columnId={colId}
                align={align}
              />
            </div>
            {isResizable && (
              <div 
                className="folder-header-resize-handle"
                onMouseDown={(e) => handleResizeStart(e, colId, index)}
              />
            )}
          </div>
        );
      })}
      
      {/* Render separator indicator at calculated position */}
      {dragOverSeparatorIndex !== null && (
        <div 
          className="folder-header-separator-indicator" 
          style={{ 
            position: 'absolute',
            left: `${getSeparatorPos(dragOverSeparatorIndex)}px`,
            top: 0,
            bottom: 0
          }}
        />
      )}
    </div>
  );
});

export default Header;
export { DefaultHeaderTextComp, MemoizedDefaultHeaderTextComp };