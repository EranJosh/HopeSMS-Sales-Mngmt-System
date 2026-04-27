import { useEffect, useState } from 'react'
import { getAllPriceHistory } from '../services/lookupService'

const fmt = n => n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) : '—'
const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

export default function PriceHistoryPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllPriceHistory()
      .then(setRows)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = rows.filter(r =>
    r.prodcode?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (error) return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Price History</h1>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Read-only lookup</span>
      </div>
      <div className="mb-4">
        <input type="text" placeholder="Filter by product code…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Product Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Effective Date</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={3} className="py-10 text-center text-gray-400">No price history found.</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={`${r.prodcode}-${r.effdate}`} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3 font-mono text-blue-700">{r.prodcode}</td>
                  <td className="px-4 py-3 text-gray-700">{fmtDate(r.effdate)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">{fmt(r.unitprice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">{filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}</div>
      </div>
    </div>
  )
}
