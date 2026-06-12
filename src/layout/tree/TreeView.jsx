import React from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import PlusIcon from '../../icon/PlusIcon';
import MinusIcon from '../../icon/MinusIcon';
import SpinningCircle from '../../icon/SpinningCircle';
import CrossIcon from '../../icon/CrossIcon';
import RefreshIcon from '../../icon/RefreshIcon';
import './tree.css';

const createItemDragState = () => ({
  isDragged: false,
  isDragHovered: false,
  isInsertBefore: false,
  isInsertAfter: false,
  isInsertUnder: false,
  isDropAllowed: true,
});

const createTreeDragOperationStore = () => {
  const store = {
    isDragging: false,
    itemDraggedId: null,
    dropInfoActive: null,
    itemDragStateById: {},
    getItemDragState(itemId) {
      if (!itemId) return createItemDragState();
      if (!this.itemDragStateById[itemId]) {
        this.itemDragStateById[itemId] = createItemDragState();
      }
      return this.itemDragStateById[itemId];
    },
    clearItemDragState(itemId) {
      if (!itemId || !this.itemDragStateById[itemId]) return;
      this.itemDragStateById[itemId] = createItemDragState();
    },
    clearDropPreview() {
      const dropInfoActive = this.dropInfoActive;
      if (dropInfoActive?.targetItemId) {
        this.clearItemDragState(dropInfoActive.targetItemId);
      }
      this.dropInfoActive = null;
    },
    startDrag(itemId) {
      this.clearAll();
      this.isDragging = true;
      this.itemDraggedId = itemId;
      const itemDragState = this.getItemDragState(itemId);
      itemDragState.isDragged = true;
    },
    previewDrop(dropInfo, isDropAllowed) {
      if (!this.isDragging || !dropInfo?.targetItemId) return;
      const itemDraggedId = this.itemDraggedId;
      this.clearDropPreview();
      this.dropInfoActive = dropInfo;
      if (itemDraggedId) {
        this.getItemDragState(itemDraggedId).isDragged = true;
      }
      const itemDragState = this.getItemDragState(dropInfo.targetItemId);
      itemDragState.isDragHovered = true;
      itemDragState.isDropAllowed = isDropAllowed !== false;
      itemDragState.isInsertBefore = dropInfo.drop?.type === 'before';
      itemDragState.isInsertAfter = dropInfo.drop?.type === 'after';
      itemDragState.isInsertUnder = dropInfo.drop?.type === 'under';
    },
    clearAll() {
      this.isDragging = false;
      this.itemDraggedId = null;
      this.dropInfoActive = null;
      this.itemDragStateById = {};
    },
  };
  return makeAutoObservable(store, {}, { autoBind: true });
};

const getTreeDropInfoFromEvent = ({
  event,
  itemId,
  itemData,
  itemParentId,
  itemPreviousId,
  itemNextId,
}) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const yInRow = event.clientY - rect.top;
  const rowHeight = rect.height || 1;
  const isLeaf = itemData?.isLeaf === true;

  if (!isLeaf && yInRow > rowHeight * 0.28 && yInRow < rowHeight * 0.72) {
    return {
      targetItemId: itemId,
      drop: {
        type: 'under',
        itemParentId: itemId,
        itemBeforeId: null,
        itemAfterId: null,
      },
    };
  }

  if (yInRow < rowHeight / 2) {
    return {
      targetItemId: itemId,
      drop: {
        type: 'before',
        itemParentId,
        itemBeforeId: itemPreviousId ?? null,
        itemAfterId: itemId,
      },
    };
  }

  return {
    targetItemId: itemId,
    drop: {
      type: 'after',
      itemParentId,
      itemBeforeId: itemId,
      itemAfterId: itemNextId ?? null,
    },
  };
};

const TreeTextItemComp = ({ itemData }) => {
  const itemText = itemData?.text || itemData?.name || String(itemData?.id || '');
  return <span className="tree-view-text-item">{itemText}</span>;
};

const TreeItemNode = observer(({
  itemId,
  itemParentId = null,
  itemPreviousId = null,
  itemNextId = null,
  depth = 0,
  indentPx = 10,
  getItemDataById,
  onDataChangeRequest,
  selectedItemId,
  onItemClick,
  onItemDoubleClick,
  onItemContextMenu,
  getItemComp,
  getItemRowClassName,
  isToggleExpandOnItemClick,
  isItemDragEnabled,
  getIsItemDraggable,
  getItemDropStatus,
  dragOperationStore,
}) => {
  const itemData = getItemDataById?.(itemId);

  if (!itemData) {
    return null;
  }

  const isLeaf = itemData.isLeaf === true;
  const isExpanded = itemData.isExpanded === true;
  const childrenLoadState = itemData.childrenLoadState || 'loaded';
  const childrenIds = Array.isArray(itemData.childrenIds) ? itemData.childrenIds : [];
  const isSelected = selectedItemId !== undefined && selectedItemId === itemId;
  const canRenderChildren = !isLeaf && isExpanded;
  const ItemComp = getItemComp?.(itemData) || TreeTextItemComp;
  const itemRowClassName = `${getItemRowClassName?.(itemData) ?? ''}`.trim();
  const itemDragState = isItemDragEnabled ? dragOperationStore.getItemDragState(itemId) : null;
  const isItemDraggable = isItemDragEnabled && (getIsItemDraggable?.(itemData) ?? true);

  const handleToggleClick = async (event) => {
    event.stopPropagation();
    if (isLeaf || !onDataChangeRequest) return;
    await onDataChangeRequest('toggle-expand', {
      itemId,
      nextIsExpanded: !isExpanded,
    });
  };

  const handleRowClick = async () => {
    if (onItemClick) {
      await onItemClick(itemId, itemData);
    }
    if (isToggleExpandOnItemClick && !isLeaf && onDataChangeRequest) {
      await onDataChangeRequest('toggle-expand', {
        itemId,
        nextIsExpanded: !isExpanded,
      });
    }
  };

  const handleRowContextMenu = async (event) => {
    if (!onItemContextMenu) return;
    event.preventDefault();
    event.stopPropagation();
    await onItemContextMenu(itemId, itemData, event);
  };

  const handleReloadClick = async (event) => {
    event.stopPropagation();
    if (!onDataChangeRequest) return;
    await onDataChangeRequest('reload-children', { itemId });
  };

  const isDropAllowedByDefault = (dropInfo) => {
    const itemDraggedId = dragOperationStore.itemDraggedId;
    if (!itemDraggedId || !dropInfo?.drop) return false;
    if (itemDraggedId === dropInfo.targetItemId) return false;
    if (dropInfo.drop.itemBeforeId === itemDraggedId || dropInfo.drop.itemAfterId === itemDraggedId) return false;
    return true;
  };

  const getIsDropAllowed = (dropInfo) => {
    if (!isDropAllowedByDefault(dropInfo)) return false;
    const status = getItemDropStatus?.({
      itemId: dragOperationStore.itemDraggedId,
      itemData: getItemDataById?.(dragOperationStore.itemDraggedId),
      targetItemId: dropInfo.targetItemId,
      targetItemData: itemData,
      drop: dropInfo.drop,
    });
    if (typeof status === 'boolean') return status;
    if (status && typeof status === 'object' && status.isDropAllowed === false) return false;
    return true;
  };

  const handleRowDragStart = (event) => {
    if (!isItemDraggable) return;
    event.stopPropagation();
    dragOperationStore.startDrag(itemId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(itemId));
  };

  const handleRowDragOver = (event) => {
    if (!isItemDragEnabled || !dragOperationStore.isDragging) return;
    event.preventDefault();
    event.stopPropagation();
    const dropInfo = getTreeDropInfoFromEvent({
      event,
      itemId,
      itemData,
      itemParentId,
      itemPreviousId,
      itemNextId,
    });
    dragOperationStore.previewDrop(dropInfo, getIsDropAllowed(dropInfo));
  };

  const handleRowDrop = async (event) => {
    if (!isItemDragEnabled || !dragOperationStore.isDragging) return;
    event.preventDefault();
    event.stopPropagation();
    const itemDraggedId = dragOperationStore.itemDraggedId;
    const dropInfoActive = dragOperationStore.dropInfoActive;
    const itemDragStateActive = dropInfoActive?.targetItemId
      ? dragOperationStore.getItemDragState(dropInfoActive.targetItemId)
      : null;

    if (itemDraggedId && dropInfoActive?.drop && itemDragStateActive?.isDropAllowed !== false && onDataChangeRequest) {
      await onDataChangeRequest('move-item', {
        itemId: itemDraggedId,
        drop: dropInfoActive.drop,
      });
    }
    dragOperationStore.clearAll();
  };

  const handleRowDragEnd = () => {
    if (!isItemDragEnabled) return;
    dragOperationStore.clearAll();
  };

  const itemDragClassName = itemDragState ? [
    itemDragState.isDragged ? 'is-dragged' : '',
    itemDragState.isDragHovered ? 'is-drag-hovered' : '',
    itemDragState.isInsertBefore ? 'is-insert-before' : '',
    itemDragState.isInsertAfter ? 'is-insert-after' : '',
    itemDragState.isInsertUnder ? 'is-insert-under' : '',
    itemDragState.isDropAllowed === false ? 'is-drop-blocked' : '',
  ].filter(Boolean).join(' ') : '';

  return (
    <div className="tree-view-node-block">
      <div className="tree-view-node-content" style={{ paddingLeft: `${depth * indentPx}px` }}>
        <div
          className={`tree-view-row ${isSelected ? 'selected' : ''} ${isLeaf ? 'is-leaf' : ''} ${itemRowClassName} ${itemDragClassName}`.trim()}
          data-tree-item-id={itemId}
          draggable={isItemDraggable}
          onClick={handleRowClick}
          onDoubleClick={() => {
            onItemDoubleClick?.(itemId, itemData);
          }}
          onContextMenu={handleRowContextMenu}
          onDragStart={isItemDragEnabled ? handleRowDragStart : undefined}
          onDragOver={isItemDragEnabled ? handleRowDragOver : undefined}
          onDrop={isItemDragEnabled ? handleRowDrop : undefined}
          onDragEnd={isItemDragEnabled ? handleRowDragEnd : undefined}
        >
          {itemDragState?.isInsertBefore ? <div className="tree-view-drop-line tree-view-drop-line-before" /> : null}
          {itemDragState?.isInsertAfter ? <div className="tree-view-drop-line tree-view-drop-line-after" /> : null}
          <button
            type="button"
            className={`tree-view-toggle-btn ${isLeaf ? 'is-empty' : ''}`}
            onClick={handleToggleClick}
            disabled={isLeaf}
            aria-label={isLeaf ? 'No children' : (isExpanded ? 'Collapse' : 'Expand')}
          >
            {!isLeaf ? (
              isExpanded
                ? <MinusIcon width={12} height={12} color="#666" />
                : <PlusIcon width={12} height={12} color="#666" />
            ) : null}
          </button>
          <div className="tree-view-label">
            <ItemComp itemData={itemData} itemDragState={itemDragState} />
          </div>
        </div>

        {canRenderChildren && childrenLoadState === 'loading' ? (
          <div className="tree-view-status-row">
            <SpinningCircle width={14} height={14} color="#666" />
            <span className="tree-view-status-text">Loading</span>
          </div>
        ) : null}

        {canRenderChildren && childrenLoadState === 'load-failed' ? (
          <div className="tree-view-status-row">
            <CrossIcon size={12} color="#c62828" />
            <span className="tree-view-status-text tree-view-status-error">
              {itemData.childrenErrorMessage || 'Failed to load'}
            </span>
            <button type="button" className="tree-view-refresh-btn" onClick={handleReloadClick} aria-label="Retry loading">
              <RefreshIcon width={12} height={12} />
            </button>
          </div>
        ) : null}
      </div>

      {canRenderChildren && childrenLoadState === 'loaded' ? (
        <div className="tree-view-children">
          {childrenIds.map((childId, childIndex) => (
            <TreeItemNode
              key={childId}
              itemId={childId}
              itemParentId={itemId}
              itemPreviousId={childrenIds[childIndex - 1] ?? null}
              itemNextId={childrenIds[childIndex + 1] ?? null}
              depth={depth + 1}
              indentPx={indentPx}
              getItemDataById={getItemDataById}
              onDataChangeRequest={onDataChangeRequest}
              selectedItemId={selectedItemId}
              onItemClick={onItemClick}
              onItemDoubleClick={onItemDoubleClick}
              onItemContextMenu={onItemContextMenu}
              getItemComp={getItemComp}
              getItemRowClassName={getItemRowClassName}
              isToggleExpandOnItemClick={isToggleExpandOnItemClick}
              isItemDragEnabled={isItemDragEnabled}
              getIsItemDraggable={getIsItemDraggable}
              getItemDropStatus={getItemDropStatus}
              dragOperationStore={dragOperationStore}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
});

const TreeView = observer(({
  rootItemIds = [],
  getItemDataById,
  onDataChangeRequest,
  selectedItemId,
  onItemClick,
  onItemDoubleClick,
  onItemContextMenu,
  getItemComp,
  getItemRowClassName,
  className = '',
  isToggleExpandOnItemClick = true,
  isItemDragEnabled = false,
  getIsItemDraggable,
  getItemDropStatus,
  indentPx = 10,
}) => {
  const dragOperationStore = React.useMemo(() => createTreeDragOperationStore(), []);

  return (
    <div className={`tree-view ${className}`}>
      {rootItemIds.map((itemId, itemIndex) => (
        <TreeItemNode
          key={itemId}
          itemId={itemId}
          itemParentId={null}
          itemPreviousId={rootItemIds[itemIndex - 1] ?? null}
          itemNextId={rootItemIds[itemIndex + 1] ?? null}
          depth={0}
          indentPx={indentPx}
          getItemDataById={getItemDataById}
          onDataChangeRequest={onDataChangeRequest}
          selectedItemId={selectedItemId}
          onItemClick={onItemClick}
          onItemDoubleClick={onItemDoubleClick}
          onItemContextMenu={onItemContextMenu}
          getItemComp={getItemComp}
          getItemRowClassName={getItemRowClassName}
          isToggleExpandOnItemClick={isToggleExpandOnItemClick}
          isItemDragEnabled={isItemDragEnabled}
          getIsItemDraggable={getIsItemDraggable}
          getItemDropStatus={getItemDropStatus}
          dragOperationStore={dragOperationStore}
        />
      ))}
    </div>
  );
});

export { TreeTextItemComp };
export default TreeView;
