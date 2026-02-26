


props input to Header.jsx:

```javascript
<Header
  columns={{
    name: { data: 'Name', align: 'left' },
    size: { data: 'Size', align: 'right' },
    createAt: { data: 'Created', align: 'left' },
    modifyAt: { data: 'Modified', align: 'left' }
  }}
  columnsOrder={['name', 'size', 'createAt', 'modifyAt']}
  columnsSize={{
    name: { width: 200, minWidth: 80, resizable: true },
    size: { width: 100, minWidth: 60, resizable: true },
    createAt: { width: 150, resizable: true },
    modifyAt: { width: 150, resizable: true }
  }}
  getComponent={(columnId) => {
    // Return custom component for specific columns, or undefined for default
    if (columnId === 'size') return CustomHeaderComp;
    return undefined;
  }}
  onColumnResize={(columnId, newWidth) => {
    console.log(`Column ${columnId} resized to ${newWidth}px`);
  }}
/>
```

Props explanations:
- `columns`: object mapping columnId to column config
  - `data`: data to display (required) - typically text, but can be any data for custom comp
  - `align`: text alignment ('left', 'center', 'right', default: 'left')
- `columnsOrder`: array of column IDs specifying display order (required)
- `columnsSize`: object mapping columnId to size config
  - `width`: initial width in pixels
  - `minWidth`: minimum width in pixels when resizing (optional, default: 40)
  - `resizable`: whether this column can be resized (optional, default: true)
- `getComponent`: optional callback function (columnId) => Component
  - Returns custom component for the column, or undefined for default text rendering
  - Custom component receives props: { data, columnId, align }
- `onColumnResize`: optional callback (columnId, newWidth) => void
- `allowColumnReorder`: optional boolean to enable column reordering via drag and drop (default: false)
- `onColumnReorder`: optional callback (newColumnsOrder) => void, called when columns are reordered

Custom component example:
```javascript
const CustomHeaderComp = ({ data, columnId, align }) => {
  return <span style={{ color: 'blue' }}>{data}</span>;
};
```

commonly used columns: name, size, createAt, updateAt.

## MobX Cell Optimization

**Why not pass cell data directly?** If Body accesses `store.rowsById.get(rowId)[colId]` to pass as props, Body (the parent component of all items) observes that data and re-renders when ANY cell changes. This defeats MobX's fine-grained reactivity.

**Solution:** Always use `getRowData` function. Cell fetches its own data, so only that cell observes it.

Body.jsx uses two cell wrappers:
- **ObservableCell**: Wrapped with `observer()`, fetches data via `getRowData(rowId, colId)`. Auto re-renders when its data changes (for MobX stores).
- **StaticCell**: Not wrapped with `observer()`, also fetches via `getRowData(rowId, colId)`. No auto re-render (for non-reactive data).

Both cells use the same data access pattern. The only difference is the `observer()` wrapper. If no `getRowData` provided, Body creates a default one for backward compatibility.

