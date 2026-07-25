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
  const menuPortalRef = useRef(null);
  const isOpenBeforeClickRef = useRef(false);
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
  const isTriggerCloseDisabled = Boolean(config?.isTriggerCloseDisabled);
  const isTriggerDoubleClickEnabled = Boolean(config?.isTriggerDoubleClickEnabled);
  const isBackdropCloseDisabled = Boolean(config?.isBackdropCloseDisabled);
  const isOpenControlled = Object.prototype.hasOwnProperty.call(config ?? {}, 'isOpen');
  const isOpenEffective = isOpenControlled ? config.isOpen === true : isOpen;
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

  const openSet = (isOpenNext) => {
    if (!isOpenControlled) setIsOpen(isOpenNext);
    onEvent?.('openChange', { isOpen: isOpenNext });
  };

  const requestMenuEvent = (eventType, eventData) => {
    if (eventType !== 'itemClick') return;
    openSet(false);
    onEvent?.(eventType, eventData);
  };

  useEffect(() => {
    if (!isOpenEffective) return undefined;
    updateMenuPosOpen();
    window.addEventListener('scroll', updateMenuPosOpen, true);
    window.addEventListener('resize', updateMenuPosOpen);
    return () => {
      window.removeEventListener('scroll', updateMenuPosOpen, true);
      window.removeEventListener('resize', updateMenuPosOpen);
    };
  }, [isOpenEffective, updateMenuPosOpen]);

  useEffect(() => {
    if (!isOpenEffective || isBackdropCloseDisabled) return undefined;
    const closeOnOutsidePointer = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target) || menuPortalRef.current?.contains(target)) return;
      openSet(false);
    };
    const closeOnOutsideContextMenu = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target) || menuPortalRef.current?.contains(target)) return;
      openSet(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer, true);
    document.addEventListener('contextmenu', closeOnOutsideContextMenu, true);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer, true);
      document.removeEventListener('contextmenu', closeOnOutsideContextMenu, true);
    };
  }, [isOpenEffective, isBackdropCloseDisabled]);

  const overlayContent = isOpenEffective ? (
    <div ref={menuPortalRef}>
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
          isViewportYClamped: config?.isViewportYClamped,
        }}
        onEvent={requestMenuEvent}
      />
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      className={`button-with-dropdown-root${isOpenEffective ? ' is-open' : ''} ${className}`}
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
          if (isTriggerDoubleClickEnabled && event.detail === 1) isOpenBeforeClickRef.current = isOpenEffective;
          if (isOpenEffective && isTriggerCloseDisabled) return;
          if (!isOpenEffective) {
            updateMenuPosOpen();
          }
          openSet(!isOpenEffective);
        }}
        onDoubleClick={(event) => {
          if (isClickPropagationStopped) event.stopPropagation();
          if (isDisabled || !isTriggerDoubleClickEnabled) return;
          const isOpenBeforeDoubleClick = isOpenBeforeClickRef.current;
          openSet(isOpenBeforeDoubleClick);
          onEvent?.('triggerDoubleClick', { isOpenBeforeDoubleClick });
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
