import React from 'react'

export interface MenuCompItemBase {
  id?: string
  label?: React.ReactNode
  name?: React.ReactNode
  component?: React.ComponentType<any>
  componentProps?: any
  preferredWidth?: number
  preferredHeight?: number
  data?: any
  disabled?: boolean
  isDisabled?: boolean
}

export interface MenuCompItemSingle extends MenuCompItemBase {
  type: 'item'
}

export interface MenuCompItemSubmenu extends MenuCompItemBase {
  type: 'menu'
  children: MenuCompItem[]
}

export type MenuCompItem = MenuCompItemSingle | MenuCompItemSubmenu

export interface MenuCompProps {
  data?: {
    items?: MenuCompItem[]
    position?: { x: number; y: number }
    emptyText?: string
  }
  config?: {
    minWidth?: number
    className?: string
  }
  onEvent?: (eventType: string, eventData: any) => void
}

declare const MenuComp: React.FC<MenuCompProps>
export default MenuComp
