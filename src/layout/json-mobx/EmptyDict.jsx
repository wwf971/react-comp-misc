import React from 'react';
import { useJsonContext } from './JsonContext';
import { getIsJsonDropAllowedByDefault, getJsonEmptyDropInfo } from './jsonDragMove';
import './JsonComp.css';

/**
 * EmptyDict - Placeholder for empty objects
 */
const EmptyDict = ({ path, onChange, containerOwnerSelectionItemId }) => {
  const { dragOperationStore, selectionOperationStore, showConversionMenu } = useJsonContext();
  const isDragMoveEnabled = Boolean(dragOperationStore);
  const targetItemId = containerOwnerSelectionItemId || 'json-empty-dict-root';
  const itemDragState = isDragMoveEnabled ? dragOperationStore.getItemDragState(targetItemId) : null;

  const handleContextMenu = (e) => {
    if (!path) return;
    
    e.preventDefault();
    e.stopPropagation();

    if (showConversionMenu) {
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        menuType: 'emptyDict',
        path: path
      });
    }
  };

  const handleDragOver = (event) => {
    if (!isDragMoveEnabled || !dragOperationStore.isDragging) return;
    event.preventDefault();
    event.stopPropagation();
    const dropInfo = getJsonEmptyDropInfo({
      targetItemId,
      containerKind: 'object',
      containerPath: path || '',
    });
    const isDropAllowed = getIsJsonDropAllowedByDefault({
      dropInfo,
      dragOperationStore,
      selectionOperationStore,
    });
    dragOperationStore.previewDrop(dropInfo, isDropAllowed);
  };

  const handleDrop = async (event) => {
    if (!isDragMoveEnabled || !dragOperationStore.isDragging) return;
    event.preventDefault();
    event.stopPropagation();
    const itemDraggedMeta = dragOperationStore.itemDraggedMeta;
    const dropInfoActive = dragOperationStore.dropInfoActive;
    const itemDragStateActive = dropInfoActive?.targetItemId
      ? dragOperationStore.getItemDragState(dropInfoActive.targetItemId)
      : null;
    if (itemDraggedMeta && dropInfoActive?.drop && itemDragStateActive?.isDropAllowed !== false && onChange) {
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
        selectionOperationStore?.clearSelection();
      }
    }
    dragOperationStore.clearAll();
  };

  const className = [
    'json-value',
    'json-empty-object',
    itemDragState?.isInsertInside ? 'is-json-insert-inside' : '',
    itemDragState?.isDropAllowed === false ? 'is-json-drop-blocked' : '',
  ].filter(Boolean).join(' ');

  return (
    <span 
      className={className}
      onContextMenu={handleContextMenu}
      onDragOver={isDragMoveEnabled ? handleDragOver : undefined}
      onDrop={isDragMoveEnabled ? handleDrop : undefined}
    >
      {'{ }'}
    </span>
  );
};

export default EmptyDict;
