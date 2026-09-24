import { useLayoutEffect, useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import TimelineLinearCard from './TimelineCard.jsx';
import './timeline.css';

function classNameJoin(...classList) {
  return classList.filter(Boolean).join(' ');
}

/**
 * TimelineLinear is a render component following the project data/config/onEvent contract.
 *
 * Input props:
 * - data: {
 *     itemList: TimelineLinearItem[],
 *     scrollKey?: string | number,
 *     updateKey?: string | number,
 *   }
 * - config: {
 *     className?: string,
 *     emptyText?: string,
 *     isScrollBottomOnAdd?: boolean,
 *     isSmoothScroll?: boolean,
 *     renderCardContent?: function,
 *     rendererByContentType?: object,
 *   }
 * - onEvent(eventType, eventData): parent/store callback. This component emits:
 *     timelineCardClick: { itemId, itemIndex }
 *
 * TimelineLinearItem accepted shape:
 * {
 *   id?: string,
 *   titleText?: string,
 *   title?: string,
 *   subtitleText?: string,
 *   subtitle?: string,
 *   timeText?: string,
 *   statusKind?: 'idle' | 'waiting' | 'pending' | 'running' | 'active' | 'done' | 'ok' | 'success' | 'warning' | 'error',
 *   status?: same as statusKind,
 *   isClickable?: boolean,
 *   isActive?: boolean,
 *   isMuted?: boolean,
 *   contentType?: string,
 *   contentData?: object,
 *   messageText?: string,
 *   message?: string,
 *   metaList?: { id?: string, key?: string, label?: string, value?: any }[],
 *   rowList?: { id?: string, key?: string, label?: string, value?: any }[],
 * }
 */
const TimelineLinear = observer(function TimelineLinear({ data = {}, config = {}, onEvent }) {
  const scrollElRef = useRef(null);
  const itemList = Array.isArray(data.itemList) ? data.itemList : [];
  const itemCount = itemList.length;
  const scrollKey = data.scrollKey ?? data.updateKey ?? itemCount;
  const isScrollBottomOnAdd = config.isScrollBottomOnAdd !== false;
  const isSmoothScroll = config.isSmoothScroll === true;
  const emptyText = config.emptyText || 'No steps yet.';

  const itemIdList = useMemo(() => itemList.map((itemData) => itemData.id || '').join('|'), [itemList]);

  useLayoutEffect(() => {
    if (!isScrollBottomOnAdd || !scrollElRef.current) return;
    const scrollEl = scrollElRef.current;
    if (isSmoothScroll && typeof scrollEl.scrollTo === 'function') {
      scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
      return;
    }
    scrollEl.scrollTop = scrollEl.scrollHeight;
  }, [isScrollBottomOnAdd, isSmoothScroll, itemCount, itemIdList, scrollKey]);

  return (
    <div className={classNameJoin('progress-timeline', config.className || '')}>
      <div className="progress-timeline-scroll" ref={scrollElRef}>
        {itemList.length ? (
          <div className="progress-timeline-stack">
            {itemList.map((itemData, itemIndex) => (
              <TimelineLinearCard
                key={itemData.id || `timeline-item-${itemIndex}`}
                itemData={itemData}
                itemIndex={itemIndex}
                isLast={itemIndex === itemList.length - 1}
                config={config}
                onEvent={onEvent}
              />
            ))}
          </div>
        ) : (
          <div className="progress-timeline-empty">{emptyText}</div>
        )}
      </div>
    </div>
  );
});

export { TimelineLinear, TimelineLinearCard };
export default TimelineLinear;
