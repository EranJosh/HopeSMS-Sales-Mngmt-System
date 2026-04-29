// Stamp hidden when currentUser.user_type=USER in SalesListPage and SalesDetailPage. Sidebar: Deleted Items + Admin links hidden for USER.
// AppShell — Navbar with logout + SMS sidebar groups: Sales, Lookups, Reports, Admin, Deleted Items — Micole Kurt Gonda
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { supabase } from '../lib/supabaseClient'

const navLinkClass = ({ isActive }) =>
  `block px-3 py-2 rounded text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-600 text-white'
      : 'text-gray-700 hover:bg-gray-100'
  }`

export default function AppShell() {
  const { currentUser } = useAuth()
  const { rights } = useRights()

  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN'

  function handleLogout() {
    supabase.auth.signOut()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <span className="font-semibold text-gray-800 text-lg">Hope, Inc. SMS</span>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{currentUser?.username || currentUser?.email}</p>
            <p className="text-xs text-gray-400">{currentUser?.user_type}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 p-4 flex-shrink-0 overflow-y-auto">
          <nav className="space-y-5">
            {/* SALES */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">Sales</p>
              <NavLink to="/sales" className={navLinkClass}>Transactions</NavLink>
            </div>

            {/* LOOKUPS */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">Lookups</p>
              <div className="space-y-0.5">
                <NavLink to="/lookups/customers" className={navLinkClass}>Customers</NavLink>
                <NavLink to="/lookups/employees" className={navLinkClass}>Employees</NavLink>
                <NavLink to="/lookups/products" className={navLinkClass}>Products</NavLink>
                <NavLink to="/lookups/prices" className={navLinkClass}>Price History</NavLink>
              </div>
            </div>

            {/* REPORTS */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">Reports</p>
              <NavLink to="/reports" className={navLinkClass}>Reports</NavLink>
            </div>

            {/* ADMIN — only if ADM_USER right */}
            {rights.ADM_USER === 1 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">Admin</p>
                <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
              </div>
            )}

            {/* DELETED ITEMS — hidden from USER accounts */}
            {isAdmin && (
              <div>
                <NavLink to="/deleted-items" className={navLinkClass}>Deleted Items</NavLink>
              </div>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
