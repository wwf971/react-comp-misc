

Props for `FolderView`:

```javascript
<FolderView
  data={{
    columns: {
      name: { data: 'Name', align: 'left' },
      size: { data: 'Size', align: 'right' },
    },
    colsOrder: ['name', 'size'],
    rows: [{ id: 'r1', data: { name: 'orders', size: '4 items' } }],
    rowIdsSelected: [],
    viewCurrent: 'list',
    contextMenuItems: [{ id: 'delete', label: 'Delete' }],
    statusBar: {
      itemCount: 1,
      messageState: null,
    },
    getRowData: (rowId, colId) => null,
    getRowIconData: (rowId) => ({ label: 'item', kind: 'file' }),
  }}
  config={{
    colSizeById: {
      name: { width: 200, minWidth: 80, resizable: true },
      size: { width: 100, minWidth: 60, resizable: true },
    },
    colWidthById: { name: 200, size: 100 },
    isColReorderAllowed: true,
    isRowReorderAllowed: false,
    isLastColFilled: true,
    isLocked: false,
    isListOnly: false,
    isStatusBarVisible: true,
    isStatusItemCountVisible: true,
    selectionMode: 'single',
    bodyHeight: 300,
    colResizeDragMode: 'preview',
    colResizeWidthMode: 'natural',
    compHeaderByColId: (colId) => undefined,
    compBodyByColId: (colId) => undefined,
    isRowDataObservable: false,
    isContextMenuBuiltInDisabled: false,
  }}
  onEvent={async (eventType, eventData) => ({ code: 0 })}
/>
```

Props for `Header` (`FolderHeader` export):

```javascript
<FolderHeader
  data={{
    columns,
    colsOrder,
    colWidthById,
  }}
  config={{
    colSizeById,
    isColReorderAllowed: true,
    isLastColFilled: true,
    colResizeDragMode: 'preview',
    colResizeWidthMode: 'natural',
    compByColId: (colId) => undefined,
  }}
  onEvent={async (eventType, eventData) => ({ code: 0 })}
/>
```

## data fields

- `columns`: object mapping col id to column config
  - `data`: content to render (required)
  - `align`: `'left' | 'center' | 'right'`
- `colsOrder`: array of col ids
- `rows`: array of `{ id, data }`
- `rowIdsSelected`: array of selected row ids
- `viewCurrent`: `'list' | 'icon'`
- `statusBar.itemCount`, `statusBar.messageState`
- `getRowData(rowId, colId)`, `getRowIconData(rowId)`

## config fields

- `colSizeById`: `{ width, minWidth, resizable }` per col
- `colWidthById`: current pixel width per col (operational state)
- `isColReorderAllowed`, `isRowReorderAllowed`, `isLastColFilled`, `isLocked`
- `compHeaderByColId`, `compBodyByColId`
- `selectionMode`: `'none' | 'single' | 'multiple'`

## onEvent types

- `colReorder`: `{ colId, fromIndex, toIndex, colsOrderNext }`
- `colResize`: `{ colId, colWidthByIdNext }`
- `rowReorder`: `{ rowId, fromIndex, toIndex, rowsOrderNext }`
- `rowReorderMultiple`: `{ rowIds, fromIndexes, toIndex, rowsOrderNext }`
- `rowDelete`: `{ rowId }`
- `rowClick`, `rowDoubleClick`, `rowContextMenu`, `rowInteraction`
- `rowIdsSelectedChange`: `{ rowIdsSelected }`
- `viewChange`: `{ viewCurrent }`
- `cellValueChange`: `{ rowId, colId, valueNext }`

Custom cell components receive `{ data, colId, rowId, align, onEvent }`.

## MobX Cell Optimization

If Body passes cell data directly as props, Body re-renders when any cell changes. Use `getRowData(rowId, colId)` so each cell observes only its own data.

- **ObservableCell**: wrapped with `observer()`, used when `config.isRowDataObservable` is true
- **StaticCell**: no observer wrapper
