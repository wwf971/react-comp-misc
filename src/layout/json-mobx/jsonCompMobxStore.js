import { makeAutoObservable } from 'mobx';
import { createJsonDragOperationStore } from './jsonDragOperationStore';
import { createJsonSelectionOperationStore } from './jsonSelectionOperationStore';

export { createJsonSelectionOperationStore, createJsonDragOperationStore };

export const createJsonCompMobxStore = ({ compId } = {}) => {
  const selection = createJsonSelectionOperationStore();
  const drag = createJsonDragOperationStore();

  const store = {
    compId: compId || `json-comp-${Date.now()}`,
    menuOpen: null,
    selection,
    drag,
    openMenu(menuRequest) {
      this.menuOpen = null;
      requestAnimationFrame(() => {
        this.menuOpen = menuRequest;
      });
    },
    closeMenu() {
      this.menuOpen = null;
    },
    clearDragState() {
      this.drag.clearAll();
    },
  };

  return makeAutoObservable(store, {}, { autoBind: true });
};
