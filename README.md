# React Components Collection

A collection of reusable React components including Login, MasterDetail layout, and various icons.

Test examples can be found [here](https://wwf971.github.io/react-comp-misc/)

## Development

```bash
pnpm install
pnpm run dev
```

## Component Design

Most components in this project are designed based on a rendering pipeline that decouples rendering and data management.

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

# Import component(s) from this project

Good way to import:

```javascript
// All components include their CSS automatically
import { 
  Login, 
  MasterDetail, 
  MasterDetailTab as Tab,
  MasterDetailSubTab as SubTab,
  MasterDetailPanel as Panel,
  TabsOnTop,
  KeyValues
} from '@wwf971/react-comp-misc';
```

Bad way to import:

```javascript
import TreeView from '@wwf971/react-comp-misc/TreeView';
import Menu from '@wwf971/react-comp-misc/Menu';
import { LeftIcon, RightIcon } from '@wwf971/react-comp-misc/Icon';
```

For more details, see `/doc/export.md`.

Use root import only. Do not rely on internal sub paths, because internal folder structure may change.
## Design Preference

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

