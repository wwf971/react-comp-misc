import { makeAutoObservable } from 'mobx';

export const createJsonItemDragState = () => ({
  isDragged: false,
  isDragHovered: false,
  isInsertBefore: false,
  isInsertAfter: false,
  isInsertInside: false,
  isDropAllowed: true,
});

export const createJsonDragOperationStore = () => {
  const store = {
    isDragging: false,
    itemDraggedId: null,
    itemDraggedMeta: null,
    dropInfoActive: null,
    itemMetaById: {},
    itemDragStateById: {},
    getItemDragState(itemId) {
      if (!itemId) return createJsonItemDragState();
      if (!this.itemDragStateById[itemId]) {
        this.itemDragStateById[itemId] = createJsonItemDragState();
      }
      return this.itemDragStateById[itemId];
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
      if (this.itemDraggedId === itemMeta.itemId) {
        this.itemDraggedMeta = this.itemMetaById[itemMeta.itemId];
      }
    },
    clearItemDragState(itemId) {
      if (!itemId || !this.itemDragStateById[itemId]) return;
      this.itemDragStateById[itemId] = createJsonItemDragState();
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
      this.itemDraggedMeta = this.itemMetaById[itemId] ?? { itemId };
      this.getItemDragState(itemId).isDragged = true;
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
      itemDragState.isInsertInside = dropInfo.drop?.type === 'inside';
    },
    clearAll() {
      this.isDragging = false;
      this.itemDraggedId = null;
      this.itemDraggedMeta = null;
      this.dropInfoActive = null;
      this.itemDragStateById = {};
    },
  };
  return makeAutoObservable(store, {
    getItemDragState: false,
  }, { autoBind: true });
};
