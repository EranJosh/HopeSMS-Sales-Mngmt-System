/** @module salesService - getSales(userType), createSale(), updateSale(), softDeleteSale() triggers cascade, recoverSale() triggers cascade restore */
import { supabase } from '../lib/supabaseClient'

const stamp = (action) =>
  `${action} ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`

export async function getSales(userType) {
  let query = supabase
    .from('sales_with_lookup')
    .select('*')
    .order('salesdate', { ascending: false })

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE')
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getDeletedSales() {
  const { data, error } = await supabase
    .from('sales_with_lookup')
    .select('*')
    .eq('record_status', 'INACTIVE')
    .order('salesdate', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createSale({ salesdate, custno, empno }) {
  // Generate next transNo
  const { data: maxRow } = await supabase
    .from('sales')
    .select('transno')
    .order('transno', { ascending: false })
    .limit(1)
    .maybeSingle()

  const maxNum = parseInt(maxRow?.transno?.replace('TR', '') || '0')
  const transno = 'TR' + String(maxNum + 1).padStart(6, '0')

  const { data, error } = await supabase
    .from('sales')
    .insert({ transno, salesdate, custno, empno, record_status: 'ACTIVE', stamp: stamp('CREATED') })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSale(transno, { salesdate, custno, empno }) {
  const { error } = await supabase
    .from('sales')
    .update({ salesdate, custno, empno })
    .eq('transno', transno)

  if (error) throw error
}

export async function softDeleteSale(transno) {
  const { error } = await supabase
    .from('sales')
    .update({ record_status: 'INACTIVE', stamp: stamp('DELETED') })
    .eq('transno', transno)

  if (error) throw error
}

export async function recoverSale(transno) {
  const { error } = await supabase
    .from('sales')
    .update({ record_status: 'ACTIVE', stamp: stamp('RECOVERED') })
    .eq('transno', transno)

  if (error) throw error
}
