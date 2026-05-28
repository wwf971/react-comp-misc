import React, { useEffect, useRef, useState } from 'react';
import './ButtonWithDropDown.css';

const ButtonWithDropDown = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const rootRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const label = `${data?.label ?? ''}`.trim() || 'Menu';
  const items = Array.isArray(data?.items) ? data.items : [];
  const isDisabled = Boolean(config?.isDisabled);
  const className = `${config?.className ?? ''}`.trim();

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleDocumentMouseDown = (event) => {
      const rootElement = rootRef.current;
      if (!rootElement) return;
      if (rootElement.contains(event.target)) return;
      setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleDocumentMouseDown, true);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown, true);
    };
  }, [isMenuOpen]);

  const requestItemClick = (item) => {
    if (item?.isDisabled) return;
    setIsMenuOpen(false);
    onEvent?.('itemClick', { itemId: item.id, item });
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
          setIsMenuOpen((isOpen) => !isOpen);
        }}
      >
        {label}
      </button>
      {isMenuOpen ? (
        <div className="button-with-dropdown-list">
          {items.length > 0 ? (
            items.map((item) => (
              <button
                key={item.id}
                className="button-with-dropdown-item"
                type="button"
                disabled={Boolean(item?.isDisabled)}
                onClick={() => requestItemClick(item)}
              >
                {`${item?.label ?? item?.id ?? ''}`}
              </button>
            ))
          ) : (
            <div className="button-with-dropdown-empty">
              {`${data?.emptyText ?? 'No items'}`}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ButtonWithDropDown;
