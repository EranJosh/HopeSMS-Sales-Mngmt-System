import { useEffect, useState } from 'react'
import { getAllPriceHistory } from '../services/lookupService'

const fmt = n => n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) : ''
const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''

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

export default function PriceHistoryPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    getAllPriceHistory()
      .then(setRows)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = rows.filter(r => r.prodcode?.toLowerCase().includes(search.toLowerCase()))

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Price History</h1>
          <p className="text-sm text-slate-500 mt-0.5">{rows.length} total entries</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
          Read-only
        </span>
      </div>

      <div className="mb-5">
        <div className="relative w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={focused ? '#10b981' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Filter by product code"
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
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Effective Date</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      <span className="text-slate-400 text-sm">No price history found</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(r => (
                <tr
                  key={`${r.prodcode}-${r.effdate}`}
                  className="transition-colors duration-100"
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669' }}>
                      {r.prodcode}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 text-sm">{fmtDate(r.effdate)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900 tabular-nums">{fmt(r.unitprice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center" style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
          <span className="text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-600 font-semibold">{filtered.length}</span> of{' '}
            <span className="text-slate-600 font-semibold">{rows.length}</span> entr{rows.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
      </div>
    </div>
  )
}
