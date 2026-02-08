import React, { useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Menu from '../../menu/Menu.tsx';
import './folder.css';

/**
 * Default component for rendering plain text in body cells
 */
const DefaultBodyCellComp = ({ data }) => {
  return <>{data}</>;
};

// Memoize to prevent unnecessary re-renders
const MemoizedDefaultBodyCellComp = React.memo(DefaultBodyCellComp, (prev, next) => {
  return prev.data === next.data;
});

const Body = observer(({ 
  columns, 
  columnsOrder, 
  columnsSizeInit = {}, 
  columnWidths: externalColumnWidths,
  rows = [], 
  getComponent,
  onRowClick,
  selectedRowId,
  allowRowReorder = false,
  onDataChangeRequest,
  locked = false,
  contextMenuItems = null // Optional: if provided, shows context menu with these items
}) => {
  
  const bodyRef = useRef(null);
  
  // Row reordering state
  const [draggingRowId, setDraggingRowId] = useState(null);
  const [dragOverSeparatorIndex, setDragOverSeparatorIndex] = useState(null);
  const dragOffsetX = useRef(0);
  const dragOffsetY = useRef(0);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);

  // Always use external columnWidths - FolderView manages all widths
  const columnWidths = externalColumnWidths || {};

  if (!columnsOrder || !rows) return null;

  const handleRowClick = (rowId) => {
    if (onRowClick) {
      onRowClick(rowId);
    }
  };

  const handleRowContextMenu = (e, rowId) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only show context menu if contextMenuItems are provided
    if (locked || !contextMenuItems || contextMenuItems.length === 0) return;
    
    // Close existing menu first
    setContextMenu(null);
    
    // Use requestAnimationFrame to ensure React completes unmount before remounting
    requestAnimationFrame(() => {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        rowId: rowId
      });
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleBackdropContextMenu = (e) => {
    e.preventDefault();
    
    // Only handle if contextMenuItems are provided
    if (locked || !contextMenuItems || contextMenuItems.length === 0) return;
    
    // Temporarily hide backdrop to find element underneath
    const backdrop = e.currentTarget;
    backdrop.style.pointerEvents = 'none';
    const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
    backdrop.style.pointerEvents = '';
    
    // Check if we clicked on a row
    const rowElement = clickedElement?.closest('[data-row-id]');
    
    if (rowElement) {
      const rowId = rowElement.getAttribute('data-row-id');
      if (rowId) {
        // Close existing menu first
        setContextMenu(null);
        
        // Use requestAnimationFrame to ensure React completes unmount before remounting
        requestAnimationFrame(() => {
          setContextMenu({
            x: e.clientX,
            y: e.clientY,
            rowId: rowId
          });
        });
      }
    } else {
      // Right-click outside rows - just close menu
      setContextMenu(null);
    }
  };

  const handleMenuItemClick = async (item) => {
    if (!contextMenu || !onDataChangeRequest) return;
    
    const rowId = contextMenu.rowId;
    handleCloseContextMenu();
    
    if (item.name === 'Delete') {
      // Call the data change callback with delete type
      await onDataChangeRequest('delete', { rowId });
    }
  };

  // Row reordering handlers
  const handleRowDragStart = (e, rowId, index) => {
    if (!allowRowReorder) return;
    
    e.stopPropagation();
    
    const rowRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate drag offset for ghost image positioning
    dragOffsetX.current = e.clientX - rowRect.left;
    dragOffsetY.current = e.clientY - rowRect.top;
    
    setDraggingRowId(rowId);
    
    // Create a ghost image
    const ghost = e.currentTarget.cloneNode(true);
    ghost.style.opacity = '0.5';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, dragOffsetX.current, dragOffsetY.current);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleRowDrag = (e) => {
    if (!draggingRowId || !bodyRef.current) return;
    
    e.preventDefault();
    
    if (e.clientX === 0 && e.clientY === 0) return; // Ignore invalid drag events
    
    const bodyRect = bodyRef.current.getBoundingClientRect();
    const mouseY = e.clientY - bodyRect.top;
    
    // Calculate separator positions
    const rowElements = bodyRef.current.querySelectorAll('.folder-body-row');
    const separators = [];
    let currentTop = 0;
    
    // Build separator positions: before each row and after the last one
    rowElements.forEach((rowEl, idx) => {
      separators.push({ index: idx, position: currentTop });
      currentTop += rowEl.offsetHeight;
    });
    // Add final separator after all rows
    separators.push({ index: rowElements.length, position: currentTop });
    
    // Find closest separator
    let closestSeparator = null;
    let minDistance = Infinity;
    
    separators.forEach(sep => {
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

  const handleRowDragEnd = async (e) => {
    if (!draggingRowId || !onDataChangeRequest) {
      setDraggingRowId(null);
      setDragOverSeparatorIndex(null);
      return;
    }
    
    const draggedIndex = rows.findIndex(row => row.id === draggingRowId);
    
    if (dragOverSeparatorIndex !== null && dragOverSeparatorIndex !== draggedIndex && dragOverSeparatorIndex !== draggedIndex + 1) {
      // Calculate new position
      let newIndex = dragOverSeparatorIndex;
      if (dragOverSeparatorIndex > draggedIndex) {
        newIndex = dragOverSeparatorIndex - 1;
      }
      
      // Call the data change callback with reorder type
      onDataChangeRequest('reorder', { rowId: draggingRowId, fromIndex: draggedIndex, toIndex: newIndex });
    }
    
    setDraggingRowId(null);
    setDragOverSeparatorIndex(null);
  };

  const handleRowDragOver = (e) => {
    if (draggingRowId) {
      e.preventDefault();
    }
  };

  // Calculate separator positions for rendering
  const getSeparatorPos = (sepIndex) => {
    if (!bodyRef.current) return 0;
    const rowElements = bodyRef.current.querySelectorAll('.folder-body-row');
    let position = 0;
    for (let i = 0; i < sepIndex && i < rowElements.length; i++) {
      position += rowElements[i].offsetHeight;
    }
    return position;
  };

  return (
    <div 
      className={`folder-body ${locked ? 'locked' : ''}`}
      ref={bodyRef}
      onDragOver={handleRowDragOver}
    >
      {rows.map((row, index) => {
        const isSelected = selectedRowId === row.id;
        const isDragging = draggingRowId === row.id;
        
        return (
          <div 
            key={row.id}
            data-row-id={row.id}
            className={`folder-body-row ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${allowRowReorder ? 'reorderable' : ''}`}
            style={{ opacity: isDragging ? 0.3 : 1 }}
            onClick={() => handleRowClick(row.id)}
            onContextMenu={(e) => handleRowContextMenu(e, row.id)}
            draggable={allowRowReorder}
            onDragStart={(e) => handleRowDragStart(e, row.id, index)}
            onDrag={handleRowDrag}
            onDragEnd={handleRowDragEnd}
          >
            {columnsOrder.map((colId) => {
              const column = columns[colId];
              if (!column) return null;
              
              const align = column.align || 'left';
              const width = columnWidths?.[colId];
              const cellData = row.data?.[colId];
              
              // Get custom component via callback or use default text component
              const CustomComp = getComponent ? getComponent(colId, row.id) : undefined;
              const CellComp = CustomComp || MemoizedDefaultBodyCellComp;
              
              return (
                <div 
                  key={colId}
                  className="folder-body-cell"
                  style={{ 
                    width: width ? `${width}px` : undefined,
                    textAlign: align
                  }}
                >
                  <div className="folder-body-cell-content">
                    <CellComp 
                      data={cellData}
                      columnId={colId}
                      rowId={row.id}
                      align={align}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      
      {/* Render separator indicator at calculated position */}
      {dragOverSeparatorIndex !== null && (
        <div 
          className="folder-body-separator-indicator" 
          style={{ 
            position: 'absolute',
            top: `${getSeparatorPos(dragOverSeparatorIndex)}px`,
            left: 0,
            right: 0
          }}
        />
      )}
      
      {/* Context menu */}
      {contextMenu && contextMenuItems && (
        <Menu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={handleCloseContextMenu}
          onItemClick={handleMenuItemClick}
          onContextMenu={handleBackdropContextMenu}
          items={contextMenuItems}
        />
      )}
    </div>
  );
});

export default Body;
export { DefaultBodyCellComp, MemoizedDefaultBodyCellComp };
