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

/**
 * Multi-level context menu component
 */
const Menu = ({ items, position, onClose, onItemClick, onContextMenu }) => {
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null)
  const [submenuPosition, setSubmenuPosition] = useState(null)

  // Reset submenu state when menu position changes (e.g., from right-click reposition)
  useEffect(() => {
    setHoveredSubmenu(null)
    setSubmenuPosition(null)
  }, [position.x, position.y])

  const isItemDisabled = (item) => item.disabled === true || item.isEnabled === false

  const handleItemClick = (item, e) => {
    // Only handle left clicks
    if (e.button !== 0) return
    if (isItemDisabled(item)) return
    
    if (item.type === 'item') {
      onItemClick(item)
      onClose()
    }
  }

  const handleItemContextMenu = (e) => {
    // Suppress browser's context menu on menu items
    e.preventDefault()
    e.stopPropagation()
  }

  const handleItemMouseEnter = (item, index, event) => {
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

  const handleBackdropContextMenu = (e) => {
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
        {items.map((item, index) => {
          const isDisabled = isItemDisabled(item)
          return (
            <div
              key={index}
              aria-disabled={isDisabled ? 'true' : 'false'}
              className={`context-menu-item ${item.type === 'menu' ? 'has-submenu' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={(e) => handleItemClick(item, e)}
              onMouseEnter={(e) => handleItemMouseEnter(item, index, e)}
              onContextMenu={handleItemContextMenu}
            >
              <span>{item.name}</span>
              {item.type === 'menu' && <span className="submenu-arrow">▶</span>}
            </div>
          )
        })}
      </div>

      {/* Submenu */}
      {hoveredSubmenu !== null && submenuPosition && items[hoveredSubmenu].type === 'menu' && (
        <Menu
          items={items[hoveredSubmenu].children}
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

