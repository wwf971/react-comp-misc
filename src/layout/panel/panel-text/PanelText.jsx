import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import CrossIcon from '../../../icon/CrossIcon.jsx';
import './PanelText.css';

function PanelText({ data = {}, config = {}, content = null, headerTitleContent = null, headerRightContent = null, headerBottomContent = null, popupCompanionContent = null, popupLayoutRender = null, children = null, onEvent }) {
  const text = String(data.text || '');
  const ContentComp = config.contentComp || null;
  const contentCustom = content ?? children ?? data.content ?? (ContentComp ? (
    <ContentComp data={data.contentData || {}} config={config.contentConfig || {}} onEvent={onEvent} />
  ) : null);
  const isContentCustom = contentCustom !== null && contentCustom !== undefined;
  const isTypeAnimated = !isContentCustom && config.isTypeAnimated === true;
  const delayMs = Math.max(0, Number(data.typeDelayMs) || 0);
  const intervalMs = Math.max(12, Number(data.typeIntervalMs) || 18);
  const step = Math.max(1, Number(data.typeStep) || Math.max(6, Math.ceil(text.length / 28)));
  const [isStarted, isStartedSet] = useState(!isTypeAnimated || delayMs === 0);
  const [countVisible, countVisibleSet] = useState(isTypeAnimated ? 0 : text.length);

  useEffect(() => {
    if (!isTypeAnimated) {
      isStartedSet(true);
      countVisibleSet(text.length);
      return undefined;
    }
    isStartedSet(false);
    countVisibleSet(0);
    if (!text) return undefined;
    let timerTypeId = 0;
    const start = () => {
      isStartedSet(true);
      timerTypeId = window.setInterval(() => {
        countVisibleSet((countCurrent) => {
          const countNext = Math.min(text.length, countCurrent + step);
          if (countNext >= text.length) window.clearInterval(timerTypeId);
          return countNext;
        });
      }, intervalMs);
    };
    const timerDelayId = window.setTimeout(start, delayMs);
    return () => {
      window.clearTimeout(timerDelayId);
      if (timerTypeId) window.clearInterval(timerTypeId);
    };
  }, [data.id, text, isTypeAnimated, delayMs, intervalMs, step]);

  if (data.isVisible === false || !isStarted) return null;

  const layout = data.layout || {};
  const stylePosition = config.isPositionAbsolute ? {
    left: `${Number(layout.x) || 0}px`,
    top: `${Number(layout.y) || 0}px`,
    width: `${Number(layout.width) || 0}px`,
    height: `${Number(layout.height) || 0}px`,
  } : undefined;
  const panel = (
    <section
      className={`panel-text is-${data.tone || 'default'} ${headerBottomContent ? 'has-header-bottom' : ''} ${config.isPositionAbsolute ? 'is-position-absolute' : ''} ${config.isPopup ? 'is-popup' : ''} ${config.className || ''}`.trim()}
      style={stylePosition}
      role={config.isPopup ? 'dialog' : undefined}
      aria-modal={config.isPopup ? 'true' : undefined}
      aria-label={data.title || 'Text'}
    >
      <div className="panel-text-title">
        <div className="panel-text-title-main">
          <span className="panel-text-title-text">{data.title || ''}</span>
          {headerTitleContent}
        </div>
        <div className="panel-text-header-right">
          {headerRightContent}
          {config.isCloseVisible ? (
            <button type="button" className="panel-text-close" aria-label="閉じる" onClick={() => onEvent?.('closeRequest', {})}>
              <CrossIcon width={15} height={15} />
            </button>
          ) : null}
        </div>
      </div>
      {headerBottomContent ? <div className="panel-text-header-bottom">{headerBottomContent}</div> : null}
      <div className={`panel-text-body${isContentCustom ? ' is-custom-content' : ''} ${config.bodyClassName || ''}`.trim()}>
        {isContentCustom ? contentCustom : text.slice(0, countVisible) || config.textEmpty || '（内容なし）'}
      </div>
    </section>
  );

  if (!config.isPopup) return panel;
  const popup = (
    <div className="panel-text-popup-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onEvent?.('closeRequest', {});
    }}>
      {popupCompanionContent ? (
        <div className={`panel-text-popup-layout ${config.popupLayoutClassName || ''}`.trim()}>
          {typeof popupLayoutRender === 'function'
            ? popupLayoutRender({ panel, companionContent: popupCompanionContent })
            : <>{panel}{popupCompanionContent}</>}
        </div>
      ) : panel}
    </div>
  );
  return globalThis.document?.body ? createPortal(popup, globalThis.document.body) : popup;
}

export default observer(PanelText);
