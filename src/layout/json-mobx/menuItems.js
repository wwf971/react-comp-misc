/**
 * Generate menu items based on menu type and context
 * @param {Object} conversionMenu - Menu context with menuType, value, availableConversions, etc.
 * @returns {Array} Array of menu item objects
 */
export function getMenuItems(conversionMenu) {
  if (!conversionMenu) return [];

  const items = [];
  const { menuType } = conversionMenu;
  
  // Add type conversion menu if available (for values)
  if (conversionMenu.availableConversions) {
    items.push({
      type: 'menu',
      name: 'Convert to',
      children: conversionMenu.availableConversions.map(conv => ({
        type: 'item',
        name: conv.targetType,
        disabled: !conv.canConvert,
        data: { targetType: conv.targetType }
      }))
    });
  }
  
  // Add delete options based on menu type
  if (menuType === 'key' || menuType === 'value') {
    // For dict entries (key or value)
    items.push(
      {
        type: 'item',
        name: 'Add entry above',
        data: { action: 'addEntryAbove' }
      },
      {
        type: 'item',
        name: 'Add entry below',
        data: { action: 'addEntryBelow' }
      },
      {
        type: 'item',
        name: 'Delete entry',
        data: { action: 'deleteEntry' }
      },
      {
        type: 'item',
        name: 'Delete dict',
        data: { action: 'deleteDict' }
      },
      {
        type: 'item',
        name: 'Delete all entries',
        data: { action: 'deleteAllEntries' }
      }
    );
    
    // If this is the only entry in parent dict, show option (disabled if value is not primitive)
    if (conversionMenu.isSingleEntryInParent && conversionMenu.itemKey) {
      const valueIsPrimitive = conversionMenu.value === null || 
                                conversionMenu.value === undefined || 
                                typeof conversionMenu.value !== 'object';
      items.push({
        type: 'item',
        name: 'Convert parent dict to text',
        disabled: !valueIsPrimitive,
        data: { action: 'convertParentDictToText' }
      });
    }
    
    // Add move up/down for dict entries
    // For values, only allow if value is primitive
    if (menuType === 'key' || (menuType === 'value' && 
        (conversionMenu.value === null || 
          conversionMenu.value === undefined || 
          typeof conversionMenu.value !== 'object'))) {
      items.push(
        {
          type: 'item',
          name: 'Move up',
          disabled: conversionMenu.isFirstInParent,
          data: { action: 'moveEntryUp' }
        },
        {
          type: 'item',
          name: 'Move down',
          disabled: conversionMenu.isLastInParent,
          data: { action: 'moveEntryDown' }
        },
        {
          type: 'item',
          name: 'Move to top',
          disabled: conversionMenu.isFirstInParent,
          data: { action: 'moveEntryToTop' }
        },
        {
          type: 'item',
          name: 'Move to bottom',
          disabled: conversionMenu.isLastInParent,
          data: { action: 'moveEntryToBottom' }
        }
      );
    }
  } else if (menuType === 'arrayItem') {
    // For array items
    items.push(
      {
        type: 'item',
        name: 'Add item above',
        data: { action: 'addItemAbove' }
      },
      {
        type: 'item',
        name: 'Add item below',
        data: { action: 'addItemBelow' }
      },
      {
        type: 'item',
        name: 'Delete item',
        data: { action: 'deleteArrayItem' }
      },
      {
        type: 'item',
        name: 'Delete array',
        data: { action: 'deleteArray' }
      },
      {
        type: 'item',
        name: 'Delete all items',
        data: { action: 'clearArray' }
      }
    );
    
    // If this is the only item in parent array, show option (disabled if item is not primitive)
    if (conversionMenu.isSingleEntryInParent) {
      const valueIsPrimitive = conversionMenu.value === null || 
                                conversionMenu.value === undefined || 
                                typeof conversionMenu.value !== 'object';
      items.push({
        type: 'item',
        name: 'Convert parent array to text',
        disabled: !valueIsPrimitive,
        data: { action: 'convertParentArrayToText' }
      });
    }
    
    // Add move up/down for array items (only for primitive values)
    const itemIsPrimitive = conversionMenu.value === null || 
                            conversionMenu.value === undefined || 
                            typeof conversionMenu.value !== 'object';
    if (itemIsPrimitive) {
      items.push(
        {
          type: 'item',
          name: 'Move up',
          disabled: conversionMenu.isFirstInParent,
          data: { action: 'moveItemUp' }
        },
        {
          type: 'item',
          name: 'Move down',
          disabled: conversionMenu.isLastInParent,
          data: { action: 'moveItemDown' }
        },
        {
          type: 'item',
          name: 'Move to top',
          disabled: conversionMenu.isFirstInParent,
          data: { action: 'moveItemToTop' }
        },
        {
          type: 'item',
          name: 'Move to bottom',
          disabled: conversionMenu.isLastInParent,
          data: { action: 'moveItemToBottom' }
        }
      );
    }
  } else if (menuType === 'emptyDict') {
    // For empty dict
    items.push(
      {
        type: 'item',
        name: 'Add entry',
        data: { action: 'addEntry' }
      },
      {
        type: 'item',
        name: 'Delete dict',
        data: { action: 'deleteDict' }
      }
    );
  } else if (menuType === 'emptyList') {
    // For empty list
    items.push(
      {
        type: 'item',
        name: 'Add item',
        data: { action: 'addItem' }
      }
    );
  }
  
  return items;
}