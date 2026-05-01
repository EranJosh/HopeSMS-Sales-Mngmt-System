/** @module salesDetailService - getDetailByTrans(transNo,userType), addDetailLine(), updateDetailLine(), softDeleteDetailLine(), recoverDetailLine() */
import { supabase } from '../lib/supabaseClient'

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

export async function addDetailLine({ transno, prodcode, quantity }) {
  const { error } = await supabase
    .from('salesdetail')
    .insert({ transno, prodcode, quantity: parseFloat(quantity), record_status: 'ACTIVE', stamp: stamp('CREATED') })

  if (error) throw error
}

export async function updateDetailLine(transno, prodcode, { quantity }) {
  const { error } = await supabase
    .from('salesdetail')
    .update({ quantity: parseFloat(quantity) })
    .eq('transno', transno)
    .eq('prodcode', prodcode)

  if (error) throw error
}

export async function softDeleteDetailLine(transno, prodcode) {
  const { error } = await supabase
    .from('salesdetail')
    .update({ record_status: 'INACTIVE', stamp: stamp('DELETED') })
    .eq('transno', transno)
    .eq('prodcode', prodcode)

  if (error) throw error
}

export async function recoverDetailLine(transno, prodcode) {
  const { error } = await supabase
    .from('salesdetail')
    .update({ record_status: 'ACTIVE', stamp: stamp('RECOVERED') })
    .eq('transno', transno)
    .eq('prodcode', prodcode)

  if (error) throw error
}
