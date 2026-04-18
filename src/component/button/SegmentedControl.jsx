import React from 'react';

const SegmentedControl = ({
  data,
  onChange,
  options = [],
  disabled = false,
  color = '#3b82f6',
  style = {},
  getComp = null,
  transitionDurationMs = 250,
  widthMode = 'fill',
}) => {
  const count = options.length;
  const selectedIndex = options.findIndex((opt) => opt.value === data);
  const hasSelection = selectedIndex >= 0 && count > 0;
  const isAutoWidthMode = widthMode === 'auto';
  const trackRef = React.useRef(null);
  const itemRefs = React.useRef([]);
  const [highlightMetrics, setHighlightMetrics] = React.useState({ left: 2, width: 0 });

  React.useLayoutEffect(() => {
    if (!isAutoWidthMode || !hasSelection) return;
    const selectedButton = itemRefs.current[selectedIndex];
    const trackElement = trackRef.current;
    if (!selectedButton || !trackElement) return;
    const nextLeft = Number(selectedButton.offsetLeft || 0);
    const nextWidth = Number(selectedButton.offsetWidth || 0);
    setHighlightMetrics({ left: nextLeft, width: nextWidth });
  }, [count, hasSelection, isAutoWidthMode, selectedIndex, options]);

  const trackStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'stretch',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    padding: '2px',
    minHeight: '28px',
    boxSizing: 'border-box',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const highlightStyle = {
    position: 'absolute',
    top: '2px',
    bottom: '2px',
    left: isAutoWidthMode ? `${highlightMetrics.left}px` : '2px',
    width: isAutoWidthMode ? `${Math.max(0, Number(highlightMetrics.width || 0))}px` : (count > 0 ? `calc((100% - 4px) / ${count})` : 0),
    borderRadius: '2px',
    backgroundColor: color,
    transition: isAutoWidthMode
      ? `left ${Math.max(0, Number(transitionDurationMs || 0))}ms ease, width ${Math.max(0, Number(transitionDurationMs || 0))}ms ease, opacity ${Math.max(0, Number(transitionDurationMs || 0) * 0.8)}ms ease`
      : `transform ${Math.max(0, Number(transitionDurationMs || 0))}ms ease, opacity ${Math.max(0, Number(transitionDurationMs || 0) * 0.8)}ms ease`,
    opacity: hasSelection ? 1 : 0,
    transform: !isAutoWidthMode && hasSelection
      ? `translateX(${selectedIndex * 100}%)`
      : 'translateX(0)',
    pointerEvents: 'none',
    zIndex: 0,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
  };

  const itemBaseStyle = {
    position: 'relative',
    zIndex: 1,
    flex: isAutoWidthMode ? '0 0 auto' : 1,
    margin: 0,
    padding: '4px 6px',
    border: 'none',
    background: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '13px',
    lineHeight: 1.2,
    borderRadius: '2px',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      ref={trackRef}
      style={trackStyle}
      role="radiogroup"
      aria-disabled={disabled ? true : undefined}
    >
      {count > 0 ? (
        <span style={highlightStyle} aria-hidden />
      ) : null}
      {options.map((opt, optionIndex) => {
        const isSelected = data === opt.value;
        const itemStyle = {
          ...itemBaseStyle,
          color: isSelected ? '#ffffff' : '#475569',
          fontWeight: isSelected ? 600 : 400,
        };
        
        let content;
        if (opt.component && getComp) {
          const CustomComp = getComp(opt.component);
          if (CustomComp) {
            const compProps = {
              value: opt.value,
              isSelected,
              disabled,
              color: itemStyle.color,
            };
            content = typeof CustomComp === 'function' 
              ? <CustomComp {...compProps} />
              : React.cloneElement(CustomComp, compProps);
          } else {
            content = opt.label || opt.value;
          }
        } else {
          content = opt.label;
        }
        
        return (
          <button
            key={String(opt.value)}
            ref={(element) => { itemRefs.current[optionIndex] = element; }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            style={itemStyle}
            onClick={() => {
              if (!disabled && onChange) {
                onChange(opt.value);
              }
            }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
