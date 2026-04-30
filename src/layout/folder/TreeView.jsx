import React from 'react';
import { observer } from 'mobx-react-lite';
import PlusIcon from '../../icon/PlusIcon';
import MinusIcon from '../../icon/MinusIcon';
import SpinningCircle from '../../icon/SpinningCircle';
import CrossIcon from '../../icon/CrossIcon';
import RefreshIcon from '../../icon/RefreshIcon';
import './folder.css';

const TreeTextItemComp = ({ itemData }) => {
  const itemText = itemData?.text || itemData?.name || String(itemData?.id || '');
  return <span className="tree-view-text-item">{itemText}</span>;
};

const TreeItemNode = observer(({
  itemId,
  getItemDataById,
  onDataChangeRequest,
  selectedItemId,
  onItemClick,
  getItemComp,
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
    if (!isLeaf && onDataChangeRequest) {
      await onDataChangeRequest('toggle-expand', {
        itemId,
        nextIsExpanded: !isExpanded,
      });
    }
  };

  const handleReloadClick = async (event) => {
    event.stopPropagation();
    if (!onDataChangeRequest) return;
    await onDataChangeRequest('reload-children', { itemId });
  };

  return (
    <div className="tree-view-node-block">
      <div
        className={`tree-view-row ${isSelected ? 'selected' : ''}`}
        onClick={handleRowClick}
      >
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
          <ItemComp itemData={itemData} />
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

      {canRenderChildren && childrenLoadState === 'loaded' ? (
        <div className="tree-view-children">
          {childrenIds.map(childId => (
            <TreeItemNode
              key={childId}
              itemId={childId}
              getItemDataById={getItemDataById}
              onDataChangeRequest={onDataChangeRequest}
              selectedItemId={selectedItemId}
              onItemClick={onItemClick}
              getItemComp={getItemComp}
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
  getItemComp,
  className = '',
}) => {
  return (
    <div className={`tree-view ${className}`}>
      {rootItemIds.map(itemId => (
        <TreeItemNode
          key={itemId}
          itemId={itemId}
          getItemDataById={getItemDataById}
          onDataChangeRequest={onDataChangeRequest}
          selectedItemId={selectedItemId}
          onItemClick={onItemClick}
          getItemComp={getItemComp}
        />
      ))}
    </div>
  );
});

export { TreeTextItemComp };
export default TreeView;
