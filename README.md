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
                         ▲
                         │ network (e.g. HTTP)
                         │
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