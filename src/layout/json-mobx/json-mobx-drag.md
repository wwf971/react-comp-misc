# JsonCompMobx Drag Move

This note describes the drag move implementation for `JsonCompMobx`. For the general renderer architecture, refer to `./json-mobx.md`.

## Core Idea

Drag move is built around item metadata, not around DOM position alone. Each selectable item registers metadata with the selection store and drag store:

```text
itemId
itemParentId
path
itemKind
itemKey
containerKind
containerPath
itemPreviousPath
itemNextPath
containerPathForInside
```

The DOM is used only to find which registered item is under the pointer. After that, drop validation and move requests use item metadata and paths.

## Main Files

`ItemWrapperObject.jsx` and `ItemWrapperArray.jsx` create item metadata and attach interaction handlers.

`useJsonItemInteraction.js` owns item-level user interactions. It handles shift-click selection, context menu capture, pointer drag lifecycle, and the selection render revision subscription.

`jsonDropPreview.js` converts the current pointer position into drop preview state.

`jsonMoveCompletion.js` sends the move request through `onChange` and reselects the moved item after a successful move.

`jsonDragMove.js` contains drop calculation, default drop validation, and the data mutation helpers used by the example `onChange`.

`jsonDragOperationStore.js` stores drag state and per-item drag preview state.

`jsonSelectionOperationStore.js` stores canonical selection state.

## Gesture Flow

Shift-click selects an item. Repeated shift-click expands selection to ancestors.

Shift-drag starts only when the pointer begins inside the currently selected item. The selected item can be dragged from its nested content.

Shift-drag can also start directly from an item that is outside the current selection. That item is selected when the pointer passes the drag threshold, then the same drag flow continues. This shortcut also works when nothing is selected.

For non-leaf items, the shortcut applies when the pointer starts on that item’s own row area. If the pointer starts inside a nested child item, the child item receives the gesture instead.

Pointer movement starts drag after a small distance threshold. Native browser drag is not used, because native drag can be unreliable when the gesture starts from editable or text-like descendants.

During drag, `jsonDropPreview.js` uses `document.elementFromPoint()` to find the current item or empty container under the pointer. It then asks `jsonDragMove.js` for the drop position and validation result.

On pointer up, `jsonMoveCompletion.js` sends an `onChange` request with `_action: 'moveJsonItem'`. If the owner accepts the move, the moved item remains selected.

If pointer up happens on a red or otherwise invalid drop target, `jsonMoveCompletion.js` sends a rejected move request with `_invalidDrop: true`. The example owner handles this flag and shows an error in its message bar. This keeps the visual drop validation and the user-facing failure message in sync.

The owner may reject the request by returning a non-zero `code`. The demo in `example.jsx` uses this to simulate drag move failures. That failure rate belongs to the example’s data-management layer, not to `JsonCompMobx`.

## Object Entry Ordering

Object entries need special care. JSON-like object data does not have a meaningful explicit order in the value itself, so visual order is stored in `keyOrderStore.js`.

Moving an object entry inside the same object usually changes only the key order store. It does not change `data[key]`. That means the normal MobX data subscription for the entry value may not be enough to repaint selection classes after the move.

To keep selection rendering reliable, `useJsonItemInteraction.js` exposes `useJsonSelectionRenderRevision()`. The wrappers call this hook so item rows rerender when `selectionRevision` changes, even if object values did not change.

## Selection Identity

Selection is based on item id.

Object entry ids are based on path:

```text
json-object-item:user.name
```

For same-object entry moves, the id stays the same. For cross-object moves, `jsonMoveCompletion.js` recomputes the id from the target container path plus the moved key.

Array item ids are based on path with index:

```text
json-array-item:tags..2
```

After an array item move, `jsonMoveCompletion.js` computes the moved item’s new index from the drop request. Do not reuse the old array item path after a move, because that would select the item that now occupies the old index.

## Points To Be Careful About

Keep one canonical selection state. Selection styling should be derived from `selectedItemId`, `selectedAncestorItemIds`, `isSelectionActive`, and `selectionRevision`. Avoid a separate cached visual selection state.

Do not infer the moved array item from its old index after the move. The old index may now belong to another item.

Do not treat object entry reorder as an object value edit. Same-object reorder is a key-order-store update.

Do not await the async move inside the pointer-up event before allowing the browser’s follow-up click to be suppressed. Pointer-up should finish quickly, suppress the next selection click, and let move completion run. The suppression is intentionally short-lived so normal later shift-click selection still works.

If the user clicks elsewhere before async move completion, that click should win. `jsonMoveCompletion.js` compares `selectionRevision` before and after the move request before reselecting the moved item.

Keep DOM logic limited to hit testing. Once an item id is found, drop behavior should be metadata-driven.

Keep object and array wrappers using the same interaction hook. If their drag logic forks, selection and drag bugs tend to reappear in only one container type.

Keep owner-side drag settings out of renderer props unless the renderer truly needs them. For example, a demo failure percentage should be read inside a stable `onChange` callback, rather than making a new callback every time the slider changes.
