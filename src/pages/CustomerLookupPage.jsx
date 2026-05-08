// CustomerLookupPage -- read-only: custno, custname, address, payterm. Zero add/edit/delete buttons -- Micole Kurt Gonda
import { useEffect, useMemo, useState } from 'react'
import { getCustomers } from '../services/lookupService'

const PAYTERM_LABEL = { COD: 'Cash on Delivery', '30D': 'Net 30 Days', '45D': 'Net 45 Days' }

const PAYTERM_STYLE = {
  COD:  { backgroundColor: 'rgba(255,210,77,0.1)', color: '#ffd24d', border: '1px solid rgba(255,210,77,0.2)' },
  '30D': { backgroundColor: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' },
  '45D': { backgroundColor: 'rgba(0,229,255,0.05)', color: '#67e8f9', border: '1px solid rgba(0,229,255,0.15)' },
}

const CARD_STYLE = {
  backgroundColor: '#0a1628',
  border: '1px solid rgba(0,229,255,0.08)',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
}

const TH_STYLE = { backgroundColor: '#0d1f36', borderBottom: '1px solid rgba(0,229,255,0.08)' }
const TH_TEXT = { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }

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
          style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#00ff88', borderTopColor: 'transparent', boxShadow: '0 0 12px rgba(0,255,136,0.3)' }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>Customers</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, backgroundColor: 'rgba(0,229,255,0.07)', color: '#3a6882', border: '1px solid rgba(0,229,255,0.12)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>{customers.length} records</span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>Read-only lookup table</p>
        </div>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: 'rgba(0,229,255,0.06)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}
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
            stroke={focused ? '#00ff88' : '#1e3a52'} strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by customer name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg outline-none transition-colors duration-150"
            style={focused
              ? { backgroundColor: '#070f1e', border: '1px solid rgba(0,255,136,0.4)', color: '#c8dff5', boxShadow: '0 0 0 3px rgba(0,255,136,0.07)' }
              : { backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.12)', color: '#c8dff5' }
            }
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
              <tr style={TH_STYLE}>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Cust No</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Name</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Address</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Pay Term</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      <span className="text-sm" style={{ color: '#1e3a52' }}>No customers found</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((c, i) => (
                <tr
                  key={c.custno}
                  className="transition-colors duration-100"
                  style={{ borderBottom: '1px solid rgba(0,229,255,0.04)', animation: 'fadeInLeft 0.3s ease-out forwards', animationDelay: `${0.05 + i * 0.03}s`, opacity: 0 }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(0,229,255,0.06)', color: '#00e5ff' }}>{c.custno}</span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: '#c8dff5' }}>{c.custname}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#4d7a9e' }}>{c.address}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ ...(PAYTERM_STYLE[c.payterm] || { backgroundColor: 'rgba(77,122,158,0.12)', color: '#4d7a9e', border: '1px solid rgba(77,122,158,0.2)' }), fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      {PAYTERM_LABEL[c.payterm] || c.payterm}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center" style={{ borderTop: '1px solid rgba(0,229,255,0.05)', backgroundColor: '#0d1f36' }}>
          <span className="text-xs font-medium" style={{ color: '#1e3a52' }}>
            Showing <span className="font-bold" style={{ color: '#4d7a9e' }}>{filtered.length}</span> of{' '}
            <span className="font-bold" style={{ color: '#4d7a9e' }}>{customers.length}</span> record{customers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
