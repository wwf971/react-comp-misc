import { makeAutoObservable } from 'mobx';

class StoreToolbarExample {
  toolbarStateById = {
    dense: { scrollLeft: 0 },
    compact: { scrollLeft: 0 },
    aside: { scrollLeft: 0 },
    edge: { scrollLeft: 0 },
    thin: { scrollLeft: 0 },
  };

  actionLogList = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  toolbarScrollSet(toolbarId, scrollLeft, scrollLeftMax = Number.POSITIVE_INFINITY) {
    const toolbarState = this.toolbarStateById[toolbarId];
    if (!toolbarState) return { code: 1, message: `Unknown toolbar: ${toolbarId}` };
    const scrollLeftLimit = Number.isFinite(scrollLeftMax) ? scrollLeftMax : Number.POSITIVE_INFINITY;
    toolbarState.scrollLeft = Math.max(0, Math.min(Number(scrollLeft) || 0, scrollLeftLimit));
    return { code: 0 };
  }

  actionAdd(actionText) {
    this.actionLogList.unshift({ id: `${Date.now()}-${Math.random()}`, text: actionText });
    this.actionLogList = this.actionLogList.slice(0, 4);
    return { code: 0 };
  }

  handleEvent(eventType, eventData = {}) {
    if (eventType === 'scrollLeftSet') return this.toolbarScrollSet(eventData.toolbarId, eventData.scrollLeft, eventData.scrollLeftMax);
    if (eventType === 'actionAdd') return this.actionAdd(eventData.actionText || 'action');
    return { code: 1, message: `Unsupported event: ${eventType}` };
  }
}

function createStoreToolbarExample() {
  return new StoreToolbarExample();
}

export { createStoreToolbarExample };
export default StoreToolbarExample;