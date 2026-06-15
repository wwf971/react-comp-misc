import React from 'react';
import { reaction } from 'mobx';
import { getJsonContextMenuTargetMeta } from './jsonContextMenu';
import { previewJsonDropFromPoint } from './jsonDropPreview';
import { completeJsonMoveDrop } from './jsonMoveCompletion';

export const useJsonSelectionRenderRevision = (selectionOperationStore) => {
  const [revisionRender, setRevisionRender] = React.useState(0);

  React.useEffect(() => {
    if (!selectionOperationStore) return undefined;
    return reaction(
      () => selectionOperationStore.selectionRevision,
      () => {
        setRevisionRender((revisionPrevious) => revisionPrevious + 1);
      }
    );
  }, [selectionOperationStore]);

  return revisionRender;
};

const useJsonPointerDragHandler = ({
  isDragMoveEnabled,
  selectionItemId,
  dragOperationStore,
  selectionOperationStore,
  pointerDragRef,
  dragAttemptRef,
  previewDropFromPoint,
  completePointerDrop,
}) => {
  const handlePointerDownCapture = React.useCallback((event) => {
    const itemSelectedId = selectionOperationStore?.selectedItemId;
    const isPointerInsideSelectedItem = selectionOperationStore?.getIsItemInsideSelectedItem(selectionItemId);
    const isDragFromSelectedItem = Boolean(itemSelectedId && isPointerInsideSelectedItem);
    const isDragFromItemDirect = !isDragFromSelectedItem;
    const itemDraggedId = isDragFromSelectedItem ? itemSelectedId : selectionItemId;
    if (!isDragMoveEnabled || !event.shiftKey || event.button !== 0 || (!isDragFromSelectedItem && !isDragFromItemDirect)) return;
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
        if (isDragFromItemDirect) {
          selectionOperationStore?.selectItem(selectionItemId);
        }
        dragOperationStore.startDrag(itemDraggedId);
      }
      if (pointerDrag.isDragging) {
        previewDropFromPoint(eventMove.clientX, eventMove.clientY);
      }
    };

    const handlePointerUp = () => {
      const pointerDrag = pointerDragRef.current;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      pointerDragRef.current = null;
      if (pointerDrag?.isDragging) {
        selectionOperationStore?.suppressNextSelectionClick();
        completePointerDrop();
        setTimeout(() => {
          selectionOperationStore?.clearNextSelectionClickSuppressed();
        }, 200);
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
    dragAttemptRef,
    dragOperationStore,
    isDragMoveEnabled,
    pointerDragRef,
    previewDropFromPoint,
    selectionItemId,
    selectionOperationStore,
  ]);

  return handlePointerDownCapture;
};

export const useJsonItemInteraction = ({
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

  const previewDropFromPoint = React.useCallback((clientX, clientY) => {
    previewJsonDropFromPoint({
      clientX,
      clientY,
      dragOperationStore,
      selectionOperationStore,
    });
  }, [dragOperationStore, selectionOperationStore]);

  const completePointerDrop = React.useCallback(async () => {
    await completeJsonMoveDrop({
      dragOperationStore,
      selectionOperationStore,
      onChange,
    });
  }, [dragOperationStore, onChange, selectionOperationStore]);

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

  const handlePointerDownCapture = useJsonPointerDragHandler({
    completePointerDrop,
    dragAttemptRef,
    dragOperationStore,
    isDragMoveEnabled,
    pointerDragRef,
    previewDropFromPoint,
    selectionItemId,
    selectionOperationStore,
  });

  return {
    handleContextMenuCapture,
    handlePointerDownCapture,
    handleSelectionClickCapture,
    handleSelectionMouseDownCapture,
  };
};
