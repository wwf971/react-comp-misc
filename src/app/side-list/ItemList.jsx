import React, { useMemo, useState } from 'react';
import './side-list.css';

const defaultGetItemKey = (item) => String(item?.key ?? item?.id ?? '');
const defaultGetItemLabel = (item) => String(item?.label ?? item?.name ?? item?.key ?? item?.id ?? '');
const defaultGetItemDescription = (item) => String(item?.description ?? '');

const renderMatchedText = (rawText, matchText) => {
  const text = String(rawText ?? '');
  const normalizedMatchText = String(matchText ?? '').trim().toLowerCase();
  if (!normalizedMatchText) return text;
  const startIndex = text.toLowerCase().indexOf(normalizedMatchText);
  if (startIndex < 0) return text;
  const endIndex = startIndex + normalizedMatchText.length;
  return (
    <>
      {text.slice(0, startIndex)}
      <span className="side-list-match-highlight">{text.slice(startIndex, endIndex)}</span>
      {text.slice(endIndex)}
    </>
  );
};

const SideListItemContent = React.memo(({
  itemData,
  getItemLabel = defaultGetItemLabel,
  getItemDescription = defaultGetItemDescription,
  isBranch = false,
  branchChildCount = 0,
  prefixIcon = null,
  matchText = '',
}) => {
  const labelText = getItemLabel(itemData);
  const descriptionText = getItemDescription(itemData);
  if (isBranch) {
    return (
      <div className="side-list-item-content">
        <div className="side-list-item-branch">
          {prefixIcon ? <div className="side-list-item-branch-icon">{prefixIcon}</div> : null}
          <div className="side-list-item-label">{renderMatchedText(labelText, matchText)}</div>
          {branchChildCount > 0 ? <div className="side-list-item-branch-meta">{branchChildCount}</div> : null}
        </div>
      </div>
    );
  }
  return (
    <div className="side-list-item-content">
      <div className="side-list-item-branch">
        {prefixIcon ? <div className="side-list-item-branch-icon">{prefixIcon}</div> : null}
        <div className="side-list-item-label">{renderMatchedText(labelText, matchText)}</div>
      </div>
      {descriptionText ? (
        <div className="side-list-item-desc">{renderMatchedText(descriptionText, matchText)}</div>
      ) : null}
    </div>
  );
});

const ItemList = ({
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

  const filteredItems = useMemo(() => {
    const normalized = searchText.trim().toLowerCase();
    if (!normalized) return resolvedItems;
    return resolvedItems.filter((item) => {
      const labelText = getItemLabel(item).toLowerCase();
      const descriptionText = getItemDescription(item).toLowerCase();
      return labelText.includes(normalized) || descriptionText.includes(normalized);
    });
  }, [resolvedItems, searchText, getItemLabel, getItemDescription]);

  const emitSelect = async (itemData) => {
    const itemKey = getItemKey(itemData);
    if (onItemSelect) {
      await onItemSelect(itemData, itemKey);
    }
    if (onEvent) {
      await onEvent('itemSelect', { itemData, itemKey });
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
      <div className="side-list-items">
        {filteredItems.map((itemData) => {
          const itemKey = getItemKey(itemData);
          const isSelected = itemKey === resolvedSelectedItemKey;
          return (
            <button
              key={itemKey}
              type="button"
              className={`side-list-item-btn ${isSelected ? 'is-selected' : ''}`}
              onClick={() => emitSelect(itemData)}
            >
              <SideListItemContent
                itemData={itemData}
                getItemLabel={getItemLabel}
                getItemDescription={getItemDescription}
                matchText={searchText}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export {
  SideListItemContent,
  defaultGetItemKey,
  defaultGetItemLabel,
  defaultGetItemDescription,
};
export default ItemList;
