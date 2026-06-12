import { runInAction } from 'mobx';
import { addKeyInOrder } from './keyOrderStore.js';
import { navigateToPath, parsePathToSegments } from '../json/pathUtils.js';

export const getJsonDropInfoFromEvent = ({
  event,
  itemMeta,
  itemPreviousMeta,
  itemNextMeta,
  containerChildKind,
  containerPath,
}) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const yInRow = event.clientY - rect.top;
  const rowHeight = rect.height || 1;
  const canDropInside = Boolean(containerChildKind && containerPath !== undefined);

  if (canDropInside && yInRow > rowHeight * 0.28 && yInRow < rowHeight * 0.72) {
    return {
      targetItemId: itemMeta.itemId,
      drop: {
        type: 'inside',
        containerKind: containerChildKind,
        containerPath,
        itemBeforePath: null,
        itemAfterPath: null,
      },
    };
  }

  if (yInRow < rowHeight / 2) {
    return {
      targetItemId: itemMeta.itemId,
      drop: {
        type: 'before',
        containerKind: itemMeta.containerKind,
        containerPath: itemMeta.containerPath,
        itemBeforePath: itemPreviousMeta?.path ?? null,
        itemAfterPath: itemMeta.path,
      },
    };
  }

  return {
    targetItemId: itemMeta.itemId,
    drop: {
      type: 'after',
      containerKind: itemMeta.containerKind,
      containerPath: itemMeta.containerPath,
      itemBeforePath: itemMeta.path,
      itemAfterPath: itemNextMeta?.path ?? null,
    },
  };
};

export const getJsonEmptyDropInfo = ({ targetItemId, containerKind, containerPath }) => ({
  targetItemId,
  drop: {
    type: 'inside',
    containerKind,
    containerPath,
    itemBeforePath: null,
    itemAfterPath: null,
  },
});

export const getIsJsonDropAllowedByDefault = ({ dropInfo, dragOperationStore, selectionOperationStore }) => {
  const itemDraggedId = dragOperationStore.itemDraggedId;
  const itemDraggedMeta = dragOperationStore.itemDraggedMeta;
  if (!itemDraggedId || !itemDraggedMeta || !dropInfo?.drop) return false;
  if (!['arrayItem', 'objectEntry'].includes(itemDraggedMeta.itemKind)) return false;
  if (dropInfo.targetItemId === itemDraggedId) return false;
  if (selectionOperationStore?.getIsItemInsideSelectedItem(dropInfo.targetItemId)) return false;
  if (dropInfo.drop.itemBeforePath === itemDraggedMeta.path || dropInfo.drop.itemAfterPath === itemDraggedMeta.path) return false;
  if (itemDraggedMeta.itemKind === 'arrayItem') return dropInfo.drop.containerKind === 'array';
  if (itemDraggedMeta.itemKind === 'objectEntry') return dropInfo.drop.containerKind === 'object';
  return false;
};

const getPathParent = (dataRoot, path) => {
  const segments = parsePathToSegments(path);
  const itemSegment = segments[segments.length - 1];
  const containerSegments = segments.slice(0, -1);
  const container = containerSegments.length === 0 ? dataRoot : navigateToPath(dataRoot, containerSegments);
  return { container, itemSegment };
};

const getContainerByPath = (dataRoot, path) => {
  if (!path) return dataRoot;
  return navigateToPath(dataRoot, parsePathToSegments(path));
};

const getArrayIndexFromItemPath = (path) => {
  const segments = parsePathToSegments(path);
  return segments[segments.length - 1]?.index ?? null;
};

const getObjectKeyFromItemPath = (path) => {
  const segments = parsePathToSegments(path);
  return segments[segments.length - 1]?.key ?? null;
};

export const moveJsonItemByRequest = ({ dataRoot, moveRequest }) => {
  const { source, drop } = moveRequest;
  if (!source || !drop) return { code: -1, message: 'Invalid move request' };

  if (source.itemKind === 'arrayItem') {
    return moveJsonArrayItem({ dataRoot, source, drop });
  }
  if (source.itemKind === 'objectEntry') {
    return moveJsonObjectEntry({ dataRoot, source, drop });
  }
  return { code: -1, message: 'Only array items and object entries can be moved' };
};

const moveJsonArrayItem = ({ dataRoot, source, drop }) => {
  const { container: arraySource, itemSegment } = getPathParent(dataRoot, source.path);
  const arrayTarget = getContainerByPath(dataRoot, drop.containerPath);
  if (!Array.isArray(arraySource) || !Array.isArray(arrayTarget) || itemSegment?.type !== 'arr') {
    return { code: -1, message: 'Invalid array move' };
  }

  const indexSource = itemSegment.index;
  const indexAfter = drop.itemAfterPath ? getArrayIndexFromItemPath(drop.itemAfterPath) : null;
  const indexBefore = drop.itemBeforePath ? getArrayIndexFromItemPath(drop.itemBeforePath) : null;
  let indexTarget = arrayTarget.length;
  if (drop.type === 'before' && indexAfter !== null) {
    indexTarget = indexAfter;
  } else if (drop.type === 'after' && indexBefore !== null) {
    indexTarget = indexBefore + 1;
  }

  runInAction(() => {
    const itemMoved = arraySource[indexSource];
    arraySource.splice(indexSource, 1);
    if (arraySource === arrayTarget && indexSource < indexTarget) {
      indexTarget -= 1;
    }
    arrayTarget.splice(indexTarget, 0, itemMoved);
  });

  return { code: 0, message: 'Moved' };
};

const moveJsonObjectEntry = ({ dataRoot, source, drop }) => {
  const { container: objectSource, itemSegment } = getPathParent(dataRoot, source.path);
  const objectTarget = getContainerByPath(dataRoot, drop.containerPath);
  if (!objectSource || !objectTarget || Array.isArray(objectSource) || Array.isArray(objectTarget) || itemSegment?.type !== 'obj') {
    return { code: -1, message: 'Invalid object move' };
  }

  const keySource = itemSegment.key;
  const keyAfter = drop.itemAfterPath ? getObjectKeyFromItemPath(drop.itemAfterPath) : null;
  const keyBefore = drop.itemBeforePath ? getObjectKeyFromItemPath(drop.itemBeforePath) : null;
  if (objectSource !== objectTarget && Object.prototype.hasOwnProperty.call(objectTarget, keySource)) {
    return { code: -1, message: 'Target object already has this key' };
  }

  runInAction(() => {
    const valueMoved = objectSource[keySource];
    if (objectSource !== objectTarget) {
      delete objectSource[keySource];
      objectTarget[keySource] = valueMoved;
    }
    if (drop.type === 'before' && keyAfter) {
      addKeyInOrder(objectTarget, keySource, 'above', keyAfter);
    } else if (drop.type === 'after' && keyBefore) {
      addKeyInOrder(objectTarget, keySource, 'below', keyBefore);
    } else {
      addKeyInOrder(objectTarget, keySource, 'below', null);
    }
  });

  return { code: 0, message: 'Moved' };
};
