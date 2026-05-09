// SETUP REQUIRED: Supabase Dashboard → Storage → New bucket → Name: "avatars" → Public: ON
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { supabase } from '../lib/supabaseClient'
import { formatDate, formatDateTime } from '../utils/formatDate'

const CARD_STYLE = {
  backgroundColor: '#0a1628',
  border: '1px solid rgba(0,229,255,0.08)',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
}

const ALL_RIGHTS_META = [
  { id: 'SALES_VIEW',   label: 'View Sales' },
  { id: 'SALES_ADD',    label: 'Add Sale' },
  { id: 'SALES_EDIT',   label: 'Edit Sale' },
  { id: 'SALES_DEL',    label: 'Delete Sale' },
  { id: 'SD_VIEW',      label: 'View Line Items' },
  { id: 'SD_ADD',       label: 'Add Line Item' },
  { id: 'SD_EDIT',      label: 'Edit Line Item' },
  { id: 'SD_DEL',       label: 'Delete Line Item' },
  { id: 'CUST_LOOKUP',  label: 'Customer Lookup' },
  { id: 'EMP_LOOKUP',   label: 'Employee Lookup' },
  { id: 'PROD_LOOKUP',  label: 'Product Lookup' },
  { id: 'PRICE_LOOKUP', label: 'Price Lookup' },
  { id: 'ADM_USER',     label: 'Admin — Manage Users' },
]

const TYPE_MAP = {
  SUPERADMIN: { bg: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' },
  ADMIN:      { bg: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' },
  USER:       { bg: 'rgba(77,122,158,0.12)', color: '#4d7a9e', border: '1px solid rgba(77,122,158,0.2)' },
}

const STATUS_MAP = {
  ACTIVE:   { bg: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' },
  INACTIVE: { bg: 'rgba(255,77,106,0.08)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)' },
}

function Badge({ map, value }) {
  const s = map[value] || { bg: 'rgba(77,122,158,0.12)', color: '#4d7a9e', border: '1px solid rgba(77,122,158,0.2)' }
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color, border: s.border, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em' }}
    >
      {value}
    </span>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3" style={{ borderBottom: '1px solid rgba(0,229,255,0.05)' }}>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", minWidth: 140 }}>{label}</span>
      <span className="text-sm font-medium text-right" style={{ color: '#c8dff5' }}>{value || <span style={{ color: '#1e3a52' }}>—</span>}</span>
    </div>
  )
}

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
const INPUT_FOCUS = { borderColor: 'rgba(0,255,136,0.4)', boxShadow: '0 0 0 3px rgba(0,255,136,0.07)' }

function PasswordField({ label, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5 uppercase" style={{ color: '#3a6882', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }}>{label}</label>
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
          onClick={() => setShow(v => !v)}
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

function UserAvatar({ avatarUrl, displayName, size = 72, uploading }) {
  const initials = (displayName || '??').slice(0, 2).toUpperCase()
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          style={{
            width: size, height: size, borderRadius: '50%', objectFit: 'cover',
            border: '2px solid rgba(0,255,136,0.25)',
            boxShadow: '0 0 20px rgba(0,255,136,0.15)',
            opacity: uploading ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.35, fontWeight: 700,
          backgroundColor: 'rgba(0,255,136,0.1)',
          color: '#00ff88',
          border: '2px solid rgba(0,255,136,0.25)',
          boxShadow: '0 0 20px rgba(0,255,136,0.15)',
          fontFamily: "'Rajdhani', sans-serif",
          opacity: uploading ? 0.5 : 1,
          transition: 'opacity 0.2s',
        }}>
          {initials}
        </div>
      )}
      {uploading && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(5,10,15,0.4)',
        }}>
          <div className="rounded-full animate-spin" style={{ width: 22, height: 22, borderWidth: 2, borderStyle: 'solid', borderColor: '#00ff88', borderTopColor: 'transparent' }} />
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useAuth()
  const { rights } = useRights()
  const fileInputRef = useRef(null)

  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNext, setPwNext] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState(null)

  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState(null)
  const [avatarSuccess, setAvatarSuccess] = useState(false)

  const displayName = currentUser?.displayName || currentUser?.username || currentUser?.email || ''
  const isGoogleUser = currentUser?.app_metadata?.provider === 'google'

  const createdAt = formatDate(currentUser?.created_at)
  const lastSignIn = formatDateTime(currentUser?.last_sign_in_at)

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!fileInputRef.current) return
    fileInputRef.current.value = ''

    if (!file) return
    setAvatarError(null)
    setAvatarSuccess(false)

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be under 2 MB.')
      return
    }

    const ext = file.name.split('.').pop()
    const userId = currentUser?.id || currentUser?.userid
    const path = `${userId}/avatar.${ext}`

    setAvatarUploading(true)
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      })
      if (updateError) throw updateError

      // Update context immediately so navbar avatar refreshes
      setCurrentUser(prev => prev ? { ...prev, avatarUrl: publicUrl } : prev)
      toast.success('Profile picture updated')
      setAvatarSuccess(true)
      setTimeout(() => setAvatarSuccess(false), 3000)
    } catch (err) {
      setAvatarError(err.message || 'Upload failed.')
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPwError(null)
    if (pwNext.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (pwNext !== pwConfirm) { setPwError('Passwords do not match.'); return }
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pwNext })
      if (error) throw error
      toast.success('Password updated successfully')
      setPwSuccess(true)
      setPwCurrent(''); setPwNext(''); setPwConfirm('')
    } catch (err) {
      setPwError(err.message || 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto" style={{ animation: 'fadeInUp 0.35s ease-out' }}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>
          My Profile
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>Account details and settings</p>
      </div>

      {/* Profile Header Card */}
      <div className="mb-5 p-6 flex items-center gap-6" style={CARD_STYLE}>
        {/* Avatar with upload */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <UserAvatar avatarUrl={currentUser?.avatarUrl} displayName={displayName} size={72} uploading={avatarUploading} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="text-xs font-bold px-2.5 py-1 rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'rgba(0,229,255,0.07)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)', fontFamily: "'Rajdhani', sans-serif" }}
            onMouseEnter={e => { if (!avatarUploading) e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.14)' }}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.07)' }
          >
            {avatarUploading ? 'Uploading...' : 'Change Photo'}
          </button>
          {avatarError && <p className="text-xs text-center" style={{ color: '#ff4d6a', maxWidth: 100 }}>{avatarError}</p>}
          {avatarSuccess && <p className="text-xs text-center" style={{ color: '#00ff88' }}>Updated!</p>}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold leading-tight mb-1" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif" }}>{displayName}</h2>
          <p className="text-sm mb-3" style={{ color: '#4d7a9e' }}>{currentUser?.email}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge map={TYPE_MAP} value={currentUser?.user_type} />
            <Badge map={STATUS_MAP} value={currentUser?.record_status} />
            {isGoogleUser && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,210,77,0.08)', color: '#ffd24d', border: '1px solid rgba(255,210,77,0.2)', fontFamily: "'Rajdhani', sans-serif" }}>
                Google OAuth
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="mb-5" style={CARD_STYLE}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.06)', backgroundColor: '#0d1f36', borderRadius: '12px 12px 0 0' }}>
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>Account Information</h3>
        </div>
        <div className="px-6 py-2">
          <InfoRow label="Username" value={currentUser?.username} />
          <InfoRow label="Email" value={currentUser?.email} />
          <InfoRow label="Full Name" value={`${currentUser?.firstname || ''} ${currentUser?.lastname || ''}`.trim() || null} />
          <InfoRow label="Role" value={<Badge map={TYPE_MAP} value={currentUser?.user_type} />} />
          <InfoRow label="Status" value={<Badge map={STATUS_MAP} value={currentUser?.record_status} />} />
          <InfoRow label="Member Since" value={createdAt} />
        </div>
      </div>

      {/* My Rights */}
      <div className="mb-5" style={CARD_STYLE}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.06)', backgroundColor: '#0d1f36', borderRadius: '12px 12px 0 0' }}>
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>Module Rights</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#0d1f36', borderBottom: '1px solid rgba(0,229,255,0.06)' }}>
                <th className="px-6 py-2.5 text-left text-xs uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>Right</th>
                <th className="px-6 py-2.5 text-center text-xs uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>Access</th>
              </tr>
            </thead>
            <tbody>
              {ALL_RIGHTS_META.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: '1px solid rgba(0,229,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-6 py-2.5" style={{ color: '#6a90aa' }}>{r.label}</td>
                  <td className="px-6 py-2.5 text-center">
                    {rights[r.id] === 1
                      ? <span style={{ color: '#00ff88', fontSize: 16 }}>✅</span>
                      : <span style={{ color: '#1e3a52', fontSize: 16 }}>❌</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Password */}
      <div className="mb-5" style={CARD_STYLE}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.06)', backgroundColor: '#0d1f36', borderRadius: '12px 12px 0 0' }}>
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>Change Password</h3>
        </div>
        <div className="px-6 py-5">
          {isGoogleUser ? (
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm" style={{ color: '#4d7a9e' }}>
                Your account uses <span style={{ color: '#00e5ff', fontWeight: 600 }}>Google Sign-In</span>. Password changes are managed through your Google account.
              </p>
            </div>
          ) : pwSuccess ? (
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.2)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-sm font-medium" style={{ color: '#00ff88' }}>Password updated successfully.</p>
              <button onClick={() => setPwSuccess(false)} className="ml-auto text-xs cursor-pointer" style={{ color: '#2a5a7e', background: 'none', border: 'none' }}>Change again</button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
              <PasswordField label="Current Password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} placeholder="Current password" />
              <PasswordField label="New Password" value={pwNext} onChange={e => setPwNext(e.target.value)} placeholder="At least 8 characters" />
              <PasswordField label="Confirm New Password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="Repeat new password" />
              {pwError && (
                <div className="px-3 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>
                  {pwError}
                </div>
              )}
              <button
                type="submit"
                disabled={pwLoading}
                className="px-5 py-2 text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#00ff88', color: '#040810', boxShadow: '0 0 14px rgba(0,255,136,0.2)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.04em', border: 'none' }}
                onMouseEnter={e => { if (!pwLoading) { e.currentTarget.style.backgroundColor = '#00e07a'; e.currentTarget.style.boxShadow = '0 0 22px rgba(0,255,136,0.35)' } }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00ff88'; e.currentTarget.style.boxShadow = '0 0 14px rgba(0,255,136,0.2)' }}
              >
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Session Info */}
      <div className="mb-5" style={CARD_STYLE}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.06)', backgroundColor: '#0d1f36', borderRadius: '12px 12px 0 0' }}>
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>Session Info</h3>
        </div>
        <div className="px-6 py-2">
          <InfoRow label="Auth Provider" value={currentUser?.app_metadata?.provider || 'email'} />
          <InfoRow label="Last Sign In" value={lastSignIn} />
          <InfoRow label="Member Since" value={createdAt} />
          <InfoRow label="User ID" value={<span className="font-mono text-xs" style={{ color: '#2a5a7e' }}>{currentUser?.id || currentUser?.userid}</span>} />
        </div>
      </div>
    </div>
  )
}
