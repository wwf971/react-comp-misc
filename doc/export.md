react-comp-misc import guide

correct import style
- always import from package root: `@wwf971/react-comp-misc`
- treat only root exports as stable public api
- do not import from internal folder paths

good examples
- `import { TreeView, KeyValues, Menu } from '@wwf971/react-comp-misc'`
- `import * as ReactCompMisc from '@wwf971/react-comp-misc'`

bad examples
- `import { xxx, yyy } from '@wwf971/react-comp-misc/aaa/bbb/ccc'`
- `import TreeView from '@wwf971/react-comp-misc/TreeView'`
- `import Menu from '@wwf971/react-comp-misc/Menu'`

typescript support
- projects importing from this project do need not create local `react-comp-misc.d.ts`
  - `@wwf971/react-comp-misc` ships its own type declarations for root imports
- when adding new components to react-comp-misc, keep them exported from `src/index.js` and declared in `src/index.d.ts`


