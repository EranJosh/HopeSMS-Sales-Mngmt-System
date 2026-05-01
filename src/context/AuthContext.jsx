/** @module AuthContext - wraps app, provides currentUser via supabase.auth.onAuthStateChange, login guard checks record_status=ACTIVE */
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
    if (!session) {
      setCurrentUser(null)
      return
    }

    try {
      const { data: userRow, error: dbError } = await supabase
        .from('user')
        .select('*')
        .eq('userid', session.user.id)
        .single()

      if (dbError || !userRow) {
        console.error('[AuthContext] User row not found or DB error  clearing user')
        setCurrentUser(null)
        return
      }

      if (userRow.record_status !== 'ACTIVE') {
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

      setError(null)
      setCurrentUser(merged)
    } catch (err) {
      console.error('[AuthContext] handleSession threw:', err)
      setCurrentUser(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session).finally(() => {
        setLoading(false)
      })
    })

    // CRITICAL: this callback must NOT be async.
    // Supabase JS v2 awaits every subscriber before resolving signInWithPassword.
    // An async callback here blocks signInWithPassword from returning,
    // which keeps the "Signing in" button spinning forever.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          handleSession(session)
            .catch(err => console.error('[AuthContext] SIGNED_IN handler error:', err))
            .finally(() => {
              setLoading(false)
            })
        } else if (event === 'SIGNED_OUT') {
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
