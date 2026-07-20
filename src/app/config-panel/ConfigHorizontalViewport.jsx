import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import styles from './Config.module.css';

function createHorizontalViewportState(align) {
  return makeAutoObservable({
    align,
    // Distance scrolled away from the natural alignment edge.
    // Left: 0 shows the leftmost content. Right: 0 shows the rightmost content.
    offsetX: 0,
    offsetMax: 0,
    updateSize(widthViewport, widthContent) {
      this.offsetMax = Math.max(0, widthContent - widthViewport);
      this.offsetX = Math.min(this.offsetX, this.offsetMax);
    },
    scroll(deltaX) {
      if (this.offsetMax <= 0) return;
      // Right-aligned content scrolls the opposite transform direction so the
      // same wheel gesture still moves toward the opposite edge.
      const signedDelta = this.align === 'right' ? -deltaX : deltaX;
      this.offsetX = Math.max(0, Math.min(this.offsetMax, this.offsetX + signedDelta));
    },
    get translateX() {
      return this.align === 'right' ? this.offsetX : -this.offsetX;
    }
  });
}

const ConfigHorizontalViewport = observer(function ConfigHorizontalViewport({
  align = 'left',
  className = '',
  trackClassName = '',
  children
}) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [viewportState] = useState(() => createHorizontalViewportState(align));
  const isAlignRight = align === 'right';

  useLayoutEffect(() => {
    const viewportElement = viewportRef.current;
    const trackElement = trackRef.current;
    if (!viewportElement || !trackElement) return undefined;

    const updateSize = () => {
      viewportState.updateSize(viewportElement.clientWidth, trackElement.scrollWidth);
    };
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(viewportElement);
    resizeObserver.observe(trackElement);
    updateSize();
    return () => resizeObserver.disconnect();
  }, [viewportState]);

  useLayoutEffect(() => {
    if (!trackRef.current) return;
    trackRef.current.style.transform = `translateX(${viewportState.translateX}px)`;
  }, [viewportState.translateX]);

  useEffect(() => {
    const viewportElement = viewportRef.current;
    if (!viewportElement) return undefined;
    const handleWheel = (event) => {
      if (viewportState.offsetMax <= 0) return;
      event.preventDefault();
      viewportState.scroll(event.deltaX + event.deltaY);
    };
    viewportElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewportElement.removeEventListener('wheel', handleWheel);
  }, [viewportState]);

  return (
    <div
      ref={viewportRef}
      className={[
        styles.configHorizontalViewport,
        isAlignRight ? styles.configHorizontalViewportAlignRight : '',
        className
      ].filter(Boolean).join(' ')}
    >
      <div
        ref={trackRef}
        className={[
          styles.configHorizontalTrack,
          isAlignRight ? styles.configHorizontalTrackAlignRight : '',
          trackClassName
        ].filter(Boolean).join(' ')}
      >
        {children}
      </div>
    </div>
  );
});

export default ConfigHorizontalViewport;
