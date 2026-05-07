// UI polish: loading skeletons, empty states (No transactions found, No data for this period), error toasts, mobile verified -- Micole Kurt Gonda
// Rights gating: Add Transaction (SALES_ADD), Edit (SALES_EDIT), Delete (SALES_DEL SUPERADMIN only), Add Line Item (SD_ADD), Edit line (SD_EDIT), Delete line (SD_DEL)
// SalesListPage -- transNo, salesDate, customer name, employee name, line item count, total; stamp for ADMIN/SA only; INACTIVE hidden for USER -- Micole Kurt Gonda
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { getSales } from '../services/salesService'
import AddSaleModal from '../components/modals/AddSaleModal'
import EditSaleModal from '../components/modals/EditSaleModal'
import SoftDeleteSaleDialog from '../components/modals/SoftDeleteSaleDialog'

const fmt = n => n != null
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  : '--'

const fmtDate = d => d
  ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  : '--'

const CARD_STYLE = {
  backgroundColor: '#0a1628',
  border: '1px solid rgba(0,229,255,0.08)',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
}

const TH_STYLE = {
  backgroundColor: '#0d1f36',
  borderBottom: '1px solid rgba(0,229,255,0.08)',
}

const TH_TEXT = { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }

function FilterInput({ type = 'text', value, onChange, placeholder, label }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5 uppercase" style={{ color: '#3a6882', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="px-3 py-2 text-sm rounded-lg outline-none transition-colors duration-150"
        style={focused
          ? { backgroundColor: '#070f1e', border: '1px solid rgba(0,255,136,0.4)', color: '#c8dff5', boxShadow: '0 0 0 3px rgba(0,255,136,0.07)' }
          : { backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.12)', color: '#c8dff5' }
        }
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

export default function SalesListPage() {
  const { currentUser } = useAuth()
  const { rights } = useRights()
  const navigate = useNavigate()

  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [custSearch, setCustSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editSale, setEditSale] = useState(null)
  const [deleteSale, setDeleteSale] = useState(null)

  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN'

  async function fetchSales() {
    setLoading(true)
    setError(null)
    try {
      const data = await getSales(currentUser?.user_type)
      setSales(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSales() }, [])

  const filtered = useMemo(() => {
    return sales.filter(s => {
      if (dateFrom && s.salesdate < dateFrom) return false
      if (dateTo && s.salesdate > dateTo) return false
      if (custSearch && !s.custname?.toLowerCase().includes(custSearch.toLowerCase())) return false
      return true
    })
  }, [sales, dateFrom, dateTo, custSearch])

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
        Failed to load sales: {error}
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>Sales Transactions</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, backgroundColor: 'rgba(0,229,255,0.07)', color: '#3a6882', border: '1px solid rgba(0,229,255,0.12)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
              {sales.length} records
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>
            {filtered.length !== sales.length ? `${filtered.length} shown · ` : ''}{isAdmin ? 'ACTIVE + INACTIVE visible' : 'Active records only'}
          </p>
        </div>
        {rights.SALES_ADD === 1 && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors duration-150 rounded-lg cursor-pointer"
            style={{ backgroundColor: '#00ff88', color: '#040810', boxShadow: '0 0 16px rgba(0,255,136,0.25)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.04em' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#00e07a'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,255,136,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00ff88'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,255,136,0.25)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Transaction
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="p-4 mb-5 flex flex-wrap gap-3 items-end" style={{ ...CARD_STYLE, borderLeft: '2px solid rgba(0,229,255,0.2)' }}>
        <FilterInput type="date" label="Date From" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <FilterInput type="date" label="Date To" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <div className="flex-1 min-w-44">
          <FilterInput label="Customer Name" value={custSearch} onChange={e => setCustSearch(e.target.value)} placeholder="Search customer..." />
        </div>
        <button
          onClick={() => { setDateFrom(''); setDateTo(''); setCustSearch('') }}
          className="px-3 py-2 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer self-end"
          style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#2a5a7e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.06)'; e.currentTarget.style.color = '#00e5ff' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2a5a7e' }}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={TH_STYLE}>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Trans No</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Date</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Customer</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Sales Agent</th>
                <th className="px-5 py-3.5 text-right text-xs uppercase tracking-widest" style={TH_TEXT}>Items</th>
                <th className="px-5 py-3.5 text-right text-xs uppercase tracking-widest" style={TH_TEXT}>Total</th>
                {isAdmin && <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Stamp</th>}
                <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="text-sm" style={{ color: '#1e3a52' }}>No transactions found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr
                    key={s.transno}
                    className="cursor-pointer transition-colors duration-100"
                    style={{
                      borderBottom: '1px solid rgba(0,229,255,0.04)',
                      backgroundColor: s.record_status === 'INACTIVE' ? 'rgba(255,77,106,0.04)' : undefined,
                      animation: `fadeInLeft 0.3s ease-out forwards`,
                      animationDelay: `${0.05 + i * 0.035}s`,
                      opacity: 0,
                    }}
                    onClick={() => navigate(`/sales/${s.transno}`)}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = s.record_status === 'INACTIVE' ? 'rgba(255,77,106,0.07)' : 'rgba(0,255,136,0.03)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = s.record_status === 'INACTIVE' ? 'rgba(255,77,106,0.04)' : 'transparent'
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88' }}
                      >
                        {s.transno}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#4d7a9e' }}>{fmtDate(s.salesdate)}</td>
                    <td className="px-5 py-3.5 font-medium" style={{ color: '#c8dff5' }}>{s.custname}</td>
                    <td className="px-5 py-3.5" style={{ color: '#4d7a9e' }}>{s.empname}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums" style={{ color: '#6a90aa' }}>{s.lineitemcount}</td>
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums" style={{ color: '#c8dff5' }}>{fmt(s.totalamount)}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-xs max-w-xs truncate" title={s.stamp} style={{ color: '#1e3a52' }}>
                        {s.stamp || <span style={{ color: '#152840' }}>--</span>}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {rights.SALES_EDIT === 1 && s.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setEditSale(s)}
                            className="px-2.5 py-1 text-xs font-bold rounded-md transition-colors duration-150 cursor-pointer"
                            style={{ backgroundColor: 'rgba(255,210,77,0.1)', color: '#ffd24d', border: '1px solid rgba(255,210,77,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.18)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.1)'}
                          >
                            Edit
                          </button>
                        )}
                        {rights.SALES_DEL === 1 && s.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setDeleteSale(s)}
                            className="px-2.5 py-1 text-xs font-bold rounded-md transition-colors duration-150 cursor-pointer"
                            style={{ backgroundColor: 'rgba(255,77,106,0.1)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.18)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.1)'}
                          >
                            Delete
                          </button>
                        )}
                        {s.record_status === 'INACTIVE' && (
                          <span
                            className="px-2.5 py-1 text-xs font-bold rounded-md"
                            style={{ backgroundColor: 'rgba(255,77,106,0.1)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
                          >
                            INACTIVE
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(0,229,255,0.05)', backgroundColor: '#0d1f36' }}
        >
          <span className="text-xs font-medium" style={{ color: '#1e3a52' }}>
            Showing <span className="font-bold" style={{ color: '#4d7a9e' }}>{filtered.length}</span> of{' '}
            <span className="font-bold" style={{ color: '#4d7a9e' }}>{sales.length}</span> record{sales.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {showAdd && <AddSaleModal onClose={() => setShowAdd(false)} onSuccess={fetchSales} />}
      {editSale && <EditSaleModal sale={editSale} onClose={() => setEditSale(null)} onSuccess={fetchSales} />}
      {deleteSale && <SoftDeleteSaleDialog sale={deleteSale} onClose={() => setDeleteSale(null)} onSuccess={fetchSales} />}
    </div>
  )
}
