import React, { useState } from 'react'
import Menu, { MenuItem } from './Menu'
import MenuRightClickExample from './exampleRightClick'

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

// Combined Menu Examples
const MenuExamplesAll = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h4 style={{ marginTop: 0, marginBottom: '8px' }}>
        Single-Level Menu
      </h4>
      <MenuSingleLevel />

      <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>
        Multi-Level Menu
        <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
          Hover over items to see submenus
        </span>
      </h4>
      <MenuMultiLevel />

      <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>
        Right-Click Repositioning Pattern
        <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
          Demonstrates correct implementation
        </span>
      </h4>
      <MenuRightClickExample />

      <div style={{ marginTop: '16px', padding: '8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '2px', fontSize: '12px' }}>
        <strong>Features:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>
          <li>Right-click to open context menu</li>
          <li>Right-click again (anywhere) to reposition menu</li>
          <li>Left-click outside or on items to close</li>
          <li>Supports single-level and multi-level (nested) menus</li>
          <li>Hover over submenu items to reveal nested options</li>
          <li>Pass <code>onContextMenu</code> to Menu component for repositioning support</li>
          <li>Use requestAnimationFrame pattern for clean state updates</li>
        </ul>
      </div>
    </div>
  )
}

export const menuExamples = {
  'Menu': {
    component: Menu,
    description: 'Context menu with single-level, multi-level, and right-click repositioning examples',
    example: MenuExamplesAll
  }
}

