import React from 'react';
import { useJsonContext } from './JsonContext';
import './JsonComp.css';

const EmptyList = ({ data }) => {
  const { path, parentItemId } = data;
  const { store } = useJsonContext();
  const { drag, openMenu } = store;
  const isDragMoveEnabled = Boolean(drag);
  const targetItemId = parentItemId || 'json-empty-list-root';
  const itemDragState = isDragMoveEnabled ? drag.getItemDragState(targetItemId) : null;

  const handleContextMenu = (e) => {
    if (!path) return;

    e.preventDefault();
    e.stopPropagation();

    openMenu({
      position: { x: e.clientX, y: e.clientY },
      menuType: 'emptyList',
      path,
    });
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
