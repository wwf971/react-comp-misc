import { observer } from 'mobx-react-lite';
import CrossIcon from '../../icon/CrossIcon.jsx';
import SpinningCircle from '../../icon/SpinningCircle.jsx';

function classNameJoin(...classList) {
  return classList.filter(Boolean).join(' ');
}

function textValueGet(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const TimelineLinearDefaultContent = observer(function TimelineLinearDefaultContent({ itemData }) {
  const metaList = Array.isArray(itemData.metaList) ? itemData.metaList : [];
  const rowList = Array.isArray(itemData.rowList) ? itemData.rowList : [];
  const messageText = textValueGet(itemData.messageText || itemData.message || '');

  return (
    <div className="progress-timeline-content-default">
      {messageText ? <div className="progress-timeline-message">{messageText}</div> : null}
      {metaList.length ? (
        <div className="progress-timeline-meta-list">
          {metaList.map((metaData) => (
            <div className="progress-timeline-meta-row" key={metaData.id || metaData.key}>
              <div className="progress-timeline-meta-key">{metaData.label || metaData.key}</div>
              <div className="progress-timeline-meta-value">{textValueGet(metaData.value)}</div>
            </div>
          ))}
        </div>
      ) : null}
      {rowList.length ? (
        <div className="progress-timeline-row-list">
          {rowList.map((rowData) => (
            <div className="progress-timeline-data-row" key={rowData.id || rowData.label || rowData.key}>
              <div>{rowData.label || rowData.key}</div>
              <div>{textValueGet(rowData.value)}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
});

function isCardStatusRunning(statusKind) {
  return ['running', 'active', 'pending', 'loading'].includes(statusKind);
}

const TimelineLinearBullet = observer(function TimelineLinearBullet({ statusKind }) {
  if (isCardStatusRunning(statusKind)) {
    return (
      <div className={classNameJoin('progress-timeline-bullet', `is-${statusKind}`, 'has-icon')}>
        <SpinningCircle width={14} height={14} color="#3d73b9" />
      </div>
    );
  }
  if (statusKind === 'error' || statusKind === 'failed') {
    return (
      <div className={classNameJoin('progress-timeline-bullet', `is-${statusKind}`, 'has-icon')}>
        <CrossIcon size={12} color="#b95454" strokeWidth={2.5} />
      </div>
    );
  }
  return <div className={classNameJoin('progress-timeline-bullet', statusKind ? `is-${statusKind}` : '')} />;
});

/**
 * TimelineLinearCard is a render component for one TimelineLinearItem.
 *
 * Input props:
 * - itemData: TimelineLinearItem documented in Timeline.jsx
 * - itemIndex: number
 * - isLast: boolean
 * - config: same config object passed to TimelineLinear
 * - onEvent(eventType, eventData): emits timelineCardClick when itemData.isClickable is true
 * - config.renderCardContent/config.rendererByContentType: optional display-only renderer choices
 *
 * Output/events:
 * - timelineCardClick: { itemId: itemData.id, itemIndex }
 *
 * Bullet convention:
 * - running/active/pending/loading cards display a spinning circle.
 * - error/failed cards display a red cross.
 * - other status values display the status-colored bullet.
 */
const TimelineLinearCard = observer(function TimelineLinearCard({ itemData, itemIndex = 0, isLast = false, config = {}, onEvent }) {
  const rendererContent = itemData.contentType && config.rendererByContentType ? config.rendererByContentType[itemData.contentType] : null;
  const content = config.renderCardContent
    ? config.renderCardContent({ itemData, itemIndex, config, onEvent })
    : rendererContent
      ? rendererContent({ itemData, itemIndex, config, onEvent })
      : <TimelineLinearDefaultContent itemData={itemData} />;
  const statusKind = itemData.statusKind || itemData.status || '';
  const titleText = itemData.titleText || itemData.title || '';
  const subtitleText = itemData.subtitleText || itemData.subtitle || '';

  return (
    <div className={classNameJoin('progress-timeline-item', isLast ? 'is-last' : '', itemData.isActive ? 'is-active' : '', itemData.isMuted ? 'is-muted' : '', itemData.animationPhase ? `is-animation-${itemData.animationPhase}` : '', itemData.lineAnimationPhase ? `is-line-${itemData.lineAnimationPhase}` : '')} data-progress-timeline-item-id={itemData.id}>
      <div className="progress-timeline-track" aria-hidden="true">
        <div className="progress-timeline-line" />
        <TimelineLinearBullet statusKind={statusKind} />
      </div>
      <article
        className={classNameJoin('progress-timeline-card', statusKind ? `is-${statusKind}` : '', itemData.isClickable ? 'is-clickable' : '')}
        title={titleText}
        onClick={() => itemData.isClickable ? onEvent?.('timelineCardClick', { itemId: itemData.id, itemIndex }) : undefined}
      >
        <div className="progress-timeline-card-head">
          <div className="progress-timeline-title-wrap">
            {titleText ? <div className="progress-timeline-title">{titleText}</div> : null}
            {subtitleText ? <div className="progress-timeline-subtitle">{subtitleText}</div> : null}
          </div>
          {itemData.timeText ? <div className="progress-timeline-time">{itemData.timeText}</div> : null}
        </div>
        <div className="progress-timeline-card-body">{content}</div>
      </article>
    </div>
  );
});

export { TimelineLinearCard };
export default TimelineLinearCard;
