// SUPERADMIN guard: all action buttons disabled and greyed on rows where targetUser.user_type===SUPERADMIN regardless of who is logged in; tooltip shown on hover
// Admin sidebar link gated: visible only when rights.ADM_USER === 1
// AdminPage UI -- userId, username, user_type, record_status table; Activate/Deactivate per row; SUPERADMIN rows fully disabled and greyed with tooltip -- Micole Kurt Gonda
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useRights } from '../context/UserRightsContext'
import { useAuth } from '../context/AuthContext'
import { getUsers, activateUser, deactivateUser } from '../services/adminService'

const CARD_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)',
}

const TYPE_STYLE = {
  SUPERADMIN: { backgroundColor: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.2)' },
  ADMIN:      { backgroundColor: 'rgba(59,130,246,0.1)',  color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)' },
  USER:       { backgroundColor: 'rgba(100,116,139,0.1)', color: '#475569', border: '1px solid rgba(100,116,139,0.2)' },
}

const STATUS_STYLE = {
  ACTIVE:   { backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' },
  INACTIVE: { backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
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
        <div className="rounded-full animate-spin" style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#10b981', borderTopColor: 'transparent' }} />
      </div>
    )
  }
  if (error) {
    return <div className="px-4 py-3 rounded-xl text-red-700 text-sm font-medium" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>{error}</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Administration</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage user accounts and access levels</p>
      </div>

      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Username</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <span className="text-slate-400 text-sm">No users found</span>
                  </td>
                </tr>
              ) : users.map(u => {
                const isSuperadmin = u.user_type === 'SUPERADMIN'
                const isCurrentUser = u.userid === currentUser?.id
                const typeStyle = TYPE_STYLE[u.user_type] || TYPE_STYLE.USER
                const statusStyle = STATUS_STYLE[u.record_status] || {}
                return (
                  <tr
                    key={u.userid}
                    className="transition-colors duration-100"
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{u.username}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.lastname}, {u.firstname}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{u.email}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={typeStyle}>
                        {u.user_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={statusStyle}>
                        {u.record_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isSuperadmin ? (
                        <span className="text-xs text-slate-400 italic font-medium" title="SUPERADMIN accounts cannot be modified">Protected</span>
                      ) : isCurrentUser ? (
                        <span className="text-xs text-slate-400 italic font-medium">Current user</span>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAction(u.userid, 'activate')}
                            disabled={actioning === u.userid || u.record_status === 'ACTIVE'}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}
                            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.15)' }}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.08)'}
                          >
                            {actioning === u.userid ? '…' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleAction(u.userid, 'deactivate')}
                            disabled={actioning === u.userid || u.record_status === 'INACTIVE'}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#fee2e2' }}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                          >
                            {actioning === u.userid ? '…' : 'Deactivate'}
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
        <div className="px-5 py-3 flex items-center" style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
          <span className="text-xs text-slate-400 font-medium">
            <span className="text-slate-600 font-semibold">{users.length}</span> user{users.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
/ /   A d m i n P a g e   U I      u s e r I d ,   u s e r n a m e ,   u s e r _ t y p e ,   r e c o r d _ s t a t u s   t a b l e ;   S U P E R A D M I N   r o w s   d i s a b l e d      M i c o l e   K u r t   G o n d a  
 