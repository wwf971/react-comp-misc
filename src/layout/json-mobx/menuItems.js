import { JsonMenuPathItem } from './jsonContextMenu';

const makeMenuItem = (id, label, data = {}, extra = {}) => ({
  id,
  label,
  data,
  ...extra,
});

export function getMenuItems(conversionMenu) {
  if (!conversionMenu) return [];

  const pathText = conversionMenu.path || conversionMenu.itemMeta?.path || 'root';
  const items = [
    {
      id: 'json-menu-path',
      label: pathText,
      isDisabled: true,
      comp: JsonMenuPathItem,
      compProps: { pathText },
      preferredWidth: 220,
    },
  ];
  const { menuType } = conversionMenu;

  if (conversionMenu.availableConversions) {
    items.push({
      id: 'convert-to',
      label: 'Convert to',
      children: conversionMenu.availableConversions.map((conv) => ({
        id: `convert-to-${conv.targetType}`,
        label: conv.targetType,
        isDisabled: !conv.canConvert,
        data: { targetType: conv.targetType },
      })),
    });
  }

  if (menuType === 'key' || menuType === 'value') {
    items.push(
      makeMenuItem('add-entry-above', 'Add entry above', { action: 'addEntryAbove' }),
      makeMenuItem('add-entry-below', 'Add entry below', { action: 'addEntryBelow' }),
      makeMenuItem('delete-entry', 'Delete entry', { action: 'deleteEntry' }),
      makeMenuItem('delete-dict', 'Delete dict', { action: 'deleteDict' }),
      makeMenuItem('delete-all-entries', 'Delete all entries', { action: 'deleteAllEntries' }),
    );

    if (conversionMenu.value && typeof conversionMenu.value === 'object') {
      if (Array.isArray(conversionMenu.value)) {
        items.push(makeMenuItem('add-child-item', 'Add child item', { action: 'addItem' }));
      } else {
        items.push(makeMenuItem('add-child-entry', 'Add child entry', { action: 'addEntry' }));
      }
    }

    if (conversionMenu.isSingleEntryInParent && conversionMenu.itemKey) {
      const valueIsPrimitive = conversionMenu.value === null
        || conversionMenu.value === undefined
        || typeof conversionMenu.value !== 'object';
      items.push(makeMenuItem(
        'convert-parent-dict-to-text',
        'Convert parent dict to text',
        { action: 'convertParentDictToText' },
        { isDisabled: !valueIsPrimitive },
      ));
    }

    if (menuType === 'key' || (menuType === 'value'
      && (conversionMenu.value === null
        || conversionMenu.value === undefined
        || typeof conversionMenu.value !== 'object'))) {
      items.push(
        makeMenuItem('move-entry-up', 'Move up', { action: 'moveEntryUp' }, { isDisabled: conversionMenu.isFirstInParent }),
        makeMenuItem('move-entry-down', 'Move down', { action: 'moveEntryDown' }, { isDisabled: conversionMenu.isLastInParent }),
        makeMenuItem('move-entry-to-top', 'Move to top', { action: 'moveEntryToTop' }, { isDisabled: conversionMenu.isFirstInParent }),
        makeMenuItem('move-entry-to-bottom', 'Move to bottom', { action: 'moveEntryToBottom' }, { isDisabled: conversionMenu.isLastInParent }),
      );
    }
  } else if (menuType === 'arrayItem') {
    items.push(
      makeMenuItem('add-item-above', 'Add item above', { action: 'addItemAbove' }),
      makeMenuItem('add-item-below', 'Add item below', { action: 'addItemBelow' }),
      makeMenuItem('delete-array-item', 'Delete item', { action: 'deleteArrayItem' }),
      makeMenuItem('delete-array', 'Delete array', { action: 'deleteArray' }),
      makeMenuItem('delete-all-items', 'Delete all items', { action: 'clearArray' }),
    );

    if (conversionMenu.isSingleEntryInParent) {
      const valueIsPrimitive = conversionMenu.value === null
        || conversionMenu.value === undefined
        || typeof conversionMenu.value !== 'object';
      items.push(makeMenuItem(
        'convert-parent-array-to-text',
        'Convert parent array to text',
        { action: 'convertParentArrayToText' },
        { isDisabled: !valueIsPrimitive },
      ));
    }

    if (conversionMenu.value && typeof conversionMenu.value === 'object') {
      if (Array.isArray(conversionMenu.value)) {
        items.push(makeMenuItem('add-child-item', 'Add child item', { action: 'addItem' }));
      } else {
        items.push(makeMenuItem('add-child-entry', 'Add child entry', { action: 'addEntry' }));
      }
    }

    items.push(
      makeMenuItem('move-item-up', 'Move up', { action: 'moveItemUp' }, { isDisabled: conversionMenu.isFirstInParent }),
      makeMenuItem('move-item-down', 'Move down', { action: 'moveItemDown' }, { isDisabled: conversionMenu.isLastInParent }),
      makeMenuItem('move-item-to-top', 'Move to top', { action: 'moveItemToTop' }, { isDisabled: conversionMenu.isFirstInParent }),
      makeMenuItem('move-item-to-bottom', 'Move to bottom', { action: 'moveItemToBottom' }, { isDisabled: conversionMenu.isLastInParent }),
    );
  } else if (menuType === 'emptyDict') {
    items.push(
      makeMenuItem('add-entry', 'Add entry', { action: 'addEntry' }),
      makeMenuItem('delete-dict', 'Delete dict', { action: 'deleteDict' }),
    );
  } else if (menuType === 'emptyList') {
    items.push(makeMenuItem('add-item', 'Add item', { action: 'addItem' }));
  }

  return items;
}
