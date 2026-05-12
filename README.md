# React Components Collection

A collection of reusable React components including Login, MasterDetail layout, and various icons.

Test examples can be found [here](https://wwf971.github.io/react-comp-misc/)

## Development

```bash
pnpm install
pnpm run dev
```

## Design

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

## Usage

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

## Design Preference

- Render components might emit multiple types of events to parent and mobx store. Try to avoid having one callback for each type of 

- In a clean render component design, the render component receives only three major props: data, config, and onEvent. data is the object containing the content to be rendered. config contains variables that records component's current operation status, such as selected rows' id for a table component, and things like isLocked/isEditable. onEvent is a unified callback function through which the component notifies about edit request. data and config can be deeply nested objects, since mobx observer will automatically trace change of subscribed properties and trigger re-render correctly.