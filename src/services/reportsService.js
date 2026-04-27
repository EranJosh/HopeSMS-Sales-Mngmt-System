import { supabase } from '../lib/supabaseClient'

export async function getSalesByEmployee() {
  const { data, error } = await supabase
    .from('sales_by_employee')
    .select('*')
  if (error) throw error
  return data || []
}

export async function getSalesByCustomer() {
  const { data, error } = await supabase
    .from('sales_by_customer')
    .select('*')
  if (error) throw error
  return data || []
}

export async function getTopProducts() {
  const { data, error } = await supabase
    .from('top_products_sold')
    .select('*')
  if (error) throw error
  return data || []
}

export async function getMonthlySalesTrend() {
  const { data, error } = await supabase
    .from('monthly_sales_trend')
    .select('*')
  if (error) throw error
  return data || []
}
