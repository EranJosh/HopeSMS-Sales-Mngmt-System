import { useEffect, useMemo, useState } from 'react'
import { getEmployees } from '../services/lookupService'
import { formatDate } from '../utils/formatDate'
import useSortableTable from '../hooks/useSortableTable'
import SortableHeader from '../components/SortableHeader'
import LoadingSpinner from '../components/LoadingSpinner'
import EmployeePerformanceModal from '../components/modals/EmployeePerformanceModal'

const CARD_STYLE = { backgroundColor: '#0a1628', border: '1px solid rgba(0,229,255,0.08)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }
const TH_STYLE = { backgroundColor: '#0d1f36', borderBottom: '1px solid rgba(0,229,255,0.08)' }
const TH_TEXT = { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }
const SH = { className: 'px-5 py-3.5 text-xs uppercase tracking-widest', style: { ...TH_TEXT, backgroundColor: '#0d1f36' } }

export default function EmployeeLookupPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)
  const [perfEmployee, setPerfEmployee] = useState(null)

  useEffect(() => {
    getEmployees().then(setEmployees).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() =>
    employees.filter(e =>
      !search ||
      e.empno?.toLowerCase().includes(search.toLowerCase()) ||
      e.lastname?.toLowerCase().includes(search.toLowerCase()) ||
      e.firstname?.toLowerCase().includes(search.toLowerCase())
    ),
    [employees, search]
  )

  const { sortedData, sortField, sortDir, handleSort } = useSortableTable(filtered)

  if (loading) return <LoadingSpinner message="Loading employees..." />
  if (error) return <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>Employees</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, backgroundColor: 'rgba(0,229,255,0.07)', color: '#3a6882', border: '1px solid rgba(0,229,255,0.12)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
              {search ? `${filtered.length} of ${employees.length}` : employees.length} records
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>Read-only lookup table · Click a row to view performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={focused ? '#00ff88' : '#1e3a52'} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Search by employee name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 pr-3 py-2.5 text-sm rounded-lg outline-none" style={focused ? { backgroundColor: '#070f1e', border: '1px solid rgba(0,255,136,0.4)', color: '#c8dff5', boxShadow: '0 0 0 3px rgba(0,255,136,0.07)', minWidth: 260 } : { backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.12)', color: '#c8dff5', minWidth: 260 }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,229,255,0.06)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}>Read-only</span>
        </div>
      </div>

      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={TH_STYLE}>
                <SortableHeader label="Emp No" field="empno" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                <SortableHeader label="Last Name" field="lastname" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                <SortableHeader label="First Name" field="firstname" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Gender</th>
                <SortableHeader label="Hire Date" field="hiredate" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Status</th>
                <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Performance</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="text-4xl mb-3">👤</div>
                    <p className="font-medium" style={{ color: '#3a6882' }}>No employees found</p>
                    <p className="text-sm mt-1" style={{ color: '#2a5a7e' }}>Try a different search term</p>
                  </td>
                </tr>
              ) : sortedData.map(e => (
                <tr key={e.empno} className="cursor-pointer transition-colors duration-100" style={{ borderBottom: '1px solid rgba(0,229,255,0.04)', opacity: e.sepdate ? 0.6 : 1 }} onClick={() => setPerfEmployee(e)} onMouseEnter={ev => ev.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.03)'} onMouseLeave={ev => ev.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="px-5 py-3.5"><span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(0,229,255,0.06)', color: '#00e5ff' }}>{e.empno}</span></td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: '#c8dff5' }}>{e.lastname}</td>
                  <td className="px-5 py-3.5" style={{ color: '#6a90aa' }}>{e.firstname}</td>
                  <td className="px-5 py-3.5 text-center text-xs font-bold uppercase" style={{ color: '#4d7a9e' }}>{e.gender}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#4d7a9e' }}>{formatDate(e.hiredate)}</td>
                  <td className="px-5 py-3.5">
                    {e.sepdate
                      ? <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,77,106,0.08)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)', fontFamily: "'Rajdhani', sans-serif" }}>Separated {formatDate(e.sepdate)}</span>
                      : <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)', fontFamily: "'Rajdhani', sans-serif" }}>Active</span>
                    }
                  </td>
                  <td className="px-5 py-3.5 text-center" onClick={ev => { ev.stopPropagation(); setPerfEmployee(e) }}>
                    <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer mx-auto" style={{ backgroundColor: 'rgba(255,210,77,0.08)', color: '#ffd24d', border: '1px solid rgba(255,210,77,0.2)', fontFamily: "'Rajdhani', sans-serif" }} onMouseEnter={ev => { ev.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.16)'; ev.currentTarget.style.borderColor = 'rgba(255,210,77,0.35)' }} onMouseLeave={ev => { ev.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.08)'; ev.currentTarget.style.borderColor = 'rgba(255,210,77,0.2)' }}>
                      Stats <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center" style={{ borderTop: '1px solid rgba(0,229,255,0.05)', backgroundColor: '#0d1f36' }}>
          <span className="text-xs font-medium" style={{ color: '#1e3a52' }}>
            {search
              ? <><span className="font-bold" style={{ color: '#4d7a9e' }}>{filtered.length}</span> of <span className="font-bold" style={{ color: '#4d7a9e' }}>{employees.length}</span> employees found</>
              : <><span className="font-bold" style={{ color: '#4d7a9e' }}>{employees.length}</span> employee{employees.length !== 1 ? 's' : ''}</>
            }
          </span>
        </div>
      </div>

      {perfEmployee && <EmployeePerformanceModal employee={perfEmployee} onClose={() => setPerfEmployee(null)} />}
    </div>
  )
}
