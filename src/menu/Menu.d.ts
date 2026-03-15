import React from 'react'

export interface MenuItemBase {
  name: string
  data?: any
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

declare const Menu: React.FC<MenuProps>
export default Menu
