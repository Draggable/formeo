import Sortable from 'sortablejs'

/**
 * Destroy every Sortable instance on root or its descendants
 * @param {Element|null} root
 * @return {Number} how many instances were destroyed
 */
export const destroySortables = root => {
  if (!root) {
    return 0
  }
  let count = 0
  for (const el of [root, ...root.querySelectorAll('*')]) {
    const sortable = Sortable.get(el)
    if (sortable) {
      sortable.destroy()
      count++
    }
  }
  return count
}
