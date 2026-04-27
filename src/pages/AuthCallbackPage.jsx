import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        navigate('/login', { replace: true })
      } else {
        navigate('/sales', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Completing sign-in…</p>
      </div>
    </div>
  )
}
