import React, { useEffect, useMemo, useRef, useState } from 'react';
import TreeView from '../../layout/tree/TreeView';
import {
  SideListItemContent,
  defaultGetItemDescription,
  defaultGetItemKey,
  defaultGetItemLabel,
} from './ItemList.jsx';
import './side-list.css';

const buildTreeDataFromItems = (items, getItemKey, getItemLabel, getItemDescription) => {
  const itemById = {};
  const parentById = {};
  const childrenByParentId = {};
  items.forEach((rawItem) => {
    const itemId = getItemKey(rawItem);
    if (!itemId) return;
    itemById[itemId] = rawItem;
    childrenByParentId[itemId] = childrenByParentId[itemId] || [];
  });
  items.forEach((rawItem) => {
    const itemId = getItemKey(rawItem);
    if (!itemId) return;
    const parentId = rawItem?.parentKey ?? rawItem?.parentId ?? null;
    if (parentId && itemById[parentId]) {
      parentById[itemId] = parentId;
      childrenByParentId[parentId].push(itemId);
    }
  });
  const rootItemIds = Object.keys(itemById).filter((itemId) => !parentById[itemId]);
  const itemDataById = {};
  Object.keys(itemById).forEach((itemId) => {
    const source = itemById[itemId];
    const childrenIds = childrenByParentId[itemId] || [];
    const isLeaf = childrenIds.length === 0;
    itemDataById[itemId] = {
      id: itemId,
      text: getItemLabel(source),
      description: getItemDescription(source),
      isLeaf,
      isExpanded: false,
      childrenIds,
      childrenLoadState: 'loaded',
      source,
    };
  });
  return { rootItemIds, itemDataById, parentById };
};

const buildVisibleFilteredTree = (normalizedFilterText, treeData) => {
  const { rootItemIds, itemDataById, parentById } = treeData;
  if (!normalizedFilterText) {
    return {
      rootItemIds,
      visibleItemIdSet: new Set(Object.keys(itemDataById)),
    };
  }
  const visibleItemIdSet = new Set();
  Object.values(itemDataById).forEach((itemData) => {
    if (itemData.isLeaf !== true) return;
    const text = String(itemData.text || '').toLowerCase();
    const description = String(itemData.description || '').toLowerCase();
    const isMatched = text.includes(normalizedFilterText) || description.includes(normalizedFilterText);
    if (!isMatched) return;
    let currentId = itemData.id;
    while (currentId) {
      visibleItemIdSet.add(currentId);
      currentId = parentById[currentId];
    }
  });
  return {
    rootItemIds: rootItemIds.filter((itemId) => visibleItemIdSet.has(itemId)),
    visibleItemIdSet,
  };
};

const listVisibleLeafItems = (rootItemIds, itemDataById) => {
  const leafItems = [];
  const walkVisibleItems = (itemIds) => {
    itemIds.forEach((itemId) => {
      const itemData = itemDataById[itemId];
      if (!itemData) return;
      if (itemData.isLeaf === true) {
        leafItems.push(itemData);
        return;
      }
      if (itemData.isExpanded !== true) return;
      walkVisibleItems(itemData.childrenIds || []);
    });
  };
  walkVisibleItems(rootItemIds);
  return leafItems;
};

const ItemTree = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const resolvedItems = Array.isArray(data?.items) ? data.items : [];
  const resolvedSelectedItemKey = data?.selectedItemKey ?? '';
  const getItemKey = config?.getItemKey || defaultGetItemKey;
  const getItemLabel = config?.getItemLabel || defaultGetItemLabel;
  const getItemDescription = config?.getItemDescription || defaultGetItemDescription;
  const className = config?.className || '';
  const resolvedTitleText = config?.titleText ?? '';
  const headerExtraContent = config?.headerExtraContent ?? null;
  const resolvedSearchPlaceholder = config?.searchPlaceholder ?? 'Search...';
  const resolvedIsSearchEnabled = config?.isSearchEnabled !== false;
  const resolvedIsHeaderVisible = config?.isHeaderVisible !== false;
  const isItemDragEnabled = config?.isItemDragEnabled === true;
  const getIsItemDraggable = config?.getIsItemDraggable;
  const getItemDropStatus = config?.getItemDropStatus;
  const [searchText, setSearchText] = useState('');
  const [expandedById, setExpandedById] = useState({});
  const [selectedItemIdInternal, setSelectedItemIdInternal] = useState(resolvedSelectedItemKey);
  const treeWrapRef = useRef(null);

  useEffect(() => {
    setSelectedItemIdInternal(resolvedSelectedItemKey);
  }, [resolvedSelectedItemKey]);

  const treeData = useMemo(
    () => buildTreeDataFromItems(resolvedItems, getItemKey, getItemLabel, getItemDescription),
    [resolvedItems, getItemKey, getItemLabel, getItemDescription],
  );

  useEffect(() => {
    setExpandedById((prev) => {
      const next = {};
      Object.values(treeData.itemDataById).forEach((itemData) => {
        if (itemData.isLeaf === true) return;
        next[itemData.id] = prev[itemData.id] !== undefined ? prev[itemData.id] : true;
      });
      return next;
    });
  }, [treeData]);

  const normalizedFilterText = searchText.trim().toLowerCase();
  const visibleTreeData = useMemo(
    () => buildVisibleFilteredTree(normalizedFilterText, treeData),
    [normalizedFilterText, treeData],
  );

  const renderTreeData = useMemo(() => {
    const itemDataById = {};
    Object.entries(treeData.itemDataById).forEach(([itemId, itemData]) => {
      if (visibleTreeData.visibleItemIdSet.size > 0 && !visibleTreeData.visibleItemIdSet.has(itemId)) return;
      if (normalizedFilterText && visibleTreeData.visibleItemIdSet.size === 0) return;
      const isExpanded = itemData.isLeaf ? false : Boolean(expandedById[itemId]);
      itemDataById[itemId] = {
        ...itemData,
        isExpanded,
        childrenIds: itemData.childrenIds.filter((childId) => {
          if (!normalizedFilterText) return true;
          return visibleTreeData.visibleItemIdSet.has(childId);
        }),
      };
    });
    const rootItemIds = normalizedFilterText
      ? visibleTreeData.rootItemIds
      : treeData.rootItemIds;
    return { rootItemIds, itemDataById };
  }, [treeData, visibleTreeData, normalizedFilterText, expandedById]);

  const TreeLeafItemComp = ({ itemData }) => (
    <SideListItemContent
      itemData={itemData.source}
      getItemLabel={getItemLabel}
      getItemDescription={getItemDescription}
      matchText={searchText}
    />
  );

  const TreeBranchItemComp = ({ itemData }) => (
    <SideListItemContent
      itemData={itemData.source}
      getItemLabel={getItemLabel}
      getItemDescription={() => ''}
      isBranch={true}
      branchChildCount={0}
      matchText={searchText}
    />
  );

  const emitMoveItem = async (eventData) => {
    const itemId = String(eventData?.itemId || '').trim();
    const itemData = renderTreeData.itemDataById[itemId] || null;
    if (!itemId || !itemData) return { code: -1 };
    if (!onEvent) return { code: 0 };
    return onEvent('moveItem', {
      itemKey: itemId,
      itemData: itemData.source,
      treeItemData: itemData,
      drop: eventData?.drop,
    });
  };

  const emitSelect = async (itemIdRaw, itemData) => {
    if (itemData?.isLeaf !== true) {
      return;
    }
    const itemId = String(itemIdRaw || itemData?.id || '').trim();
    const sourceItem = itemData?.source || null;
    setSelectedItemIdInternal(itemId);
    if (onEvent) {
      await onEvent('itemSelect', { itemData: sourceItem, itemKey: itemId });
    }
  };

  const scrollItemIntoView = (itemId) => {
    const wrapEl = treeWrapRef.current;
    if (!wrapEl || !itemId) return;
    const rowEl = wrapEl.querySelector(`.tree-view-row[data-tree-item-id="${CSS.escape(String(itemId))}"]`);
    rowEl?.scrollIntoView({ block: 'nearest' });
  };

  const focusTreeWrap = () => {
    treeWrapRef.current?.focus({ preventScroll: true });
  };

  const selectVisibleLeafByOffset = (offset) => {
    const leafItems = listVisibleLeafItems(
      renderTreeData.rootItemIds,
      renderTreeData.itemDataById,
    );
    if (leafItems.length === 0) return false;
    const currentIndex = leafItems.findIndex((item) => item.id === selectedItemIdInternal);
    let nextIndex;
    if (currentIndex < 0) {
      nextIndex = offset > 0 ? 0 : leafItems.length - 1;
    } else {
      nextIndex = Math.max(0, Math.min(leafItems.length - 1, currentIndex + offset));
    }
    const nextItem = leafItems[nextIndex];
    if (!nextItem || nextItem.id === selectedItemIdInternal) return false;
    emitSelect(nextItem.id, nextItem);
    requestAnimationFrame(() => scrollItemIntoView(nextItem.id));
    return true;
  };

  const expandAll = () => {
    const nextExpandedById = {};
    Object.values(treeData.itemDataById).forEach((itemData) => {
      if (itemData.isLeaf === true) return;
      nextExpandedById[itemData.id] = true;
    });
    setExpandedById(nextExpandedById);
    if (onEvent) {
      onEvent('toggleExpandAll', { nextIsExpanded: true });
    }
  };

  const collapseAll = () => {
    const nextExpandedById = {};
    Object.values(treeData.itemDataById).forEach((itemData) => {
      if (itemData.isLeaf === true) return;
      nextExpandedById[itemData.id] = false;
    });
    setExpandedById(nextExpandedById);
    if (onEvent) {
      onEvent('toggleExpandAll', { nextIsExpanded: false });
    }
  };

  return (
    <div className={`side-list-root ${className}`.trim()}>
      {resolvedIsHeaderVisible ? (
        <div className="side-list-header">
          {resolvedTitleText ? <div className="side-list-title">{resolvedTitleText}</div> : null}
          {headerExtraContent ? <div className="side-list-header-extra">{headerExtraContent}</div> : null}
        </div>
      ) : null}
      {resolvedIsSearchEnabled ? (
        <div className="side-list-search-wrap">
          <input
            className="side-list-search-input"
            value={searchText}
            onChange={(event) => {
              const nextSearchText = event.target.value;
              setSearchText(nextSearchText);
              if (onEvent) {
                onEvent('searchTextChange', { searchText: nextSearchText });
              }
            }}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowDown') return;
              if (event.nativeEvent.isComposing || event.keyCode === 229) return;
              const firstLeafItem = listVisibleLeafItems(
                renderTreeData.rootItemIds,
                renderTreeData.itemDataById,
              )[0];
              if (!firstLeafItem) return;
              event.preventDefault();
              emitSelect(firstLeafItem.id, firstLeafItem);
              focusTreeWrap();
              requestAnimationFrame(() => scrollItemIntoView(firstLeafItem.id));
            }}
            placeholder={resolvedSearchPlaceholder}
          />
        </div>
      ) : null}
      <div className="side-list-tree-actions">
        <button type="button" className="side-list-tree-action-btn" onClick={expandAll}>
          Expand All
        </button>
        <button type="button" className="side-list-tree-action-btn" onClick={collapseAll}>
          Collapse All
        </button>
      </div>
      <div
        className="side-list-tree-wrap"
        ref={treeWrapRef}
        tabIndex={0}
        onClick={focusTreeWrap}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
          event.preventDefault();
          selectVisibleLeafByOffset(event.key === 'ArrowDown' ? 1 : -1);
        }}
      >
        <TreeView
          data={{
            itemRootIds: renderTreeData.rootItemIds,
            itemDataById: renderTreeData.itemDataById,
            itemSelectedId: selectedItemIdInternal,
          }}
          config={{
            className: 'side-list-tree',
            indentPx: config?.indentPx ?? 20,
            isToggleExpandOnItemClick: true,
            isItemDragEnabled,
            getIsItemDraggable: getIsItemDraggable
              ? (itemData) => getIsItemDraggable(itemData?.source, itemData)
              : undefined,
            getItemDropStatus: getItemDropStatus
              ? ({ itemId, itemData, targetItemId, targetItemData, drop }) => getItemDropStatus({
                itemKey: itemId,
                itemData: itemData?.source,
                treeItemData: itemData,
                targetItemKey: targetItemId,
                targetItemData: targetItemData?.source,
                targetTreeItemData: targetItemData,
                drop,
              })
              : undefined,
            getItemComp: (itemData) => (itemData?.isLeaf ? TreeLeafItemComp : TreeBranchItemComp),
          }}
          onEvent={async (eventType, eventData) => {
            if (eventType === 'itemClick') {
              return emitSelect(eventData?.itemId, eventData?.itemData);
            }
            if (eventType === 'toggleExpand') {
              const itemId = eventData?.itemId;
              if (!itemId) return { code: -1 };
              setExpandedById((prev) => ({
                ...prev,
                [itemId]: eventData?.nextIsExpanded === true,
              }));
              if (onEvent) {
                await onEvent('toggleExpand', { itemId, nextIsExpanded: eventData?.nextIsExpanded === true });
              }
              return { code: 0 };
            }
            if (eventType === 'moveItem') {
              return emitMoveItem(eventData);
            }
            return { code: 0 };
          }}
        />
      </div>
    </div>
  );
};

export default ItemTree;
