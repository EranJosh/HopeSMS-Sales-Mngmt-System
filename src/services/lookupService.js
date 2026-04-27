import { supabase } from '../lib/supabaseClient'

export async function getCustomers() {
  const { data, error } = await supabase
    .from('customer')
    .select('custno, custname, address, payterm')
    .order('custname')
  if (error) throw error
  return data || []
}

export async function getEmployees() {
  const { data, error } = await supabase
    .from('employee')
    .select('empno, lastname, firstname, gender, birthdate, hiredate, sepdate')
    .order('lastname')
  if (error) throw error
  return data || []
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('product')
    .select('prodcode, description, unit')
    .order('description')
  if (error) throw error
  return data || []
}

export async function getCurrentPrice(prodcode) {
  const { data, error } = await supabase
    .from('pricehist')
    .select('unitprice')
    .eq('prodcode', prodcode)
    .order('effdate', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.unitprice ?? null
}

export async function getAllCurrentPrices() {
  const { data, error } = await supabase
    .from('pricehist')
    .select('prodcode, unitprice, effdate')
    .order('prodcode')
    .order('effdate', { ascending: false })
  if (error) throw error

  // Keep only the most recent price per product
  const map = {}
  ;(data || []).forEach(row => {
    if (!map[row.prodcode]) map[row.prodcode] = row.unitprice
  })
  return map
}

export async function getAllPriceHistory() {
  const { data, error } = await supabase
    .from('pricehist')
    .select('prodcode, effdate, unitprice')
    .order('prodcode')
    .order('effdate', { ascending: false })
  if (error) throw error
  return data || []
}
