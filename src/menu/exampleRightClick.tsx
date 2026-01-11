import React, { useState } from 'react'
import Menu, { MenuItem } from './Menu'

/**
 * Example demonstrating correct right-click menu repositioning
 * 
 * KEY MECHANISM:
 * 1. Always close menu first (set to null) before opening at new position
 * 2. Use requestAnimationFrame to ensure React completes the unmount before remounting
 * 3. This prevents stale menu state and ensures clean repositioning
 * 
 * Without this pattern, right-clicking when menu is open causes:
 * - Menu stays at old position
 * - Multiple menus appear
 * - Menu content doesn't update
 */
const MenuRightClickExample = () => {
  const [menuState, setMenuState] = useState<{
    position: {x: number, y: number} | null,
    clickCount: number
  }>({
    position: null,
    clickCount: 0
  })
  const [clickedItem, setClickedItem] = useState<string>('')

  // Generate menu items that change based on click count to demonstrate content updates
  const getMenuItems = (clickCount: number, position: {x: number, y: number}): MenuItem[] => [
    {
      type: 'item',
      name: `X: ${position.x}, Y: ${position.y}`,
      data: { action: 'position', count: clickCount }
    },
    {
      type: 'item',
      name: `Click #${clickCount}`,
      data: { action: 'clickCount', count: clickCount }
    },
    {
      type: 'menu',
      name: `Submenu (Click #${clickCount})`,
      children: [
        {
          type: 'item',
          name: `Sub Action A`,
          data: { action: 'subA', count: clickCount }
        },
        {
          type: 'item',
          name: `Sub Action B`,
          data: { action: 'subB', count: clickCount }
        }
      ]
    },
    {
      type: 'item',
      name: 'Close Menu',
      data: { action: 'close' }
    }
  ]

  /**
   * CORRECT PATTERN for right-click handling:
   * 
   * Step 1: Close existing menu by setting position to null
   * Step 2: Use requestAnimationFrame to wait for React to complete unmount
   * Step 3: Open menu at new position with updated content
   * 
   * This ensures:
   * - No duplicate menus
   * - Clean state transitions
   * - Content updates properly
   * - Position updates reliably
   */
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    
    const newClickCount = menuState.clickCount + 1
    
    // Step 1: Close any existing menu
    setMenuState({
      position: null,
      clickCount: newClickCount
    })
    
    // Step 2 & 3: Wait for unmount, then open at new position
    requestAnimationFrame(() => {
      setMenuState({
        position: { x: e.clientX, y: e.clientY },
        clickCount: newClickCount
      })
    })
  }

  const handleItemClick = (item: any) => {
    setClickedItem(`${item.name} - Action: ${item.data?.action}`)
  }

  const handleClose = () => {
    setMenuState(prev => ({
      ...prev,
      position: null
    }))
  }

  return (
    <div>
      <div 
        style={{
          padding: '60px 40px',
          border: '2px dashed #2196F3',
          backgroundColor: '#f5f5f5',
          textAlign: 'center',
          cursor: 'context-menu',
          userSelect: 'none',
          borderRadius: '4px'
        }}
        onContextMenu={handleContextMenu}
      >
        <div style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 500 }}>
          Right-Click Anywhere
        </div>
        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
          • Right-click to open menu<br/>
          • Right-click again while menu is open to reposition<br/>
          • Menu content updates with each click (see click count)<br/>
          • Try clicking on backdrop, on items, anywhere!
        </div>
      </div>
      
      {clickedItem && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196F3',
          borderRadius: '4px',
          color: '#1565c0',
          fontSize: '14px'
        }}>
          <strong>Last Action:</strong> {clickedItem}
        </div>
      )}
      
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#fff3e0',
        border: '1px solid #ff9800',
        borderRadius: '4px',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        <strong>Implementation Pattern:</strong><br/>
        1. Close menu (set to null)<br/>
        2. Use requestAnimationFrame()<br/>
        3. Open at new position<br/>
        <br/>
        This prevents the classic bug where right-clicking an open menu doesn't reposition it.
      </div>

      {menuState.position && (
        <Menu
          items={getMenuItems(menuState.clickCount, menuState.position)}
          position={menuState.position}
          onClose={handleClose}
          onItemClick={handleItemClick}
          onContextMenu={handleContextMenu}
        />
      )}
    </div>
  )
}

export default MenuRightClickExample

