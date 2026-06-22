import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import MenuCore from './MenuCore.jsx';
import './Menu.css';

const MenuComp = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const items = Array.isArray(data?.items) ? data.items : [];
  const isOpen = config?.isOpen !== false;
  const isBackdropScrollPassThrough = config?.isBackdropScrollPassThrough === true;

  const requestClose = () => {
    onEvent?.('closeRequest', {});
  };

  const requestBackdropContextMenu = (event) => {
    event.preventDefault();
    onEvent?.('backdropContextMenu', { event });
  };

  const requestMenuEvent = (eventType, eventData) => {
    onEvent?.(eventType, eventData);
  };

  useEffect(() => {
    if (!isBackdropScrollPassThrough) return undefined;

    const handlePointerDown = (event) => {
      if (event.target?.closest?.('.menu-core-root')) return;
      requestClose();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [isBackdropScrollPassThrough]);

  if (!isOpen) {
    return null;
  }

  return createPortal((
    <>
      <div
        className={`menu-backdrop ${isBackdropScrollPassThrough ? 'is-scroll-pass-through' : ''}`.trim()}
        onClick={isBackdropScrollPassThrough ? undefined : requestClose}
        onContextMenu={isBackdropScrollPassThrough ? undefined : requestBackdropContextMenu}
      />
      <MenuCore
        data={{
          items,
          emptyText: data?.emptyText,
        }}
        config={config}
        onEvent={requestMenuEvent}
      />
    </>
  ), document.body);
};

export default MenuComp;
