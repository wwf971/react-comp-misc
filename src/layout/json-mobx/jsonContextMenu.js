import React from 'react';
import { getAvailableConversions } from './typeConvert.js';

export const JsonMenuPathItem = ({ pathText }) => (
  React.createElement('span', { className: 'json-menu-path-item' }, pathText || 'root')
);

const getIsPrimitive = (value) => value === null || value === undefined || typeof value !== 'object';

export const getJsonContextMenuRequestFromItemMeta = ({ itemMeta, position, queryParentInfo }) => {
  if (!itemMeta) return null;

  const value = itemMeta.value;
  const valueType = value === null || value === undefined ? 'null' : typeof value;
  const isPrimitiveValue = getIsPrimitive(value);
  const parentInfo = queryParentInfo ? queryParentInfo(itemMeta.path) : { isSingleEntryInParent: false };

  if (itemMeta.itemKind === 'objectEntry') {
    return {
      position,
      menuType: isPrimitiveValue ? 'value' : 'key',
      itemKey: itemMeta.itemKey,
      path: itemMeta.path,
      value,
      currentValue: isPrimitiveValue ? value : undefined,
      currentType: isPrimitiveValue ? valueType : undefined,
      availableConversions: isPrimitiveValue
        ? getAvailableConversions(value, valueType, { includeArray: true, includeObject: true })
        : undefined,
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent,
      itemMeta,
    };
  }

  if (itemMeta.itemKind === 'arrayItem') {
    return {
      position,
      menuType: 'arrayItem',
      itemKey: itemMeta.itemKey,
      path: itemMeta.path,
      value,
      currentValue: isPrimitiveValue ? value : undefined,
      currentType: isPrimitiveValue ? valueType : undefined,
      availableConversions: isPrimitiveValue
        ? getAvailableConversions(value, valueType, { includeArray: true, includeObject: true })
        : undefined,
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent,
      itemMeta,
    };
  }

  return null;
};

export const getJsonContextMenuTargetMeta = ({ itemIdClicked, itemMetaClicked, selectionOperationStore }) => {
  const isSelectionExisting = Boolean(selectionOperationStore?.itemSelectedId);
  if (!isSelectionExisting) {
    selectionOperationStore?.selectItem(itemIdClicked);
    return itemMetaClicked;
  }

  if (selectionOperationStore.getIsItemInsideSelectedItem(itemIdClicked)) {
    return selectionOperationStore.itemSelectedMeta || itemMetaClicked;
  }

  selectionOperationStore.selectItem(itemIdClicked);
  return itemMetaClicked;
};
