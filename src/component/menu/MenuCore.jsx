import React, { useEffect, useRef, useState } from 'react';
import './Menu.css';

const SubmenuIcon = () => (
  <svg className="menu-core-submenu-icon" viewBox="0 0 8 12" aria-hidden="true">
    <path d="M2 2L6 6L2 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const getItemId = (item, index) => {
  return `${item?.id ?? index}`;
};

const isItemDisabled = (item) => {
  return Boolean(item?.isDisabled);
};

const getItemLabel = (item) => {
  return item?.label ?? item?.id ?? '';
};

const getItemChildren = (item) => {
  return Array.isArray(item?.children) ? item.children : [];
};

const getComponentStyle = (item) => {
  const style = {};
  const preferredWidth = Number(item?.preferredWidth);
  const preferredHeight = Number(item?.preferredHeight);
  if (Number.isFinite(preferredWidth) && preferredWidth > 0) {
    style['--menu-core-component-width'] = `${preferredWidth}px`;
  }
  if (Number.isFinite(preferredHeight) && preferredHeight > 0) {
    style['--menu-core-component-min-height'] = `${preferredHeight}px`;
  }
  return style;
};

const resolvePosition = (position = {}, menuElement = null) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const rect = menuElement?.getBoundingClientRect?.();
  const width = rect?.width ?? 0;
  const height = rect?.height ?? 0;
  const x = Number(position.x ?? 0);
  const y = Number(position.y ?? 0);
  return {
    x: Math.max(2, Math.min(x, viewportWidth - width - 2)),
    y: Math.max(2, Math.min(y, viewportHeight - height - 2)),
  };
};

const MenuCore = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const menuRef = useRef(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState(null);
  const [adjustedPosition, setAdjustedPosition] = useState(data?.position ?? { x: 0, y: 0 });
  const items = Array.isArray(data?.items) ? data.items : [];
  const emptyText = `${data?.emptyText ?? ''}` || 'No items';
  const position = data?.position ?? { x: 0, y: 0 };
  const minWidth = config?.minWidth ?? 120;
  const className = `${config?.className ?? ''}`.trim();

  useEffect(() => {
    setHoveredItemId(null);
    setSubmenuPosition(null);
  }, [position.x, position.y]);

  useEffect(() => {
    const menuElement = menuRef.current;
    if (!menuElement) return;
    setAdjustedPosition(resolvePosition(position, menuElement));
  }, [position.x, position.y, items.length]);

  const requestItemClick = (item, event) => {
    if (event.button !== 0) return;
    if (isItemDisabled(item)) return;
    if (getItemChildren(item).length > 0) return;
    onEvent?.('itemClick', {
      itemId: item.id ?? '',
      item,
    });
  };

  const requestItemHover = (item, index, event) => {
    if (isItemDisabled(item) || getItemChildren(item).length <= 0) {
      setHoveredItemId(null);
      setSubmenuPosition(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const submenuX = rect.right + 2;
    const submenuY = rect.top;
    setHoveredItemId(getItemId(item, index));
    setSubmenuPosition({ x: submenuX, y: submenuY });
  };

  return (
    <div
      ref={menuRef}
      className={`menu-core-root ${className}`}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        minWidth,
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {items.length > 0 ? (
        items.map((item, index) => {
          const itemId = getItemId(item, index);
          const children = getItemChildren(item);
          const isDisabled = isItemDisabled(item);
          const ItemComp = item?.component ?? null;
          return (
            <React.Fragment key={itemId}>
              <button
                className={`menu-core-item ${children.length > 0 ? 'has-submenu' : ''} ${isDisabled ? 'disabled' : ''}`}
                type="button"
                aria-disabled={isDisabled ? 'true' : 'false'}
                onClick={(event) => requestItemClick(item, event)}
                onMouseEnter={(event) => requestItemHover(item, index, event)}
              >
                <span className="menu-core-item-label">
                  {ItemComp ? (
                    <span className="menu-core-item-component" style={getComponentStyle(item)}>
                      <ItemComp {...(item?.componentProps ?? {})} />
                    </span>
                  ) : getItemLabel(item)}
                </span>
                {children.length > 0 ? <SubmenuIcon /> : null}
              </button>
              {hoveredItemId === itemId && submenuPosition && children.length > 0 ? (
                <MenuCore
                  data={{
                    items: children,
                    position: submenuPosition,
                    emptyText,
                  }}
                  config={{
                    minWidth,
                  }}
                  onEvent={onEvent}
                />
              ) : null}
            </React.Fragment>
          );
        })
      ) : (
        <div className="menu-core-empty">{emptyText}</div>
      )}
    </div>
  );
};

export default MenuCore;
