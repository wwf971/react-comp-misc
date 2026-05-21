# react-comp-misc import guide

## Correct import style

- Always import from the package root: `@wwf971/react-comp-misc`
- Treat only root exports as the stable public API
- Do not import from internal folder paths

### Good examples

```javascript
import { TreeView, KeyValues, Menu } from '@wwf971/react-comp-misc'
```

```javascript
import * as ReactCompMisc from '@wwf971/react-comp-misc'
```

### Bad examples

```javascript
import { xxx, yyy } from '@wwf971/react-comp-misc/aaa/bbb/ccc'
import TreeView from '@wwf971/react-comp-misc/TreeView'
import Menu from '@wwf971/react-comp-misc/Menu'
```

## TypeScript support

- Implement components in JavaScript; declare public types in `src/index.d.ts` only
- TypeScript importers use the root import `@wwf971/react-comp-misc` and rely on package `"types"` — no local `react-comp-misc.d.ts` needed for that path
- When adding a root export in `src/index.js`, add matching declarations in `src/index.d.ts`
