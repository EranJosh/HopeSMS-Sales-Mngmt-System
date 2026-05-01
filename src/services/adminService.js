/** @module adminService - getUsers(), activateUser(userId), deactivateUser(userId) -- all block SUPERADMIN rows at RLS level */
import { supabase } from '../lib/supabaseClient'

export async function getUsers() {
  const { data, error } = await supabase
    .from('user')
    .select('userid, username, firstname, lastname, email, user_type, record_status, stamp')
    .order('user_type')
    .order('lastname')
  if (error) throw error
  return data || []
}

export async function activateUser(userId) {
  const { error } = await supabase
    .from('user')
    .update({ record_status: 'ACTIVE' })
    .eq('userid', userId)
    .neq('user_type', 'SUPERADMIN')
  if (error) throw error
}

export async function deactivateUser(userId) {
  const { error } = await supabase
    .from('user')
    .update({ record_status: 'INACTIVE' })
    .eq('userid', userId)
    .neq('user_type', 'SUPERADMIN')
  if (error) throw error
}
