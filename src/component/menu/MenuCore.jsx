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

const getCompStyle = (item) => {
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

const resolvePos = (pos = {}, menuEl = null) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const rect = menuEl?.getBoundingClientRect?.();
  const width = rect?.width ?? 0;
  const height = rect?.height ?? 0;
  const x = Number(pos.x ?? 0);
  const y = Number(pos.y ?? 0);
  return {
    x: Math.max(2, Math.min(x, viewportWidth - width - 2)),
    y: Math.max(2, Math.min(y, viewportHeight - height - 2)),
  };
};

const isRectsIntersecting = (rectA, rectB) => {
  const aLeft = rectA.left;
  const aTop = rectA.top;
  const aRight = rectA.right ?? rectA.left;
  const aBottom = rectA.bottom ?? rectA.top;
  return aRight > rectB.left
    && aLeft < rectB.right
    && aBottom > rectB.top
    && aTop < rectB.bottom;
};

const isMenuAnchorVisible = (anchor) => {
  const rect = anchor?.getRect?.();
  if (!rect) return false;

  const visibilityRoot = anchor?.getVisibilityRoot?.();
  if (!visibilityRoot) return true;

  const rootRect = visibilityRoot.getBoundingClientRect();
  return isRectsIntersecting(rect, rootRect);
};

const MenuCore = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const menuRef = useRef(null);
  const [itemHoverIdInternal, setItemHoverIdInternal] = useState(null);
  const [submenuPosOpenInternal, setSubmenuPosOpenInternal] = useState(null);
  const [adjustPos, setAdjustPos] = useState(config?.posOpen ?? { x: 0, y: 0 });
  const [trackedPos, setTrackedPos] = useState(config?.posOpen ?? { x: 0, y: 0 });
  const anchorRef = useRef(config?.anchor ?? null);
  anchorRef.current = config?.anchor ?? null;
  const items = Array.isArray(data?.items) ? data.items : [];
  const emptyText = `${data?.emptyText ?? ''}` || 'No items';
  const posOpen = config?.posOpen ?? { x: 0, y: 0 };
  const hasAnchor = Boolean(config?.anchor?.getRect);
  const minWidth = config?.minWidth ?? 120;
  const className = `${config?.className ?? ''}`.trim();
  const itemClassName = `${config?.itemClassName ?? ''}`.trim();
  const disabledItemClassName = `${config?.disabledItemClassName ?? ''}`.trim();
  const isClickPropagationStopped = Boolean(config?.isClickPropagationStopped);
  const isHoverControlled = config && ('itemHoverId' in config || 'submenuPosOpen' in config);
  const itemHoverId = isHoverControlled ? (config?.itemHoverId ?? null) : itemHoverIdInternal;
  const submenuPosOpen = isHoverControlled ? (config?.submenuPosOpen ?? null) : submenuPosOpenInternal;

  const requestItemHoverChange = (nextItemHoverId, nextSubmenuPosOpen) => {
    if (!isHoverControlled) {
      setItemHoverIdInternal(nextItemHoverId);
      setSubmenuPosOpenInternal(nextSubmenuPosOpen);
    }
    onEvent?.('itemHoverChange', {
      itemHoverId: nextItemHoverId,
      submenuPosOpen: nextSubmenuPosOpen,
    });
  };

  useEffect(() => {
    if (!isHoverControlled) {
      setItemHoverIdInternal(null);
      setSubmenuPosOpenInternal(null);
    }
    onEvent?.('itemHoverChange', {
      itemHoverId: null,
      submenuPosOpen: null,
    });
  }, [posOpen.x, posOpen.y, trackedPos.x, trackedPos.y, isHoverControlled]);

  useEffect(() => {
    if (!hasAnchor) {
      setTrackedPos(posOpen);
      return undefined;
    }

    const updateTrackedPos = () => {
      const anchor = anchorRef.current;
      if (!isMenuAnchorVisible(anchor)) {
        onEvent?.('closeRequest', {});
        return;
      }
      const rect = anchor.getRect();
      setTrackedPos({
        x: rect.left + (anchor.offsetX ?? 0),
        y: rect.top + (anchor.offsetY ?? 0),
      });
    };

    updateTrackedPos();
    window.addEventListener('scroll', updateTrackedPos, true);
    window.addEventListener('resize', updateTrackedPos);

    const anchor = anchorRef.current;
    const targetEl = anchor?.getTargetEl?.() ?? null;
    const visibilityRoot = anchor?.getVisibilityRoot?.() ?? null;
    let intersectionObserver = null;
    if (targetEl && visibilityRoot && typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          onEvent?.('closeRequest', {});
          return;
        }
        updateTrackedPos();
      }, {
        root: visibilityRoot,
        threshold: 0,
      });
      intersectionObserver.observe(targetEl);
    }

    return () => {
      window.removeEventListener('scroll', updateTrackedPos, true);
      window.removeEventListener('resize', updateTrackedPos);
      intersectionObserver?.disconnect();
    };
  }, [hasAnchor, posOpen.x, posOpen.y, items.length]);

  useEffect(() => {
    const menuEl = menuRef.current;
    if (!menuEl) return;
    const resolvedPos = hasAnchor ? trackedPos : posOpen;
    setAdjustPos(resolvePos(resolvedPos, menuEl));
  }, [hasAnchor, posOpen.x, posOpen.y, trackedPos.x, trackedPos.y, items.length]);

  const requestItemClick = (item, event) => {
    if (isClickPropagationStopped) {
      event.stopPropagation();
    }
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
      requestItemHoverChange(null, null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    requestItemHoverChange(getItemId(item, index), {
      x: rect.right + 2,
      y: rect.top,
    });
  };

  return (
    <div
      ref={menuRef}
      className={`menu-core-root ${className}`}
      style={{
        left: adjustPos.x,
        top: adjustPos.y,
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
          const ItemComp = item?.comp ?? null;
          return (
            <React.Fragment key={itemId}>
              <button
                className={`menu-core-item ${itemClassName} ${children.length > 0 ? 'has-submenu' : ''} ${isDisabled ? `disabled ${disabledItemClassName}` : ''}`}
                type="button"
                aria-disabled={isDisabled ? 'true' : 'false'}
                onClick={(event) => requestItemClick(item, event)}
                onMouseEnter={(event) => requestItemHover(item, index, event)}
              >
                <span className="menu-core-item-label">
                  {ItemComp ? (
                    <span className="menu-core-item-component" style={getCompStyle(item)}>
                      <ItemComp {...(item?.compProps ?? {})} />
                    </span>
                  ) : getItemLabel(item)}
                </span>
                {children.length > 0 ? <SubmenuIcon /> : null}
              </button>
              {itemHoverId === itemId && submenuPosOpen && children.length > 0 ? (
                <MenuCore
                  data={{
                    items: children,
                    emptyText,
                  }}
                  config={{
                    posOpen: submenuPosOpen,
                    minWidth,
                    itemClassName,
                    disabledItemClassName,
                    isClickPropagationStopped,
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
