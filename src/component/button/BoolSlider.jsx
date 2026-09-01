import React from 'react';
import './BoolSlider.css';

const BoolSlider = ({
  checked = false,
  onChange,
  disabled = false,
  // null means the default shadcn/ui Switch look: near-black track when
  // checked. An explicit color keeps the legacy look: colored checked track.
  color = null,
  style = {},
}) => {
  const stateValue = checked ? 'checked' : 'unchecked';

  const labelStyle = {
    ...(color ? { '--bool-slider-color-checked': color } : {}),
    ...style,
  };

  return (
    <label
      className={`bool-slider${disabled ? ' is-disabled' : ''}`}
      style={labelStyle}
    >
      <input
        type="checkbox"
        className="bool-slider-input"
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
      />
      <span
        className="shadcn-switch shadcn-theme-scaled bool-slider-track"
        data-state={stateValue}
        aria-hidden
      >
        <span className="shadcn-switch-thumb" data-state={stateValue} />
      </span>
    </label>
  );
};

export default BoolSlider;
