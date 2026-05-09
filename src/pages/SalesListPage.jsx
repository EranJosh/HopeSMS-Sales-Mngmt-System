// UI polish: loading skeletons, empty states, error toasts, mobile verified -- Micole Kurt Gonda
// Rights gating: Add Transaction (SALES_ADD), Edit (SALES_EDIT), Delete (SALES_DEL SUPERADMIN only)
// SalesListPage -- transNo, salesDate, customer name, employee name, line item count, total; stamp for ADMIN/SA only -- Micole Kurt Gonda
// Features: Export (Excel/PDF), Pagination, Sortable columns, LoadingSpinner, toast
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { getSales } from '../services/salesService'
import { exportSalesToExcel, exportSalesToPDF } from '../services/exportService'
import { formatDate } from '../utils/formatDate'
import useSortableTable from '../hooks/useSortableTable'
import SortableHeader from '../components/SortableHeader'
import LoadingSpinner from '../components/LoadingSpinner'
import AddSaleModal from '../components/modals/AddSaleModal'
import EditSaleModal from '../components/modals/EditSaleModal'
import SoftDeleteSaleDialog from '../components/modals/SoftDeleteSaleDialog'

const PAGE_SIZE = 20

const fmt = n => n != null
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  : '--'

const CARD_STYLE = {
  backgroundColor: '#0a1628',
  border: '1px solid rgba(0,229,255,0.08)',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
}

const TH_STYLE = { backgroundColor: '#0d1f36', borderBottom: '1px solid rgba(0,229,255,0.08)' }
const TH_TEXT = { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }
const SH_BASE = { className: 'px-5 py-3.5 text-xs uppercase tracking-widest', style: { ...TH_TEXT, backgroundColor: '#0d1f36' } }

function FilterInput({ type = 'text', value, onChange, placeholder, label }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5 uppercase" style={{ color: '#3a6882', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="px-3 py-2 text-sm rounded-lg outline-none transition-colors duration-150"
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

function ExportDropdown({ onExcelClick, onPdfClick }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors duration-150 rounded-lg cursor-pointer"
        style={{ backgroundColor: 'rgba(255,210,77,0.1)', color: '#ffd24d', border: '1px solid rgba(255,210,77,0.2)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.04em' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.18)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.1)'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        Export
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-20 rounded-xl overflow-hidden" style={{ backgroundColor: '#0a1628', border: '1px solid rgba(0,229,255,0.1)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)', minWidth: 170, animation: 'fadeInDown 0.15s ease-out' }}>
            <button onClick={() => { setOpen(false); onExcelClick() }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer text-left" style={{ color: '#c8dff5', backgroundColor: 'transparent', border: 'none' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.05)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.75" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 12l2 2 4-4" /></svg>
              Export to Excel
            </button>
            <button onClick={() => { setOpen(false); onPdfClick() }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer text-left" style={{ color: '#c8dff5', backgroundColor: 'transparent', border: 'none', borderTop: '1px solid rgba(0,229,255,0.05)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.05)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4d6a" strokeWidth="1.75" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              Export to PDF
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems, from, to }) {
  if (totalPages <= 1) return null
  const getPageNumbers = () => {
    const pages = []
    let start = Math.max(1, currentPage - 2), end = Math.min(totalPages, currentPage + 2)
    if (end - start < 4) { if (start === 1) end = Math.min(totalPages, start + 4); else start = Math.max(1, end - 4) }
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }
  const pageNumbers = getPageNumbers()
  return (
    <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3" style={{ borderTop: '1px solid rgba(0,229,255,0.05)', backgroundColor: '#0d1f36', borderRadius: '0 0 12px 12px' }}>
      <span className="text-xs font-medium" style={{ color: '#1e3a52' }}>
        Showing <span className="font-bold" style={{ color: '#4d7a9e' }}>{from}–{to}</span> of <span className="font-bold" style={{ color: '#4d7a9e' }}>{totalItems}</span> transaction{totalItems !== 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#4d7a9e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }} onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.07)'; e.currentTarget.style.color = '#00e5ff' } }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4d7a9e' }}>‹ Prev</button>
        {pageNumbers[0] > 1 && (<><button onClick={() => onPageChange(1)} className="px-2.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer" style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#4d7a9e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }}>1</button>{pageNumbers[0] > 2 && <span style={{ color: '#1e3a52', fontSize: 12 }}>…</span>}</>)}
        {pageNumbers.map(n => <button key={n} onClick={() => onPageChange(n)} className="px-2.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors duration-150" style={{ border: n === currentPage ? '1px solid rgba(0,255,136,0.35)' : '1px solid rgba(0,229,255,0.12)', color: n === currentPage ? '#00ff88' : '#4d7a9e', backgroundColor: n === currentPage ? 'rgba(0,255,136,0.08)' : 'transparent', fontFamily: "'Rajdhani', sans-serif" }}>{n}</button>)}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (<>{pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span style={{ color: '#1e3a52', fontSize: 12 }}>…</span>}<button onClick={() => onPageChange(totalPages)} className="px-2.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer" style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#4d7a9e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }}>{totalPages}</button></>)}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#4d7a9e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif" }} onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.07)'; e.currentTarget.style.color = '#00e5ff' } }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4d7a9e' }}>Next ›</button>
      </div>
    </div>
  )
}

export default function SalesListPage() {
  const { currentUser } = useAuth()
  const { rights } = useRights()
  const navigate = useNavigate()

  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [custSearch, setCustSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editSale, setEditSale] = useState(null)
  const [deleteSale, setDeleteSale] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN'

  async function fetchSales() {
    setLoading(true)
    setError(null)
    try {
      const data = await getSales(currentUser?.user_type)
      setSales(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSales() }, [])

  const filtered = useMemo(() => {
    return sales.filter(s => {
      if (dateFrom && s.salesdate < dateFrom) return false
      if (dateTo && s.salesdate > dateTo) return false
      if (custSearch && !s.custname?.toLowerCase().includes(custSearch.toLowerCase())) return false
      return true
    })
  }, [sales, dateFrom, dateTo, custSearch])

  const filterKey = `${dateFrom}|${dateTo}|${custSearch}`
  useMemo(() => { setCurrentPage(1) }, [filterKey])

  const { sortedData: sortedFiltered, sortField, sortDir, handleSort } = useSortableTable(filtered)

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const paginated = sortedFiltered.slice(pageStart, pageStart + PAGE_SIZE)
  const showFrom = sortedFiltered.length === 0 ? 0 : pageStart + 1
  const showTo = Math.min(pageStart + PAGE_SIZE, sortedFiltered.length)

  const hasFilters = !!(dateFrom || dateTo || custSearch)

  if (loading) return <LoadingSpinner message="Loading transactions..." />
  if (error) return <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>Failed to load sales: {error}</div>

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>Sales Transactions</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, backgroundColor: 'rgba(0,229,255,0.07)', color: '#3a6882', border: '1px solid rgba(0,229,255,0.12)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
              {sales.length} records
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>
            {filtered.length !== sales.length ? `${filtered.length} shown · ` : ''}{isAdmin ? 'ACTIVE + INACTIVE visible' : 'Active records only'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDropdown onExcelClick={() => exportSalesToExcel(filtered)} onPdfClick={() => exportSalesToPDF(filtered)} />
          {rights.SALES_ADD === 1 && (
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors duration-150 rounded-lg cursor-pointer" style={{ backgroundColor: '#00ff88', color: '#040810', boxShadow: '0 0 16px rgba(0,255,136,0.25)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.04em' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#00e07a'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,255,136,0.4)' }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00ff88'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,255,136,0.25)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Transaction
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 mb-5 flex flex-wrap gap-3 items-end" style={{ ...CARD_STYLE, borderLeft: '2px solid rgba(0,229,255,0.2)' }}>
        <FilterInput type="date" label="Date From" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <FilterInput type="date" label="Date To" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <div className="flex-1 min-w-44">
          <FilterInput label="Customer Name" value={custSearch} onChange={e => setCustSearch(e.target.value)} placeholder="Search customer..." />
        </div>
        <button onClick={() => { setDateFrom(''); setDateTo(''); setCustSearch('') }} className="px-3 py-2 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer self-end" style={{ border: '1px solid rgba(0,229,255,0.12)', color: '#2a5a7e', backgroundColor: 'transparent', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.06)'; e.currentTarget.style.color = '#00e5ff' }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2a5a7e' }}>Clear</button>
      </div>

      {/* Table */}
      <div style={CARD_STYLE}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={TH_STYLE}>
                <SortableHeader label="Trans No" field="transno" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH_BASE} align="left" />
                <SortableHeader label="Date" field="salesdate" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH_BASE} align="left" />
                <SortableHeader label="Customer" field="custname" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH_BASE} align="left" />
                <SortableHeader label="Sales Agent" field="empname" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH_BASE} align="left" />
                <SortableHeader label="Items" field="lineitemcount" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH_BASE} align="right" />
                <SortableHeader label="Total" field="totalamount" sortField={sortField} sortDir={sortDir} onSort={handleSort} {...SH_BASE} align="right" />
                {isAdmin && <th className="px-5 py-3.5 text-left text-xs uppercase tracking-widest" style={TH_TEXT}>Stamp</th>}
                <th className="px-5 py-3.5 text-center text-xs uppercase tracking-widest" style={TH_TEXT}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-16 text-center">
                    <div className="text-4xl mb-3">{hasFilters ? '🔍' : '📋'}</div>
                    <p className="font-medium" style={{ color: '#3a6882' }}>{hasFilters ? 'No transactions match your search' : 'No transactions found'}</p>
                    <p className="text-sm mt-1" style={{ color: '#2a5a7e' }}>{hasFilters ? 'Try a different customer name or date range' : 'Try adjusting your date range or search filters'}</p>
                  </td>
                </tr>
              ) : (
                paginated.map((s, i) => (
                  <tr
                    key={s.transno}
                    className="cursor-pointer transition-colors duration-100"
                    style={{ borderBottom: '1px solid rgba(0,229,255,0.04)', backgroundColor: s.record_status === 'INACTIVE' ? 'rgba(255,77,106,0.04)' : undefined, animation: `fadeInLeft 0.3s ease-out forwards`, animationDelay: `${0.05 + i * 0.035}s`, opacity: 0 }}
                    onClick={() => navigate(`/sales/${s.transno}`)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = s.record_status === 'INACTIVE' ? 'rgba(255,77,106,0.07)' : 'rgba(0,255,136,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = s.record_status === 'INACTIVE' ? 'rgba(255,77,106,0.04)' : 'transparent'}
                  >
                    <td className="px-5 py-3.5"><span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88' }}>{s.transno}</span></td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#4d7a9e' }}>{formatDate(s.salesdate)}</td>
                    <td className="px-5 py-3.5 font-medium" style={{ color: '#c8dff5' }}>{s.custname}</td>
                    <td className="px-5 py-3.5" style={{ color: '#4d7a9e' }}>{s.empname}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums" style={{ color: '#6a90aa' }}>{s.lineitemcount}</td>
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums" style={{ color: '#c8dff5' }}>{fmt(s.totalamount)}</td>
                    {isAdmin && <td className="px-5 py-3.5 text-xs max-w-xs truncate" title={s.stamp} style={{ color: '#1e3a52' }}>{s.stamp || <span style={{ color: '#152840' }}>--</span>}</td>}
                    <td className="px-5 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {rights.SALES_EDIT === 1 && s.record_status === 'ACTIVE' && (
                          <button onClick={() => setEditSale(s)} className="px-2.5 py-1 text-xs font-bold rounded-md transition-colors duration-150 cursor-pointer" style={{ backgroundColor: 'rgba(255,210,77,0.1)', color: '#ffd24d', border: '1px solid rgba(255,210,77,0.2)', fontFamily: "'Rajdhani', sans-serif" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.18)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,210,77,0.1)'}>Edit</button>
                        )}
                        {rights.SALES_DEL === 1 && s.record_status === 'ACTIVE' && (
                          <button onClick={() => setDeleteSale(s)} className="px-2.5 py-1 text-xs font-bold rounded-md transition-colors duration-150 cursor-pointer" style={{ backgroundColor: 'rgba(255,77,106,0.1)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)', fontFamily: "'Rajdhani', sans-serif" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.18)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,77,106,0.1)'}>Delete</button>
                        )}
                        {s.record_status === 'INACTIVE' && (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-md" style={{ backgroundColor: 'rgba(255,77,106,0.1)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)', fontFamily: "'Rajdhani', sans-serif" }}>INACTIVE</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={sortedFiltered.length} from={showFrom} to={showTo} />
      </div>

      {showAdd && <AddSaleModal onClose={() => setShowAdd(false)} onSuccess={fetchSales} />}
      {editSale && <EditSaleModal sale={editSale} onClose={() => setEditSale(null)} onSuccess={fetchSales} />}
      {deleteSale && <SoftDeleteSaleDialog sale={deleteSale} onClose={() => setDeleteSale(null)} onSuccess={fetchSales} />}
    </div>
  )
}
