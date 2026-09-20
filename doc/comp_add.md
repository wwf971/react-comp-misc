# Adding a Component

This document describes the overall workflow of adding a component to this project, and the things to be careful about at each step. Each step has its own detailed document; this page only gives the overview and points to them.

```text
add a component
  -> design the architecture (skip if merging in an already-written component)
  -> put source files under a suitable folder in ./src/
  -> export from the package entry (./src/index.js and ./src/index.d.ts)
  -> add test/demo example(s) and register them on the dev test page
```

## 1. Architecture design

When implementing new component(s) from scratch (as opposed to merging in already-written component(s)), make sure the design conforms to the data-driven architecture of this project: a mobx store holds the data and decides whether to accept each change request, while the render component renders loyally from its `data` and `config` props, and reports change attempts upward through one unified `onEvent` callback.

For the full architecture, the `data` / `config` / `onEvent` props convention, and how containers must forward the communication path, see [comp_design.md](./comp_design.md).

## 2. Export

Export the component from the package entry `./src/index.js` only, and add matching type declarations in `./src/index.d.ts`. Do not create extra barrel `index.js` files inside component folders, and do not expect consumers to import from internal folder paths.

For the import/export rules on both the library side and the consumer side, see [comp_export.md](./comp_export.md).

## 3. Test/demo examples

Every added component needs demo example(s) on the dev test page (opened with `pnpm run dev`). Put an `exampleXxx.jsx` file in the same folder as the component, compose the panel with the standard demo layout components from `src/dev/demo/`, and register the panel in `./src/test-page/examples.jsx` as one entry for the whole component group (not one entry per small variant).

For the panel structure, the shared demo stores, and the standard simulated server, see [comp_test_example.md](./comp_test_example.md).
