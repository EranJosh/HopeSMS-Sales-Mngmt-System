import { useEffect, useState } from 'react'
import Modal from './Modal'
import { addDetailLine } from '../../services/salesDetailService'
import { getProducts, getCurrentPrice } from '../../services/lookupService'

const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5 tracking-wide'
const inputClass = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-150'
const readonlyClass = 'w-full border border-slate-200 bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-400'

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
        <div className="mb-4 px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Product</label>
          <select
            required
            value={prodcode}
            onChange={e => handleProductChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Select product</option>
            {products.map(p => (
              <option key={p.prodcode} value={p.prodcode}>{p.prodcode} - {p.description}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Unit Price (auto-filled)</label>
          <input
            readOnly
            value={unitprice ? (isNaN(unitprice) ? unitprice : `$${Number(unitprice).toFixed(2)}`) : ''}
            placeholder="Select a product above"
            className={readonlyClass}
          />
        </div>
        <div>
          <label className={labelClass}>Quantity</label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="e.g. 5"
            className={inputClass}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-all duration-150"
            style={{ backgroundColor: '#10b981' }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#059669' }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#10b981' }}
          >
            {submitting ? 'Saving...' : 'Add Line Item'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
