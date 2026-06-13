import React from 'react';
import {
  getJsonArraySelectionItemId,
  getJsonObjectSelectionItemId,
} from './jsonSelectionOperationStore';
import {
  getIsJsonDropAllowedByDefault,
  getJsonDropInfoFromClientY,
  getJsonEmptyDropInfo,
} from './jsonDragMove';
import { getJsonContextMenuTargetMeta } from './jsonContextMenu';

export const useJsonItemInteractionHandlers = ({
  selectionItemId,
  itemMeta,
  itemSelectionState,
  isDragMoveEnabled,
  dragOperationStore,
  selectionOperationStore,
  requestJsonContextMenu,
  queryParentInfo,
  onChange,
}) => {
  const dragAttemptRef = React.useRef(null);
  const pointerDragRef = React.useRef(null);

  const getSelectionItemIdAfterMove = React.useCallback((itemDraggedMeta, drop) => {
    if (!itemDraggedMeta || !drop) return null;
    if (itemDraggedMeta.itemKind === 'objectEntry') {
      const key = itemDraggedMeta.itemKey;
      const path = drop.containerPath ? `${drop.containerPath}.${key}` : key;
      return getJsonObjectSelectionItemId(path);
    }
    if (itemDraggedMeta.itemKind === 'arrayItem') {
      return getJsonArraySelectionItemId(itemDraggedMeta.path);
    }
    return itemDraggedMeta.itemId ?? null;
  }, []);

  const previewDropFromPoint = React.useCallback((clientX, clientY) => {
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
    const itemIdTarget = elementSelectionTarget?.dataset.jsonSelectionItemId;
    const itemMetaTarget = itemIdTarget ? dragOperationStore.itemMetaById[itemIdTarget] : null;
    if (!elementSelectionTarget || !itemMetaTarget) {
      dragOperationStore.clearDropPreview();
      return;
    }

    const dropInfo = getJsonDropInfoFromClientY({
      clientY,
      itemMeta: itemMetaTarget,
      itemPreviousMeta: itemMetaTarget.itemPreviousPath ? { path: itemMetaTarget.itemPreviousPath } : null,
      itemNextMeta: itemMetaTarget.itemNextPath ? { path: itemMetaTarget.itemNextPath } : null,
      containerChildKind: itemMetaTarget.containerChildKind,
      containerPath: itemMetaTarget.containerPathForInside,
      rect: elementSelectionTarget.getBoundingClientRect(),
    });
    const isDropAllowed = getIsJsonDropAllowedByDefault({
      dropInfo,
      dragOperationStore,
      selectionOperationStore,
    });
    dragOperationStore.previewDrop(dropInfo, isDropAllowed);
  }, [dragOperationStore, selectionOperationStore]);

  const completePointerDrop = React.useCallback(async () => {
    const itemDraggedMeta = dragOperationStore.itemDraggedMeta;
    const dropInfoActive = dragOperationStore.dropInfoActive;
    const itemDragStateActive = dropInfoActive?.targetItemId
      ? dragOperationStore.getItemDragState(dropInfoActive.targetItemId)
      : null;
    const isDropCommitted = Boolean(
      itemDraggedMeta
        && dropInfoActive?.drop
        && itemDragStateActive?.isDropAllowed !== false
        && onChange
    );
    dragOperationStore.clearAll();
    if (isDropCommitted) {
      const result = await onChange(itemDraggedMeta.path, {
        old: { type: itemDraggedMeta.itemKind },
        new: { type: itemDraggedMeta.itemKind },
        _action: 'moveJsonItem',
        moveRequest: {
          source: itemDraggedMeta,
          drop: dropInfoActive.drop,
        },
      });
      if (!result || result.code === 0) {
        const itemIdNext = getSelectionItemIdAfterMove(itemDraggedMeta, dropInfoActive.drop);
        selectionOperationStore?.selectItem(itemIdNext);
      }
    }
  }, [dragOperationStore, getSelectionItemIdAfterMove, onChange, selectionOperationStore]);

  const handleSelectionMouseDownCapture = React.useCallback((event) => {
    if (!event.shiftKey && event.button === 0) {
      selectionOperationStore?.clearSelection();
      return;
    }
    if (!event.shiftKey || event.button !== 0) return;
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    dragAttemptRef.current = itemSelectionState?.isSelected
      ? { x: event.clientX, y: event.clientY, isClickSuppressed: false, isShiftDragStarted: true }
      : null;
    if (itemSelectionState?.isSelected) return;
    event.preventDefault();
    event.stopPropagation();
  }, [itemSelectionState, selectionOperationStore]);

  const handleSelectionClickCapture = React.useCallback((event) => {
    if (!event.shiftKey || event.button !== 0) return;
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    if (selectionOperationStore?.consumeNextSelectionClickSuppressed()) {
      dragAttemptRef.current = null;
      return;
    }
    if (dragAttemptRef.current?.isClickSuppressed) {
      dragAttemptRef.current = null;
      return;
    }
    dragAttemptRef.current = null;
    selectionOperationStore?.selectNextFromItem(selectionItemId);
  }, [selectionItemId, selectionOperationStore]);

  const handleContextMenuCapture = React.useCallback((event) => {
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    const itemMetaTarget = getJsonContextMenuTargetMeta({
      itemIdClicked: selectionItemId,
      itemMetaClicked: itemMeta,
      selectionOperationStore,
    });
    requestJsonContextMenu?.({
      itemMeta: itemMetaTarget,
      position: { x: event.clientX, y: event.clientY },
      queryParentInfo,
    });
  }, [itemMeta, queryParentInfo, requestJsonContextMenu, selectionItemId, selectionOperationStore]);

  const handlePointerDownCapture = React.useCallback((event) => {
    const itemDraggedId = selectionOperationStore?.selectedItemId;
    const isPointerInsideSelectedItem = selectionOperationStore?.getIsItemInsideSelectedItem(selectionItemId);
    if (!isDragMoveEnabled || !event.shiftKey || event.button !== 0 || !itemDraggedId || !isPointerInsideSelectedItem) return;
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;

    event.preventDefault();
    event.stopPropagation();
    dragAttemptRef.current = { x: event.clientX, y: event.clientY, isClickSuppressed: true, isShiftDragStarted: true };
    pointerDragRef.current = {
      x: event.clientX,
      y: event.clientY,
      isDragging: false,
    };

    const handlePointerMove = (eventMove) => {
      const pointerDrag = pointerDragRef.current;
      if (!pointerDrag) return;
      const distanceX = Math.abs(eventMove.clientX - pointerDrag.x);
      const distanceY = Math.abs(eventMove.clientY - pointerDrag.y);
      if (!pointerDrag.isDragging && (distanceX > 3 || distanceY > 3)) {
        pointerDrag.isDragging = true;
        dragOperationStore.startDrag(itemDraggedId);
      }
      if (pointerDrag.isDragging) {
        previewDropFromPoint(eventMove.clientX, eventMove.clientY);
      }
    };

    const handlePointerUp = async () => {
      const pointerDrag = pointerDragRef.current;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      pointerDragRef.current = null;
      if (pointerDrag?.isDragging) {
        selectionOperationStore?.suppressNextSelectionClick();
        completePointerDrop();
        setTimeout(() => {
          selectionOperationStore?.clearNextSelectionClickSuppressed();
        }, 0);
      } else {
        selectionOperationStore?.selectNextFromItem(selectionItemId);
      }
      setTimeout(() => {
        dragAttemptRef.current = null;
      }, 0);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  }, [
    completePointerDrop,
    dragOperationStore,
    isDragMoveEnabled,
    previewDropFromPoint,
    selectionItemId,
    selectionOperationStore,
  ]);

  return {
    handleContextMenuCapture,
    handlePointerDownCapture,
    handleSelectionClickCapture,
    handleSelectionMouseDownCapture,
  };
};
