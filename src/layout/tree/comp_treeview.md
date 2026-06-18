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
