import React from 'react';
import { useJsonContext } from './JsonContext';
import './JsonComp.css';

/**
 * EmptyList - Placeholder for empty arrays
 */
const EmptyList = ({ path, onChange, containerOwnerSelectionItemId }) => {
  const { dragOperationStore, showConversionMenu } = useJsonContext();
  const isDragMoveEnabled = Boolean(dragOperationStore);
  const targetItemId = containerOwnerSelectionItemId || 'json-empty-list-root';
  const itemDragState = isDragMoveEnabled ? dragOperationStore.getItemDragState(targetItemId) : null;

  const handleContextMenu = (e) => {
    if (!path) return;
    
    e.preventDefault();
    e.stopPropagation();

    if (showConversionMenu) {
      showConversionMenu({
        position: { x: e.clientX, y: e.clientY },
        menuType: 'emptyList',
        path: path
      });
    }
  };

  const className = [
    'json-value',
    'json-empty-array',
    itemDragState?.isInsertInside ? 'is-json-insert-inside' : '',
    itemDragState?.isDropAllowed === false ? 'is-json-drop-blocked' : '',
  ].filter(Boolean).join(' ');

  return (
    <span 
      className={className}
      onContextMenu={handleContextMenu}
      data-json-empty-drop-target="array"
      data-json-empty-owner-id={targetItemId}
      data-json-empty-path={path || ''}
    >
      {'[ ]'}
    </span>
  );
};

export default EmptyList;
