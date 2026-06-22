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
        emptyText,
      }}
      config={{
        posOpen: config?.posOpen ?? { x: 0, y: 0 },
        minWidth: config?.minWidth ?? 130,
        className: `menu-dropdown-panel ${className}`.trim(),
        itemClassName: config?.itemClassName,
        disabledItemClassName: config?.disabledItemClassName,
        isClickPropagationStopped: config?.isClickPropagationStopped,
        itemHoverId: config?.itemHoverId,
        submenuPosOpen: config?.submenuPosOpen,
      }}
      onEvent={onEvent}
    />
  );
};

export default MenuDropDown;
