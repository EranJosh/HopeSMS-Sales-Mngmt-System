// SUPERADMIN guard: all action buttons disabled and greyed on rows where targetUser.user_type===SUPERADMIN regardless of who is logged in; tooltip shown on hover
// Admin sidebar link gated: visible only when rights.ADM_USER === 1
// AdminPage UI -- userId, username, user_type, record_status table; Activate/Deactivate per row; SUPERADMIN rows fully disabled and greyed with tooltip -- Micole Kurt Gonda
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useRights } from '../context/UserRightsContext'
import { useAuth } from '../context/AuthContext'
import { getUsers, activateUser, deactivateUser } from '../services/adminService'

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
    setActioning(userId)
    try {
      if (action === 'activate') await activateUser(userId)
      else await deactivateUser(userId)
      await fetchUsers()
    } catch (err) {
      alert('Action failed: ' + err.message)
    } finally {
      setActioning(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="rounded-full animate-spin" style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#00ff88', borderTopColor: 'transparent', boxShadow: '0 0 12px rgba(0,255,136,0.3)' }} />
      </div>
    )
  }
  if (error) {
    return <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>{error}</div>
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-0.5">
          <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>User Administration</h1>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, backgroundColor: 'rgba(0,229,255,0.07)', color: '#3a6882', border: '1px solid rgba(0,229,255,0.12)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>{users.length} users</span>
        </div>
        <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>Manage user accounts and access levels</p>
      </div>

      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={TH_STYLE}>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Username</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Name</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Email</th>
                <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Role</th>
                <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Status</th>
                <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <span className="text-sm" style={{ color: '#1e3a52' }}>No users found</span>
                  </td>
                </tr>
              ) : users.map((u, i) => {
                const isSuperadmin = u.user_type === 'SUPERADMIN'
                const isCurrentUser = u.userid === currentUser?.id
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
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ ...typeStyle, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em' }}>
                        {u.user_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ ...statusStyle, fontFamily: "'Rajdhani', sans-serif" }}>
                        {u.record_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isSuperadmin ? (
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
            <span className="font-bold" style={{ color: '#4d7a9e' }}>{users.length}</span> user{users.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
