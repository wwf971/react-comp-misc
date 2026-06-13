import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import JsonListItemComp from './JsonListItemComp';
import PseudoListItem from './PseudoListItem';
import { getStableKey } from './keysManage';
import { useJsonContext } from './JsonContext';
import { getJsonArraySelectionItemId } from './jsonSelectionOperationStore';
import {
  useJsonItemInteraction,
  useJsonSelectionRenderRevision,
} from './useJsonItemInteraction';

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
  const {
    dragOperationStore,
    queryParentInfo,
    requestJsonContextMenu,
    selectionOperationStore,
  } = useJsonContext();
  
  // Use stable key - for objects use WeakMap, for primitives use value+index
  const stableKey = getStableKey(item, index);
  const itemPath = getItemPath();
  const selectionItemId = getJsonArraySelectionItemId(itemPath);
  const revisionSelectionRender = useJsonSelectionRenderRevision(selectionOperationStore);
  const itemSelectionState = !isPseudo
    ? selectionOperationStore?.getItemSelectionState(selectionItemId)
    : null;
  const isDragMoveEnabled = Boolean(dragOperationStore);
  const itemDragState = !isPseudo && isDragMoveEnabled
    ? dragOperationStore?.getItemDragState(selectionItemId)
    : null;
  const containerChildKind = item && typeof item === 'object'
    ? (Array.isArray(item) ? 'array' : 'object')
    : null;
  const itemMeta = {
    itemId: selectionItemId,
    itemParentId: parentSelectionItemId,
    path: itemPath,
    itemKind: 'arrayItem',
    itemKey: index,
    label: `[${index}]`,
    value: item,
    containerKind: 'array',
    containerPath: pathPrefixRef?.current || '',
    itemPreviousPath,
    itemNextPath,
    containerChildKind,
    containerPathForInside: containerChildKind ? itemPath : null,
  };

  React.useEffect(() => {
    if (isPseudo) return;
    selectionOperationStore?.registerItem(itemMeta);
    if (isDragMoveEnabled) {
      dragOperationStore.registerItem(itemMeta);
    }
  }, [dragOperationStore, isDragMoveEnabled, isPseudo, itemMeta, selectionOperationStore]);

  const {
    handleContextMenuCapture,
    handlePointerDownCapture,
    handleSelectionClickCapture,
    handleSelectionMouseDownCapture,
  } = useJsonItemInteraction({
    selectionItemId,
    itemMeta,
    itemSelectionState,
    isDragMoveEnabled,
    dragOperationStore,
    selectionOperationStore,
    requestJsonContextMenu,
    queryParentInfo,
    onChange,
  });

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
      onPointerDownCapture={handlePointerDownCapture}
      onMouseDownCapture={handleSelectionMouseDownCapture}
      onClickCapture={handleSelectionClickCapture}
      onContextMenuCapture={handleContextMenuCapture}
      data-json-selection-item-id={selectionItemId}
      data-json-selection-render-revision={revisionSelectionRender}
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
