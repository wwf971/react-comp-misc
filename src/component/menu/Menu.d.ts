import React from 'react'

export interface MenuItemBase {
  id: string
  label?: React.ReactNode
  isDisabled?: boolean
  data?: any
}

export interface MenuItemSingle extends MenuItemBase {
  children?: never
}

export interface MenuItemSubmenu extends MenuItemBase {
  children: MenuItem[]
}

export type MenuItem = MenuItemSingle | MenuItemSubmenu

interface MenuProps {
  data?: {
    items?: MenuItem[]
    position?: { x: number; y: number }
    emptyText?: string
  }
  config?: {
    minWidth?: number
    className?: string
  }
  onEvent?: (eventType: string, eventData: any) => void
}

declare const Menu: React.FC<MenuProps>
export default Menu
