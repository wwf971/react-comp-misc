const CELL_CONTENT_ALIGN_SET = new Set(['left', 'right', 'center']);

export function normalizeKeyValuesProps(props = {}) {
  const dataInput = props.data;
  const configInput = props.config || {};
  const rows = Array.isArray(dataInput?.rows)
    ? dataInput.rows
    : (Array.isArray(dataInput) ? dataInput : []);
  const selectedRowId = dataInput?.selectedRowId ?? null;
  const keyCellContentAlignRaw = configInput.keyCellContentAlign ?? 'right';
  const keyCellContentAlign = CELL_CONTENT_ALIGN_SET.has(keyCellContentAlignRaw)
    ? keyCellContentAlignRaw
    : 'right';
  const valueCellContentAlignRaw = configInput.valueCellContentAlign ?? 'left';
  const valueCellContentAlign = CELL_CONTENT_ALIGN_SET.has(valueCellContentAlignRaw)
    ? valueCellContentAlignRaw
    : 'left';

  return {
    rows,
    selectedRowId,
    isEditable: configInput.isEditable === undefined ? true : Boolean(configInput.isEditable),
    isKeyEditable: Boolean(configInput.isKeyEditable),
    isValueEditable: configInput.isValueEditable === undefined ? true : Boolean(configInput.isValueEditable),
    alignCol: configInput.alignCol === undefined ? true : Boolean(configInput.alignCol),
    keyColWidth: configInput.keyColWidth || 'min',
    keyColWidthEffective: configInput.keyColWidthEffective ?? null,
    keyCellContentAlign,
    valueCellContentAlign,
    isWrap: Boolean(configInput.isWrap),
    isDividerDraggable: Boolean(configInput.isDividerDraggable),
    selectionMode: configInput.selectionMode === 'single' ? 'single' : 'none',
    compResolveFn: configInput.compResolveFn || null,
    rowIdResolveFn: configInput.rowIdResolveFn || null,
    onEvent: typeof props.onEvent === 'function' ? props.onEvent : null,
  };
}

export function createKeyValuesCellChangeHandler(onEvent, resolveRowId, rows) {
  if (!onEvent) {
    return null;
  }
  return (rowIndex, field, nextValue) => {
    const row = rows[rowIndex];
    const rowId = row ? resolveRowId(row) : null;
    return onEvent('cellUpdate', {
      rowIndex,
      rowId,
      field: String(field || ''),
      nextValue,
    });
  };
}
