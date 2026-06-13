import {
  getIsJsonDropAllowedByDefault,
  getJsonDropInfoFromClientY,
  getJsonEmptyDropInfo,
} from './jsonDragMove';

export const previewJsonDropFromPoint = ({
  clientX,
  clientY,
  dragOperationStore,
  selectionOperationStore,
}) => {
  const elementTarget = document.elementFromPoint(clientX, clientY);
  if (!elementTarget) {
    dragOperationStore.clearDropPreview();
    return;
  }

  const elementEmptyTarget = elementTarget.closest('[data-json-empty-drop-target]');
  if (elementEmptyTarget) {
    const dropInfo = getJsonEmptyDropInfo({
      targetItemId: elementEmptyTarget.dataset.jsonEmptyOwnerId,
      containerKind: elementEmptyTarget.dataset.jsonEmptyDropTarget,
      containerPath: elementEmptyTarget.dataset.jsonEmptyPath || '',
    });
    const isDropAllowed = getIsJsonDropAllowedByDefault({
      dropInfo,
      dragOperationStore,
      selectionOperationStore,
    });
    dragOperationStore.previewDrop(dropInfo, isDropAllowed);
    return;
  }

  const elementSelectionTarget = elementTarget.closest('[data-json-selection-item-id]');
  const itemTargetId = elementSelectionTarget?.dataset.jsonSelectionItemId;
  const itemTargetMeta = itemTargetId ? dragOperationStore.itemMetaById[itemTargetId] : null;
  if (!elementSelectionTarget || !itemTargetMeta) {
    dragOperationStore.clearDropPreview();
    return;
  }

  const dropInfo = getJsonDropInfoFromClientY({
    clientY,
    itemMeta: itemTargetMeta,
    itemPreviousMeta: itemTargetMeta.itemPreviousPath ? { path: itemTargetMeta.itemPreviousPath } : null,
    itemNextMeta: itemTargetMeta.itemNextPath ? { path: itemTargetMeta.itemNextPath } : null,
    containerChildKind: itemTargetMeta.containerChildKind,
    containerPath: itemTargetMeta.containerPathForInside,
    rect: elementSelectionTarget.getBoundingClientRect(),
  });
  const isDropAllowed = getIsJsonDropAllowedByDefault({
    dropInfo,
    dragOperationStore,
    selectionOperationStore,
  });
  dragOperationStore.previewDrop(dropInfo, isDropAllowed);
};
