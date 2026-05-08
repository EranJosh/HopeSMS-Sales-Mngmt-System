import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

const INPUT_BASE = {
  backgroundColor: '#070f1e',
  border: '1px solid rgba(0,229,255,0.12)',
  color: '#c8dff5',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

const INPUT_FOCUS = {
  borderColor: 'rgba(0,255,136,0.4)',
  boxShadow: '0 0 0 3px rgba(0,255,136,0.07)',
}

function Field({ label, value, onChange, placeholder, show, onToggle }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5 uppercase" style={{ color: '#3a6882', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={focused ? { ...INPUT_BASE, ...INPUT_FOCUS } : INPUT_BASE}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: '#2a5a7e', background: 'none', border: 'none', cursor: 'pointer' }}
          tabIndex={-1}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}

export default function ChangePasswordModal({ onClose }) {
  const { currentUser } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const isGoogleUser = currentUser?.app_metadata?.provider === 'google'

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (next.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (next !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password: next })
      if (err) throw err
      toast.success('Password updated successfully')
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(5,10,15,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: '#0a1628',
          border: '1px solid rgba(0,229,255,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          animation: 'scaleIn 0.22s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(0,229,255,0.08)', backgroundColor: '#0d1f36' }}
        >
          <h2 className="font-bold text-base" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '-0.01em' }}>
            Change Password
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: '#2a5a7e', backgroundColor: 'transparent', border: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.1)'; e.currentTarget.style.color = '#ff4d6a' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2a5a7e' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">
          {isGoogleUser ? (
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm leading-relaxed" style={{ color: '#4d7a9e' }}>
                Your account uses <span style={{ color: '#00e5ff', fontWeight: 600 }}>Google Sign-In</span>. Password changes are managed through your Google account.
              </p>
            </div>
          ) : success ? (
            <div
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.2)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-sm font-medium" style={{ color: '#00ff88' }}>Password updated successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Current Password"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                placeholder="Enter current password"
                show={showCurrent}
                onToggle={() => setShowCurrent(v => !v)}
              />
              <Field
                label="New Password"
                value={next}
                onChange={e => setNext(e.target.value)}
                placeholder="At least 8 characters"
                show={showNext}
                onToggle={() => setShowNext(v => !v)}
              />
              <Field
                label="Confirm New Password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                show={showConfirm}
                onToggle={() => setShowConfirm(v => !v)}
              />

              {error && (
                <div className="px-3 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer"
                  style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#2a5a7e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.06)'; e.currentTarget.style.color = '#00e5ff' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2a5a7e' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#00ff88',
                    color: '#040810',
                    boxShadow: '0 0 14px rgba(0,255,136,0.25)',
                    fontFamily: "'Rajdhani', sans-serif",
                    letterSpacing: '0.04em',
                    border: 'none',
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.backgroundColor = '#00e07a'; e.currentTarget.style.boxShadow = '0 0 22px rgba(0,255,136,0.4)' } }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00ff88'; e.currentTarget.style.boxShadow = '0 0 14px rgba(0,255,136,0.25)' }}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
