import React, { useState } from 'react'
import Menu, { MenuItem } from './Menu'

// Example: Single-level menu
const MenuSingleLevel = () => {
  const [menuPos, setMenuPos] = useState<{x: number, y: number} | null>(null)
  const [clickedItem, setClickedItem] = useState<string>('')

  const menuItems: MenuItem[] = [
    {
      type: 'item',
      name: 'Open',
      data: { action: 'open' }
    },
    {
      type: 'item',
      name: 'Edit',
      data: { action: 'edit' }
    },
    {
      type: 'item',
      name: 'Delete',
      data: { action: 'delete' }
    }
  ]

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // Close current menu and open new one at new position
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  const handleItemClick = (item: any) => {
    setClickedItem(`${item.name} (${item.data?.action})`)
  }

  const handleClose = () => {
    setMenuPos(null)
  }

  return (
    <div>
      <div 
        style={{
          padding: '40px',
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
        <Menu
          items={menuItems}
          position={menuPos}
          onClose={handleClose}
          onItemClick={handleItemClick}
          onContextMenu={handleContextMenu}
        />
      )}
    </div>
  )
}

// Example: Multi-level menu
const MenuMultiLevel = () => {
  const [menuPos, setMenuPos] = useState<{x: number, y: number} | null>(null)
  const [clickedItem, setClickedItem] = useState<string>('')

  const menuItems: MenuItem[] = [
    {
      type: 'item',
      name: 'New File',
      data: { action: 'newFile' }
    },
    {
      type: 'menu',
      name: 'Export',
      children: [
        {
          type: 'item',
          name: 'Export as PDF',
          data: { action: 'exportPDF' }
        },
        {
          type: 'item',
          name: 'Export as PNG',
          data: { action: 'exportPNG' }
        },
        {
          type: 'menu',
          name: 'More Formats',
          children: [
            {
              type: 'item',
              name: 'Export as SVG',
              data: { action: 'exportSVG' }
            },
            {
              type: 'item',
              name: 'Export as JPEG',
              data: { action: 'exportJPEG' }
            }
          ]
        }
      ]
    },
    {
      type: 'menu',
      name: 'Settings',
      children: [
        {
          type: 'item',
          name: 'Preferences',
          data: { action: 'preferences' }
        },
        {
          type: 'item',
          name: 'Shortcuts',
          data: { action: 'shortcuts' }
        }
      ]
    },
    {
      type: 'item',
      name: 'About',
      data: { action: 'about' }
    }
  ]

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // Close current menu and open new one at new position
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  const handleItemClick = (item: any) => {
    setClickedItem(`${item.name} (${item.data?.action})`)
  }

  const handleClose = () => {
    setMenuPos(null)
  }

  return (
    <div>
      <div 
        style={{
          padding: '40px',
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
        <Menu
          items={menuItems}
          position={menuPos}
          onClose={handleClose}
          onItemClick={handleItemClick}
          onContextMenu={handleContextMenu}
        />
      )}
    </div>
  )
}

export const menuExamples = {
  'Menu - Single Level': {
    component: Menu,
    description: 'Context menu with single-level items',
    example: MenuSingleLevel
  },
  'Menu - Multi Level': {
    component: Menu,
    description: 'Context menu with multi-level submenus (hover to see submenus)',
    example: MenuMultiLevel
  }
}

