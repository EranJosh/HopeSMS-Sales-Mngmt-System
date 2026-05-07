import { useEffect, useState } from 'react'
import { getEmployees } from '../services/lookupService'

const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''

const CARD_STYLE = {
  backgroundColor: '#0a1628',
  border: '1px solid rgba(0,229,255,0.08)',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
}

const TH_STYLE = { backgroundColor: '#0d1f36', borderBottom: '1px solid rgba(0,229,255,0.08)' }
const TH_TEXT = { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="rounded-full animate-spin" style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#00ff88', borderTopColor: 'transparent', boxShadow: '0 0 12px rgba(0,255,136,0.3)' }} />
      </div>
    )
  }
  if (error) {
    return <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>{error}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>Employees</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, backgroundColor: 'rgba(0,229,255,0.07)', color: '#3a6882', border: '1px solid rgba(0,229,255,0.12)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>{employees.length} records</span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>Read-only lookup table</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,229,255,0.06)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}>
          Read-only
        </span>
      </div>

      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={TH_STYLE}>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Emp No</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Last Name</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>First Name</th>
                <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Gender</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Hire Date</th>
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      <span className="text-sm" style={{ color: '#1e3a52' }}>No employees found</span>
                    </div>
                  </td>
                </tr>
              ) : employees.map(e => (
                <tr
                  key={e.empno}
                  className="transition-colors duration-100"
                  style={{ borderBottom: '1px solid rgba(0,229,255,0.04)', opacity: e.sepdate ? 0.6 : 1 }}
                  onMouseEnter={ev => ev.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.03)'}
                  onMouseLeave={ev => ev.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(0,229,255,0.06)', color: '#00e5ff' }}>{e.empno}</span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: '#c8dff5' }}>{e.lastname}</td>
                  <td className="px-5 py-3.5" style={{ color: '#6a90aa' }}>{e.firstname}</td>
                  <td className="px-5 py-3.5 text-center text-xs font-bold uppercase" style={{ color: '#4d7a9e' }}>{e.gender}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#4d7a9e' }}>{fmtDate(e.hiredate)}</td>
                  <td className="px-5 py-3.5">
                    {e.sepdate ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,77,106,0.08)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)', fontFamily: "'Rajdhani', sans-serif" }}>
                        Separated {fmtDate(e.sepdate)}
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)', fontFamily: "'Rajdhani', sans-serif" }}>
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center" style={{ borderTop: '1px solid rgba(0,229,255,0.05)', backgroundColor: '#0d1f36' }}>
          <span className="text-xs font-medium" style={{ color: '#1e3a52' }}>
            <span className="font-bold" style={{ color: '#4d7a9e' }}>{employees.length}</span> employee{employees.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
