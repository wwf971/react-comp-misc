import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './PanelDual.css';

const clampRatio = (value, minRatio, maxRatio) => {
  if (Number.isNaN(value)) {
    return 0.5;
  }
  return Math.min(maxRatio, Math.max(minRatio, value));
};

const PanelDual = ({
  orientation = 'vertical',
  initialRatio = 0.5,
  initialWidth = null,
  minRatio = 0.05,
  maxRatio = 0.95,
  fixedDivider = false,
  dragMode = 'immediate',
  onRatioChange,
  children
}) => {
  const isDragPreview = dragMode !== 'immediate';
  const containerRef = useRef(null);
  const paneARef = useRef(null);
  const paneBRef = useRef(null);
  const dividerRef = useRef(null);
  const indicatorRef = useRef(null);
  const ratioRef = useRef(clampRatio(initialRatio, minRatio, maxRatio));
  const dragRatioRef = useRef(ratioRef.current);
  const dragCleanupRef = useRef(() => {});
  const [isDragging, setIsDragging] = useState(false);

  const measureSizes = () => {
    const container = containerRef.current;
    if (!container) {
      return null;
    }
    const containerRect = container.getBoundingClientRect();
    const dividerRect = dividerRef.current?.getBoundingClientRect();
    const totalSize = orientation === 'horizontal' ? containerRect.height : containerRect.width;
    const dividerSize = dividerRect
      ? (orientation === 'horizontal' ? dividerRect.height : dividerRect.width)
      : 0;
    return {
      containerRect,
      dividerSize,
      paneSizeTotal: Math.max(0, totalSize - dividerSize)
    };
  };

  const applyRatio = (ratio) => {
    const paneA = paneARef.current;
    const paneB = paneBRef.current;
    const sizes = measureSizes();
    if (!paneA || !paneB || !sizes || sizes.paneSizeTotal <= 0) {
      return;
    }
    const clampedRatio = clampRatio(ratio, minRatio, maxRatio);
    const sizeA = Math.round(sizes.paneSizeTotal * clampedRatio);
    const sizeB = Math.max(0, sizes.paneSizeTotal - sizeA);
    paneA.style.flexBasis = `${sizeA}px`;
    paneB.style.flexBasis = `${sizeB}px`;
  };

  const stopDragging = () => {
    dragCleanupRef.current();
    dragCleanupRef.current = () => {};
    containerRef.current?.style.removeProperty('--panel-dual-drag-position');
    if (indicatorRef.current) {
      indicatorRef.current.style.left = '';
      indicatorRef.current.style.top = '';
    }
    setIsDragging(false);
  };

  const startDragging = (event) => {
    if (fixedDivider || event.button !== 0) {
      return;
    }
    event.preventDefault();
    const container = containerRef.current;
    const divider = dividerRef.current;
    if (!container || !divider) {
      return;
    }
    dragRatioRef.current = ratioRef.current;
    setIsDragging(true);

    const moveIndicator = (position) => {
      container.style.setProperty('--panel-dual-drag-position', `${position}px`);
      if (!indicatorRef.current) {
        return;
      }
      if (orientation === 'horizontal') {
        indicatorRef.current.style.top = `${position}px`;
      } else {
        indicatorRef.current.style.left = `${position}px`;
      }
    };

    if (isDragPreview) {
      const containerRect = container.getBoundingClientRect();
      const dividerRect = divider.getBoundingClientRect();
      const dividerStart = orientation === 'horizontal'
        ? dividerRect.top - containerRect.top
        : dividerRect.left - containerRect.left;
      const dividerSize = orientation === 'horizontal' ? dividerRect.height : dividerRect.width;
      moveIndicator(dividerStart + dividerSize / 2);
    }

    const onMove = (moveEvent) => {
      const sizes = measureSizes();
      if (!sizes || sizes.paneSizeTotal <= 0) {
        return;
      }
      const pointerPosition = orientation === 'horizontal'
        ? moveEvent.clientY - sizes.containerRect.top
        : moveEvent.clientX - sizes.containerRect.left;
      dragRatioRef.current = clampRatio(
        (pointerPosition - sizes.dividerSize / 2) / sizes.paneSizeTotal,
        minRatio,
        maxRatio
      );
      if (isDragPreview) {
        moveIndicator(sizes.paneSizeTotal * dragRatioRef.current + sizes.dividerSize / 2);
        return;
      }
      ratioRef.current = dragRatioRef.current;
      applyRatio(ratioRef.current);
      onRatioChange?.(ratioRef.current);
    };

    const onUp = (upEvent) => {
      if (upEvent.target instanceof Element && upEvent.target.closest('.panel-dual-cancel')) {
        stopDragging();
        return;
      }
      if (isDragPreview) {
        ratioRef.current = dragRatioRef.current;
        applyRatio(ratioRef.current);
        onRatioChange?.(ratioRef.current);
      }
      stopDragging();
    };

    const onKeyDown = (keyEvent) => {
      if (keyEvent.key !== 'Escape') {
        return;
      }
      keyEvent.preventDefault();
      stopDragging();
    };

    dragCleanupRef.current = () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('keydown', onKeyDown, true);
    };
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('keydown', onKeyDown, true);
  };

  useLayoutEffect(() => {
    if (initialWidth !== null) {
      const sizes = measureSizes();
      if (sizes && sizes.paneSizeTotal > 0 && initialWidth < sizes.paneSizeTotal) {
        ratioRef.current = clampRatio(initialWidth / sizes.paneSizeTotal, minRatio, maxRatio);
        applyRatio(ratioRef.current);
        return;
      }
    }
    ratioRef.current = clampRatio(initialRatio, minRatio, maxRatio);
    applyRatio(ratioRef.current);
  }, [initialRatio, initialWidth, minRatio, maxRatio, orientation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    if (typeof ResizeObserver === 'undefined') {
      const handleResize = () => applyRatio(ratioRef.current);
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
    const observer = new ResizeObserver(() => applyRatio(ratioRef.current));
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [orientation]);

  useEffect(() => {
    return () => {
      dragCleanupRef.current();
    };
  }, []);

  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length !== 2) {
    console.error('PanelDual requires exactly two child components.');
    return null;
  }

  const orientationClass = orientation === 'horizontal'
    ? 'panel-dual-horizontal'
    : 'panel-dual-vertical';
  const draggingClass = isDragging ? 'panel-dual-dragging' : '';
  const dividerClass = orientation === 'horizontal'
    ? 'panel-dual-divider panel-dual-divider-horizontal'
    : 'panel-dual-divider panel-dual-divider-vertical';
  const fixedClass = fixedDivider ? 'panel-dual-divider-fixed' : '';
  const isDragPreviewVisible = isDragging && isDragPreview;
  const indicatorClass = orientation === 'horizontal'
    ? 'panel-dual-indicator panel-dual-indicator-horizontal'
    : 'panel-dual-indicator panel-dual-indicator-vertical';
  const indicatorActiveClass = isDragPreviewVisible ? 'panel-dual-indicator-active' : '';
  const cancelClass = orientation === 'horizontal'
    ? 'panel-dual-cancel panel-dual-cancel-horizontal'
    : 'panel-dual-cancel panel-dual-cancel-vertical';

  return (
    <div
      className={`panel-dual ${orientationClass} ${draggingClass}`}
      ref={containerRef}
    >
      <div className="panel-dual-pane" ref={paneARef}>
        {childrenArray[0]}
      </div>
      <div
        className={`${dividerClass} ${fixedClass}`}
        ref={dividerRef}
        onPointerDown={startDragging}
      />
      <div className="panel-dual-pane" ref={paneBRef}>
        {childrenArray[1]}
      </div>
      <div
        className={`${indicatorClass} ${indicatorActiveClass}`}
        ref={indicatorRef}
        aria-hidden="true"
      />
      {isDragPreviewVisible ? (
        <button
          type="button"
          className={cancelClass}
          onPointerDown={(cancelEvent) => {
            cancelEvent.preventDefault();
            cancelEvent.stopPropagation();
            stopDragging();
          }}
        >
          Cancel drag
        </button>
      ) : null}
    </div>
  );
};

export default PanelDual;
