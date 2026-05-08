import { useState, useMemo } from 'react'

export default function useSortableTable(data, defaultField = null, defaultDir = null) {
  const [sortField, setSortField] = useState(defaultField)
  const [sortDir, setSortDir] = useState(defaultDir)

  function handleSort(field) {
    if (sortField !== field) {
      setSortField(field)
      setSortDir('asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
    } else {
      setSortField(null)
      setSortDir(null)
    }
  }

  const sortedData = useMemo(() => {
    if (!sortField || !sortDir) return data
    return [...data].sort((a, b) => {
      const va = a[sortField]
      const vb = b[sortField]
      if (va == null && vb == null) return 0
      if (va == null) return sortDir === 'asc' ? -1 : 1
      if (vb == null) return sortDir === 'asc' ? 1 : -1
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va
      }
      const sa = String(va), sb = String(vb)
      const cmp = sa.localeCompare(sb, undefined, { numeric: true, sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortField, sortDir])

  return { sortedData, sortField, sortDir, handleSort }
}
