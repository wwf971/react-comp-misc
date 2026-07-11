import React, { useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import './TabsOnTop.css';
import CrossIcon from '../../icon/CrossIcon';
import AddIcon from '../../icon/AddIcon';

const LINE_MODES = ['single', 'wrap'];

function normalizeLineMode(lineMode, fallback = 'single') {
  return LINE_MODES.includes(lineMode) ? lineMode : fallback;
}

function getTabItemList(containerEl) {
  const containerRect = containerEl.getBoundingClientRect();
  return Array.from(containerEl.querySelectorAll('.tab-on-top-drag-item')).map((element) => {
    const rect = element.getBoundingClientRect();
    const left = rect.left - containerRect.left + containerEl.scrollLeft;
    const top = rect.top - containerRect.top + containerEl.scrollTop;
    return {
      element,
      id: element.dataset.tabKey,
      left,
      right: left + rect.width,
      top,
      bottom: top + rect.height,
      width: rect.width,
      height: rect.height,
    };
  }).filter((item) => item.id);
}

function getSlotPreviewFromItemList(itemList, xContent) {
  if (itemList.length === 0) return null;
  const itemFirst = itemList[0];
  const itemLast = itemList[itemList.length - 1];
  let slotIndex = itemList.length;
  if (xContent <= itemFirst.left) {
    slotIndex = 0;
  } else if (xContent >= itemLast.right) {
    slotIndex = itemList.length;
  } else {
    slotIndex = itemList.findIndex((item) => xContent < item.left + item.width / 2);
    if (slotIndex < 0) slotIndex = itemList.length;
  }

  if (slotIndex <= 0) {
    return {
      tabTargetKey: itemFirst.id,
      insertPosition: 'before',
      indicatorLeftPx: itemFirst.left,
      indicatorTopPx: itemFirst.top,
      indicatorHeightPx: itemFirst.height,
    };
  }

  if (slotIndex >= itemList.length) {
    return {
      tabTargetKey: itemLast.id,
      insertPosition: 'after',
      indicatorLeftPx: itemLast.right,
      indicatorTopPx: itemLast.top,
      indicatorHeightPx: itemLast.height,
    };
  }

  const itemPrevious = itemList[slotIndex - 1];
  const itemNext = itemList[slotIndex];
  return {
    tabTargetKey: itemNext.id,
    insertPosition: 'before',
    indicatorLeftPx: (itemPrevious.right + itemNext.left) / 2,
    indicatorTopPx: itemNext.top,
    indicatorHeightPx: itemNext.height,
  };
}

function getWrapRowList(itemList) {
  const rowList = [];
  const rowTopTolerancePx = 6;
  itemList.forEach((item) => {
    const row = rowList.find((candidate) => Math.abs(candidate.top - item.top) <= rowTopTolerancePx);
    if (row) {
      row.items.push(item);
      row.top = Math.min(row.top, item.top);
      row.bottom = Math.max(row.bottom, item.bottom);
    } else {
      rowList.push({ top: item.top, bottom: item.bottom, items: [item] });
    }
  });
  return rowList
    .sort((rowA, rowB) => rowA.top - rowB.top)
    .map((row) => ({ ...row, items: row.items.sort((itemA, itemB) => itemA.left - itemB.left) }));
}

function getClosestWrapRow(rowList, yContent) {
  if (rowList.length === 0) return null;
  const rowFirst = rowList[0];
  const rowLast = rowList[rowList.length - 1];
  if (yContent < rowFirst.top) return rowFirst;
  if (yContent > rowLast.bottom) return rowLast;
  const rowContainingPointer = rowList.find((row) => yContent >= row.top && yContent <= row.bottom);
  if (rowContainingPointer) return rowContainingPointer;
  return rowList.reduce((rowClosest, row) => {
    const distanceCurrent = Math.abs(yContent - (row.top + row.bottom) / 2);
    const distanceClosest = Math.abs(yContent - (rowClosest.top + rowClosest.bottom) / 2);
    return distanceCurrent < distanceClosest ? row : rowClosest;
  }, rowFirst);
}

function getPreviewFromPoint(trackEl, clientX, clientY, lineMode) {
  if (!trackEl) return null;
  const itemList = getTabItemList(trackEl);
  if (itemList.length === 0) return null;
  const rect = trackEl.getBoundingClientRect();
  const xContent = Math.max(0, Math.min(trackEl.scrollWidth, clientX - rect.left + trackEl.scrollLeft));
  if (lineMode === 'wrap') {
    const yContent = Math.max(0, Math.min(trackEl.scrollHeight, clientY - rect.top + trackEl.scrollTop));
    const row = getClosestWrapRow(getWrapRowList(itemList), yContent);
    return row ? getSlotPreviewFromItemList(row.items, xContent) : null;
  }
  return getSlotPreviewFromItemList(itemList, xContent);
}

function getPreviewFromEdge(trackEl, direction) {
  const itemList = getTabItemList(trackEl);
  return getSlotPreviewFromItemList(itemList, direction === 'left' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY);
}

const TabsOnTop = forwardRef(({
  children,
  defaultTab,
  onTabChange,
  allowCloseTab = false,
  onTabClose,
  allowTabCreate = false,
  onTabCreate,
  autoSwitchToNewTab = true,
  allowTabReorder = false,
  onTabReorder,
  defaultKeepMounted = true,
  lineMode,
  defaultLineMode = 'single',
  allowLineModeSwitch = false,
  onLineModeChange,
  headerRightContent = null,
  headerRightItems = [],
  renderHeaderRightItem,
  onHeaderRightItemAction,
}, ref) => {
  const config = useMemo(() => extractTabConfig(children), [children]);
  const { tabs, panels, tabKeyMap } = config;
  const prevTabLabelsRef = React.useRef(null);
  const activeTabLabelRef = React.useRef(null);
  const defaultTabSyncedRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const dragOffsetX = React.useRef(0);
  const dragOffsetY = React.useRef(0);
  const [lineModeLocal, setLineModeLocal] = useState(() => normalizeLineMode(defaultLineMode));
  const lineModeActive = normalizeLineMode(lineMode ?? lineModeLocal);
  const [activeTabKey, setActiveTabKey] = useState(() => {
    const initialKey = getInitialTabKey(defaultTab, tabs, panels, tabKeyMap);
    const initialTab = tabs.find((tab) => tab.key === initialKey);
    if (initialTab) activeTabLabelRef.current = initialTab.label;
    return initialKey;
  });
  const [tabsState, setTabsState] = useState(() => {
    const initialKey = getInitialTabKey(defaultTab, tabs, panels, tabKeyMap);
    const stateByKey = {};
    tabs.forEach((tab) => {
      stateByKey[tab.key] = { clickCount: 0, isFocused: tab.key === initialKey };
    });
    return stateByKey;
  });
  const [draggingTabKey, setDraggingTabKey] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [isDragCancelHover, setIsDragCancelHover] = useState(false);
  const [dragScrollDirection, setDragScrollDirection] = useState('');
  const [isTrackOverflow, setIsTrackOverflow] = useState(false);

  const getInitialTab = () => getInitialTabKey(defaultTab, tabs, panels, tabKeyMap);

  const measureTrackOverflow = () => {
    const trackEl = trackRef.current;
    if (!trackEl) return;
    setIsTrackOverflow(trackEl.scrollWidth > trackEl.clientWidth + 1);
  };

  React.useEffect(() => {
    setTabsState((prevState) => {
      const nextState = {};
      tabs.forEach((tab) => {
        nextState[tab.key] = prevState[tab.key]
          ? { ...prevState[tab.key], isFocused: tab.key === activeTabKey }
          : { clickCount: 0, isFocused: tab.key === activeTabKey };
      });
      return nextState;
    });
  }, [tabs, activeTabKey]);

  React.useEffect(() => {
    const currentTabLabels = tabs.map((tab) => tab.label).join(',');
    const prevTabLabels = prevTabLabelsRef.current;
    if (prevTabLabels && prevTabLabels !== currentTabLabels && activeTabLabelRef.current) {
      const newActiveTab = tabs.find((tab) => tab.label === activeTabLabelRef.current);
      if (newActiveTab && newActiveTab.key !== activeTabKey) setActiveTabKey(newActiveTab.key);
    }
    prevTabLabelsRef.current = currentTabLabels;
  }, [tabs, activeTabKey]);

  React.useEffect(() => {
    if (!defaultTab) return;
    const defaultTabKeyRaw = String(defaultTab);
    if (defaultTabSyncedRef.current === defaultTabKeyRaw && panels[activeTabKey]) return;
    defaultTabSyncedRef.current = defaultTabKeyRaw;
    const tabKeyNext = tabKeyMap[String(defaultTab).toLowerCase()] || defaultTab;
    if (!panels[tabKeyNext] || tabKeyNext === activeTabKey) return;
    const tabNext = tabs.find((tab) => tab.key === tabKeyNext);
    if (tabNext) activeTabLabelRef.current = tabNext.label;
    setActiveTabKey(tabKeyNext);
  }, [defaultTab, tabKeyMap, panels, tabs, activeTabKey]);

  React.useEffect(() => {
    if (!activeTabKey || !panels[activeTabKey]) {
      const tabKeyNext = getInitialTab();
      if (tabKeyNext) setActiveTabKey(tabKeyNext);
    }
  }, [config, activeTabKey, panels]);

  React.useEffect(() => {
    if (!autoSwitchToNewTab) return;
    const lastTabKey = tabs[tabs.length - 1]?.key;
    if (lastTabKey && tabs.length > 0 && lastTabKey !== activeTabKey) {
      const prevTabCount = Object.keys(panels).length;
      if (prevTabCount === tabs.length) {
        setActiveTabKey(lastTabKey);
        onTabChange?.(lastTabKey);
      }
    }
  }, [tabs.length, autoSwitchToNewTab]);

  React.useEffect(() => {
    measureTrackOverflow();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const trackEl = trackRef.current;
    if (!trackEl) return undefined;
    const observer = new ResizeObserver(measureTrackOverflow);
    observer.observe(trackEl);
    return () => observer.disconnect();
  }, [tabs.length, lineModeActive]);

  React.useEffect(() => {
    if (!draggingTabKey || lineModeActive !== 'single' || !dragScrollDirection) return undefined;
    const intervalId = window.setInterval(() => {
      const trackEl = trackRef.current;
      if (!trackEl) return;
      trackEl.scrollLeft += dragScrollDirection === 'left' ? -24 : 24;
      measureTrackOverflow();
      const preview = getPreviewFromEdge(trackEl, dragScrollDirection);
      if (preview) setDragPreview(preview);
    }, 80);
    return () => window.clearInterval(intervalId);
  }, [draggingTabKey, dragScrollDirection, lineModeActive]);

  const switchToTab = (tabIdentifier) => {
    const targetKey = tabKeyMap[String(tabIdentifier).toLowerCase()] || tabIdentifier;
    if (!panels[targetKey]) return;
    const targetTab = tabs.find((tab) => tab.key === targetKey);
    if (targetTab) activeTabLabelRef.current = targetTab.label;
    setActiveTabKey(targetKey);
    setTabsState((prevState) => {
      const nextState = {};
      Object.keys(prevState).forEach((key) => {
        nextState[key] = key === targetKey
          ? { clickCount: prevState[key].clickCount + 1, isFocused: true }
          : { ...prevState[key], isFocused: false };
      });
      return nextState;
    });
    onTabChange?.(targetKey);
  };

  useImperativeHandle(ref, () => ({ switchTab: switchToTab }));

  const clearDragState = () => {
    setDraggingTabKey(null);
    setDragPreview(null);
    setIsDragCancelHover(false);
    setDragScrollDirection('');
  };

  const commitDrop = React.useCallback(() => {
    if (!draggingTabKey || !dragPreview || !onTabReorder) {
      clearDragState();
      return;
    }
    const draggedIndex = tabs.findIndex((tab) => tab.key === draggingTabKey);
    const targetIndexRaw = tabs.findIndex((tab) => tab.key === dragPreview.tabTargetKey);
    if (draggedIndex < 0 || targetIndexRaw < 0 || draggingTabKey === dragPreview.tabTargetKey) {
      clearDragState();
      return;
    }
    const tabsNext = [...tabs];
    const [tabMoved] = tabsNext.splice(draggedIndex, 1);
    const targetIndex = tabsNext.findIndex((tab) => tab.key === dragPreview.tabTargetKey);
    const insertIndex = dragPreview.insertPosition === 'after' ? targetIndex + 1 : targetIndex;
    tabsNext.splice(insertIndex, 0, tabMoved);
    onTabReorder(tabsNext);
    clearDragState();
  }, [draggingTabKey, dragPreview, onTabReorder, tabs]);

  const updateDragPreview = (clientX, clientY) => {
    const trackEl = trackRef.current;
    if (!draggingTabKey || !trackEl) return false;
    const preview = getPreviewFromPoint(trackEl, clientX, clientY, lineModeActive);
    if (preview) setDragPreview(preview);
    return Boolean(preview);
  };

  const handleTabDragStart = (event, tabKey) => {
    if (!allowTabReorder) return;
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', tabKey);
    const btnRect = event.currentTarget.getBoundingClientRect();
    dragOffsetX.current = event.clientX - btnRect.left;
    dragOffsetY.current = event.clientY - btnRect.top;
    setDraggingTabKey(tabKey);
    const ghost = event.currentTarget.cloneNode(true);
    ghost.style.opacity = '0.5';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, dragOffsetX.current, dragOffsetY.current);
    setTimeout(() => document.body.removeChild(ghost), 0);
    const preview = getPreviewFromPoint(trackRef.current, event.clientX, event.clientY, lineModeActive);
    if (preview) setDragPreview(preview);
  };

  const handleTrackDragOver = (event) => {
    if (!draggingTabKey) return;
    if (!updateDragPreview(event.clientX, event.clientY)) return;
    event.preventDefault();
  };

  const handleDocumentDragOver = React.useCallback((event) => {
    if (!draggingTabKey) return;
    if (event.target instanceof Element && event.target.closest('.tab-drag-cancel-drop, .tab-drag-scroll')) return;
    const trackEl = trackRef.current;
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const xMarginPx = 120;
    const yMarginPx = lineModeActive === 'wrap' ? 80 : 120;
    const isInside = event.clientX >= rect.left - xMarginPx
      && event.clientX <= rect.right + xMarginPx
      && event.clientY >= rect.top - yMarginPx
      && event.clientY <= rect.bottom + yMarginPx;
    if (!isInside) return;
    if (!updateDragPreview(event.clientX, event.clientY)) return;
    event.preventDefault();
  }, [draggingTabKey, lineModeActive]);

  const handleDocumentDrop = React.useCallback((event) => {
    if (!draggingTabKey) return;
    if (event.target instanceof Element && event.target.closest('.tabs-on-top-track, .tab-drag-cancel-drop, .tab-drag-scroll')) return;
    const trackEl = trackRef.current;
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const isInside = event.clientX >= rect.left - 120
      && event.clientX <= rect.right + 120
      && event.clientY >= rect.top - 120
      && event.clientY <= rect.bottom + 120;
    if (!isInside) return;
    event.preventDefault();
    commitDrop();
  }, [draggingTabKey, commitDrop]);

  React.useEffect(() => {
    if (!draggingTabKey) return undefined;
    document.addEventListener('dragover', handleDocumentDragOver);
    document.addEventListener('drop', handleDocumentDrop);
    return () => {
      document.removeEventListener('dragover', handleDocumentDragOver);
      document.removeEventListener('drop', handleDocumentDrop);
    };
  }, [draggingTabKey, handleDocumentDragOver, handleDocumentDrop]);

  const toggleLineMode = () => {
    const lineModeNext = lineModeActive === 'single' ? 'wrap' : 'single';
    if (lineMode == null) setLineModeLocal(lineModeNext);
    onLineModeChange?.(lineModeNext);
    setDragPreview(null);
    setDragScrollDirection('');
  };

  const handleWheel = (event) => {
    if (lineModeActive !== 'single') return;
    const trackEl = trackRef.current;
    if (!trackEl || trackEl.scrollWidth <= trackEl.clientWidth) return;
    const deltaX = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!deltaX) return;
    event.preventDefault();
    trackEl.scrollLeft += deltaX;
    measureTrackOverflow();
  };

  const isDragScrollShown = Boolean(draggingTabKey) && lineModeActive === 'single' && isTrackOverflow;

  return (
    <div className={`tabs-on-top-container line-mode-${lineModeActive}`}>
      <div className="tabs-on-top-header">
        <div className="tabs-on-top-track-shell">
          <div
            className={`tabs-on-top-track ${lineModeActive === 'wrap' ? 'is-wrap' : 'is-single'}`}
            ref={trackRef}
            onDragOver={handleTrackDragOver}
            onDrop={(event) => {
              if (!draggingTabKey) return;
              event.preventDefault();
              commitDrop();
            }}
            onScroll={measureTrackOverflow}
            onWheel={handleWheel}
          >
            {tabs.map((tab) => renderTabButton({
              tab,
              activeTabKey,
              draggingTabKey,
              allowCloseTab,
              allowTabReorder,
              switchToTab,
              onTabClose,
              handleTabDragStart,
              clearDragState,
            }))}
            {dragPreview ? (
              <div
                className={`tab-separator-indicator ${lineModeActive === 'wrap' ? 'is-wrap' : 'is-single'} ${isDragCancelHover ? 'is-cancel-drop-hover' : ''}`}
                style={{
                  left: `${dragPreview.indicatorLeftPx}px`,
                  top: lineModeActive === 'wrap' ? `${dragPreview.indicatorTopPx}px` : undefined,
                  height: lineModeActive === 'wrap' ? `${dragPreview.indicatorHeightPx}px` : undefined,
                }}
              />
            ) : null}
          </div>

          {isDragScrollShown ? (
            <>
              <button
                type="button"
                className="tab-drag-scroll tab-drag-scroll-left"
                onDragEnter={() => setDragScrollDirection('left')}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragScrollDirection('left');
                  const preview = getPreviewFromEdge(trackRef.current, 'left');
                  if (preview) setDragPreview(preview);
                }}
                onDragLeave={() => setDragScrollDirection('')}
              >
                <span aria-hidden="true">&lt;</span>
              </button>
              <button
                type="button"
                className="tab-drag-scroll tab-drag-scroll-right"
                onDragEnter={() => setDragScrollDirection('right')}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragScrollDirection('right');
                  const preview = getPreviewFromEdge(trackRef.current, 'right');
                  if (preview) setDragPreview(preview);
                }}
                onDragLeave={() => setDragScrollDirection('')}
              >
                <span aria-hidden="true">&gt;</span>
              </button>
            </>
          ) : null}

          {draggingTabKey ? (
            <button
              type="button"
              className={`tab-drag-cancel-drop ${lineModeActive === 'wrap' ? 'is-wrap' : 'is-single'} ${!isDragScrollShown ? 'is-without-scroll-zones' : ''}`}
              onDragEnter={() => {
                setIsDragCancelHover(true);
                setDragScrollDirection('');
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragCancelHover(true);
              }}
              onDragLeave={() => setIsDragCancelHover(false)}
              onDrop={(event) => {
                event.preventDefault();
                clearDragState();
              }}
            >Cancel Drop</button>
          ) : null}
        </div>

        <div className="tabs-on-top-header-right">
          {allowTabCreate ? (
            <button className="tab-create-btn" onClick={onTabCreate} type="button" title="Create tab">
              <AddIcon size={14} />
            </button>
          ) : null}
          {allowLineModeSwitch ? (
            <button className="tab-line-mode-toggle" type="button" onClick={toggleLineMode} title="Toggle tab line mode">
              {lineModeActive === 'single' ? 'Multi-line' : 'One-line'}
            </button>
          ) : null}
          {renderHeaderRightItems({ headerRightItems, renderHeaderRightItem, onHeaderRightItemAction })}
          {headerRightContent}
        </div>
      </div>
      <div className="tabs-on-top-content">
        {Object.entries(panels).map(([tabKey, panelData]) => {
          const isActive = tabKey === activeTabKey;
          const keepMounted = panelData.keepMounted !== undefined ? panelData.keepMounted : defaultKeepMounted;
          if (!isActive && !keepMounted) return null;
          let enhancedContent = panelData.content;
          if (React.isValidElement(panelData.content)) {
            const element = panelData.content;
            if (typeof element.type === 'function' || typeof element.type === 'object') {
              enhancedContent = React.cloneElement(element, { tabsState, tabKey });
            }
          }
          return (
            <div
              key={tabKey}
              className={`tab-panel ${isActive ? 'active' : ''} ${!isActive && keepMounted ? 'is-kept-hidden' : ''}`.trim()}
              style={{ display: isActive || keepMounted ? 'block' : 'none' }}
            >
              {enhancedContent}
            </div>
          );
        })}
      </div>
    </div>
  );
});

function getInitialTabKey(defaultTab, tabs, panels, tabKeyMap) {
  if (defaultTab) {
    const mappedKey = tabKeyMap[String(defaultTab).toLowerCase()];
    if (mappedKey) return mappedKey;
    if (panels[defaultTab]) return defaultTab;
  }
  return tabs[0]?.key || null;
}

function renderTabButton({ tab, activeTabKey, draggingTabKey, allowCloseTab, allowTabReorder, switchToTab, onTabClose, handleTabDragStart, clearDragState }) {
  const isDragging = draggingTabKey === tab.key;
  const isActive = activeTabKey === tab.key;
  const commonProps = {
    label: tab.label,
    tabKey: tab.key,
    isActive,
    isDragging,
    onClick: () => switchToTab(tab.key),
    onClose: allowCloseTab ? (event) => {
      event.stopPropagation();
      onTabClose?.(tab.key);
    } : undefined,
    draggable: allowTabReorder,
    onDragStart: allowTabReorder ? (event) => handleTabDragStart(event, tab.key) : undefined,
    onDragEnd: allowTabReorder ? clearDragState : undefined,
    'data-tab-key': tab.key,
  };

  if (tab.customComponent) {
    let customContent = null;
    if (typeof tab.customComponent === 'function') {
      const CustomTabComponent = tab.customComponent;
      customContent = <CustomTabComponent {...commonProps} />;
    } else if (React.isValidElement(tab.customComponent)) {
      customContent = React.cloneElement(tab.customComponent, commonProps);
    }
    return (
      <span key={tab.key} className="tab-on-top-custom-wrap tab-on-top-drag-item" data-tab-key={tab.key}>
        {customContent}
      </span>
    );
  }

  return (
    <button
      key={tab.key}
      data-tab-key={tab.key}
      className={`tab-on-top-btn tab-on-top-drag-item ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${allowTabReorder ? 'reorderable' : ''}`}
      onClick={() => switchToTab(tab.key)}
      draggable={allowTabReorder}
      onDragStart={(event) => handleTabDragStart(event, tab.key)}
      onDragEnd={clearDragState}
      type="button"
    >
      <span className="tab-label">{tab.label}</span>
      {allowCloseTab ? (
        <span
          className="tab-close-btn"
          onClick={(event) => {
            event.stopPropagation();
            onTabClose?.(tab.key);
          }}
        >
          <CrossIcon size={12} />
        </span>
      ) : null}
    </button>
  );
}

function renderHeaderRightItems({ headerRightItems, renderHeaderRightItem, onHeaderRightItemAction }) {
  if (!Array.isArray(headerRightItems) || headerRightItems.length === 0) return null;
  return headerRightItems.map((item, index) => {
    const key = item?.id || index;
    const type = item?.type || 'button';
    if (type === 'custom') {
      return (
        <span key={key} className={`tab-header-right-custom ${item.className || ''}`.trim()}>
          {renderHeaderRightItem ? renderHeaderRightItem(item, onHeaderRightItemAction) : null}
        </span>
      );
    }
    return (
      <button
        key={key}
        type="button"
        className={`tab-header-right-btn ${item.className || ''}`.trim()}
        disabled={item.isDisabled === true}
        onClick={() => onHeaderRightItemAction?.(item.action || 'buttonClick', {
          itemId: item.id,
          itemData: item.data,
          ...(item.actionData || {}),
        })}
      >
        {item.text || item.label || 'Action'}
      </button>
    );
  });
}

TabsOnTop.displayName = 'TabsOnTop';

let tabCounter = 0;
const genTabKey = () => `tab-${++tabCounter}`;

const extractTabConfig = (children) => {
  tabCounter = 0;
  const tabs = [];
  const panels = {};
  const tabKeyMap = {};
  let pendingTabLabel = null;

  const processChild = (child) => {
    if (child && child.type && child.type.__isTabLabelSlot) {
      pendingTabLabel = child.props.children;
    } else if (child && child.type && child.type.__isTabOnTopSlot) {
      const tabKey = child.props.tabKey || genTabKey();
      const tabLabel = child.props.label;
      const keepMounted = child.props.keepMounted;
      tabs.push({ key: tabKey, label: tabLabel, customComponent: pendingTabLabel });
      panels[tabKey] = { content: child.props.children, keepMounted };
      tabKeyMap[String(tabLabel).toLowerCase()] = tabKey;
      pendingTabLabel = null;
    } else if (child && child.type === React.Fragment) {
      React.Children.forEach(child.props.children, processChild);
    }
  };

  React.Children.forEach(children, processChild);
  return { tabs, panels, tabKeyMap };
};

const TabSlot = ({ tabKey, label, keepMounted, children }) => null;
TabSlot.__isTabOnTopSlot = true;

const TabLabelSlot = ({ children }) => null;
TabLabelSlot.__isTabLabelSlot = true;

TabsOnTop.Tab = TabSlot;
TabsOnTop.TabLabel = TabLabelSlot;

export default TabsOnTop;
export { TabSlot as Tab, TabLabelSlot as TabLabel };
