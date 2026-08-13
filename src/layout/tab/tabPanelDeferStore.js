import { makeAutoObservable } from 'mobx';

export const TAB_DEFER_STATE_DEFAULT = Object.freeze({
  deferKeyMounted: null,
  errorMessage: null,
  deferKeyError: null,
  revisionRetry: 0,
});

export const createTabPanelDeferStore = () => {
  const store = {
    deferStateByTabKey: {},
    ensureTabState(tabKey) {
      if (!this.deferStateByTabKey[tabKey]) {
        this.deferStateByTabKey[tabKey] = { ...TAB_DEFER_STATE_DEFAULT };
      }
      return this.deferStateByTabKey[tabKey];
    },
    markMounted(tabKey, deferKey) {
      const deferState = this.ensureTabState(tabKey);
      deferState.deferKeyMounted = deferKey;
    },
    markError(tabKey, errorMessage, deferKey) {
      const deferState = this.ensureTabState(tabKey);
      deferState.errorMessage = errorMessage;
      deferState.deferKeyError = deferKey;
    },
    retryTab(tabKey) {
      const deferState = this.ensureTabState(tabKey);
      deferState.errorMessage = null;
      deferState.deferKeyError = null;
      deferState.deferKeyMounted = null;
      deferState.revisionRetry += 1;
    },
  };
  return makeAutoObservable(store, {}, { autoBind: true });
};
