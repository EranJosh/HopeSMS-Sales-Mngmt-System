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
        <div className="mb-4 px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg">
          {error}
        </div>
      )}
      <p className="text-sm text-slate-600 mb-6">
        Delete transaction <span className="font-semibold text-slate-800">{sale.transno}</span>?{' '}
        This will also soft-delete all its line items. The transaction can be recovered later.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-150"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all duration-150"
        >
          {submitting ? 'Deleting...' : 'Delete Transaction'}
        </button>
      </div>
    </Modal>
  )
}
