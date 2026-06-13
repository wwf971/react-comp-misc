import { makeAutoObservable } from 'mobx';

export const JSON_ROOT_SELECTION_ITEM_ID = 'json-root';

export const getJsonObjectSelectionItemId = (path) => `json-object-item:${path || '$root'}`;

export const getJsonArraySelectionItemId = (path) => `json-array-item:${path || '$root'}`;

export const createJsonSelectionOperationStore = () => {
  const store = {
    isSelectionActive: false,
    selectionRevision: 0,
    selectedItemId: null,
    selectedAncestorItemIds: [],
    selectedItemMeta: null,
    itemMetaById: {},
    isNextSelectionClickSuppressed: false,
    getItemSelectionState(itemId) {
      const selectionRevision = this.selectionRevision;
      const isSelectionActive = this.isSelectionActive;
      const itemSelectedId = this.selectedItemId;
      const itemAncestorIds = this.selectedAncestorItemIds;
      return {
        selectionRevision,
        isSelected: Boolean(isSelectionActive && itemId && itemSelectedId === itemId),
        isSelectionAncestor: Boolean(isSelectionActive && itemId && itemAncestorIds.includes(itemId)),
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
      if (this.selectedItemId === itemMeta.itemId) {
        this.selectedItemMeta = this.itemMetaById[itemMeta.itemId];
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
      if (!itemId || !this.selectedItemId) return false;
      if (itemId === this.selectedItemId) return true;
      return this.getAncestorItemIds(itemId).includes(this.selectedItemId);
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
      const itemIdPrevious = this.selectedItemId;
      const isSelectionChanged = !this.isSelectionActive || itemIdPrevious !== itemId;
      this.isSelectionActive = true;
      this.selectedItemId = itemId;
      this.selectedItemMeta = this.itemMetaById[itemId] ?? { itemId };
      this.selectedAncestorItemIds = this.getAncestorItemIds(itemId);
      if (isSelectionChanged) {
        this.selectionRevision += 1;
      }
    },
    selectNextFromItem(itemId) {
      if (!itemId) return;
      const itemIdToExpand = this.getIsItemInsideSelectedItem(itemId)
        ? this.selectedItemId
        : itemId;
      if (this.selectedItemId !== itemIdToExpand) {
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
      const isSelectionChanged = this.isSelectionActive || this.selectedItemId || this.selectedAncestorItemIds.length > 0;
      this.isSelectionActive = false;
      this.selectedItemId = null;
      this.selectedAncestorItemIds = [];
      this.selectedItemMeta = null;
      if (isSelectionChanged) {
        this.selectionRevision += 1;
      }
    },
  };
  return makeAutoObservable(store, {
    getItemSelectionState: false,
  }, { autoBind: true });
};
