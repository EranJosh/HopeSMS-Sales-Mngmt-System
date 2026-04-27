import { useState } from 'react'
import Modal from './Modal'
import { softDeleteSale } from '../../services/salesService'

export default function SoftDeleteSaleDialog({ sale, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setError('')
    setSubmitting(true)
    try {
      await softDeleteSale(sale.transno)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Confirm Delete" onClose={onClose} maxWidth="max-w-md">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      <p className="text-sm text-gray-700 mb-6">
        Delete transaction <span className="font-semibold">{sale.transno}</span>?{' '}
        This will also soft-delete all its line items. The transaction can be recovered later.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? 'Deleting…' : 'Delete Transaction'}
        </button>
      </div>
    </Modal>
  )
}
