// Stamp hidden when currentUser.user_type=USER in SalesListPage and SalesDetailPage. Sidebar: Deleted Items + Admin links hidden for USER.
// AppShell — Sidebar navigation with icons + top header — Micole Kurt Gonda
import { Outlet, NavLink } from 'react-router-dom'
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
          isActive
            ? 'text-emerald-400 font-medium'
            : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-white/[0.04]'
        }`
      }
      style={({ isActive }) => ({
        padding: '8px 20px',
        borderLeft: isActive ? '2px solid #10b981' : '2px solid transparent',
        backgroundColor: isActive ? 'rgba(16,185,129,0.08)' : undefined,
      })}
    >
      <span className="flex-shrink-0 opacity-80">{icon}</span>
      {children}
    </NavLink>
  )
}

function UserBadge({ type }) {
  const map = {
    SUPERADMIN: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' },
    ADMIN:      { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' },
    USER:       { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' },
  }
  const s = map[type] || map.USER
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color, border: s.border }}
    >
      {type}
    </span>
  )
}

const sectionLabel = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#30363d',
  padding: '0 20px',
  marginBottom: '2px',
  display: 'block',
}

export default function AppShell() {
  const { currentUser } = useAuth()
  const { rights } = useRights()

  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN'

  function handleLogout() {
    supabase.auth.signOut()
  }

  const displayName = currentUser?.username || currentUser?.email || ''
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>

      {/* Left Sidebar */}
      <aside
        className="flex-shrink-0 flex flex-col overflow-hidden border-r"
        style={{ width: '240px', backgroundColor: '#0d1117', borderColor: '#1c2333' }}
      >
        {/* Brand mark */}
        <div
          className="px-5 py-4 flex items-center gap-3 flex-shrink-0"
          style={{ borderBottom: '1px solid #1c2333' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs"
            style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            H
          </div>
          <div className="leading-tight">
            <p className="text-white font-semibold text-sm tracking-tight">Hope, Inc.</p>
            <p className="text-xs" style={{ color: '#484f58' }}>Sales Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 space-y-5 overflow-y-auto">
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
          style={{ borderTop: '1px solid #1c2333' }}
        >
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate leading-tight">
              {currentUser?.username || currentUser?.email}
            </p>
            <div className="mt-0.5">
              <UserBadge type={currentUser?.user_type} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex-shrink-0 transition-colors cursor-pointer p-1 rounded"
            style={{ color: '#484f58' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = '#484f58'}
          >
            <IconLogout />
          </button>
        </div>
      </aside>

      {/* Content column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="bg-white border-b flex-shrink-0 px-6 h-14 flex items-center justify-between"
          style={{ borderColor: '#e2e8f0', boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}
        >
          <p className="text-sm font-semibold text-slate-800 lg:hidden">Hope, Inc. SMS</p>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700 leading-tight">
                {currentUser?.username || currentUser?.email}
              </p>
              <p className="text-xs text-slate-400 leading-tight">{currentUser?.email}</p>
            </div>
            <UserBadge type={currentUser?.user_type} />
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium border text-slate-600 transition-all duration-150 cursor-pointer"
              style={{ borderRadius: '6px', borderColor: '#e2e8f0' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#fecaca'
                e.currentTarget.style.color = '#dc2626'
                e.currentTarget.style.backgroundColor = '#fef2f2'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.color = '#475569'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto" style={{ backgroundColor: '#f8fafc' }}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
