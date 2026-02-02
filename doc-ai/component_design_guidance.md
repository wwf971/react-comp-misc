this is a project for miscellaneous react components.


## test examples for components.

for each component series, their examples will be imported by ./src/dev/examples.jsx, which will be shown in test page.

to view test page on dev mode, run `pnpm run dev`.

For a series of components belonging to same group, they should share one example component.

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


## export components from the prject.

DO NOT CREATE a separate index.js or index.ts to export the component.

export the component in ./src/index.ts by adding a line like:
```
export { default as BoolSlider } from "./button/BoolSlider.jsx";
```
