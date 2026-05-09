/** @module adminService - getUsers(), activateUser(userId), deactivateUser(userId) -- all block SUPERADMIN rows at RLS level */
import { supabase } from '../lib/supabaseClient'
import { logAction } from './auditService'

export async function getUsers() {
  const { data, error } = await supabase
    .from('user')
    .select('userid, username, firstname, lastname, email, user_type, record_status, stamp')
    .order('user_type')
    .order('lastname')
  if (error) throw error
  return data || []
}

export async function activateUser(userId, currentUser) {
  const { error } = await supabase
    .from('user')
    .update({ record_status: 'ACTIVE' })
    .eq('userid', userId)
    .neq('user_type', 'SUPERADMIN')
  if (error) throw error
  if (currentUser) await logAction(currentUser, 'ACTIVATE', 'user', userId, `Activated user ${userId}`)
}

export async function deactivateUser(userId, currentUser) {
  const { error } = await supabase
    .from('user')
    .update({ record_status: 'INACTIVE' })
    .eq('userid', userId)
    .neq('user_type', 'SUPERADMIN')
  if (error) throw error
  if (currentUser) await logAction(currentUser, 'DEACTIVATE', 'user', userId, `Deactivated user ${userId}`)
}

export async function changeUserRole(userId, newRole, currentUser) {
  if (newRole !== 'USER' && newRole !== 'ADMIN') throw new Error('Invalid role — only USER or ADMIN allowed')

  const { error } = await supabase
    .from('user')
    .update({ user_type: newRole })
    .eq('userid', userId)
    .neq('user_type', 'SUPERADMIN')
  if (error) throw error

  if (newRole === 'ADMIN') {
    const { error: e2 } = await supabase
      .from('usermodule_rights')
      .update({ right_value: 1 })
      .eq('userid', userId)
      .in('rightid', ['SALES_VIEW','SALES_ADD','SALES_EDIT','SD_VIEW','SD_ADD','SD_EDIT','CUST_LOOKUP','EMP_LOOKUP','PROD_LOOKUP','PRICE_LOOKUP','ADM_USER'])
    if (e2) throw e2
  } else {
    const { error: e2 } = await supabase
      .from('usermodule_rights')
      .update({ right_value: 0 })
      .eq('userid', userId)
      .in('rightid', ['SALES_ADD','SALES_EDIT','SALES_DEL','SD_ADD','SD_EDIT','SD_DEL','ADM_USER'])
    if (e2) throw e2
  }

  if (currentUser) await logAction(currentUser, 'ROLE_CHANGE', 'user', userId, `Changed user ${userId} role to ${newRole}`)
}
