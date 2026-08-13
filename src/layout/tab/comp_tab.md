# TabsOnTop

`TabsOnTop` renders a tab header and one panel for each tab.

The component has three kinds of state:

```text
tab identity
  -> tabKey identifies one tab and its panel

active tab
  -> TabsOnTop shows the selected panel

panel lifetime
  -> keepMounted controls whether inactive content remains mounted
  -> deferred options control when content mounts for the first time
```

Use a stable `tabKey` when tabs can be added, removed, or reordered. Display labels are not suitable identities because labels can change.

## Basic use

```jsx
import { TabsOnTop } from '@wwf971/react-comp-misc';

function ProjectTabs() {
  return (
    <TabsOnTop defaultTab="overview">
      <TabsOnTop.Tab tabKey="overview" label="Overview">
        <Overview />
      </TabsOnTop.Tab>
      <TabsOnTop.Tab tabKey="settings" label="Settings">
        <Settings />
      </TabsOnTop.Tab>
    </TabsOnTop>
  );
}
```

`defaultTab` accepts a `tabKey` or label. Prefer a `tabKey`.

## Panel state and mounting

`defaultKeepMounted` defaults to `true`. Inactive panels remain mounted and are hidden. Local component state, scroll position, and ongoing effects are preserved.

Set `keepMounted={false}` on one tab when its content should unmount whenever the user leaves it:

```jsx
<TabsOnTop.Tab
  tabKey="temporary"
  label="Temporary"
  keepMounted={false}
>
  <TemporaryPanel />
</TabsOnTop.Tab>
```

Use `defaultKeepMounted={false}` on `TabsOnTop` to make this the default for all tabs. A tab-level `keepMounted` value overrides the parent default.

`keepMounted` and deferred mounting solve different problems:

- `keepMounted`: what happens after the panel has been opened.
- `deferMount`: whether the panel waits until its first activation before mounting.

## Deferred tab panels

Deferred mounting avoids rendering expensive inactive panels during the initial page render.

```text
user selects tab
  -> loading fallback is painted
  -> panel content mounts
  -> later tab switches reuse the mounted panel
```

```jsx
<TabsOnTop.Tab
  tabKey="report"
  label="Report"
  deferMount
>
  <LargeReport />
</TabsOnTop.Tab>
```

The default fallback is a spinning circle. Supply `loadingFallback` to replace it:

```jsx
<TabsOnTop.Tab
  tabKey="report"
  label="Report"
  deferMount
  loadingFallback={<div>Preparing report...</div>}
>
  <LargeReport />
</TabsOnTop.Tab>
```

### Synchronous heavy rendering and spinner animation

`deferMount` gives the browser a chance to paint the fallback before mounting the panel. It does not move React rendering to another thread.

If panel mounting blocks the browser main thread, ordinary animation and all interaction pause during that work. A transform animation promoted to the browser compositor can continue visually, but it does not make the page responsive. `SpinningCircle` uses a compositor-friendly transform for this reason.

```text
main thread blocked by mount work
  -> animation on main thread: spinner freezes
  -> animation on compositor thread: spinner keeps rotating
```

Be careful about these points, otherwise the frozen-spinner problem returns:

- Inside `SpinningCircle`, the rotation animation must stay on the HTML wrapper element, together with `will-change: transform`. Never move the animation onto the `<svg>` element: browsers run svg transform animations on the main thread only, and `will-change` does not change that.
- A custom `loadingFallback` with its own animation needs the same design: animate `transform` on an HTML element that has `will-change: transform`.

Use one of these approaches:

- Split large rendering work into smaller updates.
- Move non-DOM computation to a Web Worker.
- Load data asynchronously and use `isReady`.
- Use `deferMountDelayMs` only when the fallback should remain visible briefly before mounting starts.

```jsx
<TabsOnTop.Tab
  tabKey="heavy"
  label="Heavy"
  deferMount
  deferMountDelayMs={500}
>
  <HeavyPanel />
</TabsOnTop.Tab>
```

`deferMountDelayMs` lets the spinner visibly animate before synchronous mount work begins. It does not make the mount work non-blocking. Keep it at the default `0` in normal application code unless a deliberate delay is useful.

### Waiting for external data

`isReady={false}` keeps the fallback visible. Set it to `true` when required data is available.

```jsx
<TabsOnTop
  onTabChange={(tabKey) => {
    if (tabKey === 'server-data') dataStore.loadOnce();
  }}
>
  <TabsOnTop.Tab
    tabKey="server-data"
    label="Server data"
    deferMount
    isReady={dataStore.isReady}
  >
    <ServerData data={dataStore.data} />
  </TabsOnTop.Tab>
</TabsOnTop>
```

The application store remains the source of truth for loading and data state. `TabsOnTop` only decides whether to show the fallback or panel.

### Resetting deferred state

After a panel mounts once, later switches normally show it immediately. This is expected when deferred state is preserved.

Change `deferKey` to treat the panel content as a new deferred version:

```jsx
<TabsOnTop.Tab
  tabKey="preview"
  label="Preview"
  deferMount
  deferKey={previewStore.revision}
>
  <Preview />
</TabsOnTop.Tab>
```

Incrementing `previewStore.revision` makes the fallback appear again before the next mount. Reset related application state separately when the panel also waits on `isReady`.

Remounting the whole `TabsOnTop` with a changed React `key` resets active-tab, deferred, and child component state together. Use that for demonstrations or a complete workflow reset, not for ordinary data refresh.

### Render error boundary

Set `withErrorBoundary` to catch a panel render error. The panel displays the error and a Retry action.

```jsx
<TabsOnTop.Tab
  tabKey="result"
  label="Result"
  deferMount
  withErrorBoundary
>
  <ResultPanel />
</TabsOnTop.Tab>
```

Retry clears the deferred error and mounts the panel again. The application must first fix the state that caused the render error; otherwise the retry fails in the same way.

## Tab header behavior

Relevant `TabsOnTop` props:

- `defaultTab`: initially selected tab key or label.
- `onTabChange(tabKey)`: called after user selection.
- `allowCloseTab`, `onTabClose`: enable and handle closing.
- `allowTabCreate`, `onTabCreate`: enable and handle creation.
- `autoSwitchToNewTab`: select a newly added tab; defaults to `true`.
- `allowTabReorder`, `onTabReorder`: enable drag reorder and receive the new tab order.
- `lineMode`: controlled mode, either `'single'` or `'wrap'`.
- `defaultLineMode`: initial uncontrolled line mode.
- `allowLineModeSwitch`, `onLineModeChange`: show and handle the mode switch.
- `headerRightContent`: custom content at the right side of the header.
- `headerRightItems`, `renderHeaderRightItem`, `onHeaderRightItemAction`: data-driven header actions.

One-line mode keeps one horizontal row and supports wheel scrolling when tabs overflow. Wrap mode displays multiple rows.

Relevant `TabsOnTop.Tab` props:

- `tabKey`: stable tab identity.
- `label`: displayed tab label.
- `keepMounted`: panel lifetime override.
- `deferMount`: wait for first activation before mounting.
- `deferMountDelayMs`: optional delay after painting the fallback.
- `isReady`: external readiness gate.
- `deferKey`: deferred content version.
- `loadingFallback`: custom loading content.
- `withErrorBoundary`: render error handling with Retry.

## Custom tab labels

Place `TabsOnTop.TabLabel` immediately before the related tab:

```jsx
<TabsOnTop.TabLabel>
  {(tabProps) => <ProjectTabButton {...tabProps} />}
</TabsOnTop.TabLabel>
<TabsOnTop.Tab tabKey="project" label="Project">
  <ProjectPanel />
</TabsOnTop.Tab>
```

The custom component receives tab state and handlers such as `isActive`, `onClick`, drag props, and `onClose` when closing is enabled.

## Imperative switching

`TabsOnTop` exposes `switchTab(tabKeyOrLabel)` through a ref:

```jsx
const tabsRef = useRef(null);

<TabsOnTop ref={tabsRef} defaultTab="overview">
  {/* tabs */}
</TabsOnTop>

tabsRef.current?.switchTab('settings');
```

Prefer normal user selection or application state when possible. Use the ref when another UI control must request a tab switch.

## Deferred behavior is provided by a wrapper

`TabsOnTop` remains the outer tab layout. `TabPanelDeferred` is a wrapper around one panel's content:

```text
TabsOnTop
  -> TabsOnTop.Tab
       -> TabPanelDeferred
            -> actual panel content
```

Usually, write deferred options on `TabsOnTop.Tab`. `TabsOnTop` then inserts `TabPanelDeferred` automatically:

```jsx
import { TabsOnTop } from '@wwf971/react-comp-misc';

<TabsOnTop defaultTab="summary">
  <TabsOnTop.Tab tabKey="summary" label="Summary">
    <Summary />
  </TabsOnTop.Tab>

  <TabsOnTop.Tab
    tabKey="details"
    label="Details"
    deferMount
    isReady={dataStore.isReady}
  >
    <Details />
  </TabsOnTop.Tab>
</TabsOnTop>
```

The Details panel above is conceptually rendered like this:

```jsx
import { TabPanelDeferred, TabsOnTop } from '@wwf971/react-comp-misc';

<TabsOnTop defaultTab="summary">
  <TabsOnTop.Tab tabKey="summary" label="Summary">
    <Summary />
  </TabsOnTop.Tab>

  <TabsOnTop.Tab tabKey="details" label="Details">
    <TabPanelDeferred
      isReady={dataStore.isReady}
      deferMount
    >
      <Details />
    </TabPanelDeferred>
  </TabsOnTop.Tab>
</TabsOnTop>
```

`TabsOnTop` passes the current `tabKey` and tab focus state into this wrapper. The first form is preferred because `TabsOnTop` also supplies its shared deferred-state store automatically.

`TabPanelDeferred` is also exported for content outside `TabsOnTop`. Standalone use must provide `isActive` itself and owns its deferred state locally.
