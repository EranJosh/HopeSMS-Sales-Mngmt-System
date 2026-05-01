// Mutation-free confirmed: no SALES_ADD/EDIT/DEL or SD_ADD/EDIT/DEL checks in any lookup page component. Buttons simply do not exist in markup.
import { useEffect, useState } from 'react'
import { getProducts, getAllCurrentPrices } from '../services/lookupService'

const fmt = n => n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) : ''

const CARD_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)',
}

const inputFocusStyle = {
  borderColor: '#10b981',
  boxShadow: '0 0 0 3px rgba(16,185,129,0.08)',
}

export default function ProductLookupPage() {
  const [products, setProducts] = useState([])
  const [priceMap, setPriceMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="rounded-full animate-spin" style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#10b981', borderTopColor: 'transparent' }} />
      </div>
    )
  }
  if (error) {
    return <div className="px-4 py-3 rounded-xl text-red-700 text-sm font-medium" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>{error}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} total products</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
          Read-only
        </span>
      </div>

      <div className="mb-5">
        <div className="relative w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={focused ? '#10b981' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by code or name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-slate-200 pl-9 pr-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition-all duration-150 rounded-lg"
            style={focused ? inputFocusStyle : {}}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
      </div>

      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Product Code</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Unit</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Current Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      </svg>
                      <span className="text-slate-400 text-sm">No products found</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr
                  key={p.prodcode}
                  className="transition-colors duration-100"
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669' }}>
                      {p.prodcode}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{p.description}</td>
                  <td className="px-5 py-3.5 text-center text-slate-500 text-xs font-medium uppercase">{p.unit}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900 tabular-nums">{fmt(priceMap[p.prodcode])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center" style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
          <span className="text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-600 font-semibold">{filtered.length}</span> of{' '}
            <span className="text-slate-600 font-semibold">{products.length}</span> product{products.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
