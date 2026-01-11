import React, { useState, useEffect } from 'react'
import './Menu.css'

/**
 * Multi-level context menu with right-click repositioning support
 * 
 * How right-click outside works:
 * - Backdrop intercepts onContextMenu (right-click) in addition to onClick (left-click)
 * - Right-click → backdrop onContextMenu → parent handler repositions menu at new coordinates
 * - Left-click → backdrop onClick → closes menu
 * - Key: onContextMenu on backdrop prevents browser's default menu and allows repositioning
 */

export interface MenuItemBase {
  name: string
  data?: any  // Optional custom data to pass back
}

export interface MenuItemSingle extends MenuItemBase {
  type: 'item'
}

export interface MenuItemSubmenu extends MenuItemBase {
  type: 'menu'
  children: MenuItem[]
}
export type MenuItem = MenuItemSingle | MenuItemSubmenu

interface MenuProps {
  items: MenuItem[]
  position: { x: number; y: number }
  onClose: () => void
  onItemClick: (item: MenuItemSingle) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

/**
 * Multi-level context menu component
 */
const Menu: React.FC<MenuProps> = ({ items, position, onClose, onItemClick, onContextMenu }) => {
  const [hoveredSubmenu, setHoveredSubmenu] = useState<number | null>(null)
  const [submenuPosition, setSubmenuPosition] = useState<{ x: number; y: number } | null>(null)

  // Reset submenu state when menu position changes (e.g., from right-click reposition)
  useEffect(() => {
    setHoveredSubmenu(null)
    setSubmenuPosition(null)
  }, [position.x, position.y])

  const handleItemClick = (item: MenuItem) => {
    if (item.type === 'item') {
      onItemClick(item)
      onClose()
    }
  }

  const handleItemMouseEnter = (item: MenuItem, index: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (item.type === 'menu') {
      const rect = event.currentTarget.getBoundingClientRect()
      setHoveredSubmenu(index)
      setSubmenuPosition({
        x: rect.right,
        y: rect.top
      })
    } else {
      setHoveredSubmenu(null)
      setSubmenuPosition(null)
    }
  }

  const handleMenuMouseLeave = () => {
    // Don't immediately close submenu - let the submenu's own hover handle it
  }

  const handleBackdropContextMenu = (e: React.MouseEvent) => {
    if (onContextMenu) {
      // Pass the right-click event to parent to reposition menu
      onContextMenu(e)
    } else {
      // If no onContextMenu handler, just prevent default
      e.preventDefault()
    }
  }

  return (
    <>
      {/* Backdrop to close menu when clicking outside */}
      <div 
        className="menu-backdrop" 
        onClick={onClose}
        onContextMenu={handleBackdropContextMenu}
      />
      
      {/* Menu */}
      <div 
        className="context-menu" 
        style={{ left: position.x, top: position.y }}
        onMouseLeave={handleMenuMouseLeave}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={`context-menu-item ${item.type === 'menu' ? 'has-submenu' : ''}`}
            onClick={() => handleItemClick(item)}
            onMouseEnter={(e) => handleItemMouseEnter(item, index, e)}
          >
            <span>{item.name}</span>
            {item.type === 'menu' && <span className="submenu-arrow">▶</span>}
          </div>
        ))}
      </div>

      {/* Submenu */}
      {hoveredSubmenu !== null && submenuPosition && items[hoveredSubmenu].type === 'menu' && (
        <Menu
          items={(items[hoveredSubmenu] as MenuItemSubmenu).children}
          position={submenuPosition}
          onClose={onClose}
          onItemClick={onItemClick}
          onContextMenu={onContextMenu}
        />
      )}
    </>
  )
}

export default Menu

