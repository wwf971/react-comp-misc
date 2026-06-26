## Horizontal Scroll Bar Behavior

When the panel is wide enough for all visible columns, there should be no horizontal scroll bar.

A common mistake is leaving list header and body at `width: max-content` inside a fixed-width panel. Column widths sum to fixed pixels and the last column does not grow. When a vertical scroll bar appears and takes a few pixels of width, content no longer fits and a horizontal bar shows up even though nothing is clipped.

With `config.bodyHeight` set, `ViewSwitcher` uses `has-body-height` in `folder.css`: header, body rows, and icon view use `width: 100%`, and the scroll container uses `overflow-y: auto; overflow-x: hidden`. Keep `isLastColFilled: true` (default) so the last column absorbs remaining width. Do not override those rules locally with `width: max-content` or `overflow-x: auto` unless horizontal scrolling is intentional.

Reference: search for `has-body-height` in `folder.css` in the react-comp-misc project folder.

## Scroll Bar Height Jitter

Even when a horizontal scroll bar is allowed, it must not change panel height when the bar appears or disappears, or when switching between list and icon view.

A common mistake is putting horizontal scroll on the outer `.folder-view-switcher-scroll` while `bodyHeight` is set. That bar steals height from the content area, so toggling it jumps layout by one scroll-bar thickness. Switching list/icon can make the jump more visible if a different subtree owns scroll.

When `bodyHeight` is set, the outer shell should use `overflow: hidden`; only `.folder-view-switcher-content.has-body-height` should scroll vertically (`overflow-y: auto; overflow-x: hidden`). List header must stay inside that fixed-height box (sticky within it), not above it. Putting the header outside the `bodyHeight` box causes height jitter when toggling list/icon.

Do not put `overflow-x: auto` on both outer and inner scroll containers.
