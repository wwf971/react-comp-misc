import { useMemo, useRef } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import MenuComp from './MenuComp.jsx';
import MenuRightClickExample from './exampleRightClick';
import {
  DemoPanel,
  Example,
  Explanation,
  KeyChip,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
import { ExampleGroup, ExampleStackVertical } from '../../dev/demo/ExampleGroup.jsx';
import './Menu.css';

const isPointInsideElement = (element, event) => {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return event.clientX >= rect.left
    && event.clientX <= rect.right
    && event.clientY >= rect.top
    && event.clientY <= rect.bottom;
};

const getElementUnderMenu = (event) => {
  const overlayElements = Array.from(document.querySelectorAll('.menu-backdrop, .menu-core-root'));
  const previousValues = overlayElements.map((element) => ({
    element,
    pointerEvents: element.style.pointerEvents,
  }));
  overlayElements.forEach((element) => {
    element.style.pointerEvents = 'none';
  });
  const targetElement = document.elementFromPoint(event.clientX, event.clientY);
  previousValues.forEach(({ element, pointerEvents }) => {
    element.style.pointerEvents = pointerEvents;
  });
  return targetElement;
};

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

function createStoreMenuExample() {
  return makeAutoObservable({
    menuPosOpen: null,
    clickedItem: '',
    open(event) {
      event.preventDefault();
      this.menuPosOpen = { x: event.clientX, y: event.clientY };
    },
    close() {
      this.menuPosOpen = null;
    },
    itemClickSet(clickedItem) {
      this.clickedItem = clickedItem;
    },
  }, {}, { autoBind: true });
}

const ExampleMenuVariant = observer(function ExampleMenuVariant({
  title,
  explanation,
  regionId,
  menuItems,
  itemTextGet,
  store,
}) {
  const storeLocal = useMemo(() => (store ? null : createStoreMenuExample()), [store]);
  const storeUsed = store || storeLocal;
  const regionRef = useRef(null);

  return (
    <Example title={title}>
      <Explanation>{explanation}</Explanation>
      <CompDemoArea>
        <div
          ref={regionRef}
          data-menu-example-region={regionId}
          className="menu-example-region"
          onContextMenu={(event) => storeUsed.open(event)}
        >
          <div className="menu-example-region-text">Right-click here</div>
        </div>
        {storeUsed.menuPosOpen ? (
          <MenuComp
            data={{ items: menuItems }}
            config={{ isOpen: true, posOpen: storeUsed.menuPosOpen }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'closeRequest') {
                storeUsed.close();
                return;
              }
              if (eventType === 'itemClick') {
                storeUsed.itemClickSet(itemTextGet(eventData.item));
                return;
              }
              if (eventType === 'backdropContextMenu') {
                handleScopedBackdropContextMenu(
                  eventData.event,
                  regionRef,
                  () => storeUsed.close(),
                  (event) => storeUsed.open(event),
                );
              }
            }}
          />
        ) : null}
      </CompDemoArea>
      <MessageAndOutputs>
        <span>{storeUsed.clickedItem ? `Clicked: ${storeUsed.clickedItem}` : 'No item clicked yet'}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const CustomMenuLabel = ({ title, detail }) => (
  <div className="menu-example-custom-item">
    <span className="menu-example-custom-item-title">{title}</span>
    <span className="menu-example-custom-item-detail">{detail}</span>
  </div>
);

const MenuSingleLevel = () => (
  <ExampleMenuVariant
    title="Single-level menu"
    explanation="Right-click the region to open the menu. Right-click again to reposition. Left-click outside or pick an item to close."
    regionId="single"
    menuItems={[
      { id: 'open', label: 'Open', data: { action: 'open' } },
      { id: 'edit', label: 'Edit', data: { action: 'edit' } },
      { id: 'delete', label: 'Delete', data: { action: 'delete' } },
    ]}
    itemTextGet={(item) => `${item.label} (${item.data?.action})`}
  />
);

const MenuMultiLevel = () => (
  <ExampleMenuVariant
    title="Multi-level menu"
    explanation="Hover items with a submenu indicator to open nested panels."
    regionId="multi"
    menuItems={[
      { id: 'new-file', label: 'New File', data: { action: 'newFile' } },
      {
        id: 'export',
        label: 'Export',
        children: [
          { id: 'export-pdf', label: 'Export as PDF', data: { action: 'exportPDF' } },
          { id: 'export-png', label: 'Export as PNG', data: { action: 'exportPNG' } },
          {
            id: 'more-formats',
            label: 'More Formats',
            children: [
              { id: 'export-svg', label: 'Export as SVG', data: { action: 'exportSVG' } },
              { id: 'export-jpeg', label: 'Export as JPEG', data: { action: 'exportJPEG' } },
            ],
          },
        ],
      },
      {
        id: 'settings',
        label: 'Settings',
        children: [
          { id: 'preferences', label: 'Preferences', data: { action: 'preferences' } },
          { id: 'shortcuts', label: 'Shortcuts', data: { action: 'shortcuts' } },
        ],
      },
      { id: 'about', label: 'About', data: { action: 'about' } },
    ]}
    itemTextGet={(item) => `${item.label} (${item.data?.action})`}
  />
);

const MenuWithDisabledItems = () => (
  <ExampleMenuVariant
    title="Disabled items"
    explanation="Items with isDisabled are greyed out and ignore clicks."
    regionId="disabled"
    menuItems={[
      { id: 'open', label: 'Open', data: { action: 'open' } },
      { id: 'delete', label: 'Delete (disabled)', isDisabled: true, data: { action: 'delete' } },
      { id: 'approve', label: 'Approve (disabled)', isDisabled: true, data: { action: 'approve' } },
      { id: 'edit', label: 'Edit', data: { action: 'edit' } },
    ]}
    itemTextGet={(item) => `${item.label} (${item.data?.action})`}
  />
);

const MenuWithCustomComponents = () => (
  <ExampleMenuVariant
    title="Custom component items"
    explanation="Use comp and compProps on an item when the row needs custom content."
    regionId="custom"
    menuItems={[
      {
        id: 'profile',
        comp: CustomMenuLabel,
        compProps: { title: 'Profile', detail: 'custom component item' },
        data: { action: 'profile' },
      },
      {
        id: 'export',
        label: 'Export',
        children: [
          {
            id: 'export-json',
            comp: CustomMenuLabel,
            compProps: { title: 'JSON', detail: 'nested custom item' },
            data: { action: 'exportJson' },
          },
          { id: 'export-csv', label: 'CSV', data: { action: 'exportCsv' } },
        ],
      },
    ]}
    itemTextGet={(item) => `${item.id} (${item.data?.action})`}
  />
);

const MenuExamplesAll = () => (
  <DemoPanel>
    <Explanation titleText="MenuComp context menu">
      <ul>
        <li>Use data.items for menu content and config.posOpen for placement.</li>
        <li>Handle closeRequest, itemClick, and backdropContextMenu through onEvent.</li>
        <li>
          <KeyChip>Right click</KeyChip> another dashed region while a menu is open to switch examples.
        </li>
        <li>
          Left or right click outside the dashed region while a menu is open to close the menu.
        </li>
      </ul>
    </Explanation>
    <ExampleGroup title="Variants">
      <ExampleStackVertical>
        <MenuSingleLevel />
        <MenuMultiLevel />
        <MenuWithDisabledItems />
        <MenuWithCustomComponents />
        <MenuRightClickExample />
      </ExampleStackVertical>
    </ExampleGroup>
  </DemoPanel>
);

export const menuExamples = {
  Menu: {
    component: MenuComp,
    description: 'Context menu(right click menu) that supports custom components as menu items.',
    example: MenuExamplesAll,
  },
};

export default MenuExamplesAll;
