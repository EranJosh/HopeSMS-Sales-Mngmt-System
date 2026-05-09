// SalesDetailPage -- transaction header + line items; prodCode dropdown auto-fills unitPrice from getCurrentPrice(prodCode) -- Micole Kurt Gonda
// Features: Export Receipt as PDF, Print Receipt (window.print), Grand Total summary card, Sortable line items
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { supabase } from '../lib/supabaseClient'
import { getDetailByTrans } from '../services/salesDetailService'
import { exportTransactionDetailToPDF } from '../services/exportService'
import { formatDate } from '../utils/formatDate'
import useSortableTable from '../hooks/useSortableTable'
import SortableHeader from '../components/SortableHeader'
import LoadingSpinner from '../components/LoadingSpinner'
import AddLineItemModal from '../components/modals/AddLineItemModal'
import EditLineItemModal from '../components/modals/EditLineItemModal'
import SoftDeleteDetailDialog from '../components/modals/SoftDeleteDetailDialog'

const fmt = n => n != null
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
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
  const itemCount = lines.length
  const { sortedData: sortedLines, sortField, sortDir, handleSort } = useSortableTable(lines)
  const SH = { className: 'px-5 py-3.5 text-xs uppercase tracking-widest', style: { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700, backgroundColor: '#0d1f36' } }

  function handlePrint() { window.print() }

  if (loading) return <LoadingSpinner message="Loading transaction details..." />

  if (error) {
    return (
      <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>
        {error}
      </div>
    )
  }

  return (
    <>
      {/* ── Print-only receipt ── */}
      <style>{`
        @media print {
          body > *:not(#print-receipt) { display: none !important; }
          #print-receipt { display: block !important; }
          .no-print { display: none !important; }
        }
        @media screen {
          #print-receipt { display: none; }
        }
      `}</style>

      {/* Print-only receipt DOM */}
      <div id="print-receipt" style={{ fontFamily: 'sans-serif', padding: 32, color: '#111' }}>
        <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px solid #111', paddingBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Hope, Inc.</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>Transaction Receipt</p>
        </div>
        <table style={{ width: '100%', marginBottom: 16, fontSize: 13 }}>
          <tbody>
            <tr><td style={{ color: '#555', width: 120 }}>Transaction:</td><td style={{ fontWeight: 700 }}>{sale?.transno}</td></tr>
            <tr><td style={{ color: '#555' }}>Date:</td><td>{formatDate(sale?.salesdate)}</td></tr>
            <tr><td style={{ color: '#555' }}>Customer:</td><td>{sale?.custname}</td></tr>
            <tr><td style={{ color: '#555' }}>Sales Agent:</td><td>{sale?.empname}</td></tr>
          </tbody>
        </table>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', border: '1px solid #ccc' }}>Product</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', border: '1px solid #ccc' }}>Description</th>
              <th style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #ccc' }}>Qty</th>
              <th style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #ccc' }}>Unit Price</th>
              <th style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #ccc' }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.filter(l => l.record_status !== 'INACTIVE').map(l => (
              <tr key={`${l.transno}-${l.prodcode}`}>
                <td style={{ padding: '5px 8px', border: '1px solid #eee' }}>{l.prodcode}</td>
                <td style={{ padding: '5px 8px', border: '1px solid #eee' }}>{l.description}</td>
                <td style={{ padding: '5px 8px', border: '1px solid #eee', textAlign: 'right' }}>{Number(l.quantity).toFixed(2)}</td>
                <td style={{ padding: '5px 8px', border: '1px solid #eee', textAlign: 'right' }}>{fmt(l.unitprice)}</td>
                <td style={{ padding: '5px 8px', border: '1px solid #eee', textAlign: 'right' }}>{fmt(l.linetotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 700 }}>
              <td colSpan={4} style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #ccc' }}>GRAND TOTAL</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #ccc' }}>{fmt(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Normal screen view ── */}
      <div className="no-print">
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
            className="px-6 py-3 flex items-center justify-between gap-2"
            style={{ borderBottom: '1px solid rgba(0,229,255,0.06)', backgroundColor: '#0d1f36', borderRadius: '12px 12px 0 0' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>Transaction</span>
              <span
                className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88' }}
              >
                {transNo}
              </span>
            </div>
            {/* Export + Print buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer"
                style={{ backgroundColor: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.08)'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print
              </button>
              <button
                onClick={() => sale && exportTransactionDetailToPDF(sale, lines.filter(l => l.record_status !== 'INACTIVE'))}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer"
                style={{ backgroundColor: 'rgba(255,77,106,0.08)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.15)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.08)'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { label: 'Date', value: formatDate(sale?.salesdate) },
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
                  <SortableHeader label="Product Code" field="prodcode" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                  <SortableHeader label="Description" field="description" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                  <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }}>Unit</th>
                  <SortableHeader label="Qty" field="quantity" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="right" />
                  <SortableHeader label="Unit Price" field="unitprice" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="right" />
                  <SortableHeader label="Line Total" field="linetotal" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="right" />
                  {isAdmin && <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }}>Stamp</th>}
                  <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="py-16 text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="font-medium" style={{ color: '#3a6882' }}>No line items</p>
                    <p className="text-sm mt-1" style={{ color: '#2a5a7e' }}>Add a line item to get started</p>
                    </td>
                  </tr>
                ) : (
                  sortedLines.map((l, i) => (
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

        {/* Feature 8 — Grand Total Summary Card */}
        {lines.length > 0 && (
          <div
            className="mt-4 p-5 flex items-center justify-between gap-6 flex-wrap"
            style={{
              backgroundColor: '#0a1628',
              border: '1px solid rgba(0,255,136,0.15)',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 32px rgba(0,255,136,0.04)',
            }}
          >
            <div className="flex items-center gap-8 flex-wrap">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>Line Items</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: '#c8dff5' }}>{itemCount}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>Subtotal</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: '#c8dff5' }}>{fmt(grandTotal)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#00ff88', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.12em' }}>Grand Total</p>
              <p
                className="text-3xl font-bold tabular-nums"
                style={{ color: '#00ff88', textShadow: '0 0 20px rgba(0,255,136,0.5)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '-0.01em' }}
              >
                {fmt(grandTotal)}
              </p>
            </div>
          </div>
        )}

        {showAdd && <AddLineItemModal transno={transNo} onClose={() => setShowAdd(false)} onSuccess={fetchData} />}
        {editLine && <EditLineItemModal line={editLine} onClose={() => setEditLine(null)} onSuccess={fetchData} />}
        {deleteLine && <SoftDeleteDetailDialog line={deleteLine} onClose={() => setDeleteLine(null)} onSuccess={fetchData} />}
      </div>
    </>
  )
}
