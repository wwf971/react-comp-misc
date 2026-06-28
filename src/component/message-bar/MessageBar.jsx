import { useEffect, useLayoutEffect, useRef } from 'react';
import { SpinningCircle } from '../../icon/Icon.jsx';
import './MessageBar.css';

const STATUS_SET = new Set(['idle', 'loading', 'success', 'error', 'info']);
const BUTTON_BUILT_IN_DISMISS = 'dismiss';

function buildContentItems(data, status, messageText, idleText) {
  if (Array.isArray(data.contentItems)) {
    return data.contentItems;
  }
  const items = [
    {
      id: 'message',
      type: 'text',
      text: messageText || idleText,
    },
  ];
  if (messageText || status !== 'idle') {
    items.push({
      id: 'dismiss',
      type: 'button',
      buttonKind: BUTTON_BUILT_IN_DISMISS,
      text: 'Dismiss',
    });
  }
  return items;
}

const MessageBar = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const measureLastRef = useRef({ widthViewport: 0, widthContent: 0 });
  const messageState = data.messageState || {};
  const statusRaw = messageState.status || 'idle';
  const status = STATUS_SET.has(statusRaw) ? statusRaw : 'idle';
  const messageText = `${messageState.messageText ?? ''}`;
  const idleText = `${data.idleText ?? config.idleText ?? 'ready'}`;
  const isPersistent = config.isPersistent !== false;
  const isVisible = isPersistent || Boolean(messageText);
  const isBusy = config.isBusy === true || status === 'loading';
  const isOneLine = config.isOneLine !== false;
  const displayStatus = messageText ? status : 'empty';
  const contentItems = buildContentItems(data, status, messageText, idleText);
  const textTitle = contentItems
    .filter((item) => item?.type === 'text')
    .map((item) => `${item.text ?? ''}`)
    .filter(Boolean)
    .join(' ');
  const scrollLeft = Math.max(0, Number(config.scrollLeft ?? 0));

  useLayoutEffect(() => {
    const viewportEl = viewportRef.current;
    const trackEl = trackRef.current;
    if (!viewportEl || !trackEl) {
      return;
    }
    if (!isOneLine) {
      trackEl.style.transform = '';
      return;
    }
    const widthViewport = viewportEl.clientWidth;
    const widthContent = trackEl.scrollWidth;
    const scrollLeftMax = Math.max(0, widthContent - widthViewport);
    const scrollLeftClamped = Math.min(scrollLeft, scrollLeftMax);
    trackEl.style.transform = `translateX(${-scrollLeftClamped}px)`;
    if (scrollLeft !== scrollLeftClamped) {
      onEvent?.('scrollLeftChangeRequest', {
        scrollLeft: scrollLeftClamped,
        scrollLeftMax,
        widthViewport,
        widthContent,
      });
    }
  }, [scrollLeft, contentItems, isOneLine, onEvent]);

  useEffect(() => {
    const viewportEl = viewportRef.current;
    const trackEl = trackRef.current;
    if (!viewportEl || !trackEl || !isOneLine) {
      return undefined;
    }

    const measureAndEmit = () => {
      const widthViewport = viewportEl.clientWidth;
      const widthContent = trackEl.scrollWidth;
      const measureLast = measureLastRef.current;
      if (measureLast.widthViewport === widthViewport && measureLast.widthContent === widthContent) {
        return;
      }
      measureLastRef.current = { widthViewport, widthContent };
      onEvent?.('measureChange', {
        widthViewport,
        widthContent,
        scrollLeftMax: Math.max(0, widthContent - widthViewport),
      });
    };

    measureAndEmit();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(measureAndEmit);
    observer.observe(viewportEl);
    observer.observe(trackEl);
    return () => observer.disconnect();
  }, [contentItems, isOneLine, onEvent]);

  if (!isVisible) {
    return null;
  }

  const rootClassName = [
    'message-bar-root',
    `status-${displayStatus}`,
    isOneLine ? 'is-one-line' : 'is-multi-line',
    config.heightSize ? `height-${config.heightSize}` : '',
    config.className || '',
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClassName}>
      <div
        ref={viewportRef}
        className={`message-bar-content ${config.contentClassName || ''}`.trim()}
        title={config.isTitleEnabled === false ? undefined : textTitle}
        onWheel={(event) => {
          if (!isOneLine) {
            return;
          }
          const viewportEl = viewportRef.current;
          const trackEl = trackRef.current;
          if (!viewportEl || !trackEl) {
            return;
          }
          const deltaX = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
          if (!deltaX) {
            return;
          }
          const widthViewport = viewportEl.clientWidth;
          const widthContent = trackEl.scrollWidth;
          const scrollLeftMax = Math.max(0, widthContent - widthViewport);
          if (scrollLeftMax <= 0) {
            return;
          }
          event.preventDefault();
          const scrollLeftNext = Math.min(scrollLeftMax, Math.max(0, scrollLeft + deltaX));
          onEvent?.('scrollLeftChangeRequest', {
            scrollLeft: scrollLeftNext,
            scrollLeftMax,
            widthViewport,
            widthContent,
            deltaX,
          });
        }}
      >
        <div ref={trackRef} className="message-bar-track">
          {isBusy ? <SpinningCircle width={13} height={13} /> : null}
          {contentItems.map((item, index) => renderContentItem(item, index, {
            config,
            isBusy,
            onEvent,
          }))}
        </div>
      </div>
    </div>
  );
};

function renderContentItem(item, index, context) {
  const { config, isBusy, onEvent } = context;
  const key = item?.id || index;
  const type = item?.type || 'text';
  if (type === 'button') {
    const buttonKind = item.buttonKind || '';
    const isBuiltInDismiss = buttonKind === BUTTON_BUILT_IN_DISMISS;
    const eventType = isBuiltInDismiss ? 'dismissMessageRequest' : (item.eventType || 'buttonClick');
    const className = [
      'message-bar-btn',
      isBuiltInDismiss ? 'is-dismiss' : 'is-external',
      item.className || '',
      config.buttonClassName || '',
    ].filter(Boolean).join(' ');
    return (
      <button
        key={key}
        type="button"
        className={className}
        disabled={isBusy || item.isDisabled === true}
        onClick={() => onEvent?.(eventType, { itemId: item.id, itemData: item.data, ...(item.eventData || {}) })}
      >
        {item.text || item.labelText || (isBuiltInDismiss ? 'Dismiss' : 'Action')}
      </button>
    );
  }
  if (type === 'custom') {
    const Comp = config.getComp?.(item);
    const className = [
      'message-bar-custom',
      item.heightSize ? `height-${item.heightSize}` : '',
      item.className || '',
    ].filter(Boolean).join(' ');
    return (
      <span
        key={key}
        className={className}
      >
        {Comp ? <Comp data={item.data || {}} config={item.config || {}} onEvent={onEvent} /> : null}
      </span>
    );
  }
  return (
    <span
      key={key}
      className={`message-bar-text ${item.className || ''}`.trim()}
    >
      {`${item.text ?? ''}`}
    </span>
  );
}

export default MessageBar;
