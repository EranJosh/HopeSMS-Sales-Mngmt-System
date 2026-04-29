// Mutation-free confirmed: no SALES_ADD/EDIT/DEL or SD_ADD/EDIT/DEL checks in any lookup page component. Buttons simply do not exist in markup.
import { useEffect, useState } from 'react'
import { getProducts, getAllCurrentPrices } from '../services/lookupService'

const fmt = n => n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) : '—'

export default function ProductLookupPage() {
  const [products, setProducts] = useState([])
  const [priceMap, setPriceMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([getProducts(), getAllCurrentPrices()])
      .then(([prods, prices]) => {
        setProducts(prods)
        setPriceMap(prices)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p =>
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.prodcode?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (error) return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Products</h1>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Read-only lookup</span>
      </div>
      <div className="mb-4">
        <input type="text" placeholder="Search by product code or name…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-72 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Product Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Description</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Unit</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Current Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-gray-400">No products found.</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.prodcode} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3 font-mono text-blue-700">{p.prodcode}</td>
                  <td className="px-4 py-3 text-gray-800">{p.description}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{p.unit}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">{fmt(priceMap[p.prodcode])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</div>
      </div>
    </div>
  )
}
