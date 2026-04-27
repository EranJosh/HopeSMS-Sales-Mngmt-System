import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const UserRightsContext = createContext({})

export function useRights() {
  return useContext(UserRightsContext)
}

export default function UserRightsProvider({ children }) {
  const { currentUser } = useAuth()
  const [rights, setRights] = useState({})
  const [rightsLoading, setRightsLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setRights({})
      setRightsLoading(false)
      return
    }

    async function loadRights() {
      setRightsLoading(true)
      const { data, error } = await supabase
        .from('usermodule_rights')
        .select('rightid, right_value')
        .eq('userid', currentUser.id)

      if (!error && data) {
        const map = {}
        data.forEach(r => { map[r.rightid] = r.right_value })
        setRights(map)
      }
      setRightsLoading(false)
    }

    loadRights()
  }, [currentUser])

  return (
    <UserRightsContext.Provider value={{ rights, rightsLoading }}>
      {children}
    </UserRightsContext.Provider>
  )
}
