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
    { key: 'transactions', label: `Transactions (${deletedSales.length})` },
    { key: 'lineitems', label: `Line Items (${deletedLines.length})` },
  ]

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-5">Deleted Items</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-5">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 mr-2 transition-colors ${
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      ) : tab === 'transactions' ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Trans No</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Agent</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Stamp</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedSales.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-gray-400">No deleted transactions.</td></tr>
                ) : (
                  deletedSales.map(s => (
                    <tr key={s.transno} className="border-b border-gray-100 bg-red-50">
                      <td className="px-4 py-3 font-mono text-gray-700">{s.transno}</td>
                      <td className="px-4 py-3 text-gray-700">{fmtDate(s.salesdate)}</td>
                      <td className="px-4 py-3 text-gray-700">{s.custname}</td>
                      <td className="px-4 py-3 text-gray-700">{s.empname}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(s.totalamount)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate" title={s.stamp}>{s.stamp || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRecoverSale(s.transno)}
                          disabled={recovering === s.transno}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium disabled:opacity-50"
                        >
                          {recovering === s.transno ? 'Recovering…' : 'Recover'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Trans No</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Product Code</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Description</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Qty</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Line Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Stamp</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedLines.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-gray-400">No deleted line items.</td></tr>
                ) : (
                  deletedLines.map(l => {
                    const key = `${l.transno}-${l.prodcode}`
                    return (
                      <tr key={key} className="border-b border-gray-100 bg-red-50">
                        <td className="px-4 py-3 font-mono text-gray-700">{l.transno}</td>
                        <td className="px-4 py-3 font-mono text-gray-700">{l.prodcode}</td>
                        <td className="px-4 py-3 text-gray-700">{l.description}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{Number(l.quantity).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{fmt(l.linetotal)}</td>
                        <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate" title={l.stamp}>{l.stamp || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRecoverLine(l.transno, l.prodcode)}
                            disabled={recovering === key}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium disabled:opacity-50"
                          >
                            {recovering === key ? 'Recovering…' : 'Recover'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
