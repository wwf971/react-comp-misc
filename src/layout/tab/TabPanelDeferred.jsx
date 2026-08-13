import React, { Component, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import SpinningCircle from '../../icon/SpinningCircle';
import { createTabPanelDeferStore, TAB_DEFER_STATE_DEFAULT } from './tabPanelDeferStore';

const TabPanelDeferred = observer(({
  store = null,
  tabKey = 'default',
  isActive,
  isReady = true,
  deferMount = true,
  deferMountDelayMs = 0,
  deferKey,
  loadingFallback = null,
  withErrorBoundary = false,
  tabsState = null,
  children,
}) => {
  const [storeLocal] = useState(() => (store ? null : createTabPanelDeferStore()));
  const storeActive = store || storeLocal;
  const deferKeyCurrent = String(deferKey ?? 'default');
  // isActive is passed explicitly when wrapped by TabsOnTop; tabsState covers standalone use inside a tab panel
  const isActiveResolved = isActive ?? (tabsState ? tabsState[tabKey]?.isFocused === true : true);
  const deferState = storeActive.deferStateByTabKey[tabKey] || TAB_DEFER_STATE_DEFAULT;
  const isErrorActual = deferState.errorMessage != null && deferState.deferKeyError === deferKeyCurrent;
  const isMounted = !deferMount || deferState.deferKeyMounted === deferKeyCurrent;
  const isMountPending = deferMount && !isMounted && isActiveResolved && isReady && !isErrorActual;

  useEffect(() => {
    if (!isMountPending) return undefined;
    let frameIdMount = 0;
    let timerIdMount = 0;
    const mountContent = () => {
      frameIdMount = window.requestAnimationFrame(() => storeActive.markMounted(tabKey, deferKeyCurrent));
    };
    // Paint the loading fallback first. An optional delay can keep it visible
    // before synchronous mount work starts blocking the browser main thread.
    const frameIdPaint = window.requestAnimationFrame(() => {
      if (deferMountDelayMs > 0) {
        timerIdMount = window.setTimeout(mountContent, deferMountDelayMs);
        return;
      }
      mountContent();
    });
    return () => {
      window.cancelAnimationFrame(frameIdPaint);
      window.cancelAnimationFrame(frameIdMount);
      window.clearTimeout(timerIdMount);
    };
  }, [isMountPending, storeActive, tabKey, deferKeyCurrent, deferMountDelayMs]);

  if (isErrorActual) {
    if (!isActiveResolved) return null;
    return (
      <div className="tab-panel-defer-error" role="alert">
        <div className="tab-panel-defer-error-title">Tab content failed to render.</div>
        <div className="tab-panel-defer-error-message">{deferState.errorMessage}</div>
        <div className="tab-panel-defer-retry-btn" onClick={() => storeActive.retryTab(tabKey)}>Retry</div>
      </div>
    );
  }

  if (!isMounted || !isReady) {
    if (!isActiveResolved) return null;
    // mount work may block the main thread right after this fallback paints,
    // so any animation in it must run on the compositor thread: transform
    // animation on an HTML element with will-change (see SpinningCircle)
    return loadingFallback ?? (
      <div className="tab-panel-defer-loading" role="status" aria-live="polite">
        <SpinningCircle width={22} height={22} color="#45617f" />
      </div>
    );
  }

  if (!withErrorBoundary) return children;
  return (
    <TabPanelErrorCatch
      key={`${deferKeyCurrent}:${deferState.revisionRetry}`}
      onError={(errorMessage) => storeActive.markError(tabKey, errorMessage, deferKeyCurrent)}
    >
      {children}
    </TabPanelErrorCatch>
  );
});

TabPanelDeferred.displayName = 'TabPanelDeferred';

class TabPanelErrorCatch extends Component {
  constructor(props) {
    super(props);
    this.state = { isErrorCaught: false };
  }

  static getDerivedStateFromError() {
    return { isErrorCaught: true };
  }

  componentDidCatch(error) {
    this.props.onError?.(error?.message || String(error));
  }

  render() {
    if (this.state.isErrorCaught) return null;
    return this.props.children;
  }
}

export default TabPanelDeferred;
