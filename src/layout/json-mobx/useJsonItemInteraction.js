import React from 'react';
import { reaction } from 'mobx';
import { getJsonContextMenuTargetMeta } from './jsonContextMenu';
import { previewJsonDropFromPoint } from './jsonDropPreview';
import { completeJsonMoveDrop } from './jsonMoveCompletion';

export const useJsonSelectionRenderRevision = (selection) => {
  const [revisionRender, setRevisionRender] = React.useState(0);

  React.useEffect(() => {
    if (!selection) return undefined;
    return reaction(
      () => selection.revisionSelection,
      () => {
        setRevisionRender((revisionPrevious) => revisionPrevious + 1);
      }
    );
  }, [selection]);

  return revisionRender;
};

const useJsonPointerDragHandler = ({
  isDragMoveEnabled,
  selectionItemId,
  drag,
  selection,
  pointerDragRef,
  dragAttemptRef,
  previewDropFromPoint,
  completePointerDrop,
}) => {
  const handlePointerDownCapture = React.useCallback((event) => {
    const itemSelectedId = selection?.itemSelectedId;
    const isPointerInsideSelectedItem = selection?.getIsItemInsideSelectedItem(selectionItemId);
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
          selection?.selectItem(selectionItemId);
        }
        drag.startDrag(itemDraggedId);
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
        selection?.suppressNextSelectionClick();
        completePointerDrop();
        setTimeout(() => {
          selection?.clearNextSelectionClickSuppressed();
        }, 200);
      } else {
        selection?.selectNextFromItem(selectionItemId);
      }
      setTimeout(() => {
        dragAttemptRef.current = null;
      }, 0);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  }, [
    completePointerDrop,
    drag,
    dragAttemptRef,
    isDragMoveEnabled,
    pointerDragRef,
    previewDropFromPoint,
    selection,
    selectionItemId,
  ]);

  return handlePointerDownCapture;
};

export const useJsonItemInteraction = ({
  selectionItemId,
  itemMeta,
  itemSelectionState,
  isDragMoveEnabled,
  drag,
  selection,
  requestJsonContextMenu,
  pathQueryParentInfo,
  emitEvent,
}) => {
  const dragAttemptRef = React.useRef(null);
  const pointerDragRef = React.useRef(null);

  const previewDropFromPoint = React.useCallback((clientX, clientY) => {
    previewJsonDropFromPoint({
      clientX,
      clientY,
      drag,
      selection,
    });
  }, [drag, selection]);

  const completePointerDrop = React.useCallback(async () => {
    await completeJsonMoveDrop({
      drag,
      selection,
      emitEvent,
    });
  }, [drag, emitEvent, selection]);

  const handleSelectionMouseDownCapture = React.useCallback((event) => {
    if (!event.shiftKey && event.button === 0) {
      if (event.target.closest('.json-value.editable, .json-key.editable, .json-boolean.clickable')) {
        return;
      }
      selection?.clearSelection();
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
  }, [itemSelectionState, selection]);

  const handleSelectionClickCapture = React.useCallback((event) => {
    if (!event.shiftKey || event.button !== 0) return;
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    if (selection?.consumeNextSelectionClickSuppressed()) {
      dragAttemptRef.current = null;
      return;
    }
    if (dragAttemptRef.current?.isClickSuppressed) {
      dragAttemptRef.current = null;
      return;
    }
    dragAttemptRef.current = null;
    selection?.selectNextFromItem(selectionItemId);
  }, [selectionItemId, selection]);

  const handleContextMenuCapture = React.useCallback((event) => {
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    const itemMetaTarget = getJsonContextMenuTargetMeta({
      itemIdClicked: selectionItemId,
      itemMetaClicked: itemMeta,
      selectionOperationStore: selection,
    });
    requestJsonContextMenu?.({
      itemMeta: itemMetaTarget,
      position: { x: event.clientX, y: event.clientY },
      queryParentInfo: pathQueryParentInfo,
    });
  }, [itemMeta, pathQueryParentInfo, requestJsonContextMenu, selectionItemId, selection]);

  const handlePointerDownCapture = useJsonPointerDragHandler({
    completePointerDrop,
    drag,
    dragAttemptRef,
    isDragMoveEnabled,
    pointerDragRef,
    previewDropFromPoint,
    selection,
    selectionItemId,
  });

  return {
    handleContextMenuCapture,
    handlePointerDownCapture,
    handleSelectionClickCapture,
    handleSelectionMouseDownCapture,
  };
};
