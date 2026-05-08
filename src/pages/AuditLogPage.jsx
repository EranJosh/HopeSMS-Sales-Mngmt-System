import { useEffect, useState, useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAuditLog } from '../services/auditService'
import { formatDateTime } from '../utils/formatDate'
import useSortableTable from '../hooks/useSortableTable'
import SortableHeader from '../components/SortableHeader'
import LoadingSpinner from '../components/LoadingSpinner'
import * as XLSX from 'xlsx'

const CARD_STYLE = {
  backgroundColor: '#0a1628',
  border: '1px solid rgba(0,229,255,0.08)',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
}

const TH_STYLE = { backgroundColor: '#0d1f36', borderBottom: '1px solid rgba(0,229,255,0.08)' }
const TH_TEXT = { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }

const TYPE_STYLE = {
  SUPERADMIN: { bg: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' },
  ADMIN:      { bg: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' },
  USER:       { bg: 'rgba(77,122,158,0.12)', color: '#4d7a9e', border: '1px solid rgba(77,122,158,0.2)' },
}

const ACTION_STYLE = {
  CREATE:      { bg: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' },
  EDIT:        { bg: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' },
  SOFT_DELETE: { bg: 'rgba(255,77,106,0.1)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)' },
  RECOVER:     { bg: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.15)' },
  ACTIVATE:    { bg: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.15)' },
  DEACTIVATE:  { bg: 'rgba(255,140,0,0.1)', color: '#ffa020', border: '1px solid rgba(255,140,0,0.2)' },
  ROLE_CHANGE: { bg: 'rgba(255,210,77,0.1)', color: '#ffd24d', border: '1px solid rgba(255,210,77,0.2)' },
}

const PAGE_SIZE = 50

const ALL_ACTIONS = ['CREATE','EDIT','SOFT_DELETE','RECOVER','ACTIVATE','DEACTIVATE','ROLE_CHANGE']

const fmtTs = formatDateTime

function FilterInput({ label, value, onChange, placeholder, type = 'text' }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5 uppercase" style={{ color: '#3a6882', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="px-3 py-2 text-sm rounded-lg outline-none"
        style={focused
          ? { backgroundColor: '#070f1e', border: '1px solid rgba(0,255,136,0.4)', color: '#c8dff5', boxShadow: '0 0 0 3px rgba(0,255,136,0.07)' }
          : { backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.12)', color: '#c8dff5' }
        }
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

function exportAuditToExcel(rows) {
  const data = rows.map(r => ({
    'Timestamp': fmtTs(r.created_at),
    'Username': r.username,
    'User Type': r.user_type,
    'Action': r.action,
    'Table': r.target_table,
    'Target ID': r.target_id,
    'Details': r.details,
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Audit Log')
  XLSX.writeFile(wb, `HopeSMS_AuditLog_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export default function AuditLogPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN'
  if (!isAdmin) return <Navigate to="/sales" replace />

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionFilter, setActionFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    getAuditLog(500)
      .then(setLogs)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (actionFilter && l.action !== actionFilter) return false
      if (userFilter && !l.username?.toLowerCase().includes(userFilter.toLowerCase())) return false
      if (dateFrom) { const d = l.created_at?.slice(0, 10); if (d < dateFrom) return false }
      if (dateTo) { const d = l.created_at?.slice(0, 10); if (d > dateTo) return false }
      return true
    })
  }, [logs, actionFilter, userFilter, dateFrom, dateTo])

  useMemo(() => { setPage(1) }, [actionFilter, userFilter, dateFrom, dateTo])

  // Default sort: created_at descending (newest first)
  const { sortedData: sortedFiltered, sortField, sortDir, handleSort } = useSortableTable(filtered, 'created_at', 'desc')
  const SH = { className: 'px-5 py-3.5 text-xs uppercase tracking-widest', style: { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700, backgroundColor: '#0d1f36' } }

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const paginated = sortedFiltered.slice(pageStart, pageStart + PAGE_SIZE)

  function clearFilters() {
    setActionFilter(''); setUserFilter(''); setDateFrom(''); setDateTo('')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>Audit Log</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, backgroundColor: 'rgba(0,229,255,0.07)', color: '#3a6882', border: '1px solid rgba(0,229,255,0.12)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
              {sortedFiltered.length} events
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>Full activity trail for all user actions</p>
        </div>
        <button
          onClick={() => exportAuditToExcel(sortedFiltered)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors duration-150 rounded-lg cursor-pointer"
          style={{ backgroundColor: 'rgba(255,210,77,0.1)', color: '#ffd24d', border: '1px solid rgba(255,210,77,0.2)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.04em' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.18)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.1)'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Excel
        </button>
      </div>

      {/* Filter bar */}
      <div className="p-4 mb-5 flex flex-wrap gap-3 items-end" style={{ ...CARD_STYLE, borderLeft: '2px solid rgba(0,229,255,0.2)' }}>
        {/* Action dropdown */}
        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase" style={{ color: '#3a6882', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }}>Action</label>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg outline-none"
            style={{ backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.12)', color: '#c8dff5', minWidth: 140 }}
          >
            <option value="">All Actions</option>
            {ALL_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <FilterInput label="Username" value={userFilter} onChange={e => setUserFilter(e.target.value)} placeholder="Filter by user..." />
        <FilterInput type="date" label="Date From" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <FilterInput type="date" label="Date To" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <button
          onClick={clearFilters}
          className="px-3 py-2 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer self-end"
          style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#2a5a7e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.06)'; e.currentTarget.style.color = '#00e5ff' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2a5a7e' }}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          {loading ? (
            <LoadingSpinner message="Loading activity log..." />
          ) : error ? (
            <div className="m-6 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>
              {error}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={TH_STYLE}>
                  <SortableHeader label="Timestamp" field="created_at" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                  <SortableHeader label="User" field="username" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                  <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }}>Role</th>
                  <SortableHeader label="Action" field="action" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="center" />
                  <SortableHeader label="Table" field="target_table" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH} align="left" />
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }}>Target ID</th>
                  <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="font-medium" style={{ color: '#3a6882' }}>No activity recorded yet</p>
                    <p className="text-sm mt-1" style={{ color: '#2a5a7e' }}>Actions will be logged here as users interact with the system</p>
                    </td>
                  </tr>
                ) : paginated.map((l, i) => {
                  const ts = TYPE_STYLE[l.user_type] || TYPE_STYLE.USER
                  const as_ = ACTION_STYLE[l.action] || { bg: 'rgba(77,122,158,0.12)', color: '#4d7a9e', border: '1px solid rgba(77,122,158,0.2)' }
                  const isSalesTarget = l.target_table === 'sales' && l.target_id?.startsWith('TR')
                  return (
                    <tr
                      key={l.id}
                      className="transition-colors duration-100"
                      style={{ borderBottom: '1px solid rgba(0,229,255,0.04)', animation: 'fadeInLeft 0.28s ease-out forwards', animationDelay: `${i * 0.02}s`, opacity: 0 }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-5 py-3 text-xs tabular-nums whitespace-nowrap" style={{ color: '#4d7a9e' }}>{fmtTs(l.created_at)}</td>
                      <td className="px-5 py-3 font-semibold text-sm" style={{ color: '#c8dff5' }}>{l.username || <span style={{ color: '#1e3a52' }}>—</span>}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: ts.bg, color: ts.color, border: ts.border, fontFamily: "'Rajdhani', sans-serif" }}>
                          {l.user_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: as_.bg, color: as_.color, border: as_.border, fontFamily: "'Rajdhani', sans-serif" }}>
                          {l.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: '#6a90aa' }}>{l.target_table}</td>
                      <td className="px-5 py-3">
                        {isSalesTarget ? (
                          <button
                            onClick={() => navigate(`/sales/${l.target_id}`)}
                            className="font-mono text-xs font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors duration-150"
                            style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88', border: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.08)'}
                          >
                            {l.target_id}
                          </button>
                        ) : (
                          <span className="font-mono text-xs" style={{ color: '#2a5a7e' }}>{l.target_id}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs max-w-xs truncate" title={l.details} style={{ color: '#4d7a9e' }}>{l.details}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination footer */}
        {!loading && !error && (
          <div
            className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
            style={{ borderTop: '1px solid rgba(0,229,255,0.05)', backgroundColor: '#0d1f36', borderRadius: '0 0 12px 12px' }}
          >
            <span className="text-xs font-medium" style={{ color: '#1e3a52' }}>
              Showing <span className="font-bold" style={{ color: '#4d7a9e' }}>{pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, sortedFiltered.length)}</span> of{' '}
              <span className="font-bold" style={{ color: '#4d7a9e' }}>{sortedFiltered.length}</span> event{sortedFiltered.length !== 1 ? 's' : ''}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#4d7a9e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.07)'; e.currentTarget.style.color = '#00e5ff' } }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4d7a9e' }}
                >
                  ‹ Prev
                </button>
                <span className="px-3 py-1.5 text-xs font-bold" style={{ color: '#4d7a9e', fontFamily: "'Rajdhani', sans-serif" }}>
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#4d7a9e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.07)'; e.currentTarget.style.color = '#00e5ff' } }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4d7a9e' }}
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
