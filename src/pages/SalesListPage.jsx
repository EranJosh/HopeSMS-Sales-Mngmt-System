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
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        Failed to load sales: {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Sales Transactions</h1>
        {rights.SALES_ADD === 1 && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Transaction
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-medium text-gray-500 mb-1">Customer Name</label>
          <input type="text" placeholder="Search customer…" value={custSearch} onChange={e => setCustSearch(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={() => { setDateFrom(''); setDateTo(''); setCustSearch('') }}
          className="px-3 py-1.5 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50">
          Clear
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Trans No</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Sales Agent</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Items</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                {isAdmin && <th className="px-4 py-3 text-left font-medium text-gray-600">Stamp</th>}
                <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-gray-400 text-sm">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr
                    key={s.transno}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                      s.record_status === 'INACTIVE' ? 'bg-red-50 opacity-70' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                    onClick={() => navigate(`/sales/${s.transno}`)}
                  >
                    <td className="px-4 py-3 font-mono text-blue-700 font-medium">{s.transno}</td>
                    <td className="px-4 py-3 text-gray-700">{fmtDate(s.salesdate)}</td>
                    <td className="px-4 py-3 text-gray-700">{s.custname}</td>
                    <td className="px-4 py-3 text-gray-700">{s.empname}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{s.lineitemcount}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{fmt(s.totalamount)}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate" title={s.stamp}>
                        {s.stamp || '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        {rights.SALES_EDIT === 1 && s.record_status === 'ACTIVE' && (
                          <button onClick={() => setEditSale(s)}
                            className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 font-medium">
                            Edit
                          </button>
                        )}
                        {rights.SALES_DEL === 1 && s.record_status === 'ACTIVE' && (
                          <button onClick={() => setDeleteSale(s)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium">
                            Delete
                          </button>
                        )}
                        {s.record_status === 'INACTIVE' && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded font-medium">INACTIVE</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {showAdd && <AddSaleModal onClose={() => setShowAdd(false)} onSuccess={fetchSales} />}
      {editSale && <EditSaleModal sale={editSale} onClose={() => setEditSale(null)} onSuccess={fetchSales} />}
      {deleteSale && <SoftDeleteSaleDialog sale={deleteSale} onClose={() => setDeleteSale(null)} onSuccess={fetchSales} />}
    </div>
  )
}
