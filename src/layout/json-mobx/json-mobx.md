# JsonCompMobx - MobX-based JSON-like object renderer and editor

## Core Design

This is a simplified version of layout/json/ that uses MobX for automatic dependency tracking and re-rendering, ensuring that re-render takes place for and only for components that require re-render, and save the hassle of carefully updating object references to trigger proper re-render.

### Key Concepts

1. **Observable Data**: Data is wrapped with `makeAutoObservable()` to make it deeply observable
2. **Observer Components**: Each component is wrapped with `observer()` to auto-track dependencies
3. **In-Place Mutations**: Parent can mutate data directly (e.g., `data.user.name = "new"`)
4. **Granular Re-renders**: Only components that accessed changed properties will re-render

### Architecture

```
Parent Component
  ↓ (creates observable data with makeAutoObservable)
JsonCompMobx (observer)
  ↓ (recursively renders)
JsonKeyValueComp (observer) - tracks data[key] access
  ↓
JsonCompMobx (observer) - tracks nested data
```

### Comparison

**Current approach (cloneAlongPath):**
```javascript
const handleChange = (path, changeData) => {
  const segments = parsePathToSegments(path);
  const newData = cloneAlongPath(data, segments, 0, (obj) => {
    return { ...obj, [key]: newValue };
  });
  setData(newData);  // Triggers full tree re-render
};
```

**MobX approach:**
```javascript
const handleChange = (path, value) => {
  runInAction(() => {
    // Direct mutation - only affected components re-render
    data.user.name = value;
  });
};
```

### Design Choices

1. Why many components are passed data and index/itemKey/objKey, and then get value by `data[index]` or `data[itemKey]` or `data[objKey]`? Why not directly pass value?

   **Answer:** To realize MobX fine-grained reactivity. If parent accesses `data[key]`, parent tracks that property and re-renders when it changes (causing all children to re-render). By deferring property access to the child, only that specific child tracks and re-renders when its property changes. Siblings remain unaffected.
