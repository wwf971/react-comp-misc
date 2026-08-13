# TreeView Implementation Requirements

`TreeView` is a render component following the data/config/onEvent pipeline (see `/doc/comp_design.md`). This file records behavior requirements that are error-prone in implementation, mainly drag-to-move. For usage guide of the component, see `./comp_treeview_useage.md`.

## Public API of Drag

These must stay stable for consumers:

- `config.isItemDragEnabled`, `config.getIsItemDraggable(itemData)`, `config.getItemDropStatus({ itemId, itemData, targetItemId, targetItemData, drop })`
- `moveItem` event with `{ itemId, itemData, drop }`, where `drop` is `{ type, itemParentId, itemBeforeId, itemAfterId }` and `type` is `before` / `after` / `under`

## Drag To Move

Use pointer events (pointerdown / pointermove / pointerup), not native HTML5 drag. With native drag, the browser controls part of the cursor on its own, which causes rapid flicker between move-allowed and banned cursor, and row gaps or indentation areas temporarily lose the drop target.

```text
pointerdown on a draggable row
  -> moved less than threshold(about 5px): stays a normal click
  -> moved beyond threshold: drag starts, pointer captured on tree root
drag
  -> pointermove: resolve drop position from pointer x/y
  -> escape key: cancel, nothing emitted
  -> pointerup: emit moveItem exactly once, only if position allowed and not a noop
```

### Drop zone inside one row

Zone is decided by pointer y within the hovered row:

```text
leaf row:
  top half     -> before row
  bottom half  -> after row

folder row, children not visible(collapsed or empty):
  top 25%      -> before row
  middle 50%   -> under row(into folder)
  bottom 25%   -> after row

folder row, children visible:
  top 25%      -> before row
  middle 50%   -> under row
  bottom 25%   -> before first child
```

Keep a few px of hysteresis at zone boundaries, so the zone does not flip repeatedly while pointer stays near a boundary.

### Expanded folder bottom edge

For a folder whose children are visible, the position right below the folder row means its first-child position, never "next sibling of the folder". Dragging around bottom edge of `aaa`:

```text
- aaa
  ----          <- correct: insert as first child of aaa
  - bbb
  - ccc
```

```text
- aaa
------          <- must never appear: sibling-level line between aaa and bbb
  - bbb
  - ccc
```

To place an item as next sibling of `aaa`, user drags around the last visible row of the `aaa` subtree; see next section.

### After-position depth choice

When pointer is in the after zone of a row that ends one or more nested subtrees, several insert depths are all valid. Choose depth by pointer x, clamped to the valid depth range. The indicator line starts at the chosen depth.

```text
- aaa
  - bbb
  - ccc
     ----       <- pointer x indented: after ccc, still inside aaa
--------        <- pointer x near left edge: after aaa
```

### No dead area

Every pointer position over the tree resolves to some drop position. A banned cursor must never appear just because pointer is over a gap, indentation, or empty space below the items.

```text
above first row          -> before first row
below last row           -> after zone of last row(with depth choice above)
in a gap between rows    -> nearest row
```

Example: with flat siblings `aaa bbb ccc`, dragging `aaa` far below `ccc` shows the indicator line after `ccc`, not a banned icon.

### Noop vs blocked

These two must be distinguished, and only blocked positions may show the not-allowed cursor:

- noop: structurally fine, but the item would stay at the same place. This is any position adjacent to the dragged item (`drop.itemBeforeId` or `drop.itemAfterId` equals dragged id). Keep the normal drag cursor, show no insert indicator, and on release emit nothing.
- blocked: dropping into the dragged item's own subtree, or consumer `getItemDropStatus` rejects. Show not-allowed cursor and blocked row style.

Consumer `getItemDropStatus` is not asked for noop positions, since nothing will be emitted anyway.

### Stability helpers

- hovering the under zone of a collapsed folder for about 600ms auto expands it (emit `toggleExpand`)
- pointer near top/bottom edge of the scroll container auto scrolls, and drag stays active while scrolling
- text selection disabled during drag
- all drag state cleared after drop or cancel
