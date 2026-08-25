export const DEFAULT_COL_MIN_WIDTH = 40;

// distance in px from column border, within which mouse press triggers drag-to-resize
export const DEFAULT_COL_RESIZE_TOLERANCE = 5;

export const resolveColAlign = (align) => {
  const value = `${align ?? ''}`.trim();
  if (value === 'center' || value === 'right') {
    return value;
  }
  return 'left';
};

export const resolveColJustifyContent = (align) => {
  const value = resolveColAlign(align);
  if (value === 'center') {
    return 'center';
  }
  if (value === 'right') {
    return 'flex-end';
  }
  return 'flex-start';
};

export const withResolvedColAlign = (columns) => {
  if (!columns) {
    return columns;
  }
  const next = {};
  Object.entries(columns).forEach(([colId, column]) => {
    next[colId] = {
      ...column,
      align: resolveColAlign(column?.align),
    };
  });
  return next;
};

export const buildColWidthByIdFromSize = (colsOrder, colSizeById) => {
  if (!colsOrder || colsOrder.length === 0) {
    return {};
  }
  const next = {};
  colsOrder.forEach((colId) => {
    const width = colSizeById?.[colId]?.width;
    const minWidth = colSizeById?.[colId]?.minWidth ?? DEFAULT_COL_MIN_WIDTH;
    if (width !== undefined && width !== null && width > 0) {
      next[colId] = Math.max(width, minWidth);
    } else {
      next[colId] = minWidth;
    }
  });
  return next;
};

export const emitFolderEvent = (onEvent, eventType, eventData) => {
  if (!onEvent) {
    return null;
  }
  return onEvent(eventType, eventData);
};

// Range of row ids from the anchor row to the target row. The returned ids
// keep the anchor-to-target direction, so a range selected upward lists the
// lower rows first. This keeps rowIdsSelected in the order rows were selected.
export const getRowRangeById = (rows, fromRowId, toRowId) => {
  const fromIndex = rows.findIndex((row) => row.id === fromRowId);
  const toIndex = rows.findIndex((row) => row.id === toRowId);
  if (fromIndex < 0 || toIndex < 0) {
    return [];
  }
  const startIndex = Math.min(fromIndex, toIndex);
  const endIndex = Math.max(fromIndex, toIndex);
  const rowIdsRange = rows.slice(startIndex, endIndex + 1).map((row) => row.id);
  if (fromIndex > toIndex) {
    rowIdsRange.reverse();
  }
  return rowIdsRange;
};

// Next selection after a click. The returned array keeps selection order:
// a ctrl click appends the clicked row at the end, and a shift range keeps
// the anchor-to-target direction. Consumers that need "the order rows were
// selected" (for example ordered upload) can rely on the array order.
export const calcRowIdsSelectedForClick = ({
  rows,
  rowIdsSelected,
  rowId,
  lastRowIdClicked,
  isShiftPressed,
  isCtrlPressed,
}) => {
  if (isCtrlPressed && isShiftPressed && lastRowIdClicked) {
    const range = getRowRangeById(rows, lastRowIdClicked, rowId);
    return [...new Set([...rowIdsSelected, ...range])];
  }
  if (isShiftPressed && lastRowIdClicked) {
    return getRowRangeById(rows, lastRowIdClicked, rowId);
  }
  if (isCtrlPressed) {
    const isAlreadySelected = rowIdsSelected.includes(rowId);
    return isAlreadySelected
      ? rowIdsSelected.filter((id) => id !== rowId)
      : [...rowIdsSelected, rowId];
  }
  return [rowId];
};

export const calcRowIdsSelectedForContextMenu = ({
  rowIdsSelected,
  rowId,
  isMultipleSelection,
}) => {
  if (!isMultipleSelection) {
    return [rowId];
  }
  if (rowIdsSelected.includes(rowId)) {
    return rowIdsSelected;
  }
  return [rowId];
};
