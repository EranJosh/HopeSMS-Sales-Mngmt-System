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
        <div className="mb-4 px-3.5 py-2.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>
          {error}
        </div>
      )}
      <p className="text-sm mb-6" style={{ color: '#4d7a9e' }}>
        Delete{' '}
        <span className="font-bold" style={{ color: '#c8dff5' }}>{line.prodcode} — {line.description}</span>{' '}
        from transaction{' '}
        <span className="font-bold" style={{ color: '#c8dff5' }}>{line.transno}</span>? This can be recovered later.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer"
          style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#4d7a9e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.06)'; e.currentTarget.style.color = '#c8dff5' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4d7a9e' }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="px-4 py-2 text-sm font-bold rounded-lg disabled:opacity-50 transition-colors duration-150 cursor-pointer"
          style={{ backgroundColor: '#ff4d6a', color: '#ffffff', boxShadow: '0 0 14px rgba(255,77,106,0.25)', fontFamily: "'Rajdhani', sans-serif" }}
          onMouseEnter={e => { if (!submitting) { e.currentTarget.style.backgroundColor = '#e03058'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,77,106,0.4)' } }}
          onMouseLeave={e => { if (!submitting) { e.currentTarget.style.backgroundColor = '#ff4d6a'; e.currentTarget.style.boxShadow = '0 0 14px rgba(255,77,106,0.25)' } }}
        >
          {submitting ? 'Deleting...' : 'Delete Line Item'}
        </button>
      </div>
    </Modal>
  )
}
