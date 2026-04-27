import { useState } from 'react'
import Modal from './Modal'
import { softDeleteDetailLine } from '../../services/salesDetailService'

export default function SoftDeleteDetailDialog({ line, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setError('')
    setSubmitting(true)
    try {
      await softDeleteDetailLine(line.transno, line.prodcode)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Confirm Delete Line Item" onClose={onClose} maxWidth="max-w-md">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      <p className="text-sm text-gray-700 mb-6">
        Delete <span className="font-semibold">{line.prodcode} — {line.description}</span> from transaction{' '}
        <span className="font-semibold">{line.transno}</span>? This can be recovered later.
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
          {submitting ? 'Deleting…' : 'Delete Line Item'}
        </button>
      </div>
    </Modal>
  )
}
