import React, { useRef, useState } from 'react'
import MenuContext from './MenuContext.jsx'
import MenuRightClickExample from './exampleRightClick'

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

// Example: Single-level menu
const MenuSingleLevel = () => {
  const regionRef = useRef(null)
  const [menuPos, setMenuPos] = useState(null)
  const [clickedItem, setClickedItem] = useState('')

  const menuItems = [
    {
      id: 'open',
      label: 'Open',
      data: { action: 'open' }
    },
    {
      id: 'edit',
      label: 'Edit',
      data: { action: 'edit' }
    },
    {
      id: 'delete',
      label: 'Delete',
      data: { action: 'delete' }
    }
  ]

  const handleContextMenu = (e) => {
    e.preventDefault()
    // Close current menu and open new one at new position
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  const handleItemClick = (item) => {
    setClickedItem(`${item.label} (${item.data?.action})`)
  }

  const handleClose = () => {
    setMenuPos(null)
  }

  return (
    <div>
      <div 
        ref={regionRef}
        data-menu-example-region="single"
        style={{
          border: '2px dashed #ccc',
          textAlign: 'center',
          cursor: 'context-menu',
          userSelect: 'none'
        }}
        onContextMenu={handleContextMenu}
      >
        Right-click here to open menu. Right-click again (anywhere) to reposition.
      </div>
      {clickedItem && (
        <div style={{marginTop: '10px', color: '#007bff'}}>
          Clicked: {clickedItem}
        </div>
      )}
      {menuPos && (
        <MenuContext
          data={{
            items: menuItems,
            position: menuPos,
          }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'close') {
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
      )}
    </div>
  )
}

// Example: Multi-level menu
const MenuMultiLevel = () => {
  const regionRef = useRef(null)
  const [menuPos, setMenuPos] = useState(null)
  const [clickedItem, setClickedItem] = useState('')

  const menuItems = [
    {
      id: 'new-file',
      label: 'New File',
      data: { action: 'newFile' }
    },
    {
      id: 'export',
      label: 'Export',
      children: [
        {
          id: 'export-pdf',
          label: 'Export as PDF',
          data: { action: 'exportPDF' }
        },
        {
          id: 'export-png',
          label: 'Export as PNG',
          data: { action: 'exportPNG' }
        },
        {
          id: 'more-formats',
          label: 'More Formats',
          children: [
            {
              id: 'export-svg',
              label: 'Export as SVG',
              data: { action: 'exportSVG' }
            },
            {
              id: 'export-jpeg',
              label: 'Export as JPEG',
              data: { action: 'exportJPEG' }
            }
          ]
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      children: [
        {
          id: 'preferences',
          label: 'Preferences',
          data: { action: 'preferences' }
        },
        {
          id: 'shortcuts',
          label: 'Shortcuts',
          data: { action: 'shortcuts' }
        }
      ]
    },
    {
      id: 'about',
      label: 'About',
      data: { action: 'about' }
    }
  ]

  const handleContextMenu = (e) => {
    e.preventDefault()
    // Close current menu and open new one at new position
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  const handleItemClick = (item) => {
    setClickedItem(`${item.label} (${item.data?.action})`)
  }

  const handleClose = () => {
    setMenuPos(null)
  }

  return (
    <div>
      <div 
        ref={regionRef}
        data-menu-example-region="multi"
        style={{
          border: '2px dashed #ccc',
          textAlign: 'center',
          cursor: 'context-menu',
          userSelect: 'none'
        }}
        onContextMenu={handleContextMenu}
      >
        Right-click here for multi-level menu. Right-click again (anywhere) to reposition.
      </div>
      {clickedItem && (
        <div style={{marginTop: '10px', color: '#007bff'}}>
          Clicked: {clickedItem}
        </div>
      )}
      {menuPos && (
        <MenuContext
          data={{
            items: menuItems,
            position: menuPos,
          }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'close') {
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
      )}
    </div>
  )
}

// Example: Disabled items
const MenuWithDisabledItems = () => {
  const regionRef = useRef(null)
  const [menuPos, setMenuPos] = useState(null)
  const [clickedItem, setClickedItem] = useState('')

  const menuItems = [
    {
      id: 'open',
      label: 'Open',
      data: { action: 'open' }
    },
    {
      id: 'delete',
      label: 'Delete (disabled)',
      isDisabled: true,
      data: { action: 'delete' }
    },
    {
      id: 'approve',
      label: 'Approve (disabled)',
      isDisabled: true,
      data: { action: 'approve' }
    },
    {
      id: 'edit',
      label: 'Edit',
      data: { action: 'edit' }
    }
  ]

  const handleContextMenu = (e) => {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  const handleItemClick = (item) => {
    setClickedItem(`${item.label} (${item.data?.action})`)
  }

  const handleClose = () => {
    setMenuPos(null)
  }

  return (
    <div>
      <div
        ref={regionRef}
        data-menu-example-region="disabled"
        style={{
          border: '2px dashed #ccc',
          textAlign: 'center',
          cursor: 'context-menu',
          userSelect: 'none'
        }}
        onContextMenu={handleContextMenu}
      >
        Right-click here to test disabled menu items.
      </div>
      {clickedItem && (
        <div style={{ marginTop: '10px', color: '#007bff' }}>
          Clicked: {clickedItem}
        </div>
      )}
      {menuPos && (
        <MenuContext
          data={{
            items: menuItems,
            position: menuPos,
          }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'close') {
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
      )}
    </div>
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
  const [menuPos, setMenuPos] = useState(null)
  const [clickedItem, setClickedItem] = useState('')

  const menuItems = [
    {
      id: 'profile',
      component: CustomMenuLabel,
      componentProps: { title: 'Profile', detail: 'custom component item' },
      data: { action: 'profile' },
    },
    {
      id: 'export',
      label: 'Export',
      children: [
        {
          id: 'export-json',
          component: CustomMenuLabel,
          componentProps: { title: 'JSON', detail: 'nested custom item' },
          data: { action: 'exportJson' },
        },
        {
          id: 'export-csv',
          label: 'CSV',
          data: { action: 'exportCsv' },
        },
      ],
    },
  ]

  const handleContextMenu = (event) => {
    event.preventDefault()
    setMenuPos({ x: event.clientX, y: event.clientY })
  }

  const handleClose = () => {
    setMenuPos(null)
  }

  return (
    <div>
      <div
        ref={regionRef}
        data-menu-example-region="custom"
        className="menu-example-region"
        onContextMenu={handleContextMenu}
      >
        Right-click here to open a menu with custom component items.
      </div>
      {clickedItem ? (
        <div className="menu-example-click-result">Clicked: {clickedItem}</div>
      ) : null}
      {menuPos ? (
        <MenuContext
          data={{
            items: menuItems,
            position: menuPos,
          }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'close') {
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
    </div>
  )
}

// Combined Menu Examples
const MenuExamplesAll = () => {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="menu-example-note">
        These examples use <code>MenuContext</code>. The package still supports <code>Menu</code> as an alias for compatibility.
      </div>
      <div className="menu-example-section-title">
        Single-Level Menu
      </div>
      <MenuSingleLevel />

      <div className="menu-example-section-title">
        Multi-Level Menu
        <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
          Hover over items to see submenus
        </span>
      </div>
      <MenuMultiLevel />

      <div className="menu-example-section-title">
        Disabled Items
        <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
          Disabled items are greyed out and not clickable
        </span>
      </div>
      <MenuWithDisabledItems />

      <div className="menu-example-section-title">
        Custom Component Items
        <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
          Menu items can render caller-provided components
        </span>
      </div>
      <MenuWithCustomComponents />

      <div className="menu-example-section-title">
        Right-Click Repositioning Pattern
        <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
          Demonstrates correct implementation
        </span>
      </div>
      <MenuRightClickExample />

      <div style={{ marginTop: '16px', padding: '8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '2px', fontSize: '12px' }}>
        <strong>Features:</strong>
        <div className="menu-example-feature-list">
          <div>Right-click to open context menu.</div>
          <div>Right-click inside the same dashed region to reposition menu.</div>
          <div>Right-click another dashed region to open that example menu.</div>
          <div>Left-click outside or on items to close.</div>
          <div>Supports single-level, multi-level, disabled, and custom component items.</div>
        </div>
      </div>
    </div>
  )
}

export const menuExamples = {
  'MenuContext': {
    component: MenuContext,
    description: 'MenuContext examples. Menu remains available as a compatibility alias.',
    example: MenuExamplesAll
  }
}

