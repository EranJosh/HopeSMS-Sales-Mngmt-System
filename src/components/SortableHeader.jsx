const ALIGN_MAP = { left: 'justify-start', right: 'justify-end', center: 'justify-center' }

export default function SortableHeader({ label, field, sortField, sortDir, onSort, className = '', style = {}, align = 'left' }) {
  const isActive = sortField === field
  const icon = isActive ? (sortDir === 'asc' ? '↑' : '↓') : '↕'
  const iconColor = isActive ? '#00ff88' : '#2d5068'
  const justify = ALIGN_MAP[align] || 'justify-start'

  return (
    <th
      className={`cursor-pointer select-none transition-colors duration-150 ${className}`}
      style={{ ...style }}
      onClick={() => onSort(field)}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.03)' }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = style.backgroundColor || '#0d1f36' }}
    >
      <span className={`flex items-center gap-1 ${justify}`}>
        <span>{label}</span>
        <span style={{ color: iconColor, fontSize: 9, fontWeight: 700, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      </span>
    </th>
  )
}
