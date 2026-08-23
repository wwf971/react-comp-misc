/*
use this exmample as reference, when you cannot implement the "right-click after right-click" behavior correctly.
*/

import { useMemo, useRef } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import MenuComp from './MenuComp.jsx';
import { getElementUnderMenu, isPointInsideElement } from './menuContextMenuUtils.js';
import {
  Example,
  Explanation,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
import './Menu.css';

const forwardContextMenuToAnotherRegion = (event) => {
  const targetElement = getElementUnderMenu(event);
  const targetRegion = targetElement?.closest?.('[data-menu-example-region]');
  if (!targetRegion) return;
  requestAnimationFrame(() => {
    const nextEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: event.clientX,
      clientY: event.clientY,
      button: 2,
    });
    targetElement.dispatchEvent(nextEvent);
  });
};

const handleScopedBackdropContextMenu = (event, regionRef, closeMenu, openMenu) => {
  event.preventDefault();
  if (isPointInsideElement(regionRef.current, event)) {
    openMenu(event);
    return;
  }
  closeMenu();
  forwardContextMenuToAnotherRegion(event);
};

function createStoreMenuRightClickExample() {
  return makeAutoObservable({
    menuPosOpen: null,
    clickCount: 0,
    tagsPosOpen: null,
    selectedTag: null,
    clickedItem: '',
    openSimple(event) {
      event.preventDefault();
      const newClickCount = this.clickCount + 1;
      this.menuPosOpen = null;
      this.clickCount = newClickCount;
      requestAnimationFrame(() => {
        runInAction(() => {
          this.menuPosOpen = { x: event.clientX, y: event.clientY };
          this.clickCount = newClickCount;
        });
      });
    },
    closeSimple() {
      this.menuPosOpen = null;
    },
    itemClickSet(clickedItem) {
      this.clickedItem = clickedItem;
    },
    openTag(event, tagName) {
      event.preventDefault();
      event.stopPropagation();
      this.tagsPosOpen = null;
      this.selectedTag = null;
      requestAnimationFrame(() => {
        runInAction(() => {
          this.tagsPosOpen = { x: event.clientX, y: event.clientY };
          this.selectedTag = tagName;
        });
      });
    },
    closeTags() {
      this.tagsPosOpen = null;
      this.selectedTag = null;
    },
    backdropContextMenuOnTags(event) {
      event.preventDefault();
      const backdrop = event.currentTarget;
      backdrop.style.pointerEvents = 'none';
      const clickedEl = document.elementFromPoint(event.clientX, event.clientY);
      backdrop.style.pointerEvents = '';
      const tagElement = clickedEl?.closest?.('[data-tag-name]');
      if (tagElement) {
        const tagName = tagElement.getAttribute('data-tag-name');
        if (tagName) {
          this.tagsPosOpen = null;
          this.selectedTag = null;
          requestAnimationFrame(() => {
            runInAction(() => {
              this.tagsPosOpen = { x: event.clientX, y: event.clientY };
              this.selectedTag = tagName;
            });
          });
          return;
        }
      }
      this.tagsPosOpen = null;
      this.selectedTag = null;
    },
  }, {}, { autoBind: true });
}

const getMenuItems = (clickCount, posOpen) => [
  {
    id: 'position',
    label: `X: ${posOpen.x}, Y: ${posOpen.y}`,
    data: { action: 'position', count: clickCount },
  },
  {
    id: 'click-count',
    label: `Click #${clickCount}`,
    data: { action: 'clickCount', count: clickCount },
  },
  {
    id: 'submenu',
    label: `Submenu (Click #${clickCount})`,
    children: [
      { id: 'sub-a', label: 'Sub Action A', data: { action: 'subA', count: clickCount } },
      { id: 'sub-b', label: 'Sub Action B', data: { action: 'subB', count: clickCount } },
    ],
  },
  { id: 'close', label: 'Close Menu', data: { action: 'close' } },
];

const tags = ['Tag A', 'Tag B', 'Tag C', 'Tag D', 'Tag E'];

const MenuRightClickExample = observer(function MenuRightClickExample({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreMenuRightClickExample()), [store]);
  const storeUsed = store || storeLocal;
  const simpleRegionRef = useRef(null);
  const tagsRegionRef = useRef(null);

  return (
    <Example title="Right-click repositioning">
      <Explanation>
        When a menu is already open, close it first, then reopen on the next animation frame.
        Without this pattern, right-clicking again often leaves stale position or duplicate menus.
      </Explanation>
      <CompDemoArea>
        <div className="menu-example-subsection">
          <div className="menu-example-subsection-title">Scenario 1: open region not covered by backdrop</div>
          <div className="menu-example-note">
            Right-click to open. Right-click again while open to reposition. Menu content updates with each click count.
          </div>
          <div
            ref={simpleRegionRef}
            data-menu-example-region="right-click-simple"
            className="menu-example-region menu-example-region-scenario-simple"
            onContextMenu={(event) => storeUsed.openSimple(event)}
          >
            <div className="menu-example-region-text">Right-click anywhere in this region</div>
          </div>
        </div>
        <div className="menu-example-subsection">
          <div className="menu-example-subsection-title">Scenario 2: clickables covered by backdrop</div>
          <div className="menu-example-note">
            Handle backdropContextMenu, temporarily disable backdrop pointer events, use elementFromPoint
            to find the tag under the cursor, then reopen the menu on that tag.
          </div>
          <div
            ref={tagsRegionRef}
            data-menu-example-region="right-click-tags"
            className="menu-example-region menu-example-region-scenario-tags"
          >
            <div className="menu-example-region-text">Right-click a tag. While menu is open, right-click another tag.</div>
            <div className="menu-example-tag-list">
              {tags.map((tag) => (
                <div
                  key={tag}
                  data-tag-name={tag}
                  className={`menu-example-tag${storeUsed.selectedTag === tag ? ' is-selected' : ''}`}
                  onContextMenu={(event) => storeUsed.openTag(event, tag)}
                >
                  {tag}
                </div>
              ))}
            </div>
            <div className="menu-example-tag-status">
              Selected: {storeUsed.selectedTag || 'None'}
            </div>
          </div>
        </div>
        {storeUsed.menuPosOpen ? (
          <MenuComp
            data={{ items: getMenuItems(storeUsed.clickCount, storeUsed.menuPosOpen) }}
            config={{ isOpen: true, posOpen: storeUsed.menuPosOpen }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'closeRequest') {
                storeUsed.closeSimple();
                return;
              }
              if (eventType === 'itemClick') {
                storeUsed.itemClickSet(`${eventData.item.label} - Action: ${eventData.item.data?.action}`);
                return;
              }
              if (eventType === 'backdropContextMenu') {
                handleScopedBackdropContextMenu(
                  eventData.event,
                  simpleRegionRef,
                  () => storeUsed.closeSimple(),
                  (event) => storeUsed.openSimple(event),
                );
              }
            }}
          />
        ) : null}
        {storeUsed.tagsPosOpen ? (
          <MenuComp
            data={{
              items: [
                { id: 'edit', label: 'Edit', data: { action: 'edit' } },
                { id: 'delete', label: 'Delete', data: { action: 'delete' } },
                { id: 'duplicate', label: 'Duplicate', data: { action: 'duplicate' } },
              ],
            }}
            config={{ isOpen: true, posOpen: storeUsed.tagsPosOpen }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'closeRequest') {
                storeUsed.closeTags();
                return;
              }
              if (eventType === 'itemClick') {
                storeUsed.itemClickSet(`Tag menu: ${eventData.item.label} on "${storeUsed.selectedTag}"`);
                return;
              }
              if (eventType === 'backdropContextMenu') {
                if (isPointInsideElement(tagsRegionRef.current, eventData.event)) {
                  storeUsed.backdropContextMenuOnTags(eventData.event);
                  return;
                }
                storeUsed.closeTags();
                forwardContextMenuToAnotherRegion(eventData.event);
              }
            }}
          />
        ) : null}
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.clickedItem ? `Last action: ${storeUsed.clickedItem}` : 'No action yet'}</span>
      </MessageAndOutputs>
    </Example>
  );
});

export default MenuRightClickExample;
