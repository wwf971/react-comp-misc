import React from 'react';
import MenuCore from './MenuCore.jsx';
import './Menu.css';

const MenuDropDown = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const items = Array.isArray(data?.items) ? data.items : [];
  const emptyText = `${data?.emptyText ?? ''}` || 'No items';
  const className = `${config?.className ?? ''}`.trim();

  return (
    <MenuCore
      data={{
        items,
        position: data?.position ?? { x: 0, y: 0 },
        emptyText,
      }}
      config={{
        minWidth: config?.minWidth ?? 130,
        className: `menu-dropdown-panel ${className}`.trim(),
        itemClassName: config?.itemClassName,
        disabledItemClassName: config?.disabledItemClassName,
        isClickPropagationStopped: config?.isClickPropagationStopped,
      }}
      onEvent={(eventType, eventData) => {
        if (eventType !== 'itemClick') return;
        onEvent?.(eventType, eventData);
      }}
    />
  );
};

export default MenuDropDown;
