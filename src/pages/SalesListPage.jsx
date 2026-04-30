// UI polish: loading skeletons, empty states (No transactions found, No data for this period), error toasts, mobile verified -- Micole Kurt Gonda
// Rights gating: Add Transaction (SALES_ADD), Edit (SALES_EDIT), Delete (SALES_DEL SUPERADMIN only), Add Line Item (SD_ADD), Edit line (SD_EDIT), Delete line (SD_DEL)
// SalesListPage — transNo, salesDate, customer name, employee name, line item count, total; stamp for ADMIN/SA only; INACTIVE hidden for USER — Micole Kurt Gonda
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
  : '—'

const fmtDate = d => d
  ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  : '—'

const CARD_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)',
}

const inputClass =
  'border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-all duration-150 rounded-lg placeholder-slate-400'

const inputFocusStyle = {
  borderColor: '#10b981',
  boxShadow: '0 0 0 3px rgba(16,185,129,0.08)',
}

function FilterInput({ type = 'text', value, onChange, placeholder, label }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClass}
        style={focused ? inputFocusStyle : {}}
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
          style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#10b981', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded-xl text-red-700 text-sm font-medium" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
        Failed to load sales: {error}
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Transactions</h1>
          <p className="text-sm text-slate-500 mt-0.5">{sales.length} total transactions</p>
        </div>
        {rights.SALES_ADD === 1 && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white font-semibold transition-all duration-150 rounded-lg cursor-pointer"
            style={{ backgroundColor: '#10b981', boxShadow: '0 1px 3px rgba(16,185,129,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Transaction
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="p-4 mb-5 flex flex-wrap gap-3 items-end" style={CARD_STYLE}>
        <FilterInput
          type="date"
          label="Date From"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
        />
        <FilterInput
          type="date"
          label="Date To"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
        />
        <div className="flex-1 min-w-44">
          <FilterInput
            label="Customer Name"
            value={custSearch}
            onChange={e => setCustSearch(e.target.value)}
            placeholder="Search customer…"
          />
        </div>
        <button
          onClick={() => { setDateFrom(''); setDateTo(''); setCustSearch('') }}
          className="px-3 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg transition-colors duration-150 cursor-pointer self-end"
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Trans No</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Sales Agent</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Items</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Total</th>
                {isAdmin && <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Stamp</th>}
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="text-slate-400 text-sm">No transactions found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr
                    key={s.transno}
                    className="cursor-pointer transition-colors duration-100"
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: s.record_status === 'INACTIVE' ? '#fff5f5' : undefined,
                      opacity: s.record_status === 'INACTIVE' ? 0.75 : 1,
                    }}
                    onClick={() => navigate(`/sales/${s.transno}`)}
                    onMouseEnter={e => {
                      if (s.record_status !== 'INACTIVE') e.currentTarget.style.backgroundColor = '#f0fdf4'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = s.record_status === 'INACTIVE' ? '#fff5f5' : 'transparent'
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669' }}
                      >
                        {s.transno}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-sm">{fmtDate(s.salesdate)}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{s.custname}</td>
                    <td className="px-5 py-3.5 text-slate-500">{s.empname}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 tabular-nums">{s.lineitemcount}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900 tabular-nums">{fmt(s.totalamount)}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate" title={s.stamp}>
                        {s.stamp || <span className="text-slate-300">—</span>}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {rights.SALES_EDIT === 1 && s.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setEditSale(s)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md transition-colors duration-150 cursor-pointer"
                            style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef3c7'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fffbeb'}
                          >
                            Edit
                          </button>
                        )}
                        {rights.SALES_DEL === 1 && s.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setDeleteSale(s)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md transition-colors duration-150 cursor-pointer"
                            style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                          >
                            Delete
                          </button>
                        )}
                        {s.record_status === 'INACTIVE' && (
                          <span
                            className="px-2.5 py-1 text-xs font-semibold rounded-md"
                            style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
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
          style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}
        >
          <span className="text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-600 font-semibold">{filtered.length}</span> of{' '}
            <span className="text-slate-600 font-semibold">{sales.length}</span> record{sales.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {showAdd && <AddSaleModal onClose={() => setShowAdd(false)} onSuccess={fetchSales} />}
      {editSale && <EditSaleModal sale={editSale} onClose={() => setEditSale(null)} onSuccess={fetchSales} />}
      {deleteSale && <SoftDeleteSaleDialog sale={deleteSale} onClose={() => setDeleteSale(null)} onSuccess={fetchSales} />}
    </div>
  )
}
/ /   S a l e s L i s t P a g e      t r a n s N o ,   s a l e s D a t e ,   c u s t o m e r   n a m e ,   e m p l o y e e   n a m e ,   s t a m p   f o r   A D M I N / S A   o n l y      M i c o l e   K u r t   G o n d a  
 