import {
  getJsonArraySelectionItemId,
  getJsonObjectSelectionItemId,
} from './jsonSelectionOperationStore';
import { parsePathToSegments } from '../json/pathUtils';

const getJsonArrayItemIndexFromPath = (path) => {
  const segments = parsePathToSegments(path);
  return segments[segments.length - 1]?.index ?? null;
};

const getJsonArrayItemPathAfterMove = ({ itemDraggedMeta, drop }) => {
  const itemSourceIndex = Number(itemDraggedMeta.itemKey);
  const itemAfterIndex = drop.itemAfterPath ? getJsonArrayItemIndexFromPath(drop.itemAfterPath) : null;
  const itemBeforeIndex = drop.itemBeforePath ? getJsonArrayItemIndexFromPath(drop.itemBeforePath) : null;
  let itemTargetIndex = 0;
  if (drop.type === 'before' && itemAfterIndex !== null) {
    itemTargetIndex = itemAfterIndex;
  } else if (drop.type === 'after' && itemBeforeIndex !== null) {
    itemTargetIndex = itemBeforeIndex + 1;
  }
  if (itemDraggedMeta.containerPath === drop.containerPath && itemSourceIndex < itemTargetIndex) {
    itemTargetIndex -= 1;
  }
  return drop.containerPath ? `${drop.containerPath}..${itemTargetIndex}` : `..${itemTargetIndex}`;
};

export const getJsonSelectionItemIdAfterMove = ({ itemDraggedMeta, drop }) => {
  if (!itemDraggedMeta || !drop) return null;
  if (itemDraggedMeta.itemKind === 'objectEntry') {
    const key = itemDraggedMeta.itemKey;
    const path = drop.containerPath ? `${drop.containerPath}.${key}` : key;
    return getJsonObjectSelectionItemId(path);
  }
  if (itemDraggedMeta.itemKind === 'arrayItem') {
    return getJsonArraySelectionItemId(getJsonArrayItemPathAfterMove({ itemDraggedMeta, drop }));
  }
  return itemDraggedMeta.itemId ?? null;
};

export const completeJsonMoveDrop = async ({
  dragOperationStore,
  selectionOperationStore,
  onChange,
}) => {
  const itemDraggedMeta = dragOperationStore.itemDraggedMeta;
  const dropInfoActive = dragOperationStore.dropInfoActive;
  const itemDragStateActive = dropInfoActive?.targetItemId
    ? dragOperationStore.getItemDragState(dropInfoActive.targetItemId)
    : null;
  const isDropInvalid = Boolean(
    itemDraggedMeta
      && onChange
      && (!dropInfoActive?.drop || itemDragStateActive?.isDropAllowed === false)
  );
  const isDropCommitted = Boolean(
    itemDraggedMeta
      && dropInfoActive?.drop
      && itemDragStateActive?.isDropAllowed !== false
      && onChange
  );
  const selectionRevisionBeforeMove = selectionOperationStore?.selectionRevision;
  dragOperationStore.clearAll();
  if (isDropInvalid) {
    await onChange(itemDraggedMeta.path, {
      old: { type: itemDraggedMeta.itemKind },
      new: { type: itemDraggedMeta.itemKind },
      _action: 'moveJsonItem',
      _invalidDrop: true,
      moveRequest: {
        source: itemDraggedMeta,
        drop: dropInfoActive?.drop ?? null,
      },
    });
    return;
  }
  if (!isDropCommitted) return;

  const result = await onChange(itemDraggedMeta.path, {
    old: { type: itemDraggedMeta.itemKind },
    new: { type: itemDraggedMeta.itemKind },
    _action: 'moveJsonItem',
    moveRequest: {
      source: itemDraggedMeta,
      drop: dropInfoActive.drop,
    },
  });
  if (result && result.code !== 0) return;
  if (selectionOperationStore?.selectionRevision !== selectionRevisionBeforeMove) return;

  const itemIdNext = getJsonSelectionItemIdAfterMove({
    itemDraggedMeta,
    drop: dropInfoActive.drop,
  });
  selectionOperationStore?.selectItem(itemIdNext);
};
