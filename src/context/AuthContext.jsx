import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function handleSession(session) {
    console.log('[AuthContext] handleSession — session user id:', session?.user?.id ?? 'none')

    if (!session) {
      console.log('[AuthContext] No session → clearing user')
      setCurrentUser(null)
      return
    }

    try {
      console.log('[AuthContext] Querying public.user for userid =', session.user.id)
      const { data: userRow, error: dbError } = await supabase
        .from('user')
        .select('*')
        .eq('userid', session.user.id)
        .single()

      console.log('[AuthContext] DB result →', { userRow, dbError: dbError?.message })

      if (dbError || !userRow) {
        console.warn('[AuthContext] User row not found or DB error — clearing user')
        setCurrentUser(null)
        return
      }

      if (userRow.record_status !== 'ACTIVE') {
        console.log('[AuthContext] User is INACTIVE — signing out')
        await supabase.auth.signOut()
        setError('Your account is pending activation by a Sales Manager.')
        setCurrentUser(null)
        return
      }

      // Spread session.user first (provides .id, .email, auth timestamps, etc.),
      // then explicitly overwrite every app-owned field from public.user so that
      // JWT claims or session.user properties never shadow our DB values.
      const merged = {
        ...session.user,
        ...userRow,
        // Belt-and-suspenders: guarantee these critical fields always come from
        // public.user, even if a future Supabase JWT claim uses the same key name.
        userid:        userRow.userid,
        username:      userRow.username,
        firstname:     userRow.firstname,
        lastname:      userRow.lastname,
        user_type:     userRow.user_type,
        record_status: userRow.record_status,
        stamp:         userRow.stamp,
      }

      console.log(
        '[AuthContext] Setting currentUser — userid:', merged.userid,
        '| user_type from DB:', userRow.user_type,
        '| user_type on merged object:', merged.user_type
      )
      setError(null)
      setCurrentUser(merged)
    } catch (err) {
      console.error('[AuthContext] handleSession threw:', err)
      setCurrentUser(null)
    }
  }

  useEffect(() => {
    console.log('[AuthContext] mount — restoring session')

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[AuthContext] getSession →', session?.user?.id ?? 'no session', error?.message)
      handleSession(session).finally(() => {
        console.log('[AuthContext] initial load complete — loading = false')
        setLoading(false)
      })
    })

    // CRITICAL: this callback must NOT be async.
    // Supabase JS v2 awaits every subscriber before resolving signInWithPassword.
    // An async callback here blocks signInWithPassword from returning,
    // which keeps the "Signing in…" button spinning forever.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthContext] onAuthStateChange →', event, session?.user?.id)

        if (event === 'SIGNED_IN') {
          handleSession(session)
            .catch(err => console.error('[AuthContext] SIGNED_IN handler error:', err))
            .finally(() => {
              console.log('[AuthContext] SIGNED_IN handling complete — loading = false')
              setLoading(false)
            })
        } else if (event === 'SIGNED_OUT') {
          console.log('[AuthContext] SIGNED_OUT — clearing user')
          setCurrentUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}
