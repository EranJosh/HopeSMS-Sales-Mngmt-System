// SUPERADMIN guard: all action buttons disabled and greyed on rows where targetUser.user_type===SUPERADMIN regardless of who is logged in; tooltip shown on hover
// Admin sidebar link gated: visible only when rights.ADM_USER === 1
// AdminPage UI -- userId, username, user_type, record_status table; Activate/Deactivate per row; SUPERADMIN rows fully disabled and greyed with tooltip -- Micole Kurt Gonda
// Feature: role management — SUPERADMIN can change USER↔ADMIN; ADMIN cannot change roles
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useRights } from '../context/UserRightsContext'
import { useAuth } from '../context/AuthContext'
import { getUsers, activateUser, deactivateUser, changeUserRole } from '../services/adminService'
import useSortableTable from '../hooks/useSortableTable'
import SortableHeader from '../components/SortableHeader'
import LoadingSpinner from '../components/LoadingSpinner'

const CARD_STYLE = {
  backgroundColor: '#0a1628',
  border: '1px solid rgba(0,229,255,0.08)',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
}

const TH_STYLE = { backgroundColor: '#0d1f36', borderBottom: '1px solid rgba(0,229,255,0.08)' }
const TH_TEXT = { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }

const TYPE_STYLE = {
  SUPERADMIN: { backgroundColor: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' },
  ADMIN:      { backgroundColor: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' },
  USER:       { backgroundColor: 'rgba(77,122,158,0.12)', color: '#4d7a9e', border: '1px solid rgba(77,122,158,0.2)' },
}

const STATUS_STYLE = {
  ACTIVE:   { backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' },
  INACTIVE: { backgroundColor: 'rgba(255,77,106,0.08)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)' },
}

function RoleConfirmDialog({ username, newRole, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(5,10,15,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm mx-4 p-6 rounded-2xl"
        style={{
          backgroundColor: '#0a1628',
          border: '1px solid rgba(0,229,255,0.12)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        <h3 className="font-bold text-base mb-2" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif" }}>
          Confirm Role Change
        </h3>
        <p className="text-sm mb-5" style={{ color: '#4d7a9e' }}>
          Change <span style={{ color: '#c8dff5', fontWeight: 600 }}>{username}</span>'s role to{' '}
          <span style={{ color: newRole === 'ADMIN' ? '#00e5ff' : '#4d7a9e', fontWeight: 700 }}>{newRole}</span>?
          {newRole === 'ADMIN' && (
            <span style={{ color: '#2a5a7e', display: 'block', marginTop: 6, fontSize: 12 }}>
              This will grant full admin module rights.
            </span>
          )}
          {newRole === 'USER' && (
            <span style={{ color: '#2a5a7e', display: 'block', marginTop: 6, fontSize: 12 }}>
              This will revoke add, edit, delete, and admin rights.
            </span>
          )}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#2a5a7e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.06)'; e.currentTarget.style.color = '#00e5ff' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2a5a7e' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer"
            style={{
              backgroundColor: newRole === 'ADMIN' ? 'rgba(0,229,255,0.12)' : 'rgba(255,210,77,0.12)',
              color: newRole === 'ADMIN' ? '#00e5ff' : '#ffd24d',
              border: newRole === 'ADMIN' ? '1px solid rgba(0,229,255,0.25)' : '1px solid rgba(255,210,77,0.25)',
              fontFamily: "'Rajdhani', sans-serif",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { rights } = useRights()
  const { currentUser } = useAuth()

  if (rights.ADM_USER !== 1) {
    return <Navigate to="/sales" replace />
  }

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actioning, setActioning] = useState(null)
  const [roleChanging, setRoleChanging] = useState(null)
  const [pendingRole, setPendingRole] = useState(null)
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const isSuperAdmin = currentUser?.user_type === 'SUPERADMIN'

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      setUsers(await getUsers())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  async function handleAction(userId, action) {
    const targetUser = users.find(u => u.userid === userId)
    setActioning(userId)
    try {
      if (action === 'activate') {
        await activateUser(userId, currentUser)
        toast.success(`${targetUser?.username || userId} has been activated`)
      } else {
        await deactivateUser(userId, currentUser)
        toast.success(`${targetUser?.username || userId} has been deactivated`)
      }
      await fetchUsers()
    } catch (err) {
      toast.error('Failed to update user. Please try again.')
    } finally {
      setActioning(null)
    }
  }

  async function handleRoleConfirm() {
    if (!pendingRole) return
    const { userId, username, newRole } = pendingRole
    setRoleChanging(userId)
    setPendingRole(null)
    try {
      await changeUserRole(userId, newRole, currentUser)
      toast.success(`${username} role changed to ${newRole}`)
      await fetchUsers()
    } catch (err) {
      toast.error('Failed to change role. Please try again.')
    } finally {
      setRoleChanging(null)
    }
  }

  const filteredUsers = users.filter(u =>
    !search ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const { sortedData: sortedUsers, sortField, sortDir, handleSort } = useSortableTable(filteredUsers)
  const SH = { className: 'px-5 py-3.5 text-xs uppercase tracking-widest', style: { ...TH_TEXT, backgroundColor: '#0d1f36' } }

  if (loading) return <LoadingSpinner message="Loading users..." />
  if (error) return <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>User Administration</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, backgroundColor: 'rgba(0,229,255,0.07)', color: '#3a6882', border: '1px solid rgba(0,229,255,0.12)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
              {search ? `${filteredUsers.length} of ${users.length}` : users.length} users
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>Manage user accounts and access levels</p>
        </div>
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={searchFocused ? '#00ff88' : '#1e3a52'} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm rounded-lg outline-none"
            style={searchFocused
              ? { backgroundColor: '#070f1e', border: '1px solid rgba(0,255,136,0.4)', color: '#c8dff5', boxShadow: '0 0 0 3px rgba(0,255,136,0.07)', minWidth: 240 }
              : { backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.12)', color: '#c8dff5', minWidth: 240 }
            }
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={TH_STYLE}>
                <SortableHeader label="Username" field="username" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Name</th>
                <SortableHeader label="Email" field="email" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                <SortableHeader label="Role" field="user_type" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="center" />
                <SortableHeader label="Status" field="record_status" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="center" />
                <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="text-4xl mb-3">👤</div>
                    <p className="font-medium" style={{ color: '#3a6882' }}>No users found</p>
                    <p className="text-sm mt-1" style={{ color: '#2a5a7e' }}>Try a different search term</p>
                  </td>
                </tr>
              ) : sortedUsers.map((u, i) => {
                const isTargetSuperadmin = u.user_type === 'SUPERADMIN'
                const isCurrentUser = u.userid === currentUser?.userid || u.userid === currentUser?.id
                const typeStyle = TYPE_STYLE[u.user_type] || TYPE_STYLE.USER
                const statusStyle = STATUS_STYLE[u.record_status] || {}
                return (
                  <tr
                    key={u.userid}
                    className="transition-colors duration-100"
                    style={{ borderBottom: '1px solid rgba(0,229,255,0.04)', animation: 'fadeInLeft 0.3s ease-out forwards', animationDelay: `${0.05 + i * 0.04}s`, opacity: 0 }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-5 py-3.5 font-semibold" style={{ color: '#c8dff5' }}>{u.username}</td>
                    <td className="px-5 py-3.5" style={{ color: '#6a90aa' }}>{u.lastname}, {u.firstname}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#4d7a9e' }}>{u.email}</td>
                    <td className="px-5 py-3.5 text-center">
                      {isTargetSuperadmin ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ ...typeStyle, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em' }}>
                          SUPERADMIN
                        </span>
                      ) : isSuperAdmin && !isCurrentUser ? (
                        /* SUPERADMIN can change roles via dropdown */
                        <select
                          value={u.user_type}
                          disabled={roleChanging === u.userid}
                          onChange={e => {
                            const newRole = e.target.value
                            if (newRole !== u.user_type) {
                              setPendingRole({ userId: u.userid, username: u.username, newRole })
                            }
                          }}
                          className="text-xs font-bold px-2 py-1 rounded-lg cursor-pointer"
                          style={{
                            backgroundColor: '#0d1f36',
                            border: '1px solid rgba(0,229,255,0.18)',
                            color: u.user_type === 'ADMIN' ? '#00e5ff' : '#4d7a9e',
                            fontFamily: "'Rajdhani', sans-serif",
                            letterSpacing: '0.05em',
                            opacity: roleChanging === u.userid ? 0.5 : 1,
                          }}
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        /* ADMIN logged in — show badge only, no dropdown */
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ ...typeStyle, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em' }}>
                          {u.user_type}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ ...statusStyle, fontFamily: "'Rajdhani', sans-serif" }}>
                        {u.record_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isTargetSuperadmin ? (
                        <span className="text-xs italic font-medium" title="SUPERADMIN accounts cannot be modified" style={{ color: '#1e3a52' }}>Protected</span>
                      ) : isCurrentUser ? (
                        <span className="text-xs italic font-medium" style={{ color: '#1e3a52' }}>Current user</span>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAction(u.userid, 'activate')}
                            disabled={actioning === u.userid || u.record_status === 'ACTIVE'}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
                            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.15)' }}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.08)'}
                          >
                            {actioning === u.userid ? '...' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleAction(u.userid, 'deactivate')}
                            disabled={actioning === u.userid || u.record_status === 'INACTIVE'}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            style={{ backgroundColor: 'rgba(255,77,106,0.08)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
                            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.15)' }}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.08)'}
                          >
                            {actioning === u.userid ? '...' : 'Deactivate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center" style={{ borderTop: '1px solid rgba(0,229,255,0.05)', backgroundColor: '#0d1f36' }}>
          <span className="text-xs font-medium" style={{ color: '#1e3a52' }}>
            {search
              ? <><span className="font-bold" style={{ color: '#4d7a9e' }}>{filteredUsers.length}</span> of <span className="font-bold" style={{ color: '#4d7a9e' }}>{users.length}</span> users</>
              : <><span className="font-bold" style={{ color: '#4d7a9e' }}>{users.length}</span> user{users.length !== 1 ? 's' : ''}</>
            }
          </span>
        </div>
      </div>

      {pendingRole && (
        <RoleConfirmDialog
          username={pendingRole.username}
          newRole={pendingRole.newRole}
          onConfirm={handleRoleConfirm}
          onCancel={() => setPendingRole(null)}
        />
      )}
    </div>
  )
}
