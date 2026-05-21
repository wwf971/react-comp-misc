Most components in this project are designed based on a rendering pipeline that decouples rendering and data management.


# About TypeScript

Implement components in **JavaScript** (`.jsx` / `.js`). Do not add new component source files as `.tsx` unless there is a strong reason.

## Public API (runtime)

- Export every public symbol from **`./src/index.js`** only (see [Export Components from This Project](#export-components-from-this-project)).
- Importers use the package root: `import { TreeView } from '@wwf971/react-comp-misc'`.

This is **not** the same as forbidding `index.d.ts`. The rule below applies to **extra barrel files inside feature folders** (e.g. `database/index.js` inside a feature folder), not to the single package entrypoints at `src/`.

## Public API (types)

- Maintain **`./src/index.d.ts`** as the one type declaration file for the root export (`package.json` field `"types": "./src/index.d.ts"`).
- When you add a root export in `index.js`, add matching types in `index.d.ts`.
- Type-only symbols (helpers, prop types) also live in `index.d.ts`; do not create `index.ts` barrels under subfolders.

TypeScript consumers should rely on that file and **do not need** a local `react-comp-misc.d.ts` in their repo when they install the published package and import from the root.

If an app wires the library through Vite aliases to **source paths** or uses **non-root subpath imports** from `package.json` `exports`, it may still need local declarations for what it actually imports. That is an integration choice, not the default consumption model.

## Current codebase (not the target shape)

| Area | What exists today |
|------|-------------------|
| Most UI | `.jsx` / `.js` |
| Legacy / internal | Some `.tsx` (e.g. `database/DatabaseSetup.tsx`, `database/TableManage.tsx`, `layout/json/JsonContext.tsx`) |
| Menu | `.jsx` plus local `Menu.d.ts` / `MenuComp.d.ts` next to the component |
| Package `exports` | Root `.` plus several **subpath** entries (`./TreeView`, `./Menu`, …) in `package.json` — prefer root imports for new work |

New components should be `.jsx` and root-exported only. Migrating legacy `.tsx` and trimming subpath `exports` is optional cleanup, not required for every change.


# Component Architecture Design

```
┌─────────────────────────────────────────────────────┐
│                    remote server                    │
│  ┌────────────────────────────────────────────┐     │
│  │ e.g. HTTP API                              │     │
│  └────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
          ▲                        │
          │ network (e.g. HTTP)    │ websocket(optional)
          │                        ▼
┌─────────────────────────────────────────────────────┐
│             Data-Management Components              │
│  ┌────────────────────────────────────────────┐     │
│  │ holds data; coordinates remote I/O         │     │
│  │ accepts or rejects each change request     │     │
│  └────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
            │                    ▲                     
            │ data prop          │ change attempt callback
            ▼                    │                     
┌─────────────────────────────────────────────────────┐
│                  Render Components                  │
│  ┌────────────────────────────────────────────┐     │
│  │ render loyally based on data prop          │     │
│  └────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

- Render Components render loyally based on the data prop. They send change requests upward (callbacks). Data-Management Components decide whether to accept each request and update their data; they may also talk to a remote server over the network.

- MobX is used to make data-management components change things inside data object in-place, without the need to carefully ensure precise re-render in render components.

- Render components might emit multiple types of events to parent and mobx store. Try to avoid having one callback for each type of event, and use one unified callback function to notify event handling logic in handler container or mobx store.

- In a clean render component design, the render component receives only three major props: data, config, and onEvent. data is the object containing the content to be rendered. config contains variables that records component's current operation status, such as selected rows' id for a table component, and things like isLocked/isEditable. onEvent is a unified callback function through which the component notifies about edit request. data and config can be deeply nested objects, since mobx observer will automatically trace change of subscribed properties and trigger re-render correctly. Exmaple:

```jsx
import { MetadataKeyValues } from '@wwf971/react-comp-misc';

<MetadataKeyValues
  data={{
    titleText: 'Metadata',
    rows: [
      { id: '1', key: 'owner', value: 'team-a' },
      { id: '2', key: 'version', value: 'v1' },
    ],
    selectedRowId: '1',
    messageState: null,
  }}
  config={{
    isLocked: false,
    isEditable: true,
    keyColWidth: '180px',
    requestTimeoutMs: 8000,
  }}
  onEvent={async (eventType, eventData) => {
    if (eventType === 'cellUpdate') {
      // parent/store decides accept or reject
      return { code: 0, message: 'updated' };
    }
    return { code: 0 };
  }}
/>
```

See [test_example.md](./test_example.md) for how to register examples on the dev test page.


## Export Components from This Project

DO NOT CREATE a separate `index.js` or `index.ts` **inside a component folder** to re-export that folder.

Add the public export on the package entry only:

```javascript
export { default as BoolSlider } from "./component/button/BoolSlider.jsx";
```

Type-only re-exports for the package root go in `./src/index.d.ts` (same public names as `index.js`).

Import rules for consumers: [export.md](./export.md).

# Test Examples

See `/doc/test_example.md`.