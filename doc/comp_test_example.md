# Test Example(s) Design

For each component series, design test examples. Usually put them in an `example.jsx` or `exampleXxx` under the same folder as the component(s). Import those examples from `./src/test-page/examples.jsx`; the dev test page shows them.

To open the test page in dev mode, run `pnpm run dev`.

Components in the same group should share one example entry (one panel), not one registry row per tiny variant.

For shared button helpers such as `ButtonWithDropDown`, put the demo in the button folder example panel, for example `src/component/button/example.jsx`.

Wrong:

```javascript
export const folderExamples = {
  'Folder Header - Basic': <BasicHeaderExample />,
  'Folder Header - Dynamic': <DynamicHeaderExample />,
  'Folder Header - Non-Resizable': <NonResizableHeaderExample />,
  'Folder Header - Mixed Width': <MixedWidthHeaderExample />
};
```

Right:

```javascript
export const folderExamples = {
  'Folder': {
    component: null,
    description: 'Folder view components with resizable headers',
    example: () => <FolderExamplesPanel />
  }
};
```

For a panel containing multiple examples, explanation of/introduction to one specific example should be contained inside that example's area. Global introduction should be close to top of the panel.

## Demo Layout Components

Compose example panels with the standard components from `src/dev/demo/` (see the `Demo Layout` entry on the dev page for a live demo of these components themselves):

```jsx
<DemoPanel>
  <Explanation titleText="...">...global intro; plain text for one-liners, ul/li/strong for lists, KeyChip for keys...</Explanation>
  <Example title="...">
    <Explanation>...</Explanation>  {/* inside Example/ExampleGroup/ExampleStackVertical: no tone */}
    <Controls>...ControlGroup/ControlItem, wraps to next row on overflow...</Controls>
    <CompDemoArea>...the demonstrated component...</CompDemoArea>
    <MessageAndOutputs>...change messages/state, selectable text...</MessageAndOutputs>
  </Example>
</DemoPanel>
```

For a group of related examples, use `ExampleGroup` with either `ExampleSwitcher` (one example shown at a time, stable height; children carry `exampleId`/`labelText` props; switch via `ExampleSwitchButtons` in Controls or inline `ExampleJumpLink` in Explanation) or `ExampleStackVertical` (all examples stacked, Explanation can be interleaved).

Jump links: `<ExampleJumpLink data={{ exampleId, groupId?, pageKey? }}>label</ExampleJumpLink>` emits an `exampleJumpRequest` event which bubbles through levels: the nearest `ExampleGroup` store (switch inside the group), then the `DemoPanel` store (activate and scroll to targets in other groups or standalone examples with an `exampleId` prop), then the `onEvent` prop of `DemoPanel` (future page level jumps via `pageKey`). Each level returns `{ code: 0 }` when handled; `code < 0` bubbles on.

Conventions:

- An exampleXxx component accepts an optional `store` prop and passes it to the component inside `CompDemoArea`; when absent it creates its own local store with `useMemo`. A page-global store can be created at the top panel and passed to several examples.
- All ui state, including control values and the active example of a switcher, lives in mobx stores (see `demoStores.js`: `createStoreExampleGroup`, `createStoreDemoPanel`), not in `useState`.

When a component has multiple interaction modes, add examples that make the behavioral difference visible. For example, the color picker should show:

- Immediate commit mode: each picker change updates the committed value; `Restore` returns to the value from when the picker opened.
- Apply commit mode: picker edits stay local until `Apply`; `Cancel` discards the local picker value.