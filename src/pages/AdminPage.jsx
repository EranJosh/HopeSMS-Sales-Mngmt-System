import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useRights } from '../context/UserRightsContext'
import { useAuth } from '../context/AuthContext'
import { getUsers, activateUser, deactivateUser } from '../services/adminService'

const TYPE_BADGE = {
  SUPERADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  USER: 'bg-gray-100 text-gray-600',
}

const STATUS_BADGE = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-red-100 text-red-700',
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

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (error) return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-5">User Administration</h1>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Username</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">No users found.</td></tr>
              ) : users.map((u, i) => {
                const isSuperadmin = u.user_type === 'SUPERADMIN'
                const isCurrentUser = u.userid === currentUser?.id
                return (
                  <tr key={u.userid} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{u.username}</td>
                    <td className="px-4 py-3 text-gray-700">{u.lastname}, {u.firstname}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_BADGE[u.user_type] || 'bg-gray-100 text-gray-600'}`}>
                        {u.user_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[u.record_status] || ''}`}>
                        {u.record_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isSuperadmin ? (
                        <span className="text-xs text-gray-400 italic" title="SUPERADMIN accounts cannot be modified">
                          Protected
                        </span>
                      ) : isCurrentUser ? (
                        <span className="text-xs text-gray-400 italic">Current user</span>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAction(u.userid, 'activate')}
                            disabled={actioning === u.userid || u.record_status === 'ACTIVE'}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {actioning === u.userid ? '…' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleAction(u.userid, 'deactivate')}
                            disabled={actioning === u.userid || u.record_status === 'INACTIVE'}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
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
        <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">{users.length} user{users.length !== 1 ? 's' : ''}</div>
      </div>
    </div>
  )
}
