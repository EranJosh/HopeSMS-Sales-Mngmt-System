import { useEffect, useState } from 'react'
import Modal from './Modal'
import { addDetailLine } from '../../services/salesDetailService'
import { getProducts, getCurrentPrice } from '../../services/lookupService'

export default function AddLineItemModal({ transno, onClose, onSuccess }) {
  const [prodcode, setProdcode] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitprice, setUnitprice] = useState('')
  const [products, setProducts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {})
  }, [])

  async function handleProductChange(code) {
    setProdcode(code)
    setUnitprice('')
    if (code) {
      try {
        const price = await getCurrentPrice(code)
        setUnitprice(price != null ? String(price) : 'N/A')
      } catch {
        setUnitprice('N/A')
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await addDetailLine({ transno, prodcode, quantity })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Add Line Item" onClose={onClose}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
          <select
            required
            value={prodcode}
            onChange={e => handleProductChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select product —</option>
            {products.map(p => (
              <option key={p.prodcode} value={p.prodcode}>{p.prodcode} — {p.description}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (auto-filled)</label>
          <input
            readOnly
            value={unitprice ? (isNaN(unitprice) ? unitprice : `$${Number(unitprice).toFixed(2)}`) : '—'}
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 5"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Add Line Item'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
