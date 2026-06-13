# JsonCompMobx

`JsonCompMobx` renders and edits JSON-like observable data. The component expects the owner to provide observable data and an `onChange` function. The view sends edit requests upward; the owner decides whether to apply each change.

For drag move behavior, refer to `./json-mobx-drag.md`.

## Core Design

The component relies on MobX to make in-place edits practical. The data owner can mutate the existing object or array inside an action, and observer components rerender when the observable fields they read change.

The render tree is intentionally split into small observer components:

```text
JsonCompMobx
ItemWrapperObject or ItemWrapperArray
JsonKeyValueComp or JsonListItemComp
JsonTextComp, JsonNumberComp, JsonBoolComp, or nested JsonCompMobx
```

Parent components avoid reading child values when possible. For object entries and array items, the wrapper receives the container plus the key or index. The child then reads `data[itemKey]` or `data[index]` itself. This keeps MobX subscriptions narrow, so editing one leaf does not rerender unrelated siblings.

## Data And Events

`JsonCompMobx` receives:

```jsx
<JsonCompMobx
  data={dataObservable}
  isEditable
  isKeyEditable
  isValueEditable
  isDragMoveEnabled
  onChange={handleChange}
/>
```

`onChange(path, changeData)` is the main edit boundary. The renderer does not own persistence or backend decisions. The owner can reject a request by returning a non-zero `code`.

Keep `onChange` identity stable when possible. If the owner needs runtime settings for request handling, such as a demo failure rate or remote-write option, store the latest setting in a ref or data-management object and read it inside the callback. Passing a newly-created callback on every control change can make the JSON tree rerender even though the renderer does not care about that setting.

Common actions include:

```text
value edit
key rename
type conversion
entry or item creation
entry or item deletion
array item move
object entry order move
drag move
```

## Selection And Context Menu

Selection is handled by `jsonSelectionOperationStore.js`. The canonical selection state is:

```text
selectedItemId
selectedAncestorItemIds
isSelectionActive
selectionRevision
```

Selection styling is derived from those fields. Do not add a second cached visual selection state. Object-entry reordering can move React components without changing the object value, so selection rendering also observes `selectionRevision` through `useJsonSelectionRenderRevision` in `useJsonItemInteraction.js`.

Context menu targeting is resolved through `jsonContextMenu.js`. When an item is selected, a context menu request can target the selected item rather than the exact nested element that received the right click.

## Object Key Order

Plain object properties should not be treated as if their order is part of JSON data. Visual order for object entries is stored separately in `keyOrderStore.js`.

`getOrderedKeys()` returns the display order. `addKeyInOrder()`, `renameKeyInOrder()`, and `moveKeyInOrder()` update that order and bump a MobX observable version for rerendering. This separation is important because moving a key-value pair within the same object usually changes only the visual key order, not the object value itself.

## File Map

`JsonCompMobx.jsx` renders objects, arrays, primitives, empty containers, and the root context provider.

`ItemWrapperObject.jsx` and `ItemWrapperArray.jsx` isolate each object entry or array item and register item metadata for selection, menus, and drag move.

`useJsonItemInteraction.js` owns item-level interactions: selection click handling, context menu capture, pointer drag lifecycle, and selection rerender subscription.

`jsonSelectionOperationStore.js` stores canonical selection state.

`jsonDragOperationStore.js` stores active drag state and drop-preview state.

`jsonMoveCompletion.js`, `jsonDropPreview.js`, and `jsonDragMove.js` contain drag move helpers. See `./json-mobx-drag.md` for details.

`example.jsx` demonstrates owner-side request handling. The drag failure rate and message bar live in the example wrapper, not in `JsonCompMobx`, so the renderer stays decoupled from demo-only acceptance rules.
