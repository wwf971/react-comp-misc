
The following are the points to be careful about, when utilizing FolderView.jsx and the series of componetns in the same folder.

You can also refer to ./example.jsx, for exmaples that demonstrate how some features can be implemented when using this series of components.

## Horizontal Scroll Bar Behavior

When the panel is wide enough for all visible columns, there should be no horizontal scroll bar.

A common mistake is leaving list header and body at `width: max-content` inside a fixed-width panel. Column widths sum to fixed pixels and the last column does not grow. When a vertical scroll bar appears and takes a few pixels of width, content no longer fits and a horizontal bar shows up even though nothing is clipped.

With `config.bodyHeight` set, `ViewSwitcher` uses `has-body-height` in `folder.css`: the fixed-height content box owns both vertical and horizontal scroll. Header and rows keep natural column width with `width: max-content` and `min-width: 100%`, so a horizontal scroll bar appears when the sum of visible column widths is wider than the panel.

Keep `isLastColFilled: true` (default) when the last column should absorb remaining width. Do not override the fixed-height content box with `overflow-x: hidden`, and do not force header or row width to `100%` only. Either of those local overrides can hide wide columns without showing a horizontal scroll bar.

Reference: search for `has-body-height` in `folder.css` in the react-comp-misc project folder.

## Scroll Bar Height Jitter

Even when a horizontal scroll bar is allowed, it must not change panel height when the bar appears or disappears, or when switching between list and icon view.

A common mistake is putting horizontal scroll on the outer `.folder-view-switcher-scroll` while `bodyHeight` is set. That bar is outside the fixed-height content box, so toggling it changes the total component height by one scroll-bar thickness. Switching list/icon can make the jump more visible if a different subtree owns scroll.

When `bodyHeight` is set, the outer shell should use `overflow: hidden`; only `.folder-view-switcher-content.has-body-height` should scroll. List header must stay inside that fixed-height box (sticky within it), not above it. Putting the header outside the `bodyHeight` box causes height jitter when toggling list/icon.

Do not put `overflow-x: auto` on both outer and inner scroll containers.

## Context Menu And Selection Behavior

Folder view should behave like a file explorer. A context menu is temporary UI above the folder content. When user clicks or right-clicks through it, the action should be interpreted against the folder item or empty folder area under the mouse.

### Left click on another item when one item's context menu is open

When a context menu is open, left-clicking another item should close the menu and select that item in the same click. Do not require a second click. The menu backdrop should report the click location before closing, and the folder view should find the row under that location and run the normal row click selection logic.

### Right click on another item when one item's context menu is open

When a context menu is open, right-clicking another item should close the old menu, select the item under the mouse, and open the new context menu at the new mouse position. Right-clicking an already selected item in multiple selection mode should keep the current selection, so menu actions can still apply to the selected group.

### Click empty space inside the folder view

Clicking empty space inside the folder view should clear selection. In list view, this means the blank area below rows and the blank area to the right of cells should belong to the folder body. With `config.bodyHeight` set, keep the body filling the available content area, so empty-space click can be handled by `ItemsListView`.
