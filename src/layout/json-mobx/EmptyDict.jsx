import React from 'react';
import { useJsonContext } from './JsonContext';
import './JsonComp.css';

const EmptyDict = ({ data }) => {
  const { path, parentItemId } = data;
  const { store } = useJsonContext();
  const { drag, openMenu } = store;
  const isDragMoveEnabled = Boolean(drag);
  const targetItemId = parentItemId || 'json-empty-dict-root';
  const itemDragState = isDragMoveEnabled ? drag.getItemDragState(targetItemId) : null;

  const handleContextMenu = (e) => {
    if (!path) return;

    e.preventDefault();
    e.stopPropagation();

    openMenu({
      position: { x: e.clientX, y: e.clientY },
      menuType: 'emptyDict',
      path,
    });
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
