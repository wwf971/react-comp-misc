import { useEffect } from 'react';

export const bindValueCompWheelScroll = (containerElement, scrollElement) => {
  if (!containerElement || !scrollElement) {
    return () => {};
  }

  const handleWheel = (event) => {
    const overflowX = scrollElement.scrollWidth - scrollElement.clientWidth;
    if (overflowX <= 1) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
    if (!delta) return;

    event.preventDefault();
    event.stopPropagation();

    scrollElement.scrollLeft = Math.max(
      0,
      Math.min(overflowX, scrollElement.scrollLeft + delta),
    );
  };

  containerElement.addEventListener('wheel', handleWheel, { passive: false });
  return () => containerElement.removeEventListener('wheel', handleWheel);
};

export const useValueCompWheelScroll = (containerRef, scrollTargetRef) => {
  useEffect(() => {
    const container = containerRef.current;
    const scrollTarget = scrollTargetRef.current;
    if (!container || !scrollTarget) {
      return undefined;
    }
    return bindValueCompWheelScroll(container, scrollTarget);
  }, [containerRef, scrollTargetRef]);
};
