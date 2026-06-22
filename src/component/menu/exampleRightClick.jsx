/*
use this exmample as reference, when you cannot implement the "right-click after right-click" behavior correctly.
*/

import React, { useRef, useState } from 'react'
import MenuComp from './MenuComp.jsx'
import './Menu.css'

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

const MenuRightClickExample = () => {
  const simpleRegionRef = useRef(null)
  const tagsRegionRef = useRef(null)
  const [menuState, setMenuState] = useState({
    posOpen: null,
    clickCount: 0,
  })
  const [tagsMenuState, setTagsMenuState] = useState({
    posOpen: null,
    selectedTag: null,
  })
  const tags = ['Tag A', 'Tag B', 'Tag C', 'Tag D', 'Tag E']
  const [clickedItem, setClickedItem] = useState('')

  const getMenuItems = (clickCount, posOpen) => [
    {
      id: 'position',
      label: `X: ${posOpen.x}, Y: ${posOpen.y}`,
      data: { action: 'position', count: clickCount },
    },
    {
      id: 'click-count',
      label: `Click #${clickCount}`,
      data: { action: 'clickCount', count: clickCount },
    },
    {
      id: 'submenu',
      label: `Submenu (Click #${clickCount})`,
      children: [
        { id: 'sub-a', label: 'Sub Action A', data: { action: 'subA', count: clickCount } },
        { id: 'sub-b', label: 'Sub Action B', data: { action: 'subB', count: clickCount } },
      ],
    },
    { id: 'close', label: 'Close Menu', data: { action: 'close' } },
  ]

  const handleContextMenu = (event) => {
    event.preventDefault()
    const newClickCount = menuState.clickCount + 1
    setMenuState({ posOpen: null, clickCount: newClickCount })
    requestAnimationFrame(() => {
      setMenuState({
        posOpen: { x: event.clientX, y: event.clientY },
        clickCount: newClickCount,
      })
    })
  }

  const handleItemClick = (item) => {
    setClickedItem(`${item.label} - Action: ${item.data?.action}`)
  }

  const handleClose = () => {
    setMenuState((prev) => ({ ...prev, posOpen: null }))
  }

  const handleTagContextMenu = (event, tagName) => {
    event.preventDefault()
    event.stopPropagation()
    setTagsMenuState({ posOpen: null, selectedTag: null })
    requestAnimationFrame(() => {
      setTagsMenuState({
        posOpen: { x: event.clientX, y: event.clientY },
        selectedTag: tagName,
      })
    })
  }

  const handleBackdropContextMenu = (event) => {
    event.preventDefault()
    const backdrop = event.currentTarget
    backdrop.style.pointerEvents = 'none'
    const clickedEl = document.elementFromPoint(event.clientX, event.clientY)
    backdrop.style.pointerEvents = ''
    const tagElement = clickedEl?.closest?.('[data-tag-name]')
    if (tagElement) {
      const tagName = tagElement.getAttribute('data-tag-name')
      if (tagName) {
        setTagsMenuState({ posOpen: null, selectedTag: null })
        requestAnimationFrame(() => {
          setTagsMenuState({
            posOpen: { x: event.clientX, y: event.clientY },
            selectedTag: tagName,
          })
        })
      }
    } else {
      setTagsMenuState({ posOpen: null, selectedTag: null })
    }
  }

  const handleTagItemClick = (item) => {
    setClickedItem(`Tag menu: ${item.label} on "${tagsMenuState.selectedTag}"`)
  }

  return (
    <div className="menu-example-section">
      <div className="menu-example-title">Right-click repositioning</div>
      <div className="menu-example-note">
        When a menu is already open, close it first, then reopen on the next animation frame.
        Without this pattern, right-clicking again often leaves stale position or duplicate menus.
      </div>

      <div className="menu-example-subsection">
        <div className="menu-example-subsection-title">Scenario 1: open region not covered by backdrop</div>
        <div className="menu-example-note">
          Right-click to open. Right-click again while open to reposition. Menu content updates with each click count.
        </div>
        <div
          ref={simpleRegionRef}
          data-menu-example-region="right-click-simple"
          className="menu-example-region menu-example-region-scenario-simple"
          onContextMenu={handleContextMenu}
        >
          <div className="menu-example-region-text">Right-click anywhere in this region</div>
        </div>
      </div>

      <div className="menu-example-subsection">
        <div className="menu-example-subsection-title">Scenario 2: clickables covered by backdrop</div>
        <div className="menu-example-note">
          Handle backdropContextMenu, temporarily disable backdrop pointer events, use elementFromPoint
          to find the tag under the cursor, then reopen the menu on that tag.
        </div>
        <div
          ref={tagsRegionRef}
          data-menu-example-region="right-click-tags"
          className="menu-example-region menu-example-region-scenario-tags"
        >
          <div className="menu-example-region-text">Right-click a tag. While menu is open, right-click another tag.</div>
          <div className="menu-example-tag-list">
            {tags.map((tag) => (
              <div
                key={tag}
                data-tag-name={tag}
                className={`menu-example-tag ${tagsMenuState.selectedTag === tag ? 'is-selected' : ''}`.trim()}
                onContextMenu={(event) => handleTagContextMenu(event, tag)}
              >
                {tag}
              </div>
            ))}
          </div>
          <div className="menu-example-tag-status">
            Selected: {tagsMenuState.selectedTag || 'None'}
          </div>
        </div>
      </div>

      {clickedItem ? (
        <div className="menu-example-action-result">Last action: {clickedItem}</div>
      ) : null}

      {menuState.posOpen ? (
        <MenuComp
          data={{ items: getMenuItems(menuState.clickCount, menuState.posOpen) }}
          config={{ isOpen: true, posOpen: menuState.posOpen }}
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
              handleScopedBackdropContextMenu(eventData.event, simpleRegionRef, handleClose, handleContextMenu)
            }
          }}
        />
      ) : null}

      {tagsMenuState.posOpen ? (
        <MenuComp
          data={{
            items: [
              { id: 'edit', label: 'Edit', data: { action: 'edit' } },
              { id: 'delete', label: 'Delete', data: { action: 'delete' } },
              { id: 'duplicate', label: 'Duplicate', data: { action: 'duplicate' } },
            ],
          }}
          config={{ isOpen: true, posOpen: tagsMenuState.posOpen }}
          onEvent={(eventType, eventData) => {
            if (eventType === 'closeRequest') {
              setTagsMenuState({ posOpen: null, selectedTag: null })
              return
            }
            if (eventType === 'itemClick') {
              handleTagItemClick(eventData.item)
              return
            }
            if (eventType === 'backdropContextMenu') {
              if (isPointInsideElement(tagsRegionRef.current, eventData.event)) {
                handleBackdropContextMenu(eventData.event)
                return
              }
              setTagsMenuState({ posOpen: null, selectedTag: null })
              forwardContextMenuToAnotherRegion(eventData.event)
            }
          }}
        />
      ) : null}
    </div>
  )
}

export default MenuRightClickExample
