import { useState } from 'react'
import Modal from './Modal'
import { updateDetailLine } from '../../services/salesDetailService'

const fmt = n => n != null ? `$${Number(n).toFixed(2)}` : ''

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
    <Modal title={`Edit Line Item  ${line.prodcode}`} onClose={onClose} maxWidth="max-w-md">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      <p className="text-sm text-gray-600 mb-4">{line.description}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
          <input
            readOnly
            value={fmt(line.unitprice)}
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
            {submitting ? 'Saving' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
