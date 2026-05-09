import { supabase } from '../lib/supabaseClient'

export async function logAction(currentUser, action, targetTable, targetId, details) {
  try {
    await supabase.from('audit_log').insert([{
      userid: currentUser.userid,
      username: currentUser.username,
      user_type: currentUser.user_type,
      action,
      target_table: targetTable,
      target_id: targetId,
      details,
    }])
  } catch (err) {
    console.error('Audit log failed:', err)
    // Never throw — audit logging should never break the main action
  }
}

export async function getAuditLog(limit = 100) {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}
