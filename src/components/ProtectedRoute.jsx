import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  // Only block on auth loading — rights load asynchronously in the background.
  // Each page already gates its own actions via useRights(), so blocking here
  // would delay the redirect to /sales without providing any additional safety.
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4"
        style={{ backgroundColor: '#0d1117' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            H
          </div>
          <span className="text-white font-semibold text-base tracking-tight">Hope, Inc. SMS</span>
        </div>
        <div
          className="rounded-full animate-spin"
          style={{
            width: '36px',
            height: '36px',
            borderWidth: '3px',
            borderStyle: 'solid',
            borderColor: 'rgba(16,185,129,0.2)',
            borderTopColor: '#10b981',
          }}
        />
        <p className="text-sm font-medium" style={{ color: '#8b949e' }}>Loading…</p>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // USER accounts cannot access /deleted-items
  if (location.pathname === '/deleted-items' && currentUser.user_type === 'USER') {
    return <Navigate to="/sales" replace />
  }

  return <Outlet />
}
