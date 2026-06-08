import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MenuDropDown from '../menu/MenuDropDown.jsx';
import './ButtonWithDropDown.css';

const ButtonWithDropDown = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const label = typeof data?.label === 'string'
    ? data.label.trim() || 'Menu'
    : data?.label ?? 'Menu';
  const items = Array.isArray(data?.items) ? data.items : [];
  const emptyText = `${data?.emptyText ?? ''}` || 'No items';
  const isDisabled = Boolean(config?.isDisabled);
  const className = `${config?.className ?? ''}`.trim();
  const buttonClassName = `${config?.buttonClassName ?? ''}`.trim();
  const menuClassName = `${config?.menuClassName ?? ''}`.trim();
  const menuAlign = config?.menuAlign === 'right' ? 'right' : 'left';
  const minWidth = config?.minWidth ?? 130;
  const isClickPropagationStopped = Boolean(config?.isClickPropagationStopped);

  const updateMenuPosition = useCallback(() => {
    const rootElement = rootRef.current;
    if (!rootElement) return;
    const rect = rootElement.getBoundingClientRect();
    setMenuPosition({
      x: menuAlign === 'right' ? rect.right - minWidth : rect.left,
      y: rect.bottom + 2,
    });
  }, [menuAlign, minWidth]);

  const requestMenuEvent = (eventType, eventData) => {
    if (eventType !== 'itemClick') return;
    setIsOpen(false);
    onEvent?.(eventType, eventData);
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [isOpen, updateMenuPosition]);

  const overlayContent = isOpen ? (
    <>
      <div
        className="button-with-dropdown-backdrop"
        onClick={(event) => {
          if (isClickPropagationStopped) {
            event.stopPropagation();
          }
          setIsOpen(false);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          if (isClickPropagationStopped) {
            event.stopPropagation();
          }
          setIsOpen(false);
        }}
      />
      <MenuDropDown
        data={{
          items,
          position: menuPosition,
          emptyText,
        }}
        config={{
          minWidth,
          className: menuClassName,
          itemClassName: config?.itemClassName,
          disabledItemClassName: config?.disabledItemClassName,
          isClickPropagationStopped,
        }}
        onEvent={requestMenuEvent}
      />
    </>
  ) : null;

  return (
    <div
      ref={rootRef}
      className={`button-with-dropdown-root ${className}`}
    >
      <button
        className={`button-with-dropdown-button ${buttonClassName}`}
        type="button"
        disabled={isDisabled}
        onClick={(event) => {
          if (isClickPropagationStopped) {
            event.stopPropagation();
          }
          if (isDisabled) return;
          if (!isOpen) {
            updateMenuPosition();
          }
          setIsOpen((prevValue) => !prevValue);
        }}
      >
        {label}
      </button>
      {overlayContent && typeof document !== 'undefined'
        ? createPortal(overlayContent, document.body)
        : overlayContent}
    </div>
  );
};

export default ButtonWithDropDown;
