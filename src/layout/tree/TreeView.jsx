import React from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import PlusIcon from '../../icon/PlusIcon';
import MinusIcon from '../../icon/MinusIcon';
import SpinningCircle from '../../icon/SpinningCircle';
import CrossIcon from '../../icon/CrossIcon';
import RefreshClockwise from '../../icon/RefreshClockwise';
import './tree.css';

const DRAG_START_DISTANCE_PX = 5;
const DRAG_ZONE_HYSTERESIS_PX = 4;
const DRAG_AUTO_EXPAND_DELAY_MS = 600;
const DRAG_AUTO_SCROLL_EDGE_PX = 24;
const DRAG_AUTO_SCROLL_SPEED_MAX_PX = 12;

const TreeView = observer(({
  data = {},
  config = {},
  onEvent,
}) => {
  const dragOperationStore = React.useMemo(() => createTreeDragOperationStore(), []);
  const treeRootRef = React.useRef(null);
  const dragSessionRef = React.useRef(null);
  const updateDropPreviewRef = React.useRef(null);

  const itemRootIds = Array.isArray(data?.itemRootIds) ? data.itemRootIds : [];
  const itemDataById = data?.itemDataById || {};
  const itemSelectedId = data?.itemSelectedId;
  const className = config?.className || '';
  const indentPx = config?.indentPx ?? 10;
  const isItemDragEnabled = config?.isItemDragEnabled === true;
  const getIsItemDraggable = config?.getIsItemDraggable;
  const getItemDropStatus = config?.getItemDropStatus;
  const configResolved = {
    ...config,
    dragOperationStore,
  };

  const getIsDropAllowedResolved = (dropResolved, entryById, itemDraggedId) => {
    if (getIsItemInSubtree(entryById, dropResolved.drop.itemParentId, itemDraggedId)) return false;
    if (!getItemDropStatus) return true;
    const status = getItemDropStatus({
      itemId: itemDraggedId,
      itemData: itemDataById[itemDraggedId] || null,
      targetItemId: dropResolved.targetItemId,
      targetItemData: itemDataById[dropResolved.targetItemId] || null,
      drop: dropResolved.drop,
    });
    if (typeof status === 'boolean') return status;
    if (status && typeof status === 'object' && status.isDropAllowed === false) return false;
    return true;
  };

  const updateAutoExpand = (dropResolved, isDropAllowed, isDropNoop) => {
    const session = dragSessionRef.current;
    if (!session) return;
    const targetItemData = dropResolved ? itemDataById[dropResolved.targetItemId] || null : null;
    const isExpandWanted = Boolean(
      dropResolved
      && dropResolved.zone === 'under'
      && isDropAllowed
      && !isDropNoop
      && targetItemData
      && targetItemData.isLeaf !== true
      && targetItemData.isExpanded !== true,
    );
    if (!isExpandWanted) {
      clearAutoExpandTimer(session);
      return;
    }
    if (session.expandItemId === dropResolved.targetItemId) return;
    clearAutoExpandTimer(session);
    session.expandItemId = dropResolved.targetItemId;
    session.expandTimerId = setTimeout(() => {
      session.expandItemId = null;
      session.expandTimerId = null;
      onEvent?.('toggleExpand', {
        itemId: dropResolved.targetItemId,
        itemData: targetItemData,
        nextIsExpanded: true,
      });
    }, DRAG_AUTO_EXPAND_DELAY_MS);
  };

  const updateDropPreviewFromPointer = (clientX, clientY) => {
    const session = dragSessionRef.current;
    if (!session?.isDragActive || !dragOperationStore.isDragging) return;
    const resolveResult = resolveTreeDropFromPointer({
      treeRootEl: treeRootRef.current,
      itemRootIds,
      itemDataById,
      indentPx,
      clientX,
      clientY,
      zonePrev: session.zonePrev,
    });
    if (!resolveResult) {
      session.zonePrev = null;
      dragOperationStore.previewDrop(null);
      return;
    }
    const { dropResolved, entryById } = resolveResult;
    session.zonePrev = { itemId: dropResolved.targetItemId, zone: dropResolved.zone };
    const itemDraggedId = dragOperationStore.itemDraggedId;
    const isDropNoop = getIsDropNoop(entryById, dropResolved.drop, itemDraggedId);
    const isDropAllowed = isDropNoop
      ? true
      : getIsDropAllowedResolved(dropResolved, entryById, itemDraggedId);
    dragOperationStore.previewDrop({ ...dropResolved, isDropAllowed, isDropNoop });
    updateAutoExpand(dropResolved, isDropAllowed, isDropNoop);
  };
  updateDropPreviewRef.current = updateDropPreviewFromPointer;

  const ensureAutoScrollLoop = () => {
    const session = dragSessionRef.current;
    if (!session || session.scrollRafId !== null) return;
    const runScrollStep = () => {
      const sessionCur = dragSessionRef.current;
      if (!sessionCur || !sessionCur.isDragActive || sessionCur.scrollSpeed === 0 || !sessionCur.scrollContainerEl) {
        if (sessionCur) sessionCur.scrollRafId = null;
        return;
      }
      sessionCur.scrollContainerEl.scrollTop += sessionCur.scrollSpeed;
      updateDropPreviewRef.current?.(sessionCur.xLast, sessionCur.yLast);
      sessionCur.scrollRafId = requestAnimationFrame(runScrollStep);
    };
    session.scrollRafId = requestAnimationFrame(runScrollStep);
  };

  const updateAutoScrollSpeed = (session, clientY) => {
    const containerEl = session.scrollContainerEl;
    if (!containerEl) {
      session.scrollSpeed = 0;
      return;
    }
    const rect = containerEl.getBoundingClientRect();
    let speed = 0;
    if (clientY < rect.top + DRAG_AUTO_SCROLL_EDGE_PX) {
      speed = -Math.ceil((rect.top + DRAG_AUTO_SCROLL_EDGE_PX - clientY) / 4);
    } else if (clientY > rect.bottom - DRAG_AUTO_SCROLL_EDGE_PX) {
      speed = Math.ceil((clientY - (rect.bottom - DRAG_AUTO_SCROLL_EDGE_PX)) / 4);
    }
    session.scrollSpeed = Math.max(
      -DRAG_AUTO_SCROLL_SPEED_MAX_PX,
      Math.min(DRAG_AUTO_SCROLL_SPEED_MAX_PX, speed),
    );
    if (session.scrollSpeed !== 0) {
      ensureAutoScrollLoop();
    }
  };

  const cancelDrag = () => {
    const session = dragSessionRef.current;
    if (!session) return;
    const isDragWasActive = session.isDragActive;
    finishDragSession(session, treeRootRef.current);
    session.isClickSuppressed = isDragWasActive;
    dragOperationStore.clearAll();
  };

  const handleTreePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.target?.closest?.('.tree-view-toggle-btn')) return;
    const rowEl = event.target?.closest?.('.tree-view-row[data-tree-item-id]');
    if (!rowEl || !treeRootRef.current?.contains(rowEl)) return;
    const itemId = rowEl.getAttribute('data-tree-item-id');
    const itemData = itemDataById[itemId];
    if (!itemData) return;
    const isItemDraggable = Boolean(getIsItemDraggable?.(itemData) ?? true);
    if (!isItemDraggable) return;
    dragSessionRef.current = {
      pointerId: event.pointerId,
      itemPressedId: itemId,
      xStart: event.clientX,
      yStart: event.clientY,
      xLast: event.clientX,
      yLast: event.clientY,
      isDragActive: false,
      isClickSuppressed: false,
      zonePrev: null,
      expandItemId: null,
      expandTimerId: null,
      scrollContainerEl: null,
      scrollSpeed: 0,
      scrollRafId: null,
    };
  };

  const handleTreePointerMove = (event) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    if (event.buttons === 0) {
      // pointerup was missed (released outside without capture)
      if (session.isDragActive) {
        cancelDrag();
      } else {
        dragSessionRef.current = null;
      }
      return;
    }
    session.xLast = event.clientX;
    session.yLast = event.clientY;
    if (!session.isDragActive) {
      const distanceX = Math.abs(event.clientX - session.xStart);
      const distanceY = Math.abs(event.clientY - session.yStart);
      if (Math.max(distanceX, distanceY) < DRAG_START_DISTANCE_PX) return;
      session.isDragActive = true;
      session.scrollContainerEl = findScrollContainerEl(treeRootRef.current);
      treeRootRef.current?.setPointerCapture?.(event.pointerId);
      dragOperationStore.startDrag(session.itemPressedId);
    }
    event.preventDefault();
    dragOperationStore.setPointerPos(event.clientX, event.clientY);
    updateAutoScrollSpeed(session, event.clientY);
    updateDropPreviewFromPointer(event.clientX, event.clientY);
  };

  const handleTreePointerUp = async (event) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    if (!session.isDragActive) {
      if (!session.isClickSuppressed) {
        dragSessionRef.current = null;
      }
      return;
    }
    event.preventDefault();
    const itemDraggedId = dragOperationStore.itemDraggedId;
    const dropInfoActive = dragOperationStore.dropInfoActive;
    finishDragSession(session, treeRootRef.current);
    session.isClickSuppressed = true;
    dragOperationStore.clearAll();
    if (itemDraggedId
      && dropInfoActive?.drop
      && dropInfoActive.isDropAllowed !== false
      && dropInfoActive.isDropNoop !== true
      && onEvent) {
      await onEvent('moveItem', {
        itemId: itemDraggedId,
        itemData: itemDataById[itemDraggedId] || null,
        drop: dropInfoActive.drop,
      });
    }
  };

  const handleTreePointerCancel = (event) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    cancelDrag();
  };

  const handleTreeClickCapture = (event) => {
    const session = dragSessionRef.current;
    if (!session?.isClickSuppressed) return;
    event.preventDefault();
    event.stopPropagation();
    dragSessionRef.current = null;
  };

  const isDragging = dragOperationStore.isDragging;

  React.useEffect(() => {
    if (!isDragging) return undefined;
    const handleWindowKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      cancelDrag();
    };
    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  React.useEffect(() => () => {
    finishDragSession(dragSessionRef.current, treeRootRef.current);
  }, []);

  const treeClassName = [
    'tree-view',
    className,
    isDragging ? 'is-drag-active' : '',
    dragOperationStore.isDropBlockedActive ? 'is-drag-blocked' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={treeRootRef}
      className={treeClassName}
      onPointerDown={isItemDragEnabled ? handleTreePointerDown : undefined}
      onPointerMove={isItemDragEnabled ? handleTreePointerMove : undefined}
      onPointerUp={isItemDragEnabled ? handleTreePointerUp : undefined}
      onPointerCancel={isItemDragEnabled ? handleTreePointerCancel : undefined}
      onClickCapture={isItemDragEnabled ? handleTreeClickCapture : undefined}
    >
      {itemRootIds.map((itemId) => (
        <TreeItemNode
          key={itemId}
          data={{
            itemId,
            depth: 0,
            itemSelectedId,
            itemDataById,
          }}
          config={configResolved}
          onEvent={onEvent}
        />
      ))}
      {isItemDragEnabled ? (
        <TreeDragGhost dragOperationStore={dragOperationStore} itemDataById={itemDataById} />
      ) : null}
    </div>
  );
});

const TreeItemNode = observer(({
  data = {},
  config = {},
  onEvent,
}) => {
  const itemId = data?.itemId;
  const depth = data?.depth ?? 0;
  const itemSelectedId = data?.itemSelectedId;
  const itemDataById = data?.itemDataById || {};
  const indentPx = config?.indentPx ?? 10;
  const getItemComp = config?.getItemComp;
  const getItemRowClassName = config?.getItemRowClassName;
  const isToggleExpandOnItemClick = config?.isToggleExpandOnItemClick !== false;
  const isItemDragEnabled = config?.isItemDragEnabled === true;
  const dragOperationStore = config?.dragOperationStore;
  const itemData = itemDataById[itemId] || null;

  if (!itemData) {
    return null;
  }

  const isLeaf = itemData.isLeaf === true;
  const isExpanded = itemData.isExpanded === true;
  const childrenLoadState = itemData.childrenLoadState || 'loaded';
  const childrenIds = Array.isArray(itemData.childrenIds) ? itemData.childrenIds : [];
  const isSelected = itemSelectedId !== undefined && itemSelectedId === itemId;
  const canRenderChildren = !isLeaf && isExpanded;
  const ItemComp = getItemComp?.(itemData) || TreeTextItemComp;
  const itemRowClassName = `${getItemRowClassName?.(itemData) ?? ''}`.trim();
  const itemDragState = isItemDragEnabled ? dragOperationStore.getItemDragState(itemId) : null;

  const handleToggleClick = async (event) => {
    event.stopPropagation();
    if (isLeaf || !onEvent) return;
    await onEvent('toggleExpand', {
      itemId,
      itemData,
      nextIsExpanded: !isExpanded,
    });
  };

  const handleRowClick = async () => {
    if (onEvent) {
      await onEvent('itemClick', { itemId, itemData });
    }
    if (isToggleExpandOnItemClick && !isLeaf && onEvent) {
      await onEvent('toggleExpand', {
        itemId,
        itemData,
        nextIsExpanded: !isExpanded,
      });
    }
  };

  const handleRowContextMenu = async (event) => {
    if (!onEvent) return;
    event.preventDefault();
    event.stopPropagation();
    await onEvent('itemContextMenu', { itemId, itemData, event });
  };

  const handleReloadClick = async (event) => {
    event.stopPropagation();
    if (!onEvent) return;
    await onEvent('reloadChildren', { itemId, itemData });
  };

  const itemDragClassName = itemDragState ? [
    itemDragState.isDragged ? 'is-dragged' : '',
    itemDragState.isDragHovered ? 'is-drag-hovered' : '',
    itemDragState.isInsertBefore ? 'is-insert-before' : '',
    itemDragState.isInsertAfter ? 'is-insert-after' : '',
    itemDragState.isInsertUnder ? 'is-insert-under' : '',
    itemDragState.isDropAllowed === false ? 'is-drop-blocked' : '',
  ].filter(Boolean).join(' ') : '';

  // insert line can start at a different depth than the row it renders on
  const insertDepth = itemDragState?.insertDepth;
  const dropLineStyle = insertDepth !== null && insertDepth !== undefined && insertDepth !== depth
    ? { left: `${4 + (insertDepth - depth) * indentPx}px` }
    : undefined;

  return (
    <div className="tree-view-node-block">
      <div className="tree-view-node-content" style={{ paddingLeft: `${depth * indentPx}px` }}>
        <div
          className={`tree-view-row ${isSelected ? 'selected' : ''} ${isLeaf ? 'is-leaf' : ''} ${itemRowClassName} ${itemDragClassName}`.trim()}
          data-tree-item-id={itemId}
          onClick={handleRowClick}
          onDoubleClick={() => {
            onEvent?.('itemDoubleClick', { itemId, itemData });
          }}
          onContextMenu={handleRowContextMenu}
        >
          {itemDragState?.isInsertBefore ? <div className="tree-view-drop-line tree-view-drop-line-before" style={dropLineStyle} /> : null}
          {itemDragState?.isInsertAfter ? <div className="tree-view-drop-line tree-view-drop-line-after" style={dropLineStyle} /> : null}
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
              <RefreshClockwise width={12} height={12} />
            </button>
          </div>
        ) : null}
      </div>

      {canRenderChildren && childrenLoadState === 'loaded' ? (
        <div className="tree-view-children">
          {childrenIds.map((childId) => (
            <TreeItemNode
              key={childId}
              data={{
                itemId: childId,
                depth: depth + 1,
                itemSelectedId,
                itemDataById,
              }}
              config={config}
              onEvent={onEvent}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
});

const TreeTextItemComp = ({ itemData }) => {
  const itemText = itemData?.text || itemData?.name || String(itemData?.id || '');
  return <span className="tree-view-text-item">{itemText}</span>;
};

const TreeDragGhost = observer(({ dragOperationStore, itemDataById }) => {
  if (!dragOperationStore.isDragging || !dragOperationStore.pointerPos) return null;
  const itemData = itemDataById[dragOperationStore.itemDraggedId] || null;
  if (!itemData) return null;
  const itemText = itemData.text || itemData.name || String(itemData.id || '');
  return (
    <div
      className="tree-view-drag-ghost"
      style={{
        left: `${dragOperationStore.pointerPos.x + 8}px`,
        top: `${dragOperationStore.pointerPos.y + 12}px`,
      }}
    >
      {itemText}
    </div>
  );
});

function createItemDragState() {
  return {
    isDragged: false,
    isDragHovered: false,
    isInsertBefore: false,
    isInsertAfter: false,
    isInsertUnder: false,
    isDropAllowed: true,
    insertDepth: null,
  };
}

function createTreeDragOperationStore() {
  const store = {
    isDragging: false,
    itemDraggedId: null,
    dropInfoActive: null,
    pointerPos: null,
    itemDragStateById: {},
    get isDropBlockedActive() {
      return this.isDragging && this.dropInfoActive?.isDropAllowed === false;
    },
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
        if (this.itemDraggedId) {
          this.getItemDragState(this.itemDraggedId).isDragged = true;
        }
      }
      this.dropInfoActive = null;
    },
    setPointerPos(x, y) {
      this.pointerPos = { x, y };
    },
    startDrag(itemId) {
      this.clearAll();
      this.isDragging = true;
      this.itemDraggedId = itemId;
      const itemDragState = this.getItemDragState(itemId);
      itemDragState.isDragged = true;
    },
    previewDrop(dropInfo) {
      if (!this.isDragging) return;
      if (!dropInfo?.targetItemId) {
        this.clearDropPreview();
        return;
      }
      if (getIsDropInfoSame(this.dropInfoActive, dropInfo)) return;
      this.clearDropPreview();
      this.dropInfoActive = dropInfo;
      const itemDragState = this.getItemDragState(dropInfo.targetItemId);
      itemDragState.isDragHovered = true;
      if (dropInfo.isDropNoop === true) {
        // noop position: normal drag cursor, no insert indicator
        return;
      }
      itemDragState.isDropAllowed = dropInfo.isDropAllowed !== false;
      itemDragState.isInsertBefore = dropInfo.indicatorType === 'before';
      itemDragState.isInsertAfter = dropInfo.indicatorType === 'after';
      itemDragState.isInsertUnder = dropInfo.indicatorType === 'under';
      itemDragState.insertDepth = dropInfo.indicatorDepth ?? null;
    },
    clearAll() {
      this.isDragging = false;
      this.itemDraggedId = null;
      this.dropInfoActive = null;
      this.pointerPos = null;
      this.itemDragStateById = {};
    },
  };
  return makeAutoObservable(store, {}, { autoBind: true });
}

function getIsDropInfoSame(dropA, dropB) {
  if (!dropA || !dropB) return false;
  return dropA.targetItemId === dropB.targetItemId
    && dropA.zone === dropB.zone
    && dropA.indicatorType === dropB.indicatorType
    && dropA.indicatorDepth === dropB.indicatorDepth
    && dropA.isDropAllowed === dropB.isDropAllowed
    && dropA.isDropNoop === dropB.isDropNoop
    && dropA.drop?.type === dropB.drop?.type
    && dropA.drop?.itemParentId === dropB.drop?.itemParentId
    && dropA.drop?.itemBeforeId === dropB.drop?.itemBeforeId
    && dropA.drop?.itemAfterId === dropB.drop?.itemAfterId;
}

// flat list of visible rows, in render order, with sibling/parent links
function buildTreeRowEntryList(itemRootIds, itemDataById) {
  const entryList = [];
  const entryById = {};
  const walkItem = (itemId, itemParentId, itemPrevId, itemNextId, depth) => {
    const itemData = itemDataById[itemId];
    if (!itemData) return;
    const isLeaf = itemData.isLeaf === true;
    const childrenIds = Array.isArray(itemData.childrenIds) ? itemData.childrenIds : [];
    const childrenVisibleIds = childrenIds.filter((childId) => itemDataById[childId]);
    const isChildrenVisible = !isLeaf
      && itemData.isExpanded === true
      && (itemData.childrenLoadState || 'loaded') === 'loaded'
      && childrenVisibleIds.length > 0;
    const entry = {
      itemId,
      itemParentId,
      itemPrevId,
      itemNextId,
      depth,
      isLeaf,
      isChildrenVisible,
      childFirstId: isChildrenVisible ? childrenVisibleIds[0] : null,
    };
    entryList.push(entry);
    entryById[itemId] = entry;
    if (!isChildrenVisible) return;
    childrenVisibleIds.forEach((childId, childIndex) => {
      walkItem(
        childId,
        itemId,
        childrenVisibleIds[childIndex - 1] ?? null,
        childrenVisibleIds[childIndex + 1] ?? null,
        depth + 1,
      );
    });
  };
  itemRootIds.forEach((itemId, itemIndex) => {
    walkItem(itemId, null, itemRootIds[itemIndex - 1] ?? null, itemRootIds[itemIndex + 1] ?? null, 0);
  });
  return { entryList, entryById };
}

function getIsItemInSubtree(entryById, itemId, itemAncestorId) {
  if (!itemAncestorId) return false;
  let itemCurId = itemId;
  while (itemCurId !== null && itemCurId !== undefined) {
    if (itemCurId === itemAncestorId) return true;
    itemCurId = entryById[itemCurId]?.itemParentId ?? null;
  }
  return false;
}

function getIsDropNoop(entryById, drop, itemDraggedId) {
  if (!itemDraggedId || !drop) return false;
  if (drop.type === 'under') {
    const entryDragged = entryById[itemDraggedId];
    return Boolean(entryDragged
      && entryDragged.itemParentId === drop.itemParentId
      && entryDragged.itemNextId === null);
  }
  return drop.itemBeforeId === itemDraggedId || drop.itemAfterId === itemDraggedId;
}

function getRowDropZoneSegList(entry, rowHeight) {
  if (entry.isLeaf) {
    return [
      { zone: 'before', yStart: 0, yEnd: rowHeight * 0.5 },
      { zone: 'after', yStart: rowHeight * 0.5, yEnd: rowHeight },
    ];
  }
  const zoneTail = entry.isChildrenVisible ? 'child-first' : 'after';
  return [
    { zone: 'before', yStart: 0, yEnd: rowHeight * 0.25 },
    { zone: 'under', yStart: rowHeight * 0.25, yEnd: rowHeight * 0.75 },
    { zone: zoneTail, yStart: rowHeight * 0.75, yEnd: rowHeight },
  ];
}

function computeRowDropZone({ entry, rect, clientY, zonePrev }) {
  const yInRow = clientY - rect.top;
  const segList = getRowDropZoneSegList(entry, rect.height || 1);
  if (zonePrev && zonePrev.itemId === entry.itemId) {
    const segPrev = segList.find((seg) => seg.zone === zonePrev.zone);
    if (segPrev
      && yInRow >= segPrev.yStart - DRAG_ZONE_HYSTERESIS_PX
      && yInRow < segPrev.yEnd + DRAG_ZONE_HYSTERESIS_PX) {
      return zonePrev.zone;
    }
  }
  const segMatched = segList.find((seg) => yInRow >= seg.yStart && yInRow < seg.yEnd);
  return segMatched ? segMatched.zone : segList[segList.length - 1].zone;
}

function buildDropForZone({ entry, zone, entryById, rectByItemId, indentPx, clientX }) {
  if (zone === 'before') {
    return {
      targetItemId: entry.itemId,
      zone,
      indicatorType: 'before',
      indicatorDepth: entry.depth,
      drop: {
        type: 'before',
        itemParentId: entry.itemParentId,
        itemBeforeId: entry.itemPrevId,
        itemAfterId: entry.itemId,
      },
    };
  }
  if (zone === 'under') {
    return {
      targetItemId: entry.itemId,
      zone,
      indicatorType: 'under',
      indicatorDepth: entry.depth,
      drop: {
        type: 'under',
        itemParentId: entry.itemId,
        itemBeforeId: null,
        itemAfterId: null,
      },
    };
  }
  if (zone === 'child-first') {
    // bottom edge of an expanded folder means its first-child position,
    // never "next sibling of the folder"
    return {
      targetItemId: entry.itemId,
      zone,
      indicatorType: 'after',
      indicatorDepth: entry.depth + 1,
      drop: {
        type: 'before',
        itemParentId: entry.itemId,
        itemBeforeId: null,
        itemAfterId: entry.childFirstId,
      },
    };
  }
  // zone 'after': when this row ends one or more nested subtrees,
  // several insert depths are valid; pointer x chooses among them
  const candidateList = [{
    depth: entry.depth,
    drop: {
      type: 'after',
      itemParentId: entry.itemParentId,
      itemBeforeId: entry.itemId,
      itemAfterId: entry.itemNextId,
    },
  }];
  let entryCur = entry;
  while (entryCur.itemNextId === null && entryCur.itemParentId !== null) {
    const entryParent = entryById[entryCur.itemParentId];
    if (!entryParent) break;
    candidateList.push({
      depth: entryParent.depth,
      drop: {
        type: 'after',
        itemParentId: entryParent.itemParentId,
        itemBeforeId: entryParent.itemId,
        itemAfterId: entryParent.itemNextId,
      },
    });
    entryCur = entryParent;
  }
  const rect = rectByItemId[entry.itemId];
  const xDepthBase = rect.left - entry.depth * indentPx;
  const depthFromX = Math.floor((clientX - xDepthBase) / Math.max(indentPx, 1));
  const depthMin = candidateList[candidateList.length - 1].depth;
  const depthMax = candidateList[0].depth;
  const depthChosen = Math.min(Math.max(depthFromX, depthMin), depthMax);
  const candidateChosen = candidateList.find((candidate) => candidate.depth === depthChosen)
    || candidateList[0];
  return {
    targetItemId: entry.itemId,
    zone,
    indicatorType: 'after',
    indicatorDepth: candidateChosen.depth,
    drop: candidateChosen.drop,
  };
}

function resolveTreeDropFromPointer({
  treeRootEl,
  itemRootIds,
  itemDataById,
  indentPx,
  clientX,
  clientY,
  zonePrev,
}) {
  if (!treeRootEl) return null;
  const { entryList, entryById } = buildTreeRowEntryList(itemRootIds, itemDataById);
  const rectByItemId = {};
  treeRootEl.querySelectorAll('.tree-view-row[data-tree-item-id]').forEach((rowEl) => {
    rectByItemId[rowEl.getAttribute('data-tree-item-id')] = rowEl.getBoundingClientRect();
  });
  const entryVisibleList = entryList.filter((entry) => rectByItemId[entry.itemId]);
  if (entryVisibleList.length === 0) return null;

  const buildParams = { entryById, rectByItemId, indentPx, clientX };
  const entryFirst = entryVisibleList[0];
  const entryLast = entryVisibleList[entryVisibleList.length - 1];
  if (clientY < rectByItemId[entryFirst.itemId].top) {
    return { dropResolved: buildDropForZone({ entry: entryFirst, zone: 'before', ...buildParams }), entryById };
  }
  if (clientY >= rectByItemId[entryLast.itemId].bottom) {
    return { dropResolved: buildDropForZone({ entry: entryLast, zone: 'after', ...buildParams }), entryById };
  }

  // row containing pointer y; when in a gap, nearest row by edge distance
  let entryTarget = null;
  let distanceNearest = Infinity;
  for (const entry of entryVisibleList) {
    const rect = rectByItemId[entry.itemId];
    if (clientY >= rect.top && clientY < rect.bottom) {
      entryTarget = entry;
      break;
    }
    const distance = clientY < rect.top ? rect.top - clientY : clientY - rect.bottom;
    if (distance < distanceNearest) {
      distanceNearest = distance;
      entryTarget = entry;
    }
  }
  const zone = computeRowDropZone({
    entry: entryTarget,
    rect: rectByItemId[entryTarget.itemId],
    clientY,
    zonePrev,
  });
  return { dropResolved: buildDropForZone({ entry: entryTarget, zone, ...buildParams }), entryById };
}

function findScrollContainerEl(treeRootEl) {
  let el = treeRootEl;
  while (el) {
    const styleComputed = window.getComputedStyle(el);
    const isOverflowScrollable = /(auto|scroll)/.test(styleComputed.overflowY);
    if (isOverflowScrollable && el.scrollHeight > el.clientHeight + 1) return el;
    el = el.parentElement;
  }
  return null;
}

function clearAutoExpandTimer(session) {
  if (session.expandTimerId) {
    clearTimeout(session.expandTimerId);
  }
  session.expandTimerId = null;
  session.expandItemId = null;
}

function finishDragSession(session, treeRootEl) {
  if (!session) return;
  clearAutoExpandTimer(session);
  if (session.scrollRafId !== null) {
    cancelAnimationFrame(session.scrollRafId);
  }
  session.scrollRafId = null;
  session.scrollSpeed = 0;
  if (session.isDragActive && treeRootEl?.hasPointerCapture?.(session.pointerId)) {
    treeRootEl.releasePointerCapture(session.pointerId);
  }
  session.isDragActive = false;
}

export { TreeTextItemComp };
export default TreeView;
