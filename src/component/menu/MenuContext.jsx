import React from 'react';
import { createPortal } from 'react-dom';
import MenuCore from './MenuCore.jsx';
import './Menu.css';

const MenuContext = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const items = Array.isArray(data?.items) ? data.items : [];
  const position = data?.position ?? { x: 0, y: 0 };

  const requestClose = () => {
    onEvent?.('close', {});
  };

  const requestBackdropContextMenu = (event) => {
    event.preventDefault();
    onEvent?.('backdropContextMenu', { event });
  };

  const requestMenuEvent = (eventType, eventData) => {
    if (eventType !== 'itemClick') return;
    onEvent?.(eventType, eventData);
  };

  return createPortal((
    <>
      <div
        className="menu-backdrop"
        onClick={requestClose}
        onContextMenu={requestBackdropContextMenu}
      />
      <MenuCore
        data={{
          items,
          position,
          emptyText: data?.emptyText,
        }}
        config={config}
        onEvent={requestMenuEvent}
      />
    </>
  ), document.body);
};

export default MenuContext;
