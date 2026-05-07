// Stamp hidden when currentUser.user_type=USER in SalesListPage and SalesDetailPage. Sidebar: Deleted Items + Admin links hidden for USER.
// AppShell -- Sidebar navigation with icons + top header -- Micole Kurt Gonda
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { supabase } from '../lib/supabaseClient'

const IconReceipt = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </svg>
)

const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
)

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconBox = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const IconTag = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

const IconChartBar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const IconCog = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
)

const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
)

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

function SidebarLink({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 text-sm transition-colors duration-150 cursor-pointer ${
          isActive ? 'font-semibold' : 'hover:bg-white/[0.03]'
        }`
      }
      style={({ isActive }) => ({
        padding: '8px 20px',
        color: isActive ? '#00ff88' : '#2a5a7e',
        borderLeft: isActive ? '2px solid #00ff88' : '2px solid transparent',
        backgroundColor: isActive ? 'rgba(0,255,136,0.06)' : undefined,
        boxShadow: isActive ? 'inset 0 0 20px rgba(0,255,136,0.03)' : undefined,
      })}
      onMouseEnter={e => { if (!e.currentTarget.classList.contains('font-semibold')) e.currentTarget.style.color = '#c8dff5' }}
      onMouseLeave={e => { if (!e.currentTarget.classList.contains('font-semibold')) e.currentTarget.style.color = '#2a5a7e' }}
    >
      <span className="flex-shrink-0 opacity-80">{icon}</span>
      {children}
    </NavLink>
  )
}

function UserBadge({ type }) {
  const map = {
    SUPERADMIN: { bg: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' },
    ADMIN:      { bg: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' },
    USER:       { bg: 'rgba(77,122,158,0.12)', color: '#4d7a9e', border: '1px solid rgba(77,122,158,0.2)' },
  }
  const s = map[type] || map.USER
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color, border: s.border, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em' }}
    >
      {type}
    </span>
  )
}

const sectionLabel = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: '#2d5068',
  padding: '0 20px',
  marginBottom: '2px',
  display: 'block',
  fontFamily: "'Rajdhani', sans-serif",
}

export default function AppShell() {
  const { currentUser } = useAuth()
  const { rights } = useRights()
  const location = useLocation()

  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN'

  function handleLogout() {
    supabase.auth.signOut()
  }

  const displayName = currentUser?.username || currentUser?.email || ''
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#050a0f' }}>

      {/* Left Sidebar */}
      <aside
        className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          width: '240px',
          backgroundColor: '#060c18',
          borderRight: '1px solid rgba(0,229,255,0.06)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Brand mark */}
        <div
          className="px-5 py-4 flex items-center gap-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,229,255,0.06)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs"
            style={{
              backgroundColor: 'rgba(0,255,136,0.12)',
              color: '#00ff88',
              border: '1px solid rgba(0,255,136,0.25)',
              boxShadow: '0 0 12px rgba(0,255,136,0.15)',
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div className="leading-tight">
            <p className="font-bold text-sm tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif" }}>Hope, Inc.</p>
            <p className="text-xs" style={{ color: '#1e3a52', letterSpacing: '0.06em' }}>Sales Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 space-y-5 overflow-y-auto">
          <div>
            <span style={sectionLabel}>Overview</span>
            <div className="space-y-0.5 mt-1">
              <SidebarLink to="/dashboard" icon={<IconGrid />}>Dashboard</SidebarLink>
            </div>
          </div>

          <div>
            <span style={sectionLabel}>Sales</span>
            <div className="space-y-0.5 mt-1">
              <SidebarLink to="/sales" icon={<IconReceipt />}>Transactions</SidebarLink>
            </div>
          </div>

          <div>
            <span style={sectionLabel}>Lookups</span>
            <div className="space-y-0.5 mt-1">
              <SidebarLink to="/lookups/customers" icon={<IconUsers />}>Customers</SidebarLink>
              <SidebarLink to="/lookups/employees" icon={<IconUser />}>Employees</SidebarLink>
              <SidebarLink to="/lookups/products" icon={<IconBox />}>Products</SidebarLink>
              <SidebarLink to="/lookups/prices" icon={<IconTag />}>Price History</SidebarLink>
            </div>
          </div>

          <div>
            <span style={sectionLabel}>Analytics</span>
            <div className="space-y-0.5 mt-1">
              <SidebarLink to="/reports" icon={<IconChartBar />}>Reports</SidebarLink>
            </div>
          </div>

          {(rights.ADM_USER === 1 || isAdmin) && (
            <div>
              <span style={sectionLabel}>System</span>
              <div className="space-y-0.5 mt-1">
                {rights.ADM_USER === 1 && (
                  <SidebarLink to="/admin" icon={<IconCog />}>Admin</SidebarLink>
                )}
                {isAdmin && (
                  <SidebarLink to="/deleted-items" icon={<IconTrash />}>Deleted Items</SidebarLink>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* User footer */}
        <div
          className="flex-shrink-0 px-4 py-3 flex items-center gap-2.5"
          style={{ borderTop: '1px solid rgba(0,229,255,0.06)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: 'rgba(0,255,136,0.1)',
              color: '#00ff88',
              border: '1px solid rgba(0,255,136,0.2)',
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate leading-tight" style={{ color: '#c8dff5' }}>
              {currentUser?.username || currentUser?.email}
            </p>
            <div className="mt-0.5">
              <UserBadge type={currentUser?.user_type} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex-shrink-0 transition-colors duration-150 cursor-pointer p-1 rounded"
            style={{ color: '#1e3a52' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff4d6a'}
            onMouseLeave={e => e.currentTarget.style.color = '#1e3a52'}
          >
            <IconLogout />
          </button>
        </div>
      </aside>

      {/* Content column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex-shrink-0 px-6 h-14 flex items-center justify-between"
          style={{
            backgroundColor: '#080f1c',
            borderBottom: '1px solid rgba(0,229,255,0.06)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
          }}
        >
          <p className="text-sm font-bold text-white lg:hidden" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Hope, Inc. SMS</p>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight" style={{ color: '#c8dff5' }}>
                {currentUser?.username || currentUser?.email}
              </p>
              <p className="text-xs leading-tight" style={{ color: '#1e3a52' }}>{currentUser?.email}</p>
            </div>
            <UserBadge type={currentUser?.user_type} />
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold transition-colors duration-150 cursor-pointer"
              style={{
                borderRadius: '6px',
                border: '1px solid rgba(255,77,106,0.2)',
                color: '#ff4d6a',
                backgroundColor: 'rgba(255,77,106,0.06)',
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '0.05em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.14)'
                e.currentTarget.style.borderColor = 'rgba(255,77,106,0.35)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.06)'
                e.currentTarget.style.borderColor = 'rgba(255,77,106,0.2)'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto" style={{ backgroundColor: '#050a0f' }}>
          <div
            key={location.pathname}
            className="p-6"
            style={{ animation: 'fadeInUp 0.38s ease-out' }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
