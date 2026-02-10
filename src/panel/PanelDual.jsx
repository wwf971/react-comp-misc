import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './PanelDual.css';

const clampRatio = (value) => {
  if (Number.isNaN(value)) {
    return 0.5;
  }
  return Math.min(0.95, Math.max(0.05, value));
};

const PanelDual = ({
  orientation = 'vertical',
  initialRatio = 0.5,
  fixedDivider = false,
  children
}) => {
  const containerRef = useRef(null);
  const paneARef = useRef(null);
  const paneBRef = useRef(null);
  const ratioRef = useRef(clampRatio(initialRatio));
  const dragHandlersRef = useRef({ onMove: null, onUp: null });
  const [isDragging, setIsDragging] = useState(false);

  const applyRatio = (ratio) => {
    const container = containerRef.current;
    const paneA = paneARef.current;
    const paneB = paneBRef.current;
    if (!container || !paneA || !paneB) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const totalSize = orientation === 'horizontal' ? rect.height : rect.width;
    if (!totalSize || totalSize <= 0) {
      return;
    }
    const clampedRatio = clampRatio(ratio);
    const sizeA = Math.round(totalSize * clampedRatio);
    const sizeB = Math.max(0, totalSize - sizeA);
    if (orientation === 'horizontal') {
      paneA.style.flexBasis = `${sizeA}px`;
      paneB.style.flexBasis = `${sizeB}px`;
    } else {
      paneA.style.flexBasis = `${sizeA}px`;
      paneB.style.flexBasis = `${sizeB}px`;
    }
  };

  const stopDragging = () => {
    const { onMove, onUp } = dragHandlersRef.current;
    if (onMove) {
      window.removeEventListener('mousemove', onMove);
    }
    if (onUp) {
      window.removeEventListener('mouseup', onUp);
    }
    dragHandlersRef.current = { onMove: null, onUp: null };
    setIsDragging(false);
  };

  const startDragging = (event) => {
    if (fixedDivider) {
      return;
    }
    event.preventDefault();
    const container = containerRef.current;
    if (!container) {
      return;
    }
    setIsDragging(true);
    const onMove = (moveEvent) => {
      const rect = container.getBoundingClientRect();
      if (orientation === 'horizontal') {
        const nextRatio = (moveEvent.clientY - rect.top) / rect.height;
        ratioRef.current = clampRatio(nextRatio);
      } else {
        const nextRatio = (moveEvent.clientX - rect.left) / rect.width;
        ratioRef.current = clampRatio(nextRatio);
      }
      applyRatio(ratioRef.current);
    };
    const onUp = () => {
      stopDragging();
    };
    dragHandlersRef.current = { onMove, onUp };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  useLayoutEffect(() => {
    ratioRef.current = clampRatio(initialRatio);
    applyRatio(ratioRef.current);
  }, [initialRatio, orientation]);

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
      stopDragging();
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
        onMouseDown={startDragging}
      />
      <div className="panel-dual-pane" ref={paneBRef}>
        {childrenArray[1]}
      </div>
    </div>
  );
};

export default PanelDual;
