import React, { useState, useMemo, useCallback } from 'react';
import './ItemsListVert.css';

function defaultMatchFn(data, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  if (data.label != null && String(data.label).toLowerCase().includes(q)) return true;
  if (data.description != null && String(data.description).toLowerCase().includes(q)) return true;
  try {
    if (JSON.stringify(data).toLowerCase().includes(q)) return true;
  } catch (_) {}
  return false;
}

function ItemsListVertDefaultItemInner({ data, searchQuery, onSelect, matchFn, selected, className }) {
  const matches = useMemo(
    () => (matchFn ? matchFn(data, searchQuery) : defaultMatchFn(data, searchQuery)),
    [data, searchQuery, matchFn]
  );
  if (searchQuery != null && searchQuery !== '' && !matches) return null;
  const content = (
    <>
      {data.label != null && <div className="items-list-vert-item-label">{data.label}</div>}
      {data.description != null && <div className="items-list-vert-item-desc">{data.description}</div>}
    </>
  );
  if (onSelect) {
    return (
      <button
        type="button"
        className={`items-list-vert-item-button ${selected ? 'items-list-vert-item-button-selected' : ''} ${className ?? ''}`.trim()}
        onClick={() => onSelect(data)}
      >
        {content}
      </button>
    );
  }
  return <div className={`items-list-vert-item-block ${className ?? ''}`.trim()}>{content}</div>;
}

function itemsListVertDefaultItemComparison(prevProps, nextProps) {
  if (prevProps.data !== nextProps.data) return false;
  if (prevProps.selected !== nextProps.selected) return false;
  if (prevProps.onSelect !== nextProps.onSelect) return false;
  if (prevProps.className !== nextProps.className) return false;
  if (prevProps.matchFn !== nextProps.matchFn) return false;
  
  const fn = nextProps.matchFn || defaultMatchFn;
  const prevMatches = fn(prevProps.data, prevProps.searchQuery);
  const nextMatches = fn(nextProps.data, nextProps.searchQuery);
  
  return prevMatches === nextMatches;
}

const ItemsListVertDefaultItem = React.memo(ItemsListVertDefaultItemInner, itemsListVertDefaultItemComparison);

function ItemsListVert({
  items = [],
  getItemComp = () => ItemsListVertDefaultItem,
  getItemKey = (item) => item.id ?? item.key ?? String(item),
  searchEnabled = true,
  searchPlaceholder = 'Search...',
  onItemSelect,
  matchItem,
  itemClassName,
  itemSelectedKey,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const stableSearchQuery = searchEnabled ? searchQuery : undefined;

  const handleClear = useCallback(() => setSearchQuery(''), []);

  return (
    <div className="items-list-vert">
      {searchEnabled && (
        <div className="items-list-vert-search-wrap">
          <input
            type="text"
            className="items-list-vert-search-input"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery !== '' && (
            <button
              type="button"
              className="items-list-vert-search-clear"
              onClick={handleClear}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      )}
      <div className="items-list-vert-list">
        {items.map((data, index) => {
          const ItemComp = getItemComp(data, index);
          return (
            <div key={getItemKey(data)} className="items-list-vert-list-cell">
              <ItemComp
                data={data}
                searchQuery={stableSearchQuery}
                onSelect={onItemSelect}
                matchFn={matchItem}
                selected={itemSelectedKey != null && getItemKey(data) === itemSelectedKey}
                className={itemClassName}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ItemsListVert, ItemsListVertDefaultItem };
export default ItemsListVert;
