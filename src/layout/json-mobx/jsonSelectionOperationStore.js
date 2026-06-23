import { makeAutoObservable } from 'mobx';

export const JSON_ROOT_SELECTION_ITEM_ID = 'json-root';

export const getJsonObjectSelectionItemId = (path) => `json-object-item:${path || '$root'}`;

export const getJsonArraySelectionItemId = (path) => `json-array-item:${path || '$root'}`;

export const createJsonSelectionOperationStore = () => {
  const store = {
    isSelectionActive: false,
    revisionSelection: 0,
    itemSelectedId: null,
    itemAncestorIdsSelected: [],
    itemSelectedMeta: null,
    itemMetaById: {},
    isNextSelectionClickSuppressed: false,
    getItemSelectionState(itemId) {
      const isSelectionActive = this.isSelectionActive;
      const itemSelectedId = this.itemSelectedId;
      const itemAncestorIdsSelected = this.itemAncestorIdsSelected;
      return {
        isSelected: Boolean(isSelectionActive && itemId && itemSelectedId === itemId),
        isSelectionAncestor: Boolean(isSelectionActive && itemId && itemAncestorIdsSelected.includes(itemId)),
      };
    },
    registerItem(itemMeta) {
      if (!itemMeta?.itemId) return;
      this.itemMetaById[itemMeta.itemId] = {
        itemParentId: null,
        path: '',
        itemKind: 'item',
        label: '',
        ...itemMeta,
      };
      if (this.itemSelectedId === itemMeta.itemId) {
        this.itemSelectedMeta = this.itemMetaById[itemMeta.itemId];
      }
    },
    getAncestorItemIds(itemId) {
      const ancestorItemIds = [];
      const visitedItemIds = new Set();
      let currentItemId = this.itemMetaById[itemId]?.itemParentId;
      while (currentItemId && !visitedItemIds.has(currentItemId)) {
        visitedItemIds.add(currentItemId);
        ancestorItemIds.push(currentItemId);
        currentItemId = this.itemMetaById[currentItemId]?.itemParentId;
      }
      return ancestorItemIds;
    },
    getIsItemInsideSelectedItem(itemId) {
      if (!itemId || !this.itemSelectedId) return false;
      if (itemId === this.itemSelectedId) return true;
      return this.getAncestorItemIds(itemId).includes(this.itemSelectedId);
    },
    suppressNextSelectionClick() {
      this.isNextSelectionClickSuppressed = true;
    },
    consumeNextSelectionClickSuppressed() {
      if (!this.isNextSelectionClickSuppressed) return false;
      this.isNextSelectionClickSuppressed = false;
      return true;
    },
    clearNextSelectionClickSuppressed() {
      this.isNextSelectionClickSuppressed = false;
    },
    selectItem(itemId) {
      if (!itemId) {
        this.clearSelection();
        return;
      }
      const itemIdPrevious = this.itemSelectedId;
      const isSelectionChanged = !this.isSelectionActive || itemIdPrevious !== itemId;
      this.isSelectionActive = true;
      this.itemSelectedId = itemId;
      this.itemSelectedMeta = this.itemMetaById[itemId] ?? { itemId };
      this.itemAncestorIdsSelected = this.getAncestorItemIds(itemId);
      if (isSelectionChanged) {
        this.revisionSelection += 1;
      }
    },
    selectNextFromItem(itemId) {
      if (!itemId) return;
      const itemIdToExpand = this.getIsItemInsideSelectedItem(itemId)
        ? this.itemSelectedId
        : itemId;
      if (this.itemSelectedId !== itemIdToExpand) {
        this.selectItem(itemIdToExpand);
        return;
      }
      const itemParentId = this.itemMetaById[itemIdToExpand]?.itemParentId;
      if (itemParentId) {
        this.selectItem(itemParentId);
        return;
      }
      this.clearSelection();
    },
    clearSelection() {
      const isSelectionChanged = this.isSelectionActive || this.itemSelectedId || this.itemAncestorIdsSelected.length > 0;
      if (!isSelectionChanged) {
        return;
      }
      this.isSelectionActive = false;
      this.itemSelectedId = null;
      this.itemAncestorIdsSelected.length = 0;
      this.itemSelectedMeta = null;
      this.revisionSelection += 1;
    },
  };
  return makeAutoObservable(store, {
    getItemSelectionState: false,
  }, { autoBind: true });
};
