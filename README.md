# React Components Collection

A collection of reusable React components including Login, MasterDetail layout, and various icons.

Test examples can be found [here](https://wwf971.github.io/react-comp-misc/)

## Development

```bash
pnpm install
pnpm run dev
```

## Component Design

See `/doc/comp_design.md`

## Adding a Component

For the workflow and things to be careful about when adding a component (architecture design, export, test/demo examples), see `/doc/comp_add.md`.

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

For more details, see `/doc/comp_export.md`.

Use root import only. Do not rely on internal sub paths, because internal folder structure may change.