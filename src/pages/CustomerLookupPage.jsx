// CustomerLookupPage — read-only: custno, custname, address, payterm. Zero add/edit/delete buttons — Micole Kurt Gonda
import { useEffect, useMemo, useState } from 'react'
import { getCustomers } from '../services/lookupService'

const PAYTERM_LABEL = { COD: 'Cash on Delivery', '30D': 'Net 30 Days', '45D': 'Net 45 Days' }

const PAYTERM_STYLE = {
  COD:  { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' },
  '30D': { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' },
  '45D': { backgroundColor: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' },
}

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

export default function CustomerLookupPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div
          className="rounded-full animate-spin"
          style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#10b981', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded-xl text-red-700 text-sm font-medium" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{customers.length} total customers</p>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}
        >
          Read-only
        </span>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative w-72">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={focused ? '#10b981' : '#94a3b8'} strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by customer name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-slate-200 pl-9 pr-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition-all duration-150 rounded-lg"
            style={focused ? inputFocusStyle : {}}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
      </div>

      {/* Table */}
      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Cust No</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Address</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Pay Term</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      <span className="text-slate-400 text-sm">No customers found</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr
                  key={c.custno}
                  className="transition-colors duration-100"
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{c.custno}</span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{c.custname}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">{c.address}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={PAYTERM_STYLE[c.payterm] || { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
                    >
                      {PAYTERM_LABEL[c.payterm] || c.payterm}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="px-5 py-3 flex items-center"
          style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}
        >
          <span className="text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-600 font-semibold">{filtered.length}</span> of{' '}
            <span className="text-slate-600 font-semibold">{customers.length}</span> record{customers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
