# JsonCompMobx

`JsonCompMobx` renders and edits JSON-like observable data. The owner provides observable semantic data, render config, and an event handler. The view sends edit requests upward; the owner decides whether to accept each change.

For drag move behavior, refer to `./json-mobx-drag.md`.

## Public API

```jsx
import JsonCompMobx, {
  createJsonCompMobxStore,
  createJsonOnEventAdapter,
} from '@wwf971/react-comp-misc';

<JsonCompMobx
  data={dataObservable}
  config={{
    compId: 'my-json-editor',
    isEditable: true,
    isKeyEditable: false,
    isValueEditable: true,
    isDragMoveEnabled: false,
    isDebug: false,
    indentPx: 20,
    typeConversionBehavior: 'allow',
    getValueComp: null,
  }}
  onEvent={handleOnEvent}
  store={jsonCompMobxStore}
/>
```

| Prop | Role |
|------|------|
| `data` | Observable JSON root (object or array). Semantic content only. |
| `config` | Edit permissions, layout, debug flags, optional custom primitive renderer. |
| `onEvent` | Unified callback: `(eventType, eventData) => Promise<{ code, message? }>` |
| `store` | Optional. Defaults to an internal store keyed by `config.compId`. Pass one when multiple instances need isolated selection, drag, or menu state, or when external UI reads that state. |

`config.compId` identifies one editor instance. Selection, drag, and menu-open state for different instances must not share the same store unless you pass the same `store` on purpose.

Legacy handlers can be adapted with `createJsonOnEventAdapter(handleChange)`. The adapter forwards to the old `(path, changeData)` shape:

```jsx
const handleChange = createHandleChange(observableData);
const handleOnEvent = createJsonOnEventAdapter(handleChange);

<JsonCompMobx data={observableData} config={config} onEvent={handleOnEvent} />
```

Inside the component tree, leaf and wrapper comps read shared settings from `JsonContext` (`config`, `store`, `emitEvent`, `renderNestedJson`). They do not receive flat edit props directly.

## Core Design

The component relies on MobX for in-place edits. The data owner mutates the existing object or array inside an action; observer components re-render only when observable fields they read change.

The render tree is split into small observer components:

```text
JsonCompMobx
  JsonCompMobxRoot (context, root selection shell, menu)
    JsonCompMobxTree (structure only; memoized)
      ItemWrapperObject or ItemWrapperArray
        JsonKeyValueComp or JsonListItemComp
          JsonTextComp, JsonNumberComp, JsonBoolComp, JsonNullComp
          or nested JsonCompMobxTree
```

Container components must not read leaf values when building sibling lists. `JsonCompMobxTree` tracks object keys, array length, and key order only. Each wrapper receives the container plus key or index, then reads `container[itemKey]` or `container[itemIndex]` itself. That keeps MobX subscriptions narrow so editing one leaf does not re-render unrelated siblings.

`JsonCompMobxTree` is wrapped in `React.memo` so parent React re-renders (for example from an `observer` wrapper or message bar state) do not re-run the full tree when `data` reference and resolved `config` are unchanged.

Operational UI state lives in `createJsonCompMobxStore()`:

```text
compId
menuOpen
selection   (from jsonSelectionOperationStore.js)
drag        (from jsonDragOperationStore.js, when drag move is enabled)
```

Context menu open state is stored in `store.menuOpen`, not in React local state at the root.

## Data And Events

`onEvent(eventType, eventData)` is the edit boundary. `eventData` always includes `path` and `changeData`. The renderer does not own persistence or backend decisions. Return a non-zero `code` to reject a request.

`emitJsonCompEvent()` maps internal `changeData` markers to `eventType`:

| eventType | When |
|-----------|------|
| `valueUpdate` | Default value edit or type conversion |
| `keyRename` | `changeData._keyRename` |
| other | `changeData._action` (delete, move, add pseudo item, drag move, etc.) |

Keep `onEvent` identity stable when possible. If the owner needs runtime settings (demo failure rate, remote-write option), store the latest setting in a ref or data-management object and read it inside the callback. Passing a newly created callback on every control change can make outer wrappers re-render even when the JSON tree does not need to.

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

## Render Isolation Notes

These rules matter when using `config.isDebug` render counters or when optimizing re-renders:

- Do not read leaf values in `JsonCompMobxTree` when mapping object keys or array indices.
- `clearSelection()` is a no-op when selection is already empty, so normal clicks do not notify all selection observers.
- Avoid wrapping the editor in a parent `observer` that reads the whole `data` tree. Observe only the config fields the wrapper actually renders (see `example.jsx` render-debug panel split).
- Memoize `config` objects passed to `JsonCompMobx` when the parent re-renders often but config values are unchanged.

Local edit mode (text key/value contentEditable) uses React state in leaf comps and does not mutate `data` until submit. Immediate value writes (boolean toggle) mutate `data` at once; isolation then depends on MobX subscriptions and the rules above.

## Selection And Context Menu

Selection state is in `store.selection`. Canonical fields:

```text
itemSelectedId
itemAncestorIdsSelected
isSelectionActive
revisionSelection
itemSelectedMeta
itemMetaById
```

Selection styling is derived from `getItemSelectionState(itemId)`. Do not add a second cached visual selection state. Object-entry reordering can move React components without changing the object value, so item wrappers also subscribe to `revisionSelection` through `useJsonSelectionRenderRevision` in `useJsonItemInteraction.js`.

Context menu targeting is resolved through `jsonContextMenu.js`. When an item is selected, a context menu request can target the selected item rather than the exact nested element that received the right click. The root renders `MenuComp` from `store.menuOpen`.

## Object Key Order

Plain object properties should not be treated as if their order is part of JSON data. Visual order for object entries is stored separately in `keyOrderStore.js`.

`getOrderedKeys()` returns the display order. `addKeyInOrder()`, `renameKeyInOrder()`, and `moveKeyInOrder()` update that order and bump a MobX observable version for re-rendering. Moving a key-value pair within the same object usually changes only visual key order, not the object value itself.

## File Map

`JsonCompMobx.jsx` — public entry, config resolution, `JsonCompMobxTree`, `JsonCompMobxRoot`, root context provider.

`jsonCompMobxStore.js` — unified store factory (`selection`, `drag`, `menuOpen`).

`jsonEvent.js` — `emitJsonCompEvent`, `createJsonOnEventAdapter`, event type resolution.

`JsonContext.jsx` — shared `config`, `store`, `emitEvent`, `renderNestedJson`, path query helpers.

`ItemWrapperObject.jsx` and `ItemWrapperArray.jsx` — one object entry or array item; selection, menu, and drag registration.

`JsonKeyValueComp.jsx` and `JsonListItemComp.jsx` — key-value row or list item row.

`JsonTextComp.jsx`, `JsonNumberComp.jsx`, `JsonBoolComp.jsx`, `JsonNullComp.jsx` — primitive leaf renderers.

`useJsonItemInteraction.js` — shift-click selection, context menu capture, pointer drag lifecycle, selection render revision hook.

`jsonSelectionOperationStore.js` — selection state.

`jsonDragOperationStore.js` — drag state and per-item drag preview state.

`jsonMoveCompletion.js`, `jsonDropPreview.js`, `jsonDragMove.js` — drag move helpers. See `./json-mobx-drag.md`.

`example.jsx` and `exampleHandleChange.js` — demo wiring. Demo-only rules (failure rate, message bar) live in the example wrapper, not in `JsonCompMobx`.
