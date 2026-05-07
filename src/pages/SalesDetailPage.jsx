// SalesDetailPage -- transaction header + line items; prodCode dropdown auto-fills unitPrice from getCurrentPrice(prodCode) -- Micole Kurt Gonda
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

const TH_STYLE = { backgroundColor: '#0d1f36', borderBottom: '1px solid rgba(0,229,255,0.08)' }
const TH_TEXT = { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }

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
      {/* Back button */}
      <button
        onClick={() => navigate('/sales')}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer"
        style={{ color: '#2a5a7e' }}
        onMouseEnter={e => e.currentTarget.style.color = '#00ff88'}
        onMouseLeave={e => e.currentTarget.style.color = '#2a5a7e'}
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
          style={{ borderBottom: '1px solid rgba(0,229,255,0.06)', backgroundColor: '#0d1f36', borderRadius: '12px 12px 0 0' }}
        >
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>Transaction</span>
          <span
            className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88' }}
          >
            {transNo}
          </span>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: 'Date', value: fmtDate(sale?.salesdate) },
              { label: 'Customer', value: sale?.custname },
              { label: 'Sales Agent', value: sale?.empname },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>{item.label}</p>
                <p className="text-sm font-semibold" style={{ color: '#c8dff5' }}>{item.value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>Grand Total</p>
              <p className="text-base font-bold" style={{ color: '#00ff88', textShadow: '0 0 12px rgba(0,255,136,0.4)' }}>{fmt(grandTotal)}</p>
            </div>
          </div>

          {isAdmin && sale?.stamp && (
            <p className="mt-4 text-xs pt-3" style={{ borderTop: '1px solid rgba(0,229,255,0.06)', color: '#2a5a7e' }}>
              <span className="font-bold uppercase tracking-wide mr-2" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>Stamp:</span>{sale.stamp}
            </p>
          )}
        </div>
      </div>

      {/* Line items section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '18px' }}>Line Items</h2>
          {lines.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, backgroundColor: 'rgba(0,229,255,0.07)', color: '#3a6882', border: '1px solid rgba(0,229,255,0.12)', fontFamily: "'Rajdhani', sans-serif" }}>{lines.length}</span>
          )}
        </div>
        {rights.SD_ADD === 1 && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-bold transition-colors duration-150 rounded-lg cursor-pointer"
            style={{ backgroundColor: '#00ff88', color: '#040810', boxShadow: '0 0 14px rgba(0,255,136,0.22)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.04em' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#00e07a'; e.currentTarget.style.boxShadow = '0 0 22px rgba(0,255,136,0.38)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00ff88'; e.currentTarget.style.boxShadow = '0 0 14px rgba(0,255,136,0.22)' }}
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
              <tr style={TH_STYLE}>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Product Code</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Description</th>
                <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Unit</th>
                <th className="px-5 py-3.5 text-right text-xs uppercase tracking-widest" style={TH_TEXT}>Qty</th>
                <th className="px-5 py-3.5 text-right text-xs uppercase tracking-widest" style={TH_TEXT}>Unit Price</th>
                <th className="px-5 py-3.5 text-right text-xs uppercase tracking-widest" style={TH_TEXT}>Line Total</th>
                {isAdmin && <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Stamp</th>}
                <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      </svg>
                      <span className="text-sm" style={{ color: '#1e3a52' }}>No line items found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                lines.map((l, i) => (
                  <tr
                    key={`${l.transno}-${l.prodcode}`}
                    className="transition-colors duration-100"
                    style={{
                      borderBottom: '1px solid rgba(0,229,255,0.04)',
                      backgroundColor: l.record_status === 'INACTIVE' ? 'rgba(255,77,106,0.04)' : undefined,
                      opacity: l.record_status === 'INACTIVE' ? 0.8 : 1,
                      animation: 'fadeInLeft 0.3s ease-out forwards',
                      animationDelay: `${0.05 + i * 0.04}s`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = l.record_status === 'INACTIVE' ? 'rgba(255,77,106,0.07)' : 'rgba(0,255,136,0.03)' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = l.record_status === 'INACTIVE' ? 'rgba(255,77,106,0.04)' : 'transparent' }}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88' }}>
                        {l.prodcode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium" style={{ color: '#a8c8e8' }}>{l.description}</td>
                    <td className="px-5 py-3.5 text-center text-xs font-bold uppercase" style={{ color: '#2a5a7e' }}>{l.unit}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums" style={{ color: '#6a90aa' }}>{Number(l.quantity).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums" style={{ color: '#6a90aa' }}>{fmt(l.unitprice)}</td>
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums" style={{ color: '#c8dff5' }}>{fmt(l.linetotal)}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-xs max-w-xs truncate" title={l.stamp} style={{ color: '#1e3a52' }}>
                        {l.stamp || <span style={{ color: '#152840' }}>--</span>}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {rights.SD_EDIT === 1 && l.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setEditLine(l)}
                            className="px-2.5 py-1 text-xs font-bold rounded-md transition-colors duration-150 cursor-pointer"
                            style={{ backgroundColor: 'rgba(255,210,77,0.1)', color: '#ffd24d', border: '1px solid rgba(255,210,77,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.18)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.1)'}
                          >
                            Edit
                          </button>
                        )}
                        {rights.SD_DEL === 1 && l.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setDeleteLine(l)}
                            className="px-2.5 py-1 text-xs font-bold rounded-md transition-colors duration-150 cursor-pointer"
                            style={{ backgroundColor: 'rgba(255,77,106,0.1)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.18)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.1)'}
                          >
                            Delete
                          </button>
                        )}
                        {l.record_status === 'INACTIVE' && (
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
            {lines.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: 'rgba(0,255,136,0.05)', borderTop: '1px solid rgba(0,255,136,0.15)' }}>
                  <td
                    colSpan={isAdmin ? 5 : 4}
                    className="px-5 py-4 text-right text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#00ff88', fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    Grand Total
                  </td>
                  <td className="px-5 py-4 text-right text-lg font-bold" style={{ color: '#00ff88', textShadow: '0 0 12px rgba(0,255,136,0.4)' }}>
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
