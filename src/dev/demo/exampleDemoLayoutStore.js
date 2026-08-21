import { makeAutoObservable } from 'mobx';

const boxColorHexById = {
  blue: '#4f83c2',
  green: '#5a9e6f',
  orange: '#d9924a',
};

const boxSizePxById = {
  small: 40,
  medium: 64,
  large: 96,
};

// Store for the demo layout self-example. One instance can be shared by several
// examples on the same page (global store), or created per example (local store).
class StoreDemoLayoutExample {
  box = {
    colorId: 'blue',
    sizeId: 'medium',
    isRounded: false,
  };

  logList = []; // [{ id, text }]

  tileClicks = {
    total: 0,
    countById: {},
  };

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  boxColorSet(colorId) {
    if (!boxColorHexById[colorId]) return { code: -1, message: `Unknown color: ${colorId}` };
    this.box.colorId = colorId;
    this.logAdd(`color set to ${colorId}`);
    return { code: 0 };
  }

  boxSizeSet(sizeId) {
    if (!boxSizePxById[sizeId]) return { code: -1, message: `Unknown size: ${sizeId}` };
    this.box.sizeId = sizeId;
    this.logAdd(`size set to ${sizeId}`);
    return { code: 0 };
  }

  boxRoundedSet(isRounded) {
    this.box.isRounded = isRounded;
    this.logAdd(`rounded set to ${isRounded}`);
    return { code: 0 };
  }

  logAdd(text) {
    this.logList.unshift({ id: `${Date.now()}-${Math.random()}`, text });
    this.logList = this.logList.slice(0, 5);
    return { code: 0 };
  }

  tileClickAdd(tileId) {
    this.tileClicks.total += 1;
    this.tileClicks.countById[tileId] = (this.tileClicks.countById[tileId] || 0) + 1;
    return { code: 0 };
  }

  handleEvent(eventType, eventData = {}) {
    if (eventType === 'boxColorSet') return this.boxColorSet(eventData.colorId);
    if (eventType === 'boxSizeSet') return this.boxSizeSet(eventData.sizeId);
    if (eventType === 'boxRoundedSet') return this.boxRoundedSet(eventData.isRounded);
    if (eventType === 'tileClickAdd') return this.tileClickAdd(eventData.tileId);
    return { code: -1, message: `Unsupported event: ${eventType}` };
  }
}

function createStoreDemoLayoutExample() {
  return new StoreDemoLayoutExample();
}

export { createStoreDemoLayoutExample, boxColorHexById, boxSizePxById };
export default StoreDemoLayoutExample;
