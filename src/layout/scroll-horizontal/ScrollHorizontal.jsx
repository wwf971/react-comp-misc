import { useEffect, useLayoutEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import './ScrollHorizontal.css';

function classNameJoin(...classList) {
  return classList.filter(Boolean).join(' ');
}

const ScrollHorizontal = observer(function ScrollHorizontal({ data = {}, config = {}, onEvent }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const scrollLeftRequestRef = useRef(0);
  const scrollCommitTaskRef = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const scrollLeft = Math.max(0, Number(data.scrollLeft) || 0);
  const commitDelayValue = Number(config.commitDelayMs ?? 80);
  const commitDelayMs = Number.isFinite(commitDelayValue) ? Math.max(0, commitDelayValue) : 80;
  const scrollLeftMaxGet = () => Math.max(0, (trackRef.current?.scrollWidth || 0) - (viewportRef.current?.clientWidth || 0));
  const scrollVisualSet = (scrollLeftNext) => {
    const scrollLeftMax = scrollLeftMaxGet();
    const scrollLeftClamped = Math.max(0, Math.min(Number(scrollLeftNext) || 0, scrollLeftMax));
    scrollLeftRequestRef.current = scrollLeftClamped;
    if (trackRef.current) trackRef.current.style.transform = `translateX(${-scrollLeftClamped}px)`;
    return { scrollLeft: scrollLeftClamped, scrollLeftMax };
  };
  const scrollCommit = () => {
    scrollCommitTaskRef.current = null;
    onEventRef.current?.('scrollLeftSet', scrollVisualSet(scrollLeftRequestRef.current));
  };
  const scrollCommitSchedule = () => {
    if (scrollCommitTaskRef.current) globalThis.clearTimeout(scrollCommitTaskRef.current);
    scrollCommitTaskRef.current = globalThis.setTimeout(scrollCommit, commitDelayMs);
  };

  useLayoutEffect(() => {
    if (!scrollCommitTaskRef.current) scrollVisualSet(scrollLeft);
  }, [scrollLeft]);

  useLayoutEffect(() => {
    const scrollClamp = () => {
      const scrollLeftPrevious = scrollLeftRequestRef.current;
      const scrollData = scrollVisualSet(scrollLeftPrevious);
      if (scrollData.scrollLeft !== scrollLeftPrevious) onEventRef.current?.('scrollLeftSet', scrollData);
    };
    scrollVisualSet(scrollLeftRequestRef.current || scrollLeft);
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', scrollClamp);
      return () => window.removeEventListener('resize', scrollClamp);
    }
    const observer = new ResizeObserver(scrollClamp);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (trackRef.current) observer.observe(trackRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return undefined;
    const wheelHandle = (event) => {
      const deltaRaw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!deltaRaw) return;
      const deltaScale = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : (event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? viewportEl.clientWidth : 1);
      const scrollLeftCurrent = scrollLeftRequestRef.current;
      const scrollLeftNext = Math.max(0, Math.min(scrollLeftCurrent + deltaRaw * deltaScale, scrollLeftMaxGet()));
      if (scrollLeftNext === scrollLeftCurrent) return;
      event.preventDefault();
      if (config.isWheelPropagationStopped === true) event.stopPropagation();
      scrollVisualSet(scrollLeftNext);
      scrollCommitSchedule();
    };
    viewportEl.addEventListener('wheel', wheelHandle, { passive: false });
    return () => {
      viewportEl.removeEventListener('wheel', wheelHandle);
      if (scrollCommitTaskRef.current) globalThis.clearTimeout(scrollCommitTaskRef.current);
      scrollCommitTaskRef.current = null;
    };
  }, []);

  return (
    <div className={classNameJoin('scroll-horizontal', config.className)} aria-label={config.ariaLabel || undefined}>
      <div ref={viewportRef} className={classNameJoin('scroll-horizontal-viewport', config.classNameViewport)}>
        <div
          ref={trackRef}
          className={classNameJoin('scroll-horizontal-track', config.classNameTrack)}
          style={{ transform: `translateX(${-scrollLeft}px)` }}
        >
          {data.content}
        </div>
      </div>
    </div>
  );
});

export default ScrollHorizontal;