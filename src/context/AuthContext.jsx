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

    const { data: userRow, error: dbError } = await supabase
      .from('user')
      .select('*')
      .eq('userId', session.user.id)
      .single()

    if (dbError || !userRow) {
      setCurrentUser(null)
      return
    }

    if (userRow.record_status !== 'ACTIVE') {
      await supabase.auth.signOut()
      setError('Your account is pending activation by a Sales Manager.')
      setCurrentUser(null)
      return
    }

    setError(null)
    setCurrentUser({ ...session.user, ...userRow })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          await handleSession(session)
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
