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
  const [menuPosOpen, setMenuPosOpen] = useState({ x: 0, y: 0 });
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
  const title = `${config?.title ?? ''}`.trim();
  const hasCustomButtonClass = Boolean(buttonClassName);
  const buttonClassNames = [
    'button-with-dropdown-button-base',
    hasCustomButtonClass ? '' : 'button-with-dropdown-button',
    buttonClassName,
  ].filter(Boolean).join(' ');

  const updateMenuPosOpen = useCallback(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;
    const rect = rootEl.getBoundingClientRect();
    setMenuPosOpen({
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
    updateMenuPosOpen();
    window.addEventListener('scroll', updateMenuPosOpen, true);
    window.addEventListener('resize', updateMenuPosOpen);
    return () => {
      window.removeEventListener('scroll', updateMenuPosOpen, true);
      window.removeEventListener('resize', updateMenuPosOpen);
    };
  }, [isOpen, updateMenuPosOpen]);

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
          emptyText,
        }}
        config={{
          posOpen: menuPosOpen,
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
        className={buttonClassNames}
        type="button"
        title={title || undefined}
        disabled={isDisabled}
        onClick={(event) => {
          if (isClickPropagationStopped) {
            event.stopPropagation();
          }
          if (isDisabled) return;
          if (!isOpen) {
            updateMenuPosOpen();
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
