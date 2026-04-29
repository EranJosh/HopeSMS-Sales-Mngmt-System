// DeletedItemsPage — Transactions tab + Line Items tab; Recover buttons; sidebar link hidden for USER — Micole Kurt Gonda
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDeletedSales, recoverSale } from '../services/salesService'
import { getDeletedDetailLines, recoverDetailLine } from '../services/salesDetailService'

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

export default function DeletedItemsPage() {
  const { currentUser } = useAuth()

  // USER accounts are blocked — redirect enforced here as well as in ProtectedRoute
  if (currentUser?.user_type === 'USER') {
    return <Navigate to="/sales" replace />
  }

  const [tab, setTab] = useState('transactions')
  const [deletedSales, setDeletedSales] = useState([])
  const [deletedLines, setDeletedLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recovering, setRecovering] = useState(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [sales, lines] = await Promise.all([getDeletedSales(), getDeletedDetailLines()])
      setDeletedSales(sales)
      setDeletedLines(lines)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function handleRecoverSale(transno) {
    setRecovering(transno)
    try {
      await recoverSale(transno)
      await fetchData()
    } catch (err) {
      alert('Recovery failed: ' + err.message)
    } finally {
      setRecovering(null)
    }
  }

  async function handleRecoverLine(transno, prodcode) {
    const key = `${transno}-${prodcode}`
    setRecovering(key)
    try {
      await recoverDetailLine(transno, prodcode)
      await fetchData()
    } catch (err) {
      alert('Recovery failed: ' + err.message)
    } finally {
      setRecovering(null)
    }
  }

  const tabs = [
    { key: 'transactions', label: 'Transactions', count: deletedSales.length },
    { key: 'lineitems', label: 'Line Items', count: deletedLines.length },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deleted Items</h1>
        <p className="text-sm text-slate-500 mt-0.5">Soft-deleted records available for recovery</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ backgroundColor: '#f1f5f9' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 text-sm font-semibold transition-all duration-150 rounded-lg cursor-pointer flex items-center gap-2"
            style={tab === t.key
              ? { backgroundColor: '#ffffff', color: '#059669', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
              : { backgroundColor: 'transparent', color: '#64748b' }
            }
            onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.color = '#334155' }}
            onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.color = '#64748b' }}
          >
            {t.label}
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={tab === t.key
                ? { backgroundColor: 'rgba(16,185,129,0.12)', color: '#059669' }
                : { backgroundColor: '#e2e8f0', color: '#94a3b8' }
              }
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="rounded-full animate-spin" style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#10b981', borderTopColor: 'transparent' }} />
        </div>
      ) : error ? (
        <div className="px-4 py-3 rounded-xl text-red-700 text-sm font-medium" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>{error}</div>
      ) : tab === 'transactions' ? (
        <div style={CARD_STYLE}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Trans No</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Agent</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Stamp</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                        <span className="text-slate-400 text-sm">No deleted transactions</span>
                      </div>
                    </td>
                  </tr>
                ) : deletedSales.map(s => (
                  <tr
                    key={s.transno}
                    className="transition-colors duration-100"
                    style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fff5f5' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff5f5'}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                        {s.transno}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-sm">{fmtDate(s.salesdate)}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{s.custname}</td>
                    <td className="px-5 py-3.5 text-slate-500">{s.empname}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-800 tabular-nums">{fmt(s.totalamount)}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate" title={s.stamp}>{s.stamp || '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleRecoverSale(s.transno)}
                        disabled={recovering === s.transno}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}
                        onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.15)' }}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.08)'}
                      >
                        {recovering === s.transno ? 'Recovering…' : 'Recover'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={CARD_STYLE}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Trans No</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Product Code</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Qty</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Line Total</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Stamp</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedLines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                        <span className="text-slate-400 text-sm">No deleted line items</span>
                      </div>
                    </td>
                  </tr>
                ) : deletedLines.map(l => {
                  const key = `${l.transno}-${l.prodcode}`
                  return (
                    <tr
                      key={key}
                      className="transition-colors duration-100"
                      style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fff5f5' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff5f5'}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{l.transno}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                          {l.prodcode}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">{l.description}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600 tabular-nums">{Number(l.quantity).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-800 tabular-nums">{fmt(l.linetotal)}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate" title={l.stamp}>{l.stamp || '—'}</td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleRecoverLine(l.transno, l.prodcode)}
                          disabled={recovering === key}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}
                          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.15)' }}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.08)'}
                        >
                          {recovering === key ? 'Recovering…' : 'Recover'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
