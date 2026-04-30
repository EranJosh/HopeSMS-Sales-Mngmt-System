// ReportsPage UI -- SalesByEmployee (bar chart), SalesByCustomer (table+highlight), TopProducts (ranked list/chart), MonthlyTrend (bar chart + date filter) -- Micole Kurt Gonda
import { useEffect, useState, useMemo } from 'react'
import {
  getSalesByEmployee,
  getSalesByCustomer,
  getTopProducts,
  getMonthlySalesTrend,
} from '../services/reportsService'

const fmt = n => n != null
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  : '--'

const CARD_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)',
}

function SortIcon({ col, sortKey, sortDir }) {
  const active = sortKey === col
  return (
    <span className="inline-flex ml-1.5 opacity-50">
      {active
        ? (sortDir === 'asc'
          ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
          : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>)
        : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="8 9 12 5 16 9" /><polyline points="16 15 12 19 8 15" /></svg>
      }
    </span>
  )
}

function SortableTable({ cols, data, defaultSort }) {
  const [sortKey, setSortKey] = useState(defaultSort)
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const v1 = a[sortKey], v2 = b[sortKey]
      const dir = sortDir === 'asc' ? 1 : -1
      if (v1 == null) return dir
      if (v2 == null) return -dir
      return v1 > v2 ? dir : v1 < v2 ? -dir : 0
    })
  }, [data, sortKey, sortDir])

  return (
    <div style={CARD_STYLE}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {cols.map(c => (
                <th
                  key={c.key}
                  onClick={() => handleSort(c.key)}
                  className={`px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-widest select-none cursor-pointer transition-colors duration-100 ${c.right ? 'text-right' : 'text-left'}`}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9f4'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {c.label}
                  <SortIcon col={c.key} sortKey={sortKey} sortDir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span className="text-slate-400 text-sm">No data available</span>
                  </div>
                </td>
              </tr>
            ) : sorted.map((row, i) => (
              <tr
                key={i}
                className="transition-colors duration-100"
                style={{ borderBottom: '1px solid #f1f5f9' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {cols.map(c => (
                  <td
                    key={c.key}
                    className={`px-5 py-3.5 ${c.right ? 'text-right tabular-nums' : ''} ${c.bold ? 'font-semibold text-slate-800' : 'text-slate-600'}`}
                  >
                    {c.fmt ? c.fmt(row[c.key]) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 flex items-center" style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
        <span className="text-xs text-slate-400 font-medium">
          <span className="text-slate-600 font-semibold">{sorted.length}</span> record{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [tab, setTab] = useState('employee')
  const [byEmp, setByEmp] = useState([])
  const [byCust, setByCust] = useState([])
  const [topProd, setTopProd] = useState([])
  const [monthly, setMonthly] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getSalesByEmployee(),
      getSalesByCustomer(),
      getTopProducts(),
      getMonthlySalesTrend(),
    ])
      .then(([emp, cust, prod, mon]) => {
        setByEmp(emp)
        setByCust(cust)
        setTopProd(prod)
        setMonthly(mon)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const tabs = [
    { key: 'employee', label: 'By Employee' },
    { key: 'customer', label: 'By Customer' },
    { key: 'products', label: 'Top Products' },
    { key: 'monthly', label: 'Monthly Trend' },
  ]

  const empCols = [
    { key: 'empno', label: 'Emp No' },
    { key: 'empname', label: 'Name', bold: true },
    { key: 'totaltransactions', label: 'Transactions', right: true },
    { key: 'totalrevenue', label: 'Total Revenue', right: true, bold: true, fmt: fmt },
  ]

  const custCols = [
    { key: 'custno', label: 'Cust No' },
    { key: 'custname', label: 'Customer Name', bold: true },
    { key: 'totaltransactions', label: 'Transactions', right: true },
    { key: 'totalrevenue', label: 'Total Revenue', right: true, bold: true, fmt: fmt },
  ]

  const prodCols = [
    { key: 'prodcode', label: 'Product Code' },
    { key: 'description', label: 'Description', bold: true },
    { key: 'unit', label: 'Unit', right: true },
    { key: 'totalqtysold', label: 'Qty Sold', right: true, fmt: n => Number(n || 0).toFixed(2) },
    { key: 'totalrevenue', label: 'Total Revenue', right: true, bold: true, fmt: fmt },
  ]

  const monthCols = [
    { key: 'salemonth', label: 'Month', bold: true },
    { key: 'totaltransactions', label: 'Transactions', right: true },
    { key: 'totalrevenue', label: 'Revenue', right: true, bold: true, fmt: fmt },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Sales analytics and performance overview</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ backgroundColor: '#f1f5f9' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 text-sm font-semibold transition-all duration-150 rounded-lg cursor-pointer"
            style={tab === t.key
              ? { backgroundColor: '#ffffff', color: '#059669', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
              : { backgroundColor: 'transparent', color: '#64748b' }
            }
            onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.color = '#334155' }}
            onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.color = '#64748b' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="rounded-full animate-spin" style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#10b981', borderTopColor: 'transparent' }} />
        </div>
      ) : error ? (
        <div className="px-4 py-3 rounded-xl text-red-700 text-sm font-medium" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>{error}</div>
      ) : (
        <>
          {tab === 'employee' && <SortableTable cols={empCols} data={byEmp} defaultSort="totalrevenue" />}
          {tab === 'customer' && <SortableTable cols={custCols} data={byCust} defaultSort="totalrevenue" />}
          {tab === 'products' && <SortableTable cols={prodCols} data={topProd} defaultSort="totalrevenue" />}
          {tab === 'monthly' && <SortableTable cols={monthCols} data={monthly} defaultSort="salemonth" />}
        </>
      )}
    </div>
  )
}
