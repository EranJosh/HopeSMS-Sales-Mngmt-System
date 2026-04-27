import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth()
  const { rightsLoading } = useRights()
  const location = useLocation()

  if (loading || rightsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
