// Responsive fix: modal and detail page layout verified across mobile and desktop breakpoints — Micole Kurt Gonda
import { useEffect, useState } from 'react'
import Modal from './Modal'
import { updateSale } from '../../services/salesService'
import { getCustomers, getEmployees } from '../../services/lookupService'

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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sales Date</label>
          <input
            type="date"
            required
            value={salesdate}
            onChange={e => setSalesdate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <select
            required
            value={custno}
            onChange={e => setCustno(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select customer —</option>
            {customers.map(c => (
              <option key={c.custno} value={c.custno}>{c.custname}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sales Agent</label>
          <select
            required
            value={empno}
            onChange={e => setEmpno(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select employee —</option>
            {employees.map(e => (
              <option key={e.empno} value={e.empno}>{e.lastname}, {e.firstname}</option>
            ))}
          </select>
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
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
