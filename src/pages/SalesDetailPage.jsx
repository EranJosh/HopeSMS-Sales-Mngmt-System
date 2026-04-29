// SalesDetailPage — transaction header + line items; prodCode dropdown auto-fills unitPrice from getCurrentPrice(prodCode) — Micole Kurt Gonda
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { supabase } from '../lib/supabaseClient'
import { getDetailByTrans } from '../services/salesDetailService'
import AddLineItemModal from '../components/modals/AddLineItemModal'
import EditLineItemModal from '../components/modals/EditLineItemModal'
import SoftDeleteDetailDialog from '../components/modals/SoftDeleteDetailDialog'

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

export default function SalesDetailPage() {
  const { transNo } = useParams()
  const { currentUser } = useAuth()
  const { rights } = useRights()
  const navigate = useNavigate()

  const [sale, setSale] = useState(null)
  const [lines, setLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editLine, setEditLine] = useState(null)
  const [deleteLine, setDeleteLine] = useState(null)

  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN'

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [{ data: saleRow }, detail] = await Promise.all([
        supabase.from('sales_with_lookup').select('*').eq('transno', transNo).single(),
        getDetailByTrans(transNo, currentUser?.user_type),
      ])
      setSale(saleRow)
      setLines(detail)
    } catch (err) {
      setError(err.message || 'Failed to load transaction.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [transNo])

  const grandTotal = lines.reduce((sum, l) => sum + (Number(l.linetotal) || 0), 0)

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
      {/* Back button */}
      <button
        onClick={() => navigate('/sales')}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors duration-150 cursor-pointer"
        onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Transactions
      </button>

      {/* Transaction header card */}
      <div className="mb-6" style={CARD_STYLE}>
        <div
          className="px-6 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa', borderRadius: '12px 12px 0 0' }}
        >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction</span>
          <span
            className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669' }}
          >
            {transNo}
          </span>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Date</p>
              <p className="text-sm font-semibold text-slate-800">{fmtDate(sale?.salesdate)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
              <p className="text-sm font-semibold text-slate-800">{sale?.custname}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Sales Agent</p>
              <p className="text-sm font-semibold text-slate-800">{sale?.empname}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
              <p className="text-base font-bold" style={{ color: '#059669' }}>{fmt(grandTotal)}</p>
            </div>
          </div>

          {isAdmin && sale?.stamp && (
            <p className="mt-4 text-xs text-slate-400 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              <span className="font-semibold uppercase tracking-wide mr-2">Stamp:</span>{sale.stamp}
            </p>
          )}
        </div>
      </div>

      {/* Line items section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Line Items</h2>
        {rights.SD_ADD === 1 && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm text-white font-semibold transition-all duration-150 rounded-lg cursor-pointer"
            style={{ backgroundColor: '#10b981', boxShadow: '0 1px 3px rgba(16,185,129,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Line Item
          </button>
        )}
      </div>

      {/* Line items table */}
      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Product Code</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Unit</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Qty</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Price</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Line Total</th>
                {isAdmin && <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Stamp</th>}
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      </svg>
                      <span className="text-slate-400 text-sm">No line items found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                lines.map(l => (
                  <tr
                    key={`${l.transno}-${l.prodcode}`}
                    className="transition-colors duration-100"
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: l.record_status === 'INACTIVE' ? '#fff5f5' : undefined,
                      opacity: l.record_status === 'INACTIVE' ? 0.75 : 1,
                    }}
                    onMouseEnter={e => {
                      if (l.record_status !== 'INACTIVE') e.currentTarget.style.backgroundColor = '#f0fdf4'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = l.record_status === 'INACTIVE' ? '#fff5f5' : 'transparent'
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669' }}
                      >
                        {l.prodcode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">{l.description}</td>
                    <td className="px-5 py-3.5 text-center text-slate-500 text-xs font-medium uppercase">{l.unit}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 tabular-nums">{Number(l.quantity).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600 tabular-nums">{fmt(l.unitprice)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900 tabular-nums">{fmt(l.linetotal)}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate" title={l.stamp}>
                        {l.stamp || <span className="text-slate-300">—</span>}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {rights.SD_EDIT === 1 && l.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setEditLine(l)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md transition-colors duration-150 cursor-pointer"
                            style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef3c7'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fffbeb'}
                          >
                            Edit
                          </button>
                        )}
                        {rights.SD_DEL === 1 && l.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setDeleteLine(l)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md transition-colors duration-150 cursor-pointer"
                            style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                          >
                            Delete
                          </button>
                        )}
                        {l.record_status === 'INACTIVE' && (
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
            {lines.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                  <td
                    colSpan={isAdmin ? 5 : 4}
                    className="px-5 py-4 text-right text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#059669' }}
                  >
                    Grand Total
                  </td>
                  <td className="px-5 py-4 text-right text-lg font-bold" style={{ color: '#065f46' }}>
                    {fmt(grandTotal)}
                  </td>
                  {isAdmin && <td />}
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {showAdd && <AddLineItemModal transno={transNo} onClose={() => setShowAdd(false)} onSuccess={fetchData} />}
      {editLine && <EditLineItemModal line={editLine} onClose={() => setEditLine(null)} onSuccess={fetchData} />}
      {deleteLine && <SoftDeleteDetailDialog line={deleteLine} onClose={() => setDeleteLine(null)} onSuccess={fetchData} />}
    </div>
  )
}
