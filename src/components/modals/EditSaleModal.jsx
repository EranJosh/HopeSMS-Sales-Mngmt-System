// Responsive fix: modal and detail page layout verified across mobile and desktop breakpoints  Micole Kurt Gonda
import { useEffect, useState } from 'react'
import Modal from './Modal'
import { updateSale } from '../../services/salesService'
import { getCustomers, getEmployees } from '../../services/lookupService'

const labelClass = 'block text-xs font-bold mb-1.5 uppercase'
const labelStyle = { color: '#1e3a52', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }

export default function EditSaleModal({ sale, onClose, onSuccess }) {
  const [salesdate, setSalesdate] = useState(sale.salesdate || '')
  const [custno, setCustno] = useState(sale.custno || '')
  const [empno, setEmpno] = useState(sale.empno || '')
  const [customers, setCustomers] = useState([])
  const [employees, setEmployees] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCustomers().then(setCustomers).catch(() => {})
    getEmployees().then(setEmployees).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await updateSale(sale.transno, { salesdate, custno, empno })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Edit Transaction ${sale.transno}`} onClose={onClose}>
      {error && (
        <div className="mb-4 px-3.5 py-2.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass} style={labelStyle}>Sales Date</label>
          <input type="date" required value={salesdate} onChange={e => setSalesdate(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors duration-150" />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Customer</label>
          <select required value={custno} onChange={e => setCustno(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors duration-150">
            <option value="">Select customer</option>
            {customers.map(c => (
              <option key={c.custno} value={c.custno}>{c.custname}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Sales Agent</label>
          <select required value={empno} onChange={e => setEmpno(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors duration-150">
            <option value="">Select employee</option>
            {employees.map(e => (
              <option key={e.empno} value={e.empno}>{e.lastname}, {e.firstname}</option>
            ))}
          </select>
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
