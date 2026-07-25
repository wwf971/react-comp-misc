


## Prepend controls before subgroup title and item

For direct children of a group, use `leadingControlList` on the child node.

```javascript
{
  id: 'blockA',
  type: 'group',
  label: 'Block A',
  leadingControlList: [
    { id: 'drag', type: 'drag' },
    { id: 'delete', type: 'action', iconName: 'delete', kind: 'danger' },
    { id: 'inspect', type: 'action', iconCompName: 'inspectIcon' },
    { id: 'mark', type: 'custom', compName: 'markButton', data: { label: 'A' } },
  ],
  children: [],
}
```

The same format works for subgroup nodes, property nodes, and custom item nodes. Built-in icons use `iconName`. Custom icons and controls are resolved by `config.getComp`.

Events still go through `onEvent`:

```text
checkbox -> propertyDirectItemCheckChange
action   -> propertyDirectItemAction
custom   -> propertyDirectLeadingControlEvent
```

To enable dragging, the parent group should set `isChildrenDraggable: true`, and the child should include `{ type: 'drag' }` in `leadingControlList`.

### Visual alignment of icons

Keep prepended controls visually small and centered:

- Use SVG for icons.
- Use a centered `viewBox`, usually square.
- Use similar visual size, normally around 13px to 14px.
- For custom button-like controls, use `display: inline-flex`, `align-items: center`, `justify-content: center`, and `line-height: 1`.
- Avoid extra top/bottom padding or margins inside the custom icon component.

## Alignment of key cells and value cells

If content of a key cell or value cell is too long, and exceeds cell width, then the overflown part will be hidden, but user should be able to scroll using mouse wheel when hovering on the cell. refer to `frontend-scrollable-button-group.md` for this kind of layout, although that document is for button group, but the layout design is same.