import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from './Modal'
import { addDetailLine } from '../../services/salesDetailService'
import { getProducts, getCurrentPrice } from '../../services/lookupService'
import { useAuth } from '../../context/AuthContext'

const labelClass = 'block text-xs font-bold mb-1.5 uppercase'
const labelStyle = { color: '#1e3a52', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }

export default function AddLineItemModal({ transno, onClose, onSuccess }) {
  const { currentUser } = useAuth()
  const [prodcode, setProdcode] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitprice, setUnitprice] = useState('')
  const [products, setProducts] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoadingOptions(true)
    getProducts().then(setProducts).catch(() => {}).finally(() => setLoadingOptions(false))
  }, [])

  async function handleProductChange(code) {
    setProdcode(code)
    setUnitprice('')
    if (code) {
      try {
        const price = await getCurrentPrice(code)
        setUnitprice(price != null ? String(price) : 'N/A')
      } catch { setUnitprice('N/A') }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await addDetailLine({ transno, prodcode, quantity }, currentUser)
      toast.success('Line item added')
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
      toast.error('Failed to add line item. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Add Line Item" onClose={onClose}>
      {error && <div className="mb-4 px-3.5 py-2.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass} style={labelStyle}>Product</label>
          <select required value={prodcode} onChange={e => handleProductChange(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors duration-150" disabled={loadingOptions}>
            <option value="">{loadingOptions ? 'Loading options...' : 'Select product'}</option>
            {products.map(p => <option key={p.prodcode} value={p.prodcode}>{p.prodcode} - {p.description}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Unit Price (auto-filled)</label>
          <input readOnly value={unitprice ? (isNaN(unitprice) ? unitprice : `$${Number(unitprice).toFixed(2)}`) : ''} placeholder="Select a product above" className="w-full rounded-lg px-3.5 py-2.5 text-sm" style={{ backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.06)', color: '#4d7a9e' }} />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Quantity</label>
          <input type="number" required min="0.01" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 5" className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors duration-150" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer" style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#4d7a9e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.06)'; e.currentTarget.style.color = '#c8dff5' }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4d7a9e' }}>Cancel</button>
          <button type="submit" disabled={submitting || loadingOptions} className="px-4 py-2 text-sm font-bold rounded-lg disabled:opacity-50 transition-colors duration-150 cursor-pointer" style={{ backgroundColor: '#00ff88', color: '#040810', boxShadow: '0 0 14px rgba(0,255,136,0.22)', fontFamily: "'Rajdhani', sans-serif" }} onMouseEnter={e => { if (!submitting) { e.currentTarget.style.backgroundColor = '#00e07a'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,136,0.35)' } }} onMouseLeave={e => { if (!submitting) { e.currentTarget.style.backgroundColor = '#00ff88'; e.currentTarget.style.boxShadow = '0 0 14px rgba(0,255,136,0.22)' } }}>
            {submitting ? 'Saving...' : 'Add Line Item'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
