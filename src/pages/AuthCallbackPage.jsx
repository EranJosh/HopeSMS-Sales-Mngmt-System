// AuthCallbackPage — loading spinner while OAuth session exchanges — Micole Kurt Gonda
// Google OAuth: supabase.auth.signInWithOAuth({provider:'google'}) + /auth/callback processes redirect + login guard
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/sales', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#0d1117' }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            H
          </div>
          <span className="text-white font-semibold text-base tracking-tight">Hope, Inc. SMS</span>
        </div>
        <div
          className="rounded-full animate-spin mx-auto mb-4"
          style={{
            width: '36px',
            height: '36px',
            borderWidth: '3px',
            borderStyle: 'solid',
            borderColor: 'rgba(16,185,129,0.2)',
            borderTopColor: '#10b981',
          }}
        />
        <p className="text-sm font-medium" style={{ color: '#8b949e' }}>Authenticating…</p>
      </div>
    </div>
  )
}
