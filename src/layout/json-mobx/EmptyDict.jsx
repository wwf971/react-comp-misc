import React from 'react';
import { useJsonContext } from './JsonContext';
import './JsonComp.css';

/**
 * EmptyDict - Placeholder for empty objects
 */
const EmptyDict = ({ path, onChange, containerOwnerSelectionItemId }) => {
  const { dragOperationStore, showConversionMenu } = useJsonContext();
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
      data-json-empty-drop-target="object"
      data-json-empty-owner-id={targetItemId}
      data-json-empty-path={path || ''}
    >
      {'{ }'}
    </span>
  );
};

export default EmptyDict;
