import React from 'react';

const BoolSlider = ({ 
  checked = false, 
  onChange, 
  disabled = false,
  color = '#3b82f6',
  style = {}
}) => {
  const labelStyle = {
    position: 'relative',
    display: 'inline-block',
    width: '44px',
    height: '24px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    ...style
  };

  const inputStyle = {
    opacity: 0,
    width: 0,
    height: 0
  };

  const trackStyle = {
    position: 'absolute',
    cursor: disabled ? 'not-allowed' : 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: checked ? color : '#cbd5e1',
    transition: '.3s',
    borderRadius: '24px'
  };

  const thumbStyle = {
    position: 'absolute',
    content: '',
    height: '18px',
    width: '18px',
    left: '3px',
    bottom: '3px',
    backgroundColor: 'white',
    transition: '.3s',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    transform: checked ? 'translateX(20px)' : 'translateX(0)'
  };

  return (
    <label style={labelStyle}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
        style={inputStyle}
      />
      <span style={trackStyle}>
        <span style={thumbStyle}></span>
      </span>
    </label>
  );
};

export default BoolSlider;
