import { useState } from 'react'
import Modal from './Modal'
import { updateDetailLine } from '../../services/salesDetailService'

const fmt = n => n != null ? `$${Number(n).toFixed(2)}` : ''
const labelClass = 'block text-xs font-bold mb-1.5 uppercase'
const labelStyle = { color: '#1e3a52', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }

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
        <div className="mb-4 px-3.5 py-2.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>
          {error}
        </div>
      )}
      <p className="text-sm mb-4" style={{ color: '#4d7a9e' }}>{line.description}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass} style={labelStyle}>Unit Price</label>
          <input
            readOnly
            value={fmt(line.unitprice)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm"
            style={{ backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.06)', color: '#4d7a9e' }}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Quantity</label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors duration-150"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#4d7a9e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.06)'; e.currentTarget.style.color = '#c8dff5' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4d7a9e' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm font-bold rounded-lg disabled:opacity-50 transition-colors duration-150 cursor-pointer"
            style={{ backgroundColor: '#ffd24d', color: '#040810', boxShadow: '0 0 14px rgba(255,210,77,0.2)', fontFamily: "'Rajdhani', sans-serif" }}
            onMouseEnter={e => { if (!submitting) { e.currentTarget.style.backgroundColor = '#f0c030'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,210,77,0.35)' } }}
            onMouseLeave={e => { if (!submitting) { e.currentTarget.style.backgroundColor = '#ffd24d'; e.currentTarget.style.boxShadow = '0 0 14px rgba(255,210,77,0.2)' } }}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
