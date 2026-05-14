import React, { useEffect, useMemo, useState } from 'react';
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

const ItemTree = ({
  data = {},
  config = {},
  onEvent,
  items,
  selectedItemKey,
  onItemSelect,
  titleText,
  headerExtraContent = null,
  searchPlaceholder,
  isSearchEnabled,
  isHeaderVisible,
  getItemKey = defaultGetItemKey,
  getItemLabel = defaultGetItemLabel,
  getItemDescription = defaultGetItemDescription,
  className = '',
}) => {
  const resolvedItems = Array.isArray(data?.items)
    ? data.items
    : (Array.isArray(items) ? items : []);
  const resolvedSelectedItemKey = data?.selectedItemKey ?? selectedItemKey ?? '';
  const resolvedTitleText = config?.titleText ?? titleText ?? '';
  const resolvedSearchPlaceholder = config?.searchPlaceholder ?? searchPlaceholder ?? 'Search...';
  const resolvedIsSearchEnabled = config?.isSearchEnabled ?? (isSearchEnabled !== false);
  const resolvedIsHeaderVisible = config?.isHeaderVisible ?? (isHeaderVisible !== false);
  const [searchText, setSearchText] = useState('');
  const [expandedById, setExpandedById] = useState({});
  const [selectedItemIdInternal, setSelectedItemIdInternal] = useState(resolvedSelectedItemKey);

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

  const emitSelect = async (itemIdRaw, itemData) => {
    if (itemData?.isLeaf !== true) {
      return;
    }
    const itemId = String(itemIdRaw || itemData?.id || '').trim();
    const sourceItem = itemData?.source || null;
    setSelectedItemIdInternal(itemId);
    if (onItemSelect) {
      await onItemSelect(sourceItem, itemId);
    }
    if (onEvent) {
      await onEvent('itemSelect', { itemData: sourceItem, itemKey: itemId });
    }
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
      <div className="side-list-tree-wrap">
        <TreeView
          className="side-list-tree"
          rootItemIds={renderTreeData.rootItemIds}
          getItemDataById={(itemId) => renderTreeData.itemDataById[itemId] || null}
          selectedItemId={selectedItemIdInternal}
          indentPx={20}
          isToggleExpandOnItemClick={true}
          onItemClick={emitSelect}
          onDataChangeRequest={async (type, params) => {
            if (type !== 'toggle-expand') return { code: 0 };
            const itemId = params?.itemId;
            if (!itemId) return { code: -1 };
            setExpandedById((prev) => ({
              ...prev,
              [itemId]: params?.nextIsExpanded === true,
            }));
            if (onEvent) {
              await onEvent('toggleExpand', { itemId, nextIsExpanded: params?.nextIsExpanded === true });
            }
            return { code: 0 };
          }}
          getItemComp={(itemData) => (itemData?.isLeaf ? TreeLeafItemComp : TreeBranchItemComp)}
        />
      </div>
    </div>
  );
};

export default ItemTree;
