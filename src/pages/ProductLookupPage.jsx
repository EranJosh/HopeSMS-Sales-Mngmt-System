// Mutation-free confirmed: no SALES_ADD/EDIT/DEL or SD_ADD/EDIT/DEL checks in any lookup page component.
import { useEffect, useMemo, useState } from 'react'
import { getProducts, getAllCurrentPrices } from '../services/lookupService'
import useSortableTable from '../hooks/useSortableTable'
import SortableHeader from '../components/SortableHeader'
import LoadingSpinner from '../components/LoadingSpinner'

const fmt = n => n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) : ''
const CARD_STYLE = { backgroundColor: '#0a1628', border: '1px solid rgba(0,229,255,0.08)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }
const TH_STYLE = { backgroundColor: '#0d1f36', borderBottom: '1px solid rgba(0,229,255,0.08)' }
const TH_TEXT = { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }
const SH = { className: 'px-5 py-3.5 text-xs uppercase tracking-widest', style: { ...TH_TEXT, backgroundColor: '#0d1f36' } }

export default function ProductLookupPage() {
  const [products, setProducts] = useState([])
  const [priceMap, setPriceMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    Promise.all([getProducts(), getAllCurrentPrices()])
      .then(([prods, prices]) => { setProducts(prods); setPriceMap(prices) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() =>
    products.filter(p =>
      !search ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.prodcode?.toLowerCase().includes(search.toLowerCase())
    ),
    [products, search]
  )

  // Enrich with price for sorting
  const enriched = useMemo(() => filtered.map(p => ({ ...p, currentprice: priceMap[p.prodcode] ?? null })), [filtered, priceMap])
  const { sortedData, sortField, sortDir, handleSort } = useSortableTable(enriched)

  if (loading) return <LoadingSpinner message="Loading products..." />
  if (error) return <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>Products</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, backgroundColor: 'rgba(0,229,255,0.07)', color: '#3a6882', border: '1px solid rgba(0,229,255,0.12)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
              {search ? `${filtered.length} of ${products.length}` : products.length} records
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>Read-only lookup table</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={focused ? '#00ff88' : '#1e3a52'} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Search by product code or description..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 pr-3 py-2.5 text-sm rounded-lg outline-none" style={focused ? { backgroundColor: '#070f1e', border: '1px solid rgba(0,255,136,0.4)', color: '#c8dff5', boxShadow: '0 0 0 3px rgba(0,255,136,0.07)', minWidth: 280 } : { backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.12)', color: '#c8dff5', minWidth: 280 }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,229,255,0.06)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}>Read-only</span>
        </div>
      </div>

      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={TH_STYLE}>
                <SortableHeader label="Product Code" field="prodcode" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                <SortableHeader label="Description" field="description" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                <SortableHeader label="Unit" field="unit" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="center" />
                <SortableHeader label="Current Price" field="currentprice" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="right" />
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="font-medium" style={{ color: '#3a6882' }}>No products found</p>
                    <p className="text-sm mt-1" style={{ color: '#2a5a7e' }}>Try a different search term</p>
                  </td>
                </tr>
              ) : sortedData.map(p => (
                <tr key={p.prodcode} className="transition-colors duration-100" style={{ borderBottom: '1px solid rgba(0,229,255,0.04)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.03)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="px-5 py-3.5"><span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88' }}>{p.prodcode}</span></td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: '#a8c8e8' }}>{p.description}</td>
                  <td className="px-5 py-3.5 text-center text-xs font-bold uppercase" style={{ color: '#2a5a7e' }}>{p.unit}</td>
                  <td className="px-5 py-3.5 text-right font-bold tabular-nums" style={{ color: '#ffd24d' }}>{fmt(priceMap[p.prodcode])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center" style={{ borderTop: '1px solid rgba(0,229,255,0.05)', backgroundColor: '#0d1f36' }}>
          <span className="text-xs font-medium" style={{ color: '#1e3a52' }}>
            {search
              ? <><span className="font-bold" style={{ color: '#4d7a9e' }}>{filtered.length}</span> of <span className="font-bold" style={{ color: '#4d7a9e' }}>{products.length}</span> products found</>
              : <><span className="font-bold" style={{ color: '#4d7a9e' }}>{products.length}</span> product{products.length !== 1 ? 's' : ''}</>
            }
          </span>
        </div>
      </div>
    </div>
  )
}
