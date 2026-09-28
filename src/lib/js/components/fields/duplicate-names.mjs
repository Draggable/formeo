// Only an explicit attrs.name can collide: generated names include the field id.
export const fieldNameKey = name =>
  String(name ?? '')
    .trim()
    .replace(/\[\]$/, '')

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
