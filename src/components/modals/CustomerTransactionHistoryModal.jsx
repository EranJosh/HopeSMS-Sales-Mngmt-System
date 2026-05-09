import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTransactionsByCustomer } from '../../services/lookupService'
import { formatDate } from '../../utils/formatDate'

const fmt = n => n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) : '--'

const TH_STYLE = { backgroundColor: '#0d1f36', borderBottom: '1px solid rgba(0,229,255,0.08)' }
const TH_TEXT = { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }

const STATUS_BADGE = {
  ACTIVE:   { bg: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' },
  INACTIVE: { bg: 'rgba(255,77,106,0.08)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)' },
}

export default function CustomerTransactionHistoryModal({ customer, onClose }) {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getTransactionsByCustomer(customer.custno)
      .then(setTransactions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [customer.custno])

  const totalRevenue = transactions.reduce((s, t) => s + Number(t.totalamount || 0), 0)
  const latestDate = transactions[0]?.salesdate || null

  function handleTransClick(transno) {
    onClose()
    navigate(`/sales/${transno}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(5,10,15,0.88)', backdropFilter: 'blur(5px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: 800,
          maxHeight: '90vh',
          backgroundColor: '#0a1628',
          border: '1px solid rgba(0,229,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.75)',
          animation: 'scaleIn 0.22s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(0,229,255,0.08)', backgroundColor: '#0d1f36', borderRadius: '16px 16px 0 0' }}
        >
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-base" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif" }}>
                {customer.custname}
              </h2>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(0,229,255,0.07)', color: '#00e5ff' }}>
                {customer.custno}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#2a5a7e' }}>Transaction History</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: '#2a5a7e', backgroundColor: 'transparent', border: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.1)'; e.currentTarget.style.color = '#ff4d6a' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2a5a7e' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Summary cards */}
        {!loading && !error && (
          <div className="flex-shrink-0 px-6 py-4 grid grid-cols-3 gap-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.06)' }}>
            {[
              { label: 'Total Transactions', value: transactions.length, color: '#c8dff5' },
              { label: 'Total Revenue', value: fmt(totalRevenue), color: '#00ff88' },
              { label: 'Latest Transaction', value: formatDate(latestDate), color: '#4d7a9e' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.07)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif" }}>{s.label}</p>
                <p className="text-base font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="rounded-full animate-spin" style={{ width: 28, height: 28, borderWidth: 3, borderStyle: 'solid', borderColor: '#00ff88', borderTopColor: 'transparent', boxShadow: '0 0 10px rgba(0,255,136,0.3)' }} />
            </div>
          ) : error ? (
            <div className="m-6 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>{error}</div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="text-sm" style={{ color: '#1e3a52' }}>No transactions found for this customer</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr style={TH_STYLE}>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Trans No</th>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Date</th>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Sales Agent</th>
                  <th className="px-5 py-3.5 text-right text-xs uppercase tracking-widest" style={TH_TEXT}>Items</th>
                  <th className="px-5 py-3.5 text-right text-xs uppercase tracking-widest" style={TH_TEXT}>Total</th>
                  <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => {
                  const ss = STATUS_BADGE[t.record_status] || STATUS_BADGE.ACTIVE
                  return (
                    <tr
                      key={t.transno}
                      className="cursor-pointer transition-colors duration-100"
                      style={{ borderBottom: '1px solid rgba(0,229,255,0.04)', animation: 'fadeInLeft 0.28s ease-out forwards', animationDelay: `${i * 0.03}s`, opacity: 0 }}
                      onClick={() => handleTransClick(t.transno)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88' }}>{t.transno}</span>
                      </td>
                      <td className="px-5 py-3 text-sm" style={{ color: '#4d7a9e' }}>{formatDate(t.salesdate)}</td>
                      <td className="px-5 py-3" style={{ color: '#6a90aa' }}>{t.empname}</td>
                      <td className="px-5 py-3 text-right tabular-nums" style={{ color: '#6a90aa' }}>{t.lineitemcount}</td>
                      <td className="px-5 py-3 text-right font-bold tabular-nums" style={{ color: '#c8dff5' }}>{fmt(t.totalamount)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: ss.bg, color: ss.color, border: ss.border, fontFamily: "'Rajdhani', sans-serif" }}>
                          {t.record_status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && transactions.length > 0 && (
          <div className="flex-shrink-0 px-5 py-3" style={{ borderTop: '1px solid rgba(0,229,255,0.05)', backgroundColor: '#0d1f36', borderRadius: '0 0 16px 16px' }}>
            <span className="text-xs" style={{ color: '#1e3a52' }}>
              <span className="font-bold" style={{ color: '#4d7a9e' }}>{transactions.length}</span> transaction{transactions.length !== 1 ? 's' : ''} · Click a row to open transaction
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
