export default function Modal({ title, onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`w-full ${maxWidth} overflow-hidden`}
        style={{
          backgroundColor: '#0a1628',
          border: '1px solid rgba(0,229,255,0.12)',
          borderRadius: '14px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,229,255,0.04), 0 0 40px rgba(0,255,136,0.04)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(0,229,255,0.07)', backgroundColor: '#0d1f36' }}
        >
          <h2 className="text-sm font-semibold tracking-wide" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '15px', fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ border: '1px solid rgba(0,229,255,0.1)', color: '#2a5a7e' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.1)'
              e.currentTarget.style.borderColor = 'rgba(255,77,106,0.2)'
              e.currentTarget.style.color = '#ff4d6a'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(0,229,255,0.1)'
              e.currentTarget.style.color = '#2a5a7e'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
