export const generateOptionConfig = (type, count = 3) =>
  Array.from({ length: count }, (v, k) => k + 1).map(i => {
    const selectedKey = type === 'checkbox' ? 'checked' : 'selected'
    return {
      label: [
        'labelCount',
        {
          label: type,
          count: i,
        },
      ],
      value: `${type}-${i}`,
      [selectedKey]: !i,
    }
  })
