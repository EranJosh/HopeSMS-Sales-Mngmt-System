// LoginPage UI — email/password form + Sign in with Google button — Micole Kurt Gonda
// Email auth: supabase.auth.signIn() wired here; login guard blocks INACTIVE accounts
import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const PANEL_BG = '#0d1117'
const PANEL_PATTERN = `
  repeating-linear-gradient(
    -45deg,
    rgba(16,185,129,0.03) 0px,
    rgba(16,185,129,0.03) 1px,
    transparent 1px,
    transparent 28px
  )
`.trim()

const inputClass =
  'w-full border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-150 rounded-lg'

const inputFocusStyle = {
  borderColor: '#10b981',
  boxShadow: '0 0 0 3px rgba(16,185,129,0.1)',
}

function FormInput({ type, value, onChange, placeholder, required, minLength }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      required={required}
      minLength={minLength}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={inputClass}
      style={focused ? inputFocusStyle : {}}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function BrandPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-5/12 flex-col justify-between px-14 py-14"
      style={{ backgroundColor: PANEL_BG, backgroundImage: PANEL_PATTERN }}
    >
      <div>
        <div className="flex items-center gap-3 mb-14">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            H
          </div>
          <span className="text-white font-semibold text-base tracking-tight">Hope, Inc. SMS</span>
        </div>

        <h2 className="text-3xl font-bold text-white leading-snug mb-5">
          Your sales,<br />organized.
        </h2>
        <p className="text-sm leading-relaxed mb-10" style={{ color: '#8b949e' }}>
          A streamlined sales management system built for Hope, Inc. — track transactions,
          customers, and reports in one place.
        </p>

        <div className="space-y-3">
          {['Sales transactions at a glance', 'Customer & employee lookups', 'Role-based access control'].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm" style={{ color: '#6e7681' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-px" style={{ backgroundColor: 'rgba(16,185,129,0.4)' }} />
        <span className="text-xs tracking-widest uppercase font-medium" style={{ color: '#484f58' }}>
          Sales Management
        </span>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { currentUser, loading, error, setError } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && currentUser) {
    return <Navigate to="/sales" replace />
  }

  async function handleLogin(e) {
    e.preventDefault()
    setFormError('')
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    setSubmitting(false)

    if (signInError) {
      setFormError(signInError.message)
    } else {
      navigate('/sales')
    }
  }

  async function handleGoogleLogin() {
    setFormError('')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
  }

  const displayError = error || formError

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10" style={{ backgroundColor: '#f8fafc' }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              H
            </div>
            <span className="font-semibold text-slate-800 text-base">Hope, Inc. SMS</span>
          </div>

          <div
            className="bg-white rounded-2xl p-8"
            style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <h1 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-sm mb-6">Sign in to your account to continue</p>

            {displayError && (
              <div className="mb-5 px-3.5 py-2.5 rounded-lg text-red-700 text-xs font-medium" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                {displayError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 tracking-wide">
                  Email address
                </label>
                <FormInput
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 tracking-wide">
                  Password
                </label>
                <FormInput
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full text-white py-2.5 text-sm font-semibold transition-all duration-150 rounded-lg disabled:opacity-50 cursor-pointer mt-1"
                style={{ backgroundColor: '#10b981', boxShadow: '0 1px 3px rgba(16,185,129,0.3)' }}
                onMouseEnter={e => !submitting && (e.currentTarget.style.backgroundColor = '#059669')}
                onMouseLeave={e => !submitting && (e.currentTarget.style.backgroundColor = '#10b981')}
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="flex-1 border-t border-slate-200" />
              <span className="text-xs text-slate-400 font-medium">or continue with</span>
              <span className="flex-1 border-t border-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full border border-slate-200 bg-white text-slate-700 py-2.5 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2.5 rounded-lg cursor-pointer"
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.3C9.6 35.7 16.3 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.2 35.7 44 30.3 44 24c0-1.3-.1-2.6-.4-3.9z" />
              </svg>
              Sign in with Google
            </button>

            <p className="mt-6 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold" style={{ color: '#10b981' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
/ /   L o g i n P a g e   U I      e m a i l / p a s s w o r d   f o r m   +   S i g n   i n   w i t h   G o o g l e   b u t t o n      M i c o l e   K u r t   G o n d a  
 