import React, { useState, useEffect, useRef } from 'react'
import './Menu.css'

/**
 * Menu item that renders a custom component
 */
export interface MenuCompItemBase {
  name: string
  component?: React.ComponentType<any>
  componentProps?: any
  preferredWidth?: number  // in pixels
  preferredHeight?: number // in pixels
  data?: any
  disabled?: boolean
}

export interface MenuCompItemSingle extends MenuCompItemBase {
  type: 'item'
}

export interface MenuCompItemSubmenu extends MenuCompItemBase {
  type: 'menu'
  children: MenuCompItem[]
}

export type MenuCompItem = MenuCompItemSingle | MenuCompItemSubmenu

interface MenuCompProps {
  items: MenuCompItem[]
  position: { x: number; y: number }
  onClose: () => void
  onItemClick: (item: MenuCompItemSingle) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

/**
 * Multi-level context menu component with custom component support
 * 
 * Key features:
 * - Supports React components as menu items
 * - preferredWidth: if exceeded, overflow hidden
 * - preferredHeight: if exceeded, item height increases to fit content
 * - Handles right-click-after-right-click correctly
 */
const MenuComp: React.FC<MenuCompProps> = ({ items, position, onClose, onItemClick, onContextMenu }) => {
  const [hoveredSubmenu, setHoveredSubmenu] = useState<number | null>(null)
  const [submenuPosition, setSubmenuPosition] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Reset submenu state when menu position changes (right-click reposition)
  useEffect(() => {
    setHoveredSubmenu(null)
    setSubmenuPosition(null)
  }, [position.x, position.y])

  // Adjust menu position if it goes off-screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let adjustedX = position.x
      let adjustedY = position.y

      // Adjust horizontal position
      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 5
      }

      // Adjust vertical position
      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 5
      }

      if (adjustedX !== position.x || adjustedY !== position.y) {
        menuRef.current.style.left = `${adjustedX}px`
        menuRef.current.style.top = `${adjustedY}px`
      }
    }
  }, [position.x, position.y])

  const handleItemClick = (item: MenuCompItem, e: React.MouseEvent) => {
    if (item.disabled) {
      e.stopPropagation()
      return
    }

    if (item.type === 'item') {
      onItemClick(item)
      onClose()
    }
  }

  const handleItemMouseEnter = (item: MenuCompItem, index: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (item.type === 'menu' && !item.disabled) {
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

  const handleBackdropContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Stop propagation to prevent infinite loop with nested menus
    
    // Temporarily hide ALL menus and backdrops to find element underneath
    const allMenus = document.querySelectorAll('.context-menu')
    const allBackdrops = document.querySelectorAll('.menu-backdrop')
    
    // Store original styles
    const originalStyles: Array<{ element: HTMLElement, display: string }> = []
    const originalBackdropStyles: Array<{ element: HTMLElement, pointerEvents: string }> = []
    
    // Hide all menus
    allMenus.forEach(menu => {
      const htmlMenu = menu as HTMLElement
      originalStyles.push({ element: htmlMenu, display: htmlMenu.style.display })
      htmlMenu.style.display = 'none'
    })
    
    // Disable pointer events on all backdrops
    allBackdrops.forEach(backdrop => {
      const htmlBackdrop = backdrop as HTMLElement
      originalBackdropStyles.push({ element: htmlBackdrop, pointerEvents: htmlBackdrop.style.pointerEvents })
      htmlBackdrop.style.pointerEvents = 'none'
    })
    
    // Get the element underneath
    const elementUnder = document.elementFromPoint(e.clientX, e.clientY)
    
    // Restore all menus
    originalStyles.forEach(({ element, display }) => {
      element.style.display = display
    })
    
    // Restore all backdrops
    originalBackdropStyles.forEach(({ element, pointerEvents }) => {
      element.style.pointerEvents = pointerEvents
    })
    
    if (elementUnder) {
      // Close the menu first, then dispatch event
      // This prevents infinite loop
      onClose()
      
      // Use setTimeout to ensure menu is fully closed before dispatching
      setTimeout(() => {
        const contextMenuEvent = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: e.clientX,
          clientY: e.clientY,
          button: 2
        })
        elementUnder.dispatchEvent(contextMenuEvent)
      }, 10)
    } else {
      // If no element found, close the menu
      onClose()
    }
  }

  const renderItemContent = (item: MenuCompItem) => {
    if (item.component) {
      const Component = item.component
      const style: React.CSSProperties = {}

      // Apply width constraint (overflow hidden if exceeded)
      if (item.preferredWidth) {
        style.width = `${item.preferredWidth}px`
        style.maxWidth = `${item.preferredWidth}px`
        style.overflow = 'hidden'
        style.textOverflow = 'ellipsis'
        style.whiteSpace = 'nowrap'
      }

      // Apply height constraint (but allow overflow to increase item height)
      if (item.preferredHeight) {
        style.minHeight = `${item.preferredHeight}px`
        // Don't set maxHeight - let content expand the item
      }

      return (
        <div style={style}>
          <Component {...(item.componentProps || {})} />
        </div>
      )
    }

    return <span>{item.name}</span>
  }

  return (
    <>
      {/* Backdrop to close menu when clicking outside */}
      <div 
        ref={backdropRef}
        className="menu-backdrop" 
        onClick={onClose}
        onContextMenu={handleBackdropContextMenu}
      />
      
      {/* Menu */}
      <div 
        ref={menuRef}
        className="context-menu" 
        style={{ left: position.x, top: position.y }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={`context-menu-item ${item.type === 'menu' ? 'has-submenu' : ''} ${item.disabled ? 'disabled' : ''}`}
            onClick={(e) => handleItemClick(item, e)}
            onMouseEnter={(e) => handleItemMouseEnter(item, index, e)}
          >
            {renderItemContent(item)}
            {item.type === 'menu' && <span className="submenu-arrow">▶</span>}
          </div>
        ))}
      </div>

      {/* Submenu */}
      {hoveredSubmenu !== null && submenuPosition && items[hoveredSubmenu].type === 'menu' && (
        <MenuComp
          items={(items[hoveredSubmenu] as MenuCompItemSubmenu).children}
          position={submenuPosition}
          onClose={onClose}
          onItemClick={onItemClick}
          onContextMenu={onContextMenu}
        />
      )}
    </>
  )
}

export default MenuComp

