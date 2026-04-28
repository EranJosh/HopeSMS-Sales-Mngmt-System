// CustomerLookupPage — read-only: custno, custname, address, payterm. Zero add/edit/delete buttons — Micole Kurt Gonda
import { useEffect, useMemo, useState } from 'react'
import { getCustomers } from '../services/lookupService'

const PAYTERM_LABEL = { COD: 'Cash on Delivery', '30D': 'Net 30 Days', '45D': 'Net 45 Days' }

export default function CustomerLookupPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() =>
    customers.filter(c => c.custname?.toLowerCase().includes(search.toLowerCase())),
    [customers, search]
  )

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (error) return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Customers</h1>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Read-only lookup</span>
      </div>
      <div className="mb-4">
        <input type="text" placeholder="Search by customer name…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Cust No</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Address</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Pay Term</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-gray-400">No customers found.</td></tr>
              ) : filtered.map((c, i) => (
                <tr key={c.custno} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3 font-mono text-gray-600">{c.custno}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{c.custname}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{c.address}</td>
                  <td className="px-4 py-3 text-gray-600">{PAYTERM_LABEL[c.payterm] || c.payterm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</div>
      </div>
    </div>
  )
}
