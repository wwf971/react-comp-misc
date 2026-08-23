import { makeAutoObservable } from 'mobx';

// Ui state of the JsonCompMobx example page: control values of the main
// editable tree, and the message produced by the latest change attempt.
class StoreJsonMobxExample {
  config = {
    isEditable: true,
    isKeyEditable: true,
    isDebug: true,
    isDragMoveEnabled: true,
    dragFailureRate: 30,
  };

  changeMessage = null; // { type: 'success' | 'error', text }

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  editableSet(isEditable) {
    this.config.isEditable = isEditable;
    if (!isEditable) {
      this.config.isDragMoveEnabled = false;
    }
    return { code: 0 };
  }

  keyEditableSet(isKeyEditable) {
    this.config.isKeyEditable = isKeyEditable;
    return { code: 0 };
  }

  debugSet(isDebug) {
    this.config.isDebug = isDebug;
    return { code: 0 };
  }

  dragMoveSet(isDragMoveEnabled) {
    this.config.isDragMoveEnabled = isDragMoveEnabled;
    return { code: 0 };
  }

  dragFailureRateSet(dragFailureRate) {
    this.config.dragFailureRate = Math.max(0, Math.min(100, Number(dragFailureRate) || 0));
    return { code: 0 };
  }

  changeMessageSet(type, text) {
    this.changeMessage = { type, text };
    return { code: 0 };
  }
}

function createStoreJsonMobxExample() {
  return new StoreJsonMobxExample();
}

export { createStoreJsonMobxExample };
export default StoreJsonMobxExample;
