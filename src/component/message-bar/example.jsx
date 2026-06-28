import { useState } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import MessageBar from './MessageBar.jsx';
import './example.css';

function createMessageBarExampleStore() {
  const store = {
    simpleMessageState: {
      status: 'success',
      messageText: 'service url: http://192.168.1.32:9400',
    },
    longMessageState: {
      status: 'error',
      messageText: 'A long message keeps one-line layout stable while the full item track moves horizontally by mouse wheel offset instead of expanding the page height.',
    },
    customMessageState: {
      status: 'info',
      messageText: 'custom detail area can appear without changing the main row height',
    },
    longScrollLeft: 0,
    longWidthViewport: 0,
    longWidthContent: 0,
    isCustomVisible: true,
    retryCount: 0,
    meterValue: 4,
    getSimpleContentItems() {
      return [
        { id: 'message', type: 'text', text: this.simpleMessageState.messageText || 'ready' },
        ...(this.simpleMessageState.messageText ? [
          { id: 'dismiss', type: 'button', buttonKind: 'dismiss', text: 'Dismiss' },
        ] : []),
      ];
    },
    getLongContentItems() {
      return [
        { id: 'message', type: 'text', text: this.longMessageState.messageText || 'ready' },
        ...(this.longMessageState.messageText ? [
          { id: 'retry', type: 'button', text: 'Retry', eventType: 'retryRequest', eventData: { source: 'long' } },
          { id: 'dismiss', type: 'button', buttonKind: 'dismiss', text: 'Dismiss' },
        ] : []),
      ];
    },
    getCustomContentItems() {
      return [
        { id: 'message', type: 'text', text: this.customMessageState.messageText || 'ready' },
        ...(this.isCustomVisible ? [
          {
            id: 'meter',
            type: 'custom',
            compKey: 'miniMeter',
            heightSize: 'md',
            data: {
              label: 'level',
              value: this.meterValue,
            },
          },
        ] : []),
        ...(this.customMessageState.messageText ? [
          { id: 'dismiss', type: 'button', buttonKind: 'dismiss', text: 'Dismiss' },
        ] : []),
      ];
    },
    setSimpleStatus(status, messageText) {
      this.simpleMessageState = { status, messageText };
    },
    dismissSimple() {
      this.simpleMessageState = { status: 'idle', messageText: '' };
    },
    dismissLong() {
      this.longMessageState = { status: 'idle', messageText: '' };
      this.longScrollLeft = 0;
    },
    dismissCustom() {
      this.customMessageState = { status: 'idle', messageText: '' };
    },
    setLongMeasure(widthViewport, widthContent) {
      this.longWidthViewport = widthViewport;
      this.longWidthContent = widthContent;
      const scrollLeftMax = Math.max(0, widthContent - widthViewport);
      this.longScrollLeft = Math.min(this.longScrollLeft, scrollLeftMax);
    },
    setLongScrollLeft(scrollLeft, scrollLeftMax) {
      const maxValue = Number.isFinite(scrollLeftMax)
        ? scrollLeftMax
        : Math.max(0, this.longWidthContent - this.longWidthViewport);
      this.longScrollLeft = Math.min(Math.max(0, scrollLeft), maxValue);
    },
    retryLong() {
      this.retryCount += 1;
      this.longMessageState = {
        status: 'loading',
        messageText: `retry submitted ${this.retryCount}`,
      };
    },
    toggleCustomVisible() {
      this.isCustomVisible = !this.isCustomVisible;
    },
  };
  return makeAutoObservable(store, {}, { autoBind: true });
}

const MessageBarExamplePanel = observer(() => {
  const [store] = useState(() => createMessageBarExampleStore());
  const compByKey = {
    miniMeter: MessageBarMiniMeter,
  };

  return (
    <div className="message-bar-example-root">
      <div className="message-bar-example-section">
        <div className="message-bar-example-title">Persistent Message</div>
        <MessageBar
          data={{
            messageState: store.simpleMessageState,
            idleText: 'ready',
            contentItems: store.getSimpleContentItems(),
          }}
          config={{
            isOneLine: true,
            isPersistent: true,
          }}
          onEvent={(eventType) => {
            if (eventType === 'dismissMessageRequest') {
              store.dismissSimple();
            }
          }}
        />
        <div className="message-bar-example-btn-row">
          <button type="button" onClick={() => store.setSimpleStatus('success', 'connection ok')}>
            Success
          </button>
          <button type="button" onClick={() => store.setSimpleStatus('error', 'connection failed')}>
            Error
          </button>
          <button type="button" onClick={() => store.setSimpleStatus('loading', 'loading')}>
            Loading
          </button>
        </div>
      </div>

      <div className="message-bar-example-section">
        <div className="message-bar-example-title">One Line Wheel Offset</div>
        <MessageBar
          data={{
            messageState: store.longMessageState,
            idleText: 'ready',
            contentItems: store.getLongContentItems(),
          }}
          config={{
            isOneLine: true,
            isPersistent: true,
            scrollLeft: store.longScrollLeft,
          }}
          onEvent={(eventType, eventData = {}) => {
            if (eventType === 'measureChange') {
              store.setLongMeasure(Number(eventData.widthViewport || 0), Number(eventData.widthContent || 0));
            }
            if (eventType === 'scrollLeftChangeRequest') {
              store.setLongScrollLeft(Number(eventData.scrollLeft || 0), Number(eventData.scrollLeftMax || 0));
            }
            if (eventType === 'retryRequest') {
              store.retryLong();
            }
            if (eventType === 'dismissMessageRequest') {
              store.dismissLong();
            }
          }}
        />
        <div className="message-bar-example-meta">
          scrollLeft: {Math.round(store.longScrollLeft)} | width: {Math.round(store.longWidthViewport)} / {Math.round(store.longWidthContent)}
        </div>
      </div>

      <div className="message-bar-example-section">
        <div className="message-bar-example-title">Reserved Custom Area</div>
        <MessageBar
          data={{
            messageState: store.customMessageState,
            idleText: 'ready',
            contentItems: store.getCustomContentItems(),
          }}
          config={{
            isOneLine: true,
            isPersistent: true,
            heightSize: 'md',
            getComp: (item) => compByKey[item.compKey],
          }}
          onEvent={(eventType) => {
            if (eventType === 'dismissMessageRequest') {
              store.dismissCustom();
            }
          }}
        />
        <button type="button" onClick={() => runInAction(() => store.toggleCustomVisible())}>
          Toggle Custom Content
        </button>
      </div>
    </div>
  );
});

function MessageBarMiniMeter({ data = {}, onEvent }) {
  return (
    <button
      type="button"
      className="message-bar-example-meter"
      onClick={() => onEvent?.('customMeterClick', { value: data.value })}
    >
      {data.label}: {data.value}
    </button>
  );
}

export const messageBarExamples = {
  'Message Bar': {
    component: MessageBar,
    description: 'Data-driven status message bar with persistent idle state and one-line scrolling.',
    example: () => <MessageBarExamplePanel />,
  },
};
