
import { makeAutoObservable } from 'mobx';

class StoreScrollHorizontalExample {
  scrollStateById = {
    action: { scrollLeft: 0 },
    item: { scrollLeft: 0 },
  };

  itemActiveId = 'item-2';
  actionText = 'No action yet';

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  scrollLeftSet(scrollId, scrollLeft, scrollLeftMax) {
    const scrollState = this.scrollStateById[scrollId];
    if (!scrollState) return { code: 1, message: `Unknown horizontal scroll: ${scrollId}` };
    const scrollLeftLimit = Math.max(0, Number(scrollLeftMax) || 0);
    scrollState.scrollLeft = Math.max(0, Math.min(Number(scrollLeft) || 0, scrollLeftLimit));
    return { code: 0 };
  }

  handleEvent(eventType, eventData = {}) {
    if (eventType === 'scrollLeftSet') return this.scrollLeftSet(eventData.scrollId, eventData.scrollLeft, eventData.scrollLeftMax);
    if (eventType === 'actionSelect') {
      this.actionText = String(eventData.actionText || 'Action selected');
      return { code: 0 };
    }
    if (eventType === 'itemSelect') {
      this.itemActiveId = String(eventData.itemId || '');
      return { code: 0 };
    }
    return { code: 1, message: `Unsupported event: ${eventType}` };
  }
}

function createStoreScrollHorizontalExample() {
  return new StoreScrollHorizontalExample();
}

export { createStoreScrollHorizontalExample };
export default StoreScrollHorizontalExample;
