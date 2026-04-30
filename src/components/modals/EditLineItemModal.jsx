import { useState } from 'react'
import Modal from './Modal'
import { updateDetailLine } from '../../services/salesDetailService'

const fmt = n => n != null ? `$${Number(n).toFixed(2)}` : ''
const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5 tracking-wide'

export default function EditLineItemModal({ line, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(String(line.quantity || ''))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await updateDetailLine(line.transno, line.prodcode, { quantity })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Edit Line Item - ${line.prodcode}`} onClose={onClose} maxWidth="max-w-md">
      {error && (
        <div className="mb-4 px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg">
          {error}
        </div>
      )}
      <p className="text-sm text-slate-500 mb-4">{line.description}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Unit Price</label>
          <input
            readOnly
            value={fmt(line.unitprice)}
            className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-400"
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
            className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-150"
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
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
