/** @module salesDetailService - getDetailByTrans(transNo,userType), addDetailLine(), updateDetailLine(), softDeleteDetailLine(), recoverDetailLine() */
import { supabase } from '../lib/supabaseClient'
import { logAction } from './auditService'

const stamp = (action) =>
  `${action} ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`

export async function getDetailByTrans(transno, userType) {
  let query = supabase
    .from('salesdetail_with_product')
    .select('*')
    .eq('transno', transno)
    .order('prodcode')

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE')
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getDeletedDetailLines() {
  const { data, error } = await supabase
    .from('salesdetail_with_product')
    .select('*')
    .eq('record_status', 'INACTIVE')
    .order('transno')
  if (error) throw error
  return data || []
}

export async function addDetailLine({ transno, prodcode, quantity }, currentUser) {
  const { error } = await supabase
    .from('salesdetail')
    .insert({ transno, prodcode, quantity: parseFloat(quantity), record_status: 'ACTIVE', stamp: stamp('CREATED') })

  if (error) throw error
  if (currentUser) await logAction(currentUser, 'CREATE', 'salesdetail', `${transno}/${prodcode}`, `Added line item ${prodcode} to ${transno}`)
}

export async function updateDetailLine(transno, prodcode, { quantity }, currentUser) {
  const { error } = await supabase
    .from('salesdetail')
    .update({ quantity: parseFloat(quantity) })
    .eq('transno', transno)
    .eq('prodcode', prodcode)

  if (error) throw error
  if (currentUser) await logAction(currentUser, 'EDIT', 'salesdetail', `${transno}/${prodcode}`, `Edited line item ${prodcode} in ${transno}`)
}

export async function softDeleteDetailLine(transno, prodcode, currentUser) {
  const { error } = await supabase
    .from('salesdetail')
    .update({ record_status: 'INACTIVE', stamp: stamp('DELETED') })
    .eq('transno', transno)
    .eq('prodcode', prodcode)

  if (error) throw error
  if (currentUser) await logAction(currentUser, 'SOFT_DELETE', 'salesdetail', `${transno}/${prodcode}`, `Soft-deleted line item ${prodcode} from ${transno}`)
}

export async function recoverDetailLine(transno, prodcode, currentUser) {
  const { error } = await supabase
    .from('salesdetail')
    .update({ record_status: 'ACTIVE', stamp: stamp('RECOVERED') })
    .eq('transno', transno)
    .eq('prodcode', prodcode)

  if (error) throw error
  if (currentUser) await logAction(currentUser, 'RECOVER', 'salesdetail', `${transno}/${prodcode}`, `Recovered line item ${prodcode} in ${transno}`)
}
