export const DEFAULT_COL_MIN_WIDTH = 40;

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

export const getRowRangeById = (rows, fromRowId, toRowId) => {
  const fromIndex = rows.findIndex((row) => row.id === fromRowId);
  const toIndex = rows.findIndex((row) => row.id === toRowId);
  if (fromIndex < 0 || toIndex < 0) {
    return [];
  }
  const startIndex = Math.min(fromIndex, toIndex);
  const endIndex = Math.max(fromIndex, toIndex);
  return rows.slice(startIndex, endIndex + 1).map((row) => row.id);
};

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
