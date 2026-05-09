// LoginPage UI -- email/password form + Sign in with Google button -- Micole Kurt Gonda
// Email auth: supabase.auth.signIn() wired here; login guard blocks INACTIVE accounts
import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import FloatingPaths from '../components/FloatingPaths'

// ── Animated mini bar chart for left card ───────────────────
const CHART_BARS = [
  { label: 'NOV', pct: 42 },
  { label: 'DEC', pct: 58 },
  { label: 'JAN', pct: 48 },
  { label: 'FEB', pct: 76 },
  { label: 'MAR', pct: 89 },
  { label: 'APR', pct: 100 },
]
const CHART_BASE = 80
const CHART_MAX_H = 64

function MiniBarChart() {
  const trendPoints = CHART_BARS.map((b, i) => {
    const h = (b.pct / 100) * CHART_MAX_H
    return `${16 + i * 28 + 9},${CHART_BASE - h}`
  }).join(' ')

  return (
    <svg viewBox="0 0 200 105" fill="none" style={{ width: '100%', height: 105 }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.5" />
        </linearGradient>
        <filter id="barGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Subtle grid */}
      {[0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i}
          x1="8" y1={CHART_BASE - t * CHART_MAX_H}
          x2="192" y2={CHART_BASE - t * CHART_MAX_H}
          stroke="rgba(0,229,255,0.06)" strokeWidth="1"
        />
      ))}

      {/* Bars */}
      {CHART_BARS.map((bar, i) => {
        const h = (bar.pct / 100) * CHART_MAX_H
        const x = 16 + i * 28
        return (
          <motion.rect
            key={i}
            x={x} width={18} rx={3}
            initial={{ height: 0, y: CHART_BASE }}
            animate={{ height: h, y: CHART_BASE - h }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
            fill="url(#barGrad)"
            filter="url(#barGlow)"
          />
        )
      })}

      {/* Trend line */}
      <motion.polyline
        points={trendPoints}
        stroke="rgba(0,255,136,0.45)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      />

      {/* Month labels */}
      {CHART_BARS.map((bar, i) => (
        <text key={i}
          x={16 + i * 28 + 9} y={98}
          textAnchor="middle"
          fontSize={7}
          fill="rgba(0,229,255,0.45)"
          fontFamily="'Rajdhani', sans-serif"
          fontWeight="700"
        >
          {bar.label}
        </text>
      ))}
    </svg>
  )
}

// ── Left card ────────────────────────────────────────────────
function LeftCard() {
  const stats = [
    { label: 'Total Revenue', value: '$689k+', color: '#00ff88' },
    { label: 'Transactions', value: '125', color: '#00e5ff' },
    { label: 'Customers', value: '82', color: '#ffd24d' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      style={{
        flex: '0 0 230px',
        backgroundColor: '#0a1628',
        borderRadius: 16,
        border: '1px solid rgba(0,229,255,0.1)',
        padding: '24px 20px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Corner glow */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 140, height: 140, background: 'radial-gradient(circle at 0% 0%, rgba(0,255,136,0.08), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 4 }}>
          Sales Intelligence
        </p>
        <p style={{ color: '#c8dff5', fontSize: 16, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>
          Revenue Trend
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <MiniBarChart />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 + i * 0.12, duration: 0.4 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 8, backgroundColor: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.07)' }}
          >
            <span style={{ color: '#4d7a9e', fontSize: 11 }}>{s.label}</span>
            <span style={{ color: s.color, fontSize: 13, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>{s.value}</span>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.1 }}
        style={{ position: 'relative', zIndex: 1, color: '#2a5a7e', fontSize: 11, textAlign: 'center', fontStyle: 'italic' }}
      >
        Real-time transaction tracking
      </motion.p>
    </motion.div>
  )
}

// ── Right card ───────────────────────────────────────────────
function RightCard() {
  const roles = [
    { role: 'SUPERADMIN', desc: 'Full system access', color: '#00ff88' },
    { role: 'ADMIN', desc: 'Sales management', color: '#00e5ff' },
    { role: 'USER', desc: 'View & lookup', color: '#ffd24d' },
  ]
  const features = [
    'Soft-delete with recovery',
    'Price history tracking',
    'Analytics & reports',
    'Customer & employee lookups',
  ]
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      style={{
        flex: '0 0 230px',
        backgroundColor: '#0a1628',
        borderRadius: 16,
        border: '1px solid rgba(255,210,77,0.1)',
        padding: '24px 20px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Corner glow */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 140, height: 140, background: 'radial-gradient(circle at 100% 0%, rgba(255,210,77,0.07), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 4 }}>
          Access Control
        </p>
        <p style={{ color: '#c8dff5', fontSize: 16, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>
          Role-Based Permissions
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {roles.map((r, i) => (
          <motion.div
            key={r.role}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + i * 0.15, duration: 0.5 }}
            style={{ padding: '10px 12px', borderRadius: 10, backgroundColor: 'rgba(0,229,255,0.04)', border: `1px solid ${r.color}18` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: r.color, boxShadow: `0 0 6px ${r.color}` }} />
              <span style={{ color: r.color, fontSize: 12, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em' }}>{r.role}</span>
            </div>
            <p style={{ color: '#4d7a9e', fontSize: 11, paddingLeft: 14 }}>{r.desc}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 10 }}>
          System Features
        </p>
        {features.map((f, i) => (
          <motion.div
            key={f}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 + i * 0.1, duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ color: '#4d7a9e', fontSize: 11 }}>{f}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Form input ───────────────────────────────────────────────
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
      className="w-full px-3.5 py-2.5 text-sm rounded-lg outline-none transition-colors duration-150"
      style={focused
        ? { backgroundColor: '#070f1e', border: '1px solid rgba(0,255,136,0.4)', color: '#c8dff5', boxShadow: '0 0 0 3px rgba(0,255,136,0.07)' }
        : { backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.12)', color: '#c8dff5' }
      }
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

// ── Main page ────────────────────────────────────────────────
export default function LoginPage() {
  const { currentUser, loading, error, setError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && currentUser) return <Navigate to="/dashboard" replace />

  async function handleLogin(e) {
    e.preventDefault()
    setFormError('')
    setError(null)
    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (signInError) setFormError(signInError.message)
    else navigate('/dashboard')
  }

  async function handleGoogleLogin() {
    setFormError('')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
  }

  const displayError = error || formError
  const titleWords = [
    { text: 'Your sales,', color: '#c8dff5' },
    { text: 'organized.', color: '#00ff88' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050a0f',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
    }}>

      {/* ── Animated background paths ── */}
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />

      {/* ── Radial center glow ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 45%, rgba(0,255,136,0.06) 0%, rgba(0,229,255,0.03) 30%, transparent 65%)',
      }} />

      {/* ── Edge vignette ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
      }} />

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1100px' }}>

        {/* Brand + animated title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52, borderRadius: 16, marginBottom: 20,
              backgroundColor: 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.3)',
              boxShadow: '0 0 30px rgba(0,255,136,0.25), inset 0 1px 0 rgba(0,255,136,0.2)',
              color: '#00ff88',
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700, fontSize: 24,
            }}
          >
            H
          </motion.div>

          {/* Letter-by-letter animated title */}
          <h1 style={{ margin: '0 0 10px', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {titleWords.map((wordObj, wi) => (
              <span key={wi} style={{ display: 'inline-block', marginRight: wi < titleWords.length - 1 ? 12 : 0 }}>
                {wordObj.text.split('').map((char, ci) => (
                  <motion.span
                    key={`${wi}-${ci}`}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wi * 0.15 + ci * 0.035,
                      type: 'spring',
                      stiffness: 180,
                      damping: 28,
                    }}
                    style={{
                      display: 'inline-block',
                      color: char === ' ' ? 'transparent' : wordObj.color,
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 'clamp(32px, 4vw, 52px)',
                      fontWeight: 700,
                      ...(wordObj.color === '#00ff88' ? { textShadow: '0 0 30px rgba(0,255,136,0.4)' } : {}),
                    }}
                  >
                    {char === ' ' ? ' ' : char}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            style={{
              color: '#2a5a7e',
              fontSize: 11,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Hope, Inc. · Sales Management System
          </motion.p>
        </div>

        {/* ── 3-card layout ── */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>

          {/* Left info card */}
          <div className="hidden lg:block">
            <LeftCard />
          </div>

          {/* Center elevated form card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.65, type: 'spring', stiffness: 120, damping: 22 }}
            style={{
              flex: '0 0 min(380px, 90vw)',
              backgroundColor: '#0a1628',
              borderRadius: 18,
              border: '1px solid rgba(0,255,136,0.18)',
              borderTop: '2px solid rgba(0,255,136,0.5)',
              boxShadow: '0 0 80px rgba(0,255,136,0.1), 0 0 140px rgba(0,229,255,0.04), 0 32px 64px rgba(0,0,0,0.7)',
              padding: '30px 26px',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            {/* Inner top green wash */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 120, pointerEvents: 'none',
              background: 'linear-gradient(180deg, rgba(0,255,136,0.05) 0%, transparent 100%)',
            }} />

            {/* Scanlines */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.012) 3px, rgba(0,229,255,0.012) 4px)',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                Welcome back
              </h2>
              <p style={{ color: '#2a5a7e', fontSize: 13, marginBottom: 22 }}>
                Sign in to your account to continue
              </p>

              {displayError && (
                <div style={{ marginBottom: 18, padding: '10px 14px', borderRadius: 8, backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a', fontSize: 12 }}>
                  {displayError}
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 6 }}>
                    Email address
                  </label>
                  <FormInput type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 6 }}>
                    Password
                  </label>
                  <FormInput type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '11px 0',
                    backgroundColor: '#00ff88', color: '#040810',
                    fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    border: 'none', borderRadius: 10, cursor: 'pointer',
                    boxShadow: '0 0 24px rgba(0,255,136,0.3), 0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'background-color 0.15s, box-shadow 0.15s',
                    opacity: submitting ? 0.6 : 1,
                    marginTop: 4,
                  }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.backgroundColor = '#00e07a'; e.currentTarget.style.boxShadow = '0 0 36px rgba(0,255,136,0.45), 0 4px 12px rgba(0,0,0,0.3)' } }}
                  onMouseLeave={e => { if (!submitting) { e.currentTarget.style.backgroundColor = '#00ff88'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,255,136,0.3), 0 4px 12px rgba(0,0,0,0.3)' } }}
                >
                  {submitting ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
                <span style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,229,255,0.07)' }} />
                <span style={{ color: '#1e3a52', fontSize: 11 }}>or continue with</span>
                <span style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,229,255,0.07)' }} />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                style={{
                  width: '100%', padding: '10px 0',
                  backgroundColor: '#070f1e',
                  border: '1px solid rgba(0,229,255,0.1)',
                  borderRadius: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  color: '#4d7a9e', fontSize: 13, fontWeight: 500,
                  transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0a1628'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.2)'; e.currentTarget.style.color = '#c8dff5' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#070f1e'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.1)'; e.currentTarget.style.color = '#4d7a9e' }}
              >
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.3C9.6 35.7 16.3 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.2 35.7 44 30.3 44 24c0-1.3-.1-2.6-.4-3.9z" />
                </svg>
                Sign in with Google
              </button>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#1e3a52' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#00ff88', fontWeight: 700 }}>
                  Create one
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Right info card */}
          <div className="hidden lg:block">
            <RightCard />
          </div>
        </div>
      </div>
    </div>
  )
}
