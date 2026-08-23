import { makeAutoObservable, runInAction } from 'mobx';

// Simulated remote server for demo examples: each request resolves after a
// randomized delay around delayAvgMs, and fails with failRatePercent chance.
// One store instance can be shared page-wide, per example group, or owned by
// one example; SimServerControl renders the tuning ui for a store.
class StoreSimServer {
  delayAvgMs = 300;

  failRatePercent = 20;

  requestPendingCount = 0;

  constructor({ delayAvgMs, failRatePercent } = {}) {
    if (Number.isFinite(delayAvgMs)) this.delayAvgMs = delayAvgMs;
    if (Number.isFinite(failRatePercent)) this.failRatePercent = failRatePercent;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  delayAvgMsSet(delayAvgMs) {
    const value = Number(delayAvgMs);
    if (!Number.isFinite(value) || value < 0) return { code: -1, message: `Invalid delay: ${delayAvgMs}` };
    this.delayAvgMs = value;
    return { code: 0 };
  }

  failRatePercentSet(failRatePercent) {
    const value = Number(failRatePercent);
    if (!Number.isFinite(value) || value < 0 || value > 100) return { code: -1, message: `Invalid fail rate: ${failRatePercent}` };
    this.failRatePercent = value;
    return { code: 0 };
  }

  // One simulated round trip. Delay is uniform in 0.5x-1.5x of delayAvgMs;
  // resolves { code: 0 } on success, { code: -1 } on simulated failure.
  async requestRun(labelText = 'request') {
    const delayMs = Math.round(this.delayAvgMs * (0.5 + Math.random()));
    this.requestPendingCount += 1;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    runInAction(() => {
      this.requestPendingCount -= 1;
    });
    const isFail = Math.random() * 100 < this.failRatePercent;
    if (isFail) return { code: -1, message: `${labelText} failed (${delayMs}ms)` };
    return { code: 0, message: `${labelText} ok (${delayMs}ms)` };
  }

  handleEvent(eventType, eventData = {}) {
    if (eventType === 'delayAvgMsSet') return this.delayAvgMsSet(eventData.delayAvgMs);
    if (eventType === 'failRatePercentSet') return this.failRatePercentSet(eventData.failRatePercent);
    return { code: -1, message: `Unsupported event: ${eventType}` };
  }
}

function createStoreSimServer(options) {
  return new StoreSimServer(options);
}

export { StoreSimServer, createStoreSimServer };
export default StoreSimServer;
