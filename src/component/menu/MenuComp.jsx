import React from 'react'
import MenuContext from './MenuContext.jsx'

const normalizeLegacyItem = (item) => ({
  ...item,
  id: item.id ?? item.name,
  label: item.label ?? item.name,
  isDisabled: Boolean(item.isDisabled || item.disabled),
  children: Array.isArray(item.children) ? item.children.map(normalizeLegacyItem) : undefined,
})

const MenuComp = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const menuData = {
    ...data,
    items: Array.isArray(data?.items) ? data.items.map(normalizeLegacyItem) : [],
  }

  return (
    <MenuContext
      data={menuData}
      config={config}
      onEvent={onEvent}
    />
  )
}

export default MenuComp

