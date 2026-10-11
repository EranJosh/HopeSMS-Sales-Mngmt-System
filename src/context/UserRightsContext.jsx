/** @module UserRightsContext - on login queries all 13 UserModule_Rights rows; stores as {SALES_VIEW:1, SALES_ADD:1, SALES_DEL:0, SD_ADD:1, CUST_LOOKUP:1, ...} */
// UserRightsContext wired at app root  loads all 13 rights on login; /deleted-items route blocked for USER type
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const UserRightsContext = createContext({})

export function useRights() {
  return useContext(UserRightsContext)
}

const RIGHTS_TIMEOUT_MS = 5000

// All 13 rights at full value  used for SUPERADMIN bypass
const ALL_RIGHTS = {
  SALES_VIEW: 1, SALES_ADD: 1, SALES_EDIT: 1, SALES_DEL: 1,
  SD_VIEW: 1,    SD_ADD: 1,    SD_EDIT: 1,    SD_DEL: 1,
  CUST_LOOKUP: 1, EMP_LOOKUP: 1, PROD_LOOKUP: 1, PRICE_LOOKUP: 1,
  ADM_USER: 1,
}

export default function UserRightsProvider({ children }) {
  const { currentUser } = useAuth()
  // Rights fetched for one user id; anything else is derived, so the effect never sets state synchronously.
  const [fetched, setFetched] = useState({ forId: null, rights: {} })

  const userId = currentUser?.id ?? null
  // SUPERADMIN always has every right, no DB query needed. This also acts as a safety net if the
  // 004_superadmin_seed migration ran with ON CONFLICT DO NOTHING and didn't overwrite a USER-provisioned row.
  const isSuperAdmin = currentUser?.user_type === 'SUPERADMIN'
  const needsQuery = Boolean(userId) && !isSuperAdmin

  useEffect(() => {
    if (!needsQuery) return

    let cancelled = false
    const finish = (map) => { if (!cancelled) { cancelled = true; setFetched({ forId: userId, rights: map }) } }

    const timeoutId = setTimeout(() => {
      if (!cancelled) console.error('[UserRightsContext] Rights query timed out after 5s, proceeding with empty rights')
      finish({})
    }, RIGHTS_TIMEOUT_MS)

    async function loadRights() {
      try {
        // Table name: PostgreSQL folds unquoted identifiers to lowercase ("UserModule_Rights" is stored as "usermodule_rights").
        const { data, error } = await supabase
          .from('usermodule_rights')
          .select('rightid, right_value')
          .eq('userid', userId)

        if (error) {
          console.error('[UserRightsContext] Rights query error:', error.message)
          finish({})
        } else {
          const map = {}
          ;(data || []).forEach(r => { map[r.rightid] = r.right_value })
          finish(map)
        }
      } catch (err) {
        console.error('[UserRightsContext] Rights query threw:', err)
        finish({})
      } finally {
        clearTimeout(timeoutId)
      }
    }

    loadRights()

    return () => { cancelled = true; clearTimeout(timeoutId) }
  }, [needsQuery, userId])

  const rights = !userId ? {} : isSuperAdmin ? ALL_RIGHTS : fetched.forId === userId ? fetched.rights : {}
  const rightsLoading = needsQuery && fetched.forId !== userId

  return (
    <UserRightsContext.Provider value={{ rights, rightsLoading }}>
      {children}
    </UserRightsContext.Provider>
  )
}
