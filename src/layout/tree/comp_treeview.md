## Related Components

- `TreeView` (search for `TreeView.jsx` in the react-comp-misc project folder): low-level tree render component. Emits `itemContextMenu` on row right click. Does not render a context menu itself.
- `ItemTree` (search for `ItemTree.jsx` in the react-comp-misc project folder): side-list wrapper built on `TreeView`. Adds search, expand/collapse-all, and flat `items[]` to tree conversion. Does not include context menu UI; consumer handles `itemContextMenu` in `onEvent` (or uses `TreeView` directly).
- `ItemList` (search for `ItemList.jsx` in the react-comp-misc project folder): flat side list, not tree-based. Does not include context menu UI; consumer adds row `onContextMenu` if needed.
- `Menu` / `MenuContext` (search for `MenuContext.jsx` in the react-comp-misc project folder): portal context menu. Use this with `data.anchor` for item-attached menus. See the tree `example.jsx` in the same project for reference wiring.

None of the list/tree components above implement a complete right-click menu by themselves. If a consumer opens `Menu` with only `{ x: clientX, y: clientY }`, the usual bugs appear: menu fixed to the window, scroll blocked while open, menu stays visible after the row is hidden.

## TreeView Usage Notes

Use stable typed ids for nodes. Avoid ids that depend on display text or list index unless the list index is part of the source model.

Each item should provide:

```js
{
  id,
  text,
  isLeaf,
  isExpanded,
  childrenIds,
  childrenLoadState: 'loaded',
}
```

## Item Context Menu(Right Click Menu) Behavior

When implementing context menu, ensure the following features. The below principles should be obeyed when implementing for `TreeView`, `ItemTree`, or `ItemList`.

1. context menu get closed, if the item that get right clicked on become no longer visible, due to parent or ancestor node collapse.

2. context menu get closed, if the item that get right clicked on become no longer visible, due to vertical scroll.

3. when right click on other item B when item A's context menu is already open, item A's context menu should disappear, and item B's context menu should appear, at the right click position.

4. during vertical scrolling at any level, the current open right click menu, should remain static relative to the corresponding item(the item that was right clicked on)

### Typical implementation

Use `Menu` with anchor-based positioning, not viewport-fixed coordinates alone.

```jsx
<Menu
  data={{
    items: menuItems,
    position: { x: 0, y: 0 },
    anchor: {
      getRect: () => rowElement?.getBoundingClientRect() ?? null,
      getTargetEl: () => rowElementOrQueryResult,
      getVisibilityRoot: () => scrollContainerElement,
      offsetX: event.clientX - rowRect.left,
      offsetY: event.clientY - rowRect.top,
    },
  }}
  config={{ isBackdropScrollPassThrough: true }}
  onEvent={(eventType) => {
    if (eventType === 'close' || eventType === 'anchorHidden') setMenuState(null);
  }}
/>
```

`MenuCore` tracks the anchor on scroll/resize, closes the menu when the anchor is hidden, and keeps menu position relative to the anchor rect plus offset.

Reference: search for `createTreeItemContextMenuAnchor` in the tree `example.jsx` in the react-comp-misc project folder.

### Requirement notes

**1. Close when ancestor collapse hides the row**

`TreeView` removes collapsed children from DOM, so the anchor row disappears.

Provide `anchor.getTargetEl` pointing at the row element (for example `.tree-view-row[data-tree-item-id="..."]`). When the row is unmounted, `getRect()` returns null and `Menu` emits `anchorHidden`, which should close the menu.

No extra collapse-specific logic is needed if anchor + `getTargetEl` are set correctly.

**2. Close when row scrolls out of the container**

Provide `anchor.getVisibilityRoot` as the nearest scroll container that clips the row (for `TreeView`, usually the `.tree-view` root with `overflow: auto`).

`Menu` checks intersection between anchor rect and visibility root on scroll/resize, and uses `IntersectionObserver` when `getTargetEl` is also provided. When the row is fully outside the visible container area, the menu closes.

Do not rely on `clientX/clientY` alone; those are viewport coordinates and do not know when the row left the container.

**3. Right click item B while item A menu is open**

Use close-then-open in one handler:

```js
setMenuState(null);
requestAnimationFrame(() => setMenuState(nextMenuState));
```

With `config.isBackdropScrollPassThrough: true`, the menu backdrop does not block pointer events, so the row `itemContextMenu` event reaches the tree directly. Right click on another row replaces the open menu without stale position/content.

`TreeView` already emits `itemContextMenu` with `{ itemId, itemData, event }`. Wire that in the parent store/handler, not inside the row component.

**4. Menu stays relative to the row while scrolling**

Provide `data.anchor` with `getRect`, `offsetX`, and `offsetY` from the original right-click event.

`Menu` recomputes menu position from the row rect on every scroll (capture-phase scroll listener catches nested scroll containers). The menu moves with the row instead of staying fixed to the window.

Also set `isBackdropScrollPassThrough: true`, otherwise the full-screen backdrop blocks wheel/scroll interaction even if position math is correct.

### Pitfalls to avoid

- Opening `Menu` with only `position: { x: event.clientX, y: event.clientY }`.
- Using a blocking menu backdrop while expecting the tree/list to scroll underneath.
- Putting menu open/close logic inside a leaf item component instead of the parent that owns menu state.
- For `ItemTree`, remember it wraps `TreeView` but does not forward `itemContextMenu` today; add that forwarding in `onEvent`, or compose `TreeView` yourself.
- For `ItemList`, rows are plain buttons; add `onContextMenu` on the row wrapper and build the same anchor object from the clicked button element.

## Expand/Collapse Behavior

Even an icon(usually the plus/minus icon pair) exists for each item for toggling expanded/collapsed state, it is preferred that clicking anywhere within the item area also toggles expanded/collapsed state.

`TreeView` already supports this through `isToggleExpandOnItemClick`, which defaults to true. Only turn it off when the whole row has a different primary action, and then re-create a clear expansion affordance yourself.

If a row has both selection and expansion behavior, keep selection in `onItemClick` and let `TreeView` handle expansion. Do not special-case only some item types, or the tree will feel inconsistent.

Use `onItemDoubleClick` for secondary navigation or open actions. Single click should usually select or expand, while double click can navigate, open, or drill in.

## Source of Truth

`TreeView` is data-driven. Keep source entities outside the tree, then derive `itemDataById`, `rootItemIds`, `selectedItemId`, and expansion state from that source data.

Keep expansion state outside the rendered item objects when possible, then merge it into derived item data. This keeps expansion operational state separate from source data.

When external selection changes, expand the ancestor path to the selected item. Do not expand the selected item itself unless that is explicitly desired.

Avoid vertical dead zones between items. Row height, hover background, and selected background should cover the full clickable row area. If local CSS overrides leaf styling, make sure leaf rows still have full-row hover and selected feedback unless there is a specific reason not to.

Keep indentation small and predictable. If the tree also uses nested child containers, avoid adding both large `indentPx` and large child padding.

Custom item components should be compact and should not contain unrelated click handlers unless they stop propagation intentionally. Let `TreeView` own row click, double click, context menu, and expand/collapse behavior.

For filtering, include ancestor nodes for matched descendants and expand those ancestors. Do not mutate the original tree source while filtering.

## Horizontal Scroll Bar Behavior

`TreeView` should show a horizontal scroll bar only when real item content is wider than the available panel. If all visible text fits, there should be no bottom scroll bar. This is easiest when the scroll container measures item content, while each row still covers at least the visible tree width.

Be careful with local CSS around `TreeView`. A common mistake is hiding horizontal overflow on the sidebar or tree root. That removes the scroll bar even when item text is clipped with `...`. Another common mistake is setting nested tree blocks to `width: 100%` without `box-sizing: border-box`, which can create a tiny permanent overflow from borders or padding, so a horizontal scroll bar appears even when all text fits.

When a consumer needs full text to drive horizontal scrolling, prefer a scoped class on that tree instance:

```css
.project-tree-view {
  box-sizing: border-box;
  overflow: auto;
}

.project-tree-view .tree-view-node-content {
  box-sizing: border-box;
  min-width: max-content;
}

.project-tree-view .tree-view-row {
  box-sizing: border-box;
  min-width: 100%;
}

.project-tree-view .tree-view-label,
.project-tree-view .tree-view-text-item {
  overflow: visible;
  text-overflow: clip;
}
```

With this pattern, short rows still fill the panel width, so hover and selected backgrounds cover the visible row. Long rows can grow beyond the panel width, so the tree root shows a horizontal scroll bar only when there is hidden content.
