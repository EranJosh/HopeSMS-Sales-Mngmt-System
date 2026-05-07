// RegisterPage UI -- First Name, Last Name, Email, Password + Google register -- Micole Kurt Gonda
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import FloatingPaths from '../components/FloatingPaths'

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

// ── Left decorative card ─────────────────────────────────────
function LeftCard() {
  const steps = [
    { num: '01', title: 'Create account', desc: 'Fill in your details below', color: '#00ff88' },
    { num: '02', title: 'Await activation', desc: 'Admin reviews your request', color: '#00e5ff' },
    { num: '03', title: 'Start working', desc: 'Access your sales dashboard', color: '#ffd24d' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      style={{
        flex: '0 0 220px',
        backgroundColor: '#0a1628',
        borderRadius: 16,
        border: '1px solid rgba(0,229,255,0.1)',
        padding: '24px 20px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: 140, height: 140, background: 'radial-gradient(circle at 0% 0%, rgba(0,255,136,0.07), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 4 }}>
          Getting Started
        </p>
        <p style={{ color: '#c8dff5', fontSize: 16, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>
          3 Simple Steps
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
          >
            <span style={{
              color: step.color,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700, fontSize: 20,
              lineHeight: 1, flexShrink: 0,
              textShadow: `0 0 12px ${step.color}60`,
            }}>{step.num}</span>
            <div>
              <p style={{ color: '#c8dff5', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{step.title}</p>
              <p style={{ color: '#4d7a9e', fontSize: 11 }}>{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Connector line between steps */}
      <div style={{ position: 'absolute', left: 32, top: 120, bottom: 80, width: 1, background: 'linear-gradient(180deg, rgba(0,255,136,0.3), rgba(0,229,255,0.3), rgba(255,210,77,0.3))' }} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ position: 'relative', zIndex: 1, padding: '12px', borderRadius: 10, backgroundColor: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00ff88', animation: 'glowPulse 1.5s ease-in-out infinite' }} />
          <span style={{ color: '#00ff88', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }}>SECURE</span>
        </div>
        <p style={{ color: '#2a5a7e', fontSize: 11 }}>Your data is protected with Supabase auth & RLS policies</p>
      </motion.div>
    </motion.div>
  )
}

// ── Right decorative card ────────────────────────────────────
function RightCard() {
  const perks = [
    { icon: '◈', label: 'Full Dashboard', desc: 'KPI cards, trend charts, revenue tracking', color: '#00ff88' },
    { icon: '◎', label: 'Sales Tracking', desc: 'Manage 125+ transactions with line items', color: '#00e5ff' },
    { icon: '◉', label: 'Lookup Tables', desc: 'Customers, employees, products & prices', color: '#ffd24d' },
    { icon: '◇', label: 'Access Tiers', desc: 'SUPERADMIN, ADMIN, USER permissions', color: '#a78bfa' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      style={{
        flex: '0 0 220px',
        backgroundColor: '#0a1628',
        borderRadius: 16,
        border: '1px solid rgba(0,229,255,0.1)',
        padding: '24px 20px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 140, height: 140, background: 'radial-gradient(circle at 100% 0%, rgba(167,139,250,0.07), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 4 }}>
          What You Get
        </p>
        <p style={{ color: '#c8dff5', fontSize: 16, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>
          Full System Access
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {perks.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + i * 0.12, duration: 0.4 }}
            style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 10px', borderRadius: 8, backgroundColor: 'rgba(0,229,255,0.03)', border: `1px solid ${p.color}14` }}
          >
            <span style={{ color: p.color, fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>{p.icon}</span>
            <div>
              <p style={{ color: '#c8dff5', fontSize: 11, fontWeight: 600, marginBottom: 1 }}>{p.label}</p>
              <p style={{ color: '#4d7a9e', fontSize: 10 }}>{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}
        style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingTop: 8 }}
      >
        <p style={{ color: '#1e3a52', fontSize: 11, fontStyle: 'italic' }}>
          Built with React · Supabase · Tailwind
        </p>
      </motion.div>
    </motion.div>
  )
}

// ── Main page ────────────────────────────────────────────────
export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { firstName, lastName, username } },
    })
    setSubmitting(false)
    if (signUpError) setError(signUpError.message)
    else setSuccess(true)
  }

  async function handleGoogleRegister() {
    setError('')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
  }

  const titleWords = [
    { text: 'Join', color: '#c8dff5' },
    { text: 'Hope,', color: '#c8dff5' },
    { text: 'Inc.', color: '#00e5ff' },
  ]

  const bgPaths = (
    <>
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 45%, rgba(0,229,255,0.05) 0%, rgba(0,255,136,0.02) 30%, transparent 65%)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />
    </>
  )

  // ── Success screen ───────────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#050a0f', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {bgPaths}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 150, damping: 20 }}
          style={{
            position: 'relative', zIndex: 10,
            backgroundColor: '#0a1628',
            borderRadius: 18,
            border: '1px solid rgba(0,255,136,0.2)',
            borderTop: '2px solid rgba(0,255,136,0.5)',
            boxShadow: '0 0 80px rgba(0,255,136,0.1), 0 32px 64px rgba(0,0,0,0.7)',
            padding: '48px 36px',
            textAlign: 'center',
            maxWidth: 380,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              backgroundColor: 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.3)',
              boxShadow: '0 0 30px rgba(0,255,136,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
          <h2 style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 10 }}>Account Created!</h2>
          <p style={{ color: '#2a5a7e', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Your account is pending admin activation. You'll be able to sign in once approved.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '11px 28px',
              backgroundColor: '#00ff88', color: '#040810',
              fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              borderRadius: 10, textDecoration: 'none',
              boxShadow: '0 0 24px rgba(0,255,136,0.3)',
            }}
          >
            Back to Login
          </Link>
        </motion.div>
      </div>
    )
  }

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
      {bgPaths}

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1060px' }}>

        {/* Brand + animated title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 14, marginBottom: 18,
              backgroundColor: 'rgba(0,229,255,0.1)',
              border: '1px solid rgba(0,229,255,0.3)',
              boxShadow: '0 0 28px rgba(0,229,255,0.2)',
              color: '#00e5ff',
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22,
            }}
          >H</motion.div>

          <h1 style={{ margin: '0 0 10px', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {titleWords.map((wordObj, wi) => (
              <span key={wi} style={{ display: 'inline-block', marginRight: wi < titleWords.length - 1 ? 10 : 0 }}>
                {wordObj.text.split('').map((char, ci) => (
                  <motion.span
                    key={`${wi}-${ci}`}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: wi * 0.12 + ci * 0.035, type: 'spring', stiffness: 180, damping: 28 }}
                    style={{
                      display: 'inline-block',
                      color: wordObj.color,
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 'clamp(28px, 3.5vw, 46px)',
                      fontWeight: 700,
                    }}
                  >{char}</motion.span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ color: '#2a5a7e', fontSize: 11, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}
          >
            Sales Management System · New Account
          </motion.p>
        </div>

        {/* 3-card layout */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>

          <div className="hidden lg:block"><LeftCard /></div>

          {/* Center form card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.65, type: 'spring', stiffness: 120, damping: 22 }}
            style={{
              flex: '0 0 min(380px, 90vw)',
              backgroundColor: '#0a1628',
              borderRadius: 18,
              border: '1px solid rgba(0,229,255,0.18)',
              borderTop: '2px solid rgba(0,229,255,0.45)',
              boxShadow: '0 0 80px rgba(0,229,255,0.08), 0 0 140px rgba(0,255,136,0.03), 0 32px 64px rgba(0,0,0,0.7)',
              padding: '28px 26px',
              position: 'relative', overflow: 'hidden', zIndex: 10,
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(0,229,255,0.04) 0%, transparent 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.012) 3px, rgba(0,229,255,0.012) 4px)' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create account</h2>
              <p style={{ color: '#2a5a7e', fontSize: 13, marginBottom: 20 }}>Register for Hope, Inc. SMS</p>

              {error && (
                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a', fontSize: 12 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 5 }}>First Name</label>
                    <FormInput type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Juan" />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 5 }}>Last Name</label>
                    <FormInput type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="dela Cruz" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 5 }}>Username</label>
                  <FormInput type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="jdelacruz" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 5 }}>Email address</label>
                  <FormInput type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 5 }}>Password</label>
                  <FormInput type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '11px 0',
                    backgroundColor: '#00e5ff', color: '#040810',
                    fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    border: 'none', borderRadius: 10, cursor: 'pointer',
                    boxShadow: '0 0 24px rgba(0,229,255,0.3), 0 4px 12px rgba(0,0,0,0.3)',
                    opacity: submitting ? 0.6 : 1,
                    marginTop: 4,
                    transition: 'background-color 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.backgroundColor = '#00c8e0'; e.currentTarget.style.boxShadow = '0 0 36px rgba(0,229,255,0.45), 0 4px 12px rgba(0,0,0,0.3)' } }}
                  onMouseLeave={e => { if (!submitting) { e.currentTarget.style.backgroundColor = '#00e5ff'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,229,255,0.3), 0 4px 12px rgba(0,0,0,0.3)' } }}
                >
                  {submitting ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                <span style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,229,255,0.07)' }} />
                <span style={{ color: '#1e3a52', fontSize: 11 }}>or continue with</span>
                <span style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,229,255,0.07)' }} />
              </div>

              <button
                type="button"
                onClick={handleGoogleRegister}
                style={{
                  width: '100%', padding: '10px 0',
                  backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.1)',
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
                Register with Google
              </button>

              <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#1e3a52' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#00e5ff', fontWeight: 700 }}>Sign in</Link>
              </p>
            </div>
          </motion.div>

          <div className="hidden lg:block"><RightCard /></div>
        </div>
      </div>
    </div>
  )
}
