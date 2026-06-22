import React, { useRef, useState } from 'react'
import MenuComp from './MenuComp.jsx'
import MenuRightClickExample from './exampleRightClick'
import './Menu.css'

const MenuExampleSection = ({ title, note, children }) => {
  return (
    <div className="menu-example-section">
      <div className="menu-example-title">{title}</div>
      {note ? <div className="menu-example-note">{note}</div> : null}
      <div className="menu-example-panel">{children}</div>
    </div>
  )
}

const isPointInsideElement = (element, event) => {
  if (!element) return false
  const rect = element.getBoundingClientRect()
  return event.clientX >= rect.left
    && event.clientX <= rect.right
    && event.clientY >= rect.top
    && event.clientY <= rect.bottom
}

const getElementUnderMenu = (event) => {
  const overlayElements = Array.from(document.querySelectorAll('.menu-backdrop, .menu-core-root'))
  const previousValues = overlayElements.map((element) => ({
    element,
    pointerEvents: element.style.pointerEvents,
  }))
  overlayElements.forEach((element) => {
    element.style.pointerEvents = 'none'
  })
  const targetElement = document.elementFromPoint(event.clientX, event.clientY)
  previousValues.forEach(({ element, pointerEvents }) => {
    element.style.pointerEvents = pointerEvents
  })
  return targetElement
}

const forwardContextMenuToAnotherRegion = (event) => {
  const targetElement = getElementUnderMenu(event)
  const targetRegion = targetElement?.closest?.('[data-menu-example-region]')
  if (!targetRegion) return
  requestAnimationFrame(() => {
    const nextEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: event.clientX,
      clientY: event.clientY,
      button: 2,
    })
    targetElement.dispatchEvent(nextEvent)
  })
}

const handleScopedBackdropContextMenu = (event, regionRef, closeMenu, openMenu) => {
  event.preventDefault()
  if (isPointInsideElement(regionRef.current, event)) {
    openMenu(event)
    return
  }
  closeMenu()
  forwardContextMenuToAnotherRegion(event)
}

const MenuSingleLevel = () => {
  const regionRef = useRef(null)
  const [menuPosOpen, setMenuPosOpen] = useState(null)
  const [clickedItem, setClickedItem] = useState('')

  const menuItems = [
    { id: 'open', label: 'Open', data: { action: 'open' } },
    { id: 'edit', label: 'Edit', data: { action: 'edit' } },
    { id: 'delete', label: 'Delete', data: { action: 'delete' } },
  ]

  const handleContextMenu = (event) => {
    event.preventDefault()
    setMenuPosOpen({ x: event.clientX, y: event.clientY })
  }

  const handleItemClick = (item) => {
    setClickedItem(`${item.label} (${item.data?.action})`)
  }

  const handleClose = () => {
    setMenuPosOpen(null)
  }

  return (
    <MenuExampleSection
      title="Single-level menu"
      note="Right-click the region to open the menu. Right-click again to reposition. Left-click outside or pick an item to close."
    >
      <div
        ref={regionRef}
        data-menu-example-region="single"
        className="menu-example-region"
        onContextMenu={handleContextMenu}
      >
        <div className="menu-example-region-text">Right-click here</div>
      </div>
      {clickedItem ? (
        <div className="menu-example-result">Clicked: {clickedItem}</div>
      ) : null}
      {menuPosOpen ? (
        <MenuComp
          data={{ items: menuItems }}
          config={{ isOpen: true, posOpen: menuPosOpen }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'closeRequest') {
              handleClose()
              return
            }
            if (eventType === 'itemClick') {
              handleItemClick(eventData.item)
              return
            }
            if (eventType === 'backdropContextMenu') {
              handleScopedBackdropContextMenu(eventData.event, regionRef, handleClose, handleContextMenu)
            }
          }}
        />
      ) : null}
    </MenuExampleSection>
  )
}

const MenuMultiLevel = () => {
  const regionRef = useRef(null)
  const [menuPosOpen, setMenuPosOpen] = useState(null)
  const [clickedItem, setClickedItem] = useState('')

  const menuItems = [
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
  ]

  const handleContextMenu = (event) => {
    event.preventDefault()
    setMenuPosOpen({ x: event.clientX, y: event.clientY })
  }

  const handleItemClick = (item) => {
    setClickedItem(`${item.label} (${item.data?.action})`)
  }

  const handleClose = () => {
    setMenuPosOpen(null)
  }

  return (
    <MenuExampleSection
      title="Multi-level menu"
      note="Hover items with a submenu indicator to open nested panels."
    >
      <div
        ref={regionRef}
        data-menu-example-region="multi"
        className="menu-example-region"
        onContextMenu={handleContextMenu}
      >
        <div className="menu-example-region-text">Right-click here</div>
      </div>
      {clickedItem ? (
        <div className="menu-example-result">Clicked: {clickedItem}</div>
      ) : null}
      {menuPosOpen ? (
        <MenuComp
          data={{ items: menuItems }}
          config={{ isOpen: true, posOpen: menuPosOpen }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'closeRequest') {
              handleClose()
              return
            }
            if (eventType === 'itemClick') {
              handleItemClick(eventData.item)
              return
            }
            if (eventType === 'backdropContextMenu') {
              handleScopedBackdropContextMenu(eventData.event, regionRef, handleClose, handleContextMenu)
            }
          }}
        />
      ) : null}
    </MenuExampleSection>
  )
}

const MenuWithDisabledItems = () => {
  const regionRef = useRef(null)
  const [menuPosOpen, setMenuPosOpen] = useState(null)
  const [clickedItem, setClickedItem] = useState('')

  const menuItems = [
    { id: 'open', label: 'Open', data: { action: 'open' } },
    { id: 'delete', label: 'Delete (disabled)', isDisabled: true, data: { action: 'delete' } },
    { id: 'approve', label: 'Approve (disabled)', isDisabled: true, data: { action: 'approve' } },
    { id: 'edit', label: 'Edit', data: { action: 'edit' } },
  ]

  const handleContextMenu = (event) => {
    event.preventDefault()
    setMenuPosOpen({ x: event.clientX, y: event.clientY })
  }

  const handleItemClick = (item) => {
    setClickedItem(`${item.label} (${item.data?.action})`)
  }

  const handleClose = () => {
    setMenuPosOpen(null)
  }

  return (
    <MenuExampleSection
      title="Disabled items"
      note="Items with isDisabled are greyed out and ignore clicks."
    >
      <div
        ref={regionRef}
        data-menu-example-region="disabled"
        className="menu-example-region"
        onContextMenu={handleContextMenu}
      >
        <div className="menu-example-region-text">Right-click here</div>
      </div>
      {clickedItem ? (
        <div className="menu-example-result">Clicked: {clickedItem}</div>
      ) : null}
      {menuPosOpen ? (
        <MenuComp
          data={{ items: menuItems }}
          config={{ isOpen: true, posOpen: menuPosOpen }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'closeRequest') {
              handleClose()
              return
            }
            if (eventType === 'itemClick') {
              handleItemClick(eventData.item)
              return
            }
            if (eventType === 'backdropContextMenu') {
              handleScopedBackdropContextMenu(eventData.event, regionRef, handleClose, handleContextMenu)
            }
          }}
        />
      ) : null}
    </MenuExampleSection>
  )
}

const CustomMenuLabel = ({ title, detail }) => {
  return (
    <div className="menu-example-custom-item">
      <span className="menu-example-custom-item-title">{title}</span>
      <span className="menu-example-custom-item-detail">{detail}</span>
    </div>
  )
}

const MenuWithCustomComponents = () => {
  const regionRef = useRef(null)
  const [menuPosOpen, setMenuPosOpen] = useState(null)
  const [clickedItem, setClickedItem] = useState('')

  const menuItems = [
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
  ]

  const handleContextMenu = (event) => {
    event.preventDefault()
    setMenuPosOpen({ x: event.clientX, y: event.clientY })
  }

  const handleClose = () => {
    setMenuPosOpen(null)
  }

  return (
    <MenuExampleSection
      title="Custom component items"
      note="Use comp and compProps on an item when the row needs custom content."
    >
      <div
        ref={regionRef}
        data-menu-example-region="custom"
        className="menu-example-region"
        onContextMenu={handleContextMenu}
      >
        <div className="menu-example-region-text">Right-click here</div>
      </div>
      {clickedItem ? (
        <div className="menu-example-result">Clicked: {clickedItem}</div>
      ) : null}
      {menuPosOpen ? (
        <MenuComp
          data={{ items: menuItems }}
          config={{ isOpen: true, posOpen: menuPosOpen }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'closeRequest') {
              handleClose()
              return
            }
            if (eventType === 'itemClick') {
              setClickedItem(`${eventData.item.id} (${eventData.item.data?.action})`)
              return
            }
            if (eventType === 'backdropContextMenu') {
              handleScopedBackdropContextMenu(eventData.event, regionRef, handleClose, handleContextMenu)
            }
          }}
        />
      ) : null}
    </MenuExampleSection>
  )
}

const MenuExamplesAll = () => {
  return (
    <div className="menu-examples-all">
      <div className="menu-example-intro">
        <div className="menu-example-intro-title">MenuComp context menu</div>
        <ul className="menu-example-guidance-list">
          <li>Use data.items for menu content and config.posOpen for placement.</li>
          <li>Handle closeRequest, itemClick, and backdropContextMenu through onEvent.</li>
          <li>Right-click another dashed region while a menu is open to switch examples.</li>
          <li>Lef or right click outside the dashed region while a menu is open to close the menu.</li>
        </ul>
      </div>

      <MenuSingleLevel />
      <MenuMultiLevel />
      <MenuWithDisabledItems />
      <MenuWithCustomComponents />
      <MenuRightClickExample />
    </div>
  )
}

export const menuExamples = {
  'Menu': {
    component: MenuComp,
    description: 'Context menu(right click menu) that supports custom components as menu items.',
    example: MenuExamplesAll,
  },
}
