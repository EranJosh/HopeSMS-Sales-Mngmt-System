// DeletedItemsPage -- Transactions tab + Line Items tab; Recover buttons; sidebar link hidden for USER -- Micole Kurt Gonda
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDeletedSales, recoverSale } from '../services/salesService'
import { getDeletedDetailLines, recoverDetailLine } from '../services/salesDetailService'

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

export default function DeletedItemsPage() {
  const { currentUser } = useAuth()

  // USER accounts are blocked -- redirect enforced here as well as in ProtectedRoute
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
        <div className="flex items-center gap-3 mb-0.5">
          <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>Deleted Items</h1>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, backgroundColor: 'rgba(255,77,106,0.08)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>Recoverable</span>
        </div>
        <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>Soft-deleted records available for recovery</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ backgroundColor: '#0d1f36', border: '1px solid rgba(0,229,255,0.07)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 text-sm font-bold transition-colors duration-150 rounded-lg cursor-pointer flex items-center gap-2"
            style={tab === t.key
              ? { backgroundColor: '#0a1628', color: '#00ff88', boxShadow: '0 0 12px rgba(0,255,136,0.1), 0 1px 3px rgba(0,0,0,0.3)', fontFamily: "'Rajdhani', sans-serif" }
              : { backgroundColor: 'transparent', color: '#2a5a7e', fontFamily: "'Rajdhani', sans-serif" }
            }
            onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.color = '#4d7a9e' }}
            onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.color = '#2a5a7e' }}
          >
            {t.label}
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={tab === t.key
                ? { backgroundColor: 'rgba(0,255,136,0.1)', color: '#00ff88' }
                : { backgroundColor: 'rgba(0,229,255,0.06)', color: '#1e3a52' }
              }
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="rounded-full animate-spin" style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#00ff88', borderTopColor: 'transparent', boxShadow: '0 0 12px rgba(0,255,136,0.3)' }} />
        </div>
      ) : error ? (
        <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>{error}</div>
      ) : tab === 'transactions' ? (
        <div style={CARD_STYLE}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={TH_STYLE}>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Trans No</th>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Date</th>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Customer</th>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Agent</th>
                  <th className="px-5 py-3.5 text-right text-xs uppercase tracking-widest" style={TH_TEXT}>Total</th>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Stamp</th>
                  <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="1.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                        <span className="text-sm" style={{ color: '#1e3a52' }}>No deleted transactions</span>
                      </div>
                    </td>
                  </tr>
                ) : deletedSales.map(s => (
                  <tr
                    key={s.transno}
                    className="transition-colors duration-100"
                    style={{ borderBottom: '1px solid rgba(0,229,255,0.04)', backgroundColor: 'rgba(255,77,106,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.04)'}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(255,77,106,0.12)', color: '#ff4d6a' }}>
                        {s.transno}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#4d7a9e' }}>{fmtDate(s.salesdate)}</td>
                    <td className="px-5 py-3.5 font-medium" style={{ color: '#a8c8e8' }}>{s.custname}</td>
                    <td className="px-5 py-3.5" style={{ color: '#4d7a9e' }}>{s.empname}</td>
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums" style={{ color: '#c8dff5' }}>{fmt(s.totalamount)}</td>
                    <td className="px-5 py-3.5 text-xs max-w-xs truncate" title={s.stamp} style={{ color: '#1e3a52' }}>{s.stamp || '--'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleRecoverSale(s.transno)}
                        disabled={recovering === s.transno}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
                        onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.15)' }}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.08)'}
                      >
                        {recovering === s.transno ? 'Recovering...' : 'Recover'}
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
                <tr style={TH_STYLE}>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Trans No</th>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Product Code</th>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Description</th>
                  <th className="px-5 py-3.5 text-right text-xs uppercase tracking-widest" style={TH_TEXT}>Qty</th>
                  <th className="px-5 py-3.5 text-right text-xs uppercase tracking-widest" style={TH_TEXT}>Line Total</th>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Stamp</th>
                  <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedLines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="1.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                        <span className="text-sm" style={{ color: '#1e3a52' }}>No deleted line items</span>
                      </div>
                    </td>
                  </tr>
                ) : deletedLines.map(l => {
                  const key = `${l.transno}-${l.prodcode}`
                  return (
                    <tr
                      key={key}
                      className="transition-colors duration-100"
                      style={{ borderBottom: '1px solid rgba(0,229,255,0.04)', backgroundColor: 'rgba(255,77,106,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.04)'}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs" style={{ color: '#4d7a9e' }}>{l.transno}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(255,77,106,0.12)', color: '#ff4d6a' }}>
                          {l.prodcode}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium" style={{ color: '#a8c8e8' }}>{l.description}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums" style={{ color: '#6a90aa' }}>{Number(l.quantity).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-right font-bold tabular-nums" style={{ color: '#c8dff5' }}>{fmt(l.linetotal)}</td>
                      <td className="px-5 py-3.5 text-xs max-w-xs truncate" title={l.stamp} style={{ color: '#1e3a52' }}>{l.stamp || '--'}</td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleRecoverLine(l.transno, l.prodcode)}
                          disabled={recovering === key}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
                          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.15)' }}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.08)'}
                        >
                          {recovering === key ? 'Recovering...' : 'Recover'}
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
