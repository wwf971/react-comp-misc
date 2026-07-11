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