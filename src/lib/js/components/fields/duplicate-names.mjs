// Only an explicit attrs.name can collide: generated names include the field id.
// The renderer submits attrs.name verbatim and userData only drops a checkbox group's [] suffix,
// so the key is compared the same way, without trimming.
export const fieldNameKey = name => String(name ?? '').replace(/\[\]$/, '')

export const duplicateNameIds = entries => {
  const idsByName = new Map()
  for (const [id, name] of entries) {
    const key = fieldNameKey(name)
    if (key) {
      idsByName.set(key, [...(idsByName.get(key) ?? []), id])
    }
  }
  return new Set([...idsByName.values()].filter(ids => ids.length > 1).flat())
}
