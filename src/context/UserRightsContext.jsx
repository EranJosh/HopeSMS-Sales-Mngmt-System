/** @module UserRightsContext - on login queries all 13 UserModule_Rights rows; stores as {SALES_VIEW:1, SALES_ADD:1, SALES_DEL:0, SD_ADD:1, CUST_LOOKUP:1, ...} */
// UserRightsContext wired at app root — loads all 13 rights on login; /deleted-items route blocked for USER type
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const UserRightsContext = createContext({})

export function useRights() {
  return useContext(UserRightsContext)
}

const RIGHTS_TIMEOUT_MS = 5000

// All 13 rights at full value — used for SUPERADMIN bypass
const ALL_RIGHTS = {
  SALES_VIEW: 1, SALES_ADD: 1, SALES_EDIT: 1, SALES_DEL: 1,
  SD_VIEW: 1,    SD_ADD: 1,    SD_EDIT: 1,    SD_DEL: 1,
  CUST_LOOKUP: 1, EMP_LOOKUP: 1, PROD_LOOKUP: 1, PRICE_LOOKUP: 1,
  ADM_USER: 1,
}

export default function UserRightsProvider({ children }) {
  const { currentUser } = useAuth()
  const [rights, setRights] = useState({})
  const [rightsLoading, setRightsLoading] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      console.log('[UserRightsContext] No user — clearing rights')
      setRights({})
      setRightsLoading(false)
      return
    }

    // SUPERADMIN always has every right — no DB query needed.
    // This also acts as a safety net if the 004_superadmin_seed migration ran
    // with ON CONFLICT DO NOTHING and didn't overwrite a USER-provisioned row.
    if (currentUser.user_type === 'SUPERADMIN') {
      console.log('[UserRightsContext] SUPERADMIN detected — granting all 13 rights without DB query')
      setRights(ALL_RIGHTS)
      setRightsLoading(false)
      return
    }

    let cancelled = false

    async function loadRights() {
      // Table name: PostgreSQL folds unquoted identifiers to lowercase.
      // The table was created as "UserModule_Rights" → stored as "usermodule_rights".
      console.log('[UserRightsContext] Loading rights from usermodule_rights for userid =', currentUser.id)
      setRightsLoading(true)

      const timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.warn('[UserRightsContext] Rights query timed out after 5s — proceeding with empty rights')
          cancelled = true
          setRights({})
          setRightsLoading(false)
        }
      }, RIGHTS_TIMEOUT_MS)

      try {
        const { data, error } = await supabase
          .from('usermodule_rights')          // lowercase — matches PostgreSQL storage
          .select('rightid, right_value')     // lowercase column names
          .eq('userid', currentUser.id)

        console.log('[UserRightsContext] Rights query result →', {
          rows: data?.length,
          error: error?.message,
          table: 'usermodule_rights',
          userid: currentUser.id,
        })

        if (cancelled) {
          clearTimeout(timeoutId)
          return
        }

        clearTimeout(timeoutId)

        if (error) {
          console.error('[UserRightsContext] Rights query error:', error.message)
          setRights({})
        } else if (data) {
          const map = {}
          data.forEach(r => { map[r.rightid] = r.right_value })
          console.log('[UserRightsContext] Rights loaded:', Object.keys(map).length, 'entries', map)
          setRights(map)
        }
      } catch (err) {
        console.error('[UserRightsContext] Rights query threw:', err)
        clearTimeout(timeoutId)
        if (!cancelled) setRights({})
      } finally {
        if (!cancelled) {
          console.log('[UserRightsContext] Rights loading complete')
          setRightsLoading(false)
        }
      }
    }

    loadRights()

    return () => { cancelled = true }
  }, [currentUser])

  return (
    <UserRightsContext.Provider value={{ rights, rightsLoading }}>
      {children}
    </UserRightsContext.Provider>
  )
}
