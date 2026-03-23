import React from 'react';

const SegmentedControl = ({
  data,
  onChange,
  options = [],
  disabled = false,
  color = '#3b82f6',
  style = {},
}) => {
  const count = options.length;
  const selectedIndex = options.findIndex((opt) => opt.value === data);
  const hasSelection = selectedIndex >= 0 && count > 0;

  const trackStyle = {
    position: 'relative',
    display: 'flex',
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
    left: '2px',
    width: count > 0 ? `calc((100% - 4px) / ${count})` : 0,
    borderRadius: '2px',
    backgroundColor: color,
    transition: 'transform 0.25s ease, opacity 0.2s ease',
    opacity: hasSelection ? 1 : 0,
    transform: hasSelection
      ? `translateX(${selectedIndex * 100}%)`
      : 'translateX(0)',
    pointerEvents: 'none',
    zIndex: 0,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
  };

  const itemBaseStyle = {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    margin: 0,
    padding: '4px 6px',
    border: 'none',
    background: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '13px',
    lineHeight: 1.2,
    borderRadius: '2px',
    fontFamily: 'inherit',
  };

  return (
    <div
      style={trackStyle}
      role="radiogroup"
      aria-disabled={disabled ? true : undefined}
    >
      {count > 0 ? (
        <span style={highlightStyle} aria-hidden />
      ) : null}
      {options.map((opt) => {
        const isSelected = data === opt.value;
        const itemStyle = {
          ...itemBaseStyle,
          color: isSelected ? '#ffffff' : '#475569',
          fontWeight: isSelected ? 600 : 400,
        };
        return (
          <button
            key={String(opt.value)}
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
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
