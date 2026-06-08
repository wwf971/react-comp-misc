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
