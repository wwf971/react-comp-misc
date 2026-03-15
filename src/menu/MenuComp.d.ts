import React from 'react'

export interface MenuCompItemBase {
  name: string
  component?: React.ComponentType<any>
  componentProps?: any
  preferredWidth?: number
  preferredHeight?: number
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

declare const MenuComp: React.FC<MenuCompProps>
export default MenuComp
