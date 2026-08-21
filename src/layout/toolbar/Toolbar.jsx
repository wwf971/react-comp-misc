import { observer } from 'mobx-react-lite';
import ScrollHorizontal from '../scroll-horizontal/ScrollHorizontal.jsx';
import './Toolbar.css';

const classNameJoin = (...classList) => classList.filter(Boolean).join(' ');

const Toolbar = observer(function Toolbar({ data = {}, config = {}, onEvent }) {
  const groupList = Array.isArray(data.groupList) ? data.groupList : [];
  const isThin = config.isThin === true;
  const isGroupHeaderVisible = !isThin && config.isGroupHeaderVisible !== false;
  const isBottomLabelVisible = !isThin && groupList.some((groupData) => groupData.labelBottomText);
  const bottomLabelEdgeGapValue = Number(config.bottomLabelEdgeGapPx ?? 1);
  const bottomLabelEdgeGapPx = Number.isFinite(bottomLabelEdgeGapValue) ? Math.max(0, bottomLabelEdgeGapValue) : 1;
  const scrollLeft = Number(data.scrollLeft ?? data.toolbarState?.scrollLeft ?? 0);
  const content = groupList.map((groupData) => {
    const isContentAsideVisible = groupData.contentAside !== null && groupData.contentAside !== undefined && groupData.contentAside !== false;
    return (
      <section
        key={groupData.id}
        className={classNameJoin(
          'toolbar-scrollable-group',
          !isThin && groupData.labelBottomText ? 'is-bottom-label-visible' : '',
          !isThin && groupData.labelBottomAlign ? `is-bottom-label-${groupData.labelBottomAlign}` : '',
          isContentAsideVisible ? 'is-content-aside-visible' : '',
          groupData.className,
        )}
        aria-label={groupData.ariaLabel || groupData.labelText || undefined}
      >
        {isGroupHeaderVisible && (groupData.labelText || groupData.labelDetailText) ? (
          <span className={classNameJoin('toolbar-scrollable-group-label', groupData.classNameLabel)}>
            {groupData.labelText ? <span>{groupData.labelText}</span> : null}
            {groupData.labelDetailText ? <small title={groupData.labelDetailText}>{groupData.labelDetailText}</small> : null}
          </span>
        ) : null}
        <div className={classNameJoin('toolbar-scrollable-group-content', groupData.classNameContent)}>
          {groupData.content}
        </div>
        {isContentAsideVisible ? (
          <div className={classNameJoin('toolbar-scrollable-group-content-aside', groupData.classNameContentAside)}>
            {groupData.contentAside}
          </div>
        ) : null}
        {!isThin && groupData.labelBottomText ? (
          <span className={classNameJoin('toolbar-scrollable-group-label-bottom', groupData.classNameLabelBottom)} title={groupData.labelBottomTitle || groupData.labelBottomText}>
            {groupData.labelBottomText}
          </span>
        ) : null}
      </section>
    );
  });

  return (
    <div
      className={classNameJoin('toolbar-scrollable', isThin ? 'is-thin' : '', !isThin && !isGroupHeaderVisible ? 'is-group-header-hidden' : '', isBottomLabelVisible ? 'is-bottom-label-visible' : '', config.className)}
      style={{ '--toolbar-bottom-label-edge-gap': `${bottomLabelEdgeGapPx}px` }}
    >
      <ScrollHorizontal
        data={{ scrollLeft, content }}
        config={{
          className: 'toolbar-scrollable-scroll',
          classNameViewport: classNameJoin('toolbar-scrollable-outer', config.classNameOuter),
          classNameTrack: classNameJoin('toolbar-scrollable-track', config.classNameTrack),
          commitDelayMs: config.scrollCommitDelayMs,
          isWheelPropagationStopped: config.isWheelPropagationStopped,
          ariaLabel: config.ariaLabel,
        }}
        onEvent={onEvent}
      />
    </div>
  );
});

export default Toolbar;