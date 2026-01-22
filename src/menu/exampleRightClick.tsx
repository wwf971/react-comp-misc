import React, { useState } from 'react'
import Menu, { MenuItem } from './Menu'

/**
 * Example demonstrating correct right-click menu repositioning
 * 
 * TWO SCENARIOS COVERED:
 * 1. Simple case: Clickable elements NOT covered by backdrop
 * 2. Complex case: Clickable elements covered by backdrop (requires special handling)
 * 
 * KEY MECHANISM (both scenarios):
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
  // Example 1: Simple case - clickable area not covered by backdrop
  const [menuState, setMenuState] = useState<{
    position: {x: number, y: number} | null,
    clickCount: number
  }>({
    position: null,
    clickCount: 0
  })
  
  // Example 2: Complex case - clickable tags covered by backdrop
  const [tagsMenuState, setTagsMenuState] = useState<{
    position: {x: number, y: number} | null,
    selectedTag: string | null
  }>({
    position: null,
    selectedTag: null
  })
  const tags = ['Tag A', 'Tag B', 'Tag C', 'Tag D', 'Tag E']
  
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

  /**
   * SCENARIO 2: When clickable elements are COVERED by backdrop
   * 
   * Problem: When menu is open, backdrop covers the tags, so their onContextMenu never fires
   * Solution: Handle right-clicks on backdrop and use document.elementFromPoint to detect tags underneath
   * 
   * Key technique:
   * 1. Temporarily disable pointer-events on backdrop
   * 2. Use document.elementFromPoint to find element underneath
   * 3. Restore pointer-events immediately
   * 4. Check if element is a tag and handle accordingly
   */
  const handleTagContextMenu = (e: React.MouseEvent, tagName: string) => {
    e.preventDefault()
    e.stopPropagation() // Prevent backdrop from handling this
    
    // Close existing menu first
    setTagsMenuState({ position: null, selectedTag: null })
    
    // Use requestAnimationFrame to ensure React completes unmount before remounting
    requestAnimationFrame(() => {
      setTagsMenuState({
        position: { x: e.clientX, y: e.clientY },
        selectedTag: tagName
      })
    })
  }

  const handleBackdropContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // CRUCIAL: Temporarily hide backdrop to find element underneath
    const backdrop = e.currentTarget as HTMLElement
    backdrop.style.pointerEvents = 'none'
    const clickedElement = document.elementFromPoint(e.clientX, e.clientY)
    backdrop.style.pointerEvents = ''
    
    // Check if we clicked on a tag
    const tagElement = clickedElement?.closest('[data-tag-name]')
    
    if (tagElement) {
      const tagName = tagElement.getAttribute('data-tag-name')
      if (tagName) {
        // Close existing menu first
        setTagsMenuState({ position: null, selectedTag: null })
        
        // Use requestAnimationFrame to ensure React completes unmount before remounting
        requestAnimationFrame(() => {
          setTagsMenuState({
            position: { x: e.clientX, y: e.clientY },
            selectedTag: tagName
          })
        })
      }
    } else {
      // Right-click outside tags - just close menu
      setTagsMenuState({ position: null, selectedTag: null })
    }
  }

  const handleTagItemClick = (item: any) => {
    setClickedItem(`Tag menu: ${item.name} on "${tagsMenuState.selectedTag}"`)
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 600, 
          marginBottom: '10px',
          color: '#2196F3'
        }}>
          Scenario 1: Simple Case (Clickable area NOT covered by backdrop)
        </div>
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
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 600, 
          marginBottom: '10px',
          color: '#ff9800'
        }}>
          Scenario 2: Complex Case (Tags covered by backdrop when menu is open)
        </div>
        <div style={{
          padding: '20px',
          border: '2px dashed #ff9800',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            Right-click on any tag to open menu. When menu is open, right-click on another tag:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <div
                key={tag}
                data-tag-name={tag}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'context-menu',
                  userSelect: 'none',
                  backgroundColor: tagsMenuState.selectedTag === tag ? '#ff9800' : 'white',
                  color: tagsMenuState.selectedTag === tag ? 'white' : '#333'
                }}
                onContextMenu={(e) => handleTagContextMenu(e, tag)}
              >
                {tag}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '12px', fontStyle: 'italic' }}>
            Selected: {tagsMenuState.selectedTag || 'None'}
          </div>
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
        backgroundColor: '#e8f5e9',
        border: '1px solid #4caf50',
        borderRadius: '4px',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        <strong>Common Pattern (both scenarios):</strong><br/>
        1. Close menu (set to null)<br/>
        2. Use requestAnimationFrame()<br/>
        3. Open at new position<br/>
        <br/>
        This prevents the classic bug where right-clicking an open menu doesn't reposition it.
      </div>

      <div style={{
        marginTop: '12px',
        padding: '12px',
        backgroundColor: '#fff3e0',
        border: '1px solid #ff9800',
        borderRadius: '4px',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        <strong>Additional for Scenario 2 (backdrop covers clickables):</strong><br/>
        1. Handle onContextMenu on Menu's backdrop<br/>
        2. Temporarily set backdrop.style.pointerEvents = 'none'<br/>
        3. Use document.elementFromPoint() to find element underneath<br/>
        4. Restore backdrop.style.pointerEvents = ''<br/>
        5. Check if found element is your target (e.g., .closest('[data-tag-name]'))<br/>
        <br/>
        This "sees through" the backdrop to detect what's underneath!
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

      {tagsMenuState.position && (
        <Menu
          items={[
            { type: 'item', name: 'Edit', data: { action: 'edit' } },
            { type: 'item', name: 'Delete', data: { action: 'delete' } },
            { type: 'item', name: 'Duplicate', data: { action: 'duplicate' } }
          ]}
          position={tagsMenuState.position}
          onClose={() => setTagsMenuState({ position: null, selectedTag: null })}
          onItemClick={handleTagItemClick}
          onContextMenu={handleBackdropContextMenu}
        />
      )}
    </div>
  )
}

export default MenuRightClickExample

