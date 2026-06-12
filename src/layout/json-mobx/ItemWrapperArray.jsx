import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import JsonListItemComp from './JsonListItemComp';
import PseudoListItem from './PseudoListItem';
import { getStableKey } from './keysManage';
import { useJsonContext } from './JsonContext';
import { getJsonArraySelectionItemId } from './jsonSelectionOperationStore';
import { getIsJsonDropAllowedByDefault, getJsonDropInfoFromEvent } from './jsonDragMove';

/**
 * ItemWrapperArray - Isolated observer for each array item
 * This prevents sibling items from re-rendering when one item changes
 */
const ItemWrapperArray = observer(({ 
  data,
  index,
  itemData,
  pathPrefixRef,
  isEditable,
  isKeyEditable,
  isValueEditable,
  onChange,
  indent,
  depth,
  renderNestedJsonValue,
  getValueComp,
  parentSelectionItemId,
  itemPreviousPath,
  itemNextPath
}) => {
  // Use itemData directly instead of data[index] to avoid MobX tracking
  const item = itemData !== undefined ? itemData : data[index];
  const getItemPath = useCallback(() => {
    const prefix = pathPrefixRef?.current || '';
    return prefix ? `${prefix}..${index}` : `..${index}`;
  }, [index, pathPrefixRef]);
  const isLastItem = index === data.length - 1;
  const isPrimitive = item === null || item === undefined || typeof item !== 'object';
  const isPseudo = item && typeof item === 'object' && item.isPseudo;
  const { dragOperationStore, selectionOperationStore } = useJsonContext();
  
  // Use stable key - for objects use WeakMap, for primitives use value+index
  const stableKey = getStableKey(item, index);
  const itemPath = getItemPath();
  const selectionItemId = getJsonArraySelectionItemId(itemPath);
  const itemSelectionState = !isPseudo
    ? selectionOperationStore?.getItemSelectionState(selectionItemId)
    : null;
  const isDragMoveEnabled = Boolean(dragOperationStore);
  const itemDragState = !isPseudo && isDragMoveEnabled
    ? dragOperationStore?.getItemDragState(selectionItemId)
    : null;
  const itemMeta = {
    itemId: selectionItemId,
    itemParentId: parentSelectionItemId,
    path: itemPath,
    itemKind: 'arrayItem',
    label: `[${index}]`,
    containerKind: 'array',
    containerPath: pathPrefixRef?.current || '',
  };

  React.useEffect(() => {
    if (isPseudo) return;
    selectionOperationStore?.registerItem(itemMeta);
    if (isDragMoveEnabled) {
      dragOperationStore.registerItem(itemMeta);
    }
  }, [dragOperationStore, isDragMoveEnabled, isPseudo, itemMeta, selectionOperationStore]);

  if (isPseudo) {
    return (
      <div key={stableKey} className="json-array-item">
        <PseudoListItem
          getPath={getItemPath}
          parentData={data}
          index={index}
          onChange={onChange}
          onCancel={() => {
            // Remove pseudo item by mutating array
            data.splice(index, 1);
          }}
          depth={depth}
        />
      </div>
    );
  }

  const handleSelectionMouseDownCapture = (event) => {
    if (!event.shiftKey || event.button !== 0) return;
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    if (!itemSelectionState?.isSelected) {
      event.preventDefault();
    }
    event.stopPropagation();
  };

  const handleSelectionClickCapture = (event) => {
    if (!event.shiftKey || event.button !== 0) return;
    if (event.target.closest('.json-selection-item') !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    selectionOperationStore?.selectNextFromItem(selectionItemId);
  };

  const handleDragStart = (event) => {
    if (!isDragMoveEnabled) return;
    const isDragSelectedItem = selectionOperationStore?.selectedItemId === selectionItemId;
    if (!event.shiftKey || !isDragSelectedItem) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    dragOperationStore?.startDrag(selectionItemId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', selectionItemId);
  };

  const handleDragOver = (event) => {
    if (!isDragMoveEnabled || !dragOperationStore?.isDragging) return;
    const containerChildKind = item && typeof item === 'object'
      ? (Array.isArray(item) ? 'array' : 'object')
      : null;
    event.preventDefault();
    event.stopPropagation();
    const dropInfo = getJsonDropInfoFromEvent({
      event,
      itemMeta,
      itemPreviousMeta: itemPreviousPath ? { path: itemPreviousPath } : null,
      itemNextMeta: itemNextPath ? { path: itemNextPath } : null,
      containerChildKind,
      containerPath: containerChildKind ? itemPath : null,
    });
    const isDropAllowed = getIsJsonDropAllowedByDefault({
      dropInfo,
      dragOperationStore,
      selectionOperationStore,
    });
    dragOperationStore.previewDrop(dropInfo, isDropAllowed);
  };

  const handleDrop = async (event) => {
    if (!isDragMoveEnabled || !dragOperationStore?.isDragging) return;
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

  const handleDragEnd = () => {
    if (!isDragMoveEnabled) return;
    dragOperationStore?.clearAll();
  };

  const selectionClassName = [
    'json-array-item',
    'json-selection-item',
    itemSelectionState?.isSelected ? 'is-json-selected' : '',
    itemSelectionState?.isSelectionAncestor ? 'is-json-selection-ancestor' : '',
    itemDragState?.isDragged ? 'is-json-dragged' : '',
    itemDragState?.isDragHovered ? 'is-json-drag-hovered' : '',
    itemDragState?.isInsertBefore ? 'is-json-insert-before' : '',
    itemDragState?.isInsertAfter ? 'is-json-insert-after' : '',
    itemDragState?.isInsertInside ? 'is-json-insert-inside' : '',
    itemDragState?.isDropAllowed === false ? 'is-json-drop-blocked' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      key={stableKey}
      className={selectionClassName}
      draggable={isDragMoveEnabled}
      onMouseDownCapture={handleSelectionMouseDownCapture}
      onClickCapture={handleSelectionClickCapture}
      onDragStart={isDragMoveEnabled ? handleDragStart : undefined}
      onDragOver={isDragMoveEnabled ? handleDragOver : undefined}
      onDrop={isDragMoveEnabled ? handleDrop : undefined}
      onDragEnd={isDragMoveEnabled ? handleDragEnd : undefined}
    >
      {itemDragState?.isInsertBefore ? <div className="json-drop-line json-drop-line-before" /> : null}
      {itemDragState?.isInsertAfter ? <div className="json-drop-line json-drop-line-after" /> : null}
      <JsonListItemComp
        parentData={data}
        index={index}
        itemData={item}
        getPath={getItemPath}
        isEditable={isEditable && isValueEditable}
        onChange={onChange}
        depth={depth}
        getValueComp={getValueComp}
      >
        {renderNestedJsonValue({
          data: item,
          isEditable,
          isKeyEditable,
          isValueEditable,
          onChange,
          indent,
          pathPrefix: getItemPath(),
          depth: depth + 1,
          isArrayItem: true,
          getValueComp,
          parentSelectionItemId: selectionItemId,
        })}
      </JsonListItemComp>
      {!isLastItem && isPrimitive && <span className="json-comma">,</span>}
    </div>
  );
});

ItemWrapperArray.displayName = 'ItemWrapperArray';

export default ItemWrapperArray;
