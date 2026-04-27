import { useEffect, useState } from 'react'
import { getEmployees } from '../services/lookupService'

const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

export default function EmployeeLookupPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (error) return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Employees</h1>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Read-only lookup</span>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Emp No</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Last Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">First Name</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Gender</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Hire Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Sep Date</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">No employees found.</td></tr>
              ) : employees.map((e, i) => (
                <tr key={e.empno} className={`border-b border-gray-100 ${e.sepdate ? 'opacity-60' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3 font-mono text-gray-600">{e.empno}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{e.lastname}</td>
                  <td className="px-4 py-3 text-gray-700">{e.firstname}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{e.gender}</td>
                  <td className="px-4 py-3 text-gray-600">{fmtDate(e.hiredate)}</td>
                  <td className="px-4 py-3 text-gray-500">{e.sepdate ? fmtDate(e.sepdate) : <span className="text-green-600 font-medium text-xs">Active</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">{employees.length} employee{employees.length !== 1 ? 's' : ''}</div>
      </div>
    </div>
  )
}
