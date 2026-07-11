

refer to ./example.jsx, for demonstration examples for implementation of some features.



some points to be careful about when implementing right click menu feature.


## Implement correct 'Right click when right click menu is open' behavior

refer to ./exapmleRightClick.jsx, for demonstration of how to realize the preferred feature of "when item A's right click menu is open, when right clicking another item B, close item A's right click menu, and make item B's right click menu appear at the right click position".


## Menu behavior when scrolling when menu is open

make sure right click menu that is already open, stay static relative to its item.

if the right clicked item is in a table, it is usally reasonable to make the item right clicked selected, and unselect all other selected items.

when right click menu is open, user should still be able to scroll the menu's parent item's container.

one reasonable behavior is close the menu if the parent item of the menu has just been scrolled outside its container, and becomes invisible.

Use `config.anchor` to bind the menu position to the right-clicked item. Provide `getRect`, `getTargetEl`, `getVisibilityRoot`, `offsetX`, and `offsetY` when the item sits inside a scroll container. Use `config.isBackdropScrollPassThrough: true` so the backdrop does not block wheel scrolling or right click on another item.