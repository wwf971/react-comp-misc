import React, { useRef, useState } from 'react';
import MenuDropDown from '../menu/MenuDropDown.jsx';
import './ButtonWithDropDown.css';

const ButtonWithDropDown = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const label = `${data?.label ?? ''}`.trim() || 'Menu';
  const items = Array.isArray(data?.items) ? data.items : [];
  const emptyText = `${data?.emptyText ?? ''}` || 'No items';
  const isDisabled = Boolean(config?.isDisabled);
  const className = `${config?.className ?? ''}`.trim();
  const menuClassName = `${config?.menuClassName ?? ''}`.trim();

  const getMenuPosition = () => {
    const rootElement = rootRef.current;
    if (!rootElement) return { x: 0, y: 0 };
    const rect = rootElement.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.bottom + 2,
    };
  };

  const requestMenuEvent = (eventType, eventData) => {
    if (eventType !== 'itemClick') return;
    setIsOpen(false);
    onEvent?.(eventType, eventData);
  };

  return (
    <div
      ref={rootRef}
      className={`button-with-dropdown-root ${className}`}
    >
      <button
        className="button-with-dropdown-button"
        type="button"
        disabled={isDisabled}
        onClick={() => {
          if (isDisabled) return;
          setIsOpen((prevValue) => !prevValue);
        }}
      >
        {label}
      </button>
      {isOpen ? (
        <>
          <div
            className="button-with-dropdown-backdrop"
            onClick={() => setIsOpen(false)}
            onContextMenu={(event) => {
              event.preventDefault();
              setIsOpen(false);
            }}
          />
          <MenuDropDown
            data={{
              items,
              position: getMenuPosition(),
              emptyText,
            }}
            config={{
              minWidth: config?.minWidth ?? 130,
              className: menuClassName,
            }}
            onEvent={requestMenuEvent}
          />
        </>
      ) : null}
    </div>
  );
};

export default ButtonWithDropDown;
