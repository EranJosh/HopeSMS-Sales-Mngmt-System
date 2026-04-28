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
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
  }

  return (
    <div>
      {/* Back button + header */}
      <button
        onClick={() => navigate('/sales')}
        className="mb-4 flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        ← Back to Transactions
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800 font-mono">{transNo}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{fmtDate(sale?.salesdate)}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p><span className="font-medium">Customer:</span> {sale?.custname}</p>
            <p><span className="font-medium">Agent:</span> {sale?.empname}</p>
          </div>
        </div>
        {isAdmin && sale?.stamp && (
          <p className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-2">Stamp: {sale.stamp}</p>
        )}
      </div>

      {/* Line items */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-700">Line Items</h2>
        {rights.SD_ADD === 1 && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Line Item
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Product Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Description</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Unit</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Unit Price</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Line Total</th>
                {isAdmin && <th className="px-4 py-3 text-left font-medium text-gray-600">Stamp</th>}
                <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-10 text-center text-gray-400 text-sm">
                    No line items found.
                  </td>
                </tr>
              ) : (
                lines.map((l, i) => (
                  <tr
                    key={`${l.transno}-${l.prodcode}`}
                    className={`border-b border-gray-100 ${
                      l.record_status === 'INACTIVE' ? 'bg-red-50 opacity-70' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-gray-700">{l.prodcode}</td>
                    <td className="px-4 py-3 text-gray-700">{l.description}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{l.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{Number(l.quantity).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(l.unitprice)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{fmt(l.linetotal)}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate" title={l.stamp}>
                        {l.stamp || '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {rights.SD_EDIT === 1 && l.record_status === 'ACTIVE' && (
                          <button onClick={() => setEditLine(l)}
                            className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 font-medium">
                            Edit
                          </button>
                        )}
                        {rights.SD_DEL === 1 && l.record_status === 'ACTIVE' && (
                          <button onClick={() => setDeleteLine(l)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium">
                            Delete
                          </button>
                        )}
                        {l.record_status === 'INACTIVE' && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded font-medium">INACTIVE</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {lines.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Grand Total
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
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
