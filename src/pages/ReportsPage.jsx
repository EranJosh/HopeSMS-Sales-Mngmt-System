// ReportsPage UI -- SalesByEmployee (bar chart), SalesByCustomer (table+highlight), TopProducts (ranked list/chart), MonthlyTrend (bar chart + date filter) -- Micole Kurt Gonda
import { useEffect, useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import {
  getSalesByEmployee,
  getSalesByCustomer,
  getTopProducts,
  getMonthlySalesTrend,
} from '../services/reportsService'

const NEON_GREEN = '#00ff88'
const NEON_CYAN = '#00e5ff'
const NEON_GOLD = '#ffd24d'
const GRID_COLOR = 'rgba(0,229,255,0.06)'
const BAR_DIM = 'rgba(0,229,255,0.25)'

// Gradient color scale: highest bar = neon green, lowest = neon cyan, opacity fades
function scaleColor(i, total) {
  const t = total <= 1 ? 0 : i / (total - 1)
  const g = Math.round(255 - t * 26)   // 255 → 229
  const b = Math.round(136 + t * 119)  // 136 → 255
  const a = Math.max(0.45, 1 - t * 0.45)
  return `rgba(0,${g},${b},${a})`
}

const fmt = n => n != null
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  : '--'

const shortFmt = v => {
  const n = Number(v)
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n}`
}

const CARD_STYLE = {
  backgroundColor: '#0a1628',
  border: '1px solid rgba(0,229,255,0.08)',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
}

const TH_STYLE = { backgroundColor: '#0d1f36', borderBottom: '1px solid rgba(0,229,255,0.08)' }
const TH_TEXT = { color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', fontWeight: 700 }

function ChartCard({ children }) {
  return (
    <div style={{ ...CARD_STYLE, padding: '20px 16px 8px', marginBottom: 20 }}>
      {children}
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0d1f36', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.5)', border: '1px solid rgba(0,229,255,0.12)' }}>
      <p style={{ color: '#2a5a7e', fontSize: 11, marginBottom: 2 }}>{label}</p>
      <p style={{ color: NEON_GREEN, fontSize: 13, fontWeight: 700 }}>{fmt(payload[0].value)}</p>
    </div>
  )
}

function SortIcon({ col, sortKey, sortDir }) {
  const active = sortKey === col
  return (
    <span className="inline-flex ml-1.5" style={{ opacity: active ? 0.8 : 0.3 }}>
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
            <tr style={TH_STYLE}>
              {cols.map(c => (
                <th
                  key={c.key}
                  onClick={() => handleSort(c.key)}
                  className={`px-5 py-3.5 text-xs uppercase tracking-widest select-none cursor-pointer transition-colors duration-100 ${c.right ? 'text-right' : 'text-left'}`}
                  style={{ ...TH_TEXT, userSelect: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#2a5a7e'}
                  onMouseLeave={e => e.currentTarget.style.color = TH_TEXT.color}
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
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span className="text-sm" style={{ color: '#1e3a52' }}>No data available</span>
                  </div>
                </td>
              </tr>
            ) : sorted.map((row, i) => (
              <tr
                key={i}
                className="transition-colors duration-100"
                style={{ borderBottom: '1px solid rgba(0,229,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.03)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {cols.map(c => (
                  <td
                    key={c.key}
                    className={`px-5 py-3.5 ${c.right ? 'text-right tabular-nums' : ''}`}
                    style={{ color: c.bold ? '#c8dff5' : '#4d7a9e' }}
                  >
                    {c.fmt ? c.fmt(row[c.key]) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 flex items-center" style={{ borderTop: '1px solid rgba(0,229,255,0.05)', backgroundColor: '#0d1f36' }}>
        <span className="text-xs font-medium" style={{ color: '#1e3a52' }}>
          <span className="font-bold" style={{ color: '#4d7a9e' }}>{sorted.length}</span> record{sorted.length !== 1 ? 's' : ''}
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
  const [fromMonth, setFromMonth] = useState('')
  const [toMonth, setToMonth] = useState('')

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

  const empChartData = useMemo(() =>
    [...byEmp]
      .sort((a, b) => Number(b.totalrevenue) - Number(a.totalrevenue))
      .slice(0, 10)
      .map(r => ({ name: r.empname, revenue: Number(r.totalrevenue) }))
  , [byEmp])

  const custChartData = useMemo(() =>
    [...byCust]
      .sort((a, b) => Number(b.totalrevenue) - Number(a.totalrevenue))
      .slice(0, 10)
      .map(r => ({ name: r.custname, revenue: Number(r.totalrevenue) }))
  , [byCust])

  const prodChartData = useMemo(() =>
    [...topProd]
      .sort((a, b) => Number(b.totalrevenue) - Number(a.totalrevenue))
      .slice(0, 10)
      .map(r => ({ name: r.description, revenue: Number(r.totalrevenue) }))
  , [topProd])

  const filteredMonthly = useMemo(() => {
    return monthly
      .filter(r => {
        if (fromMonth && r.salemonth < fromMonth) return false
        if (toMonth && r.salemonth > toMonth) return false
        return true
      })
      .sort((a, b) => a.salemonth.localeCompare(b.salemonth))
  }, [monthly, fromMonth, toMonth])

  const monthChartData = useMemo(() =>
    filteredMonthly.map(r => ({ name: r.salemonth, revenue: Number(r.totalrevenue) }))
  , [filteredMonthly])

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

  const axisTickStyle = { fill: '#1e3a52', fontSize: 11 }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-0.5">
          <h1 className="font-bold tracking-tight" style={{ color: '#c8dff5', fontFamily: "'Rajdhani', sans-serif", fontSize: '26px', letterSpacing: '-0.01em' }}>Reports</h1>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, backgroundColor: 'rgba(255,210,77,0.08)', color: '#ffd24d', border: '1px solid rgba(255,210,77,0.18)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>Analytics</span>
        </div>
        <p className="text-sm mt-0.5" style={{ color: '#2a5a7e' }}>Sales analytics and performance overview</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ backgroundColor: '#0d1f36', border: '1px solid rgba(0,229,255,0.07)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 text-sm font-bold transition-colors duration-150 rounded-lg cursor-pointer"
            style={tab === t.key
              ? { backgroundColor: '#0a1628', color: '#00ff88', boxShadow: '0 0 12px rgba(0,255,136,0.1), 0 1px 3px rgba(0,0,0,0.3)', fontFamily: "'Rajdhani', sans-serif" }
              : { backgroundColor: 'transparent', color: '#2a5a7e', fontFamily: "'Rajdhani', sans-serif" }
            }
            onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.color = '#4d7a9e' }}
            onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.color = '#2a5a7e' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="rounded-full animate-spin" style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#00ff88', borderTopColor: 'transparent', boxShadow: '0 0 12px rgba(0,255,136,0.3)' }} />
        </div>
      ) : error ? (
        <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>{error}</div>
      ) : (
        <>
          {tab === 'employee' && (
            <>
              <ChartCard>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#1e3a52', fontFamily: "'Rajdhani', sans-serif" }}>Revenue by Employee — Top 10</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={empChartData} margin={{ top: 4, right: 16, left: 8, bottom: 56 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                    <XAxis dataKey="name" tick={axisTickStyle} angle={-35} textAnchor="end" interval={0} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={shortFmt} tick={axisTickStyle} tickLine={false} axisLine={false} width={56} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,255,136,0.04)' }} />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={48}>
                      {empChartData.map((_, i) => (
                        <Cell key={i} fill={scaleColor(i, empChartData.length)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <SortableTable cols={empCols} data={byEmp} defaultSort="totalrevenue" />
            </>
          )}

          {tab === 'customer' && (
            <>
              <ChartCard>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#1e3a52', fontFamily: "'Rajdhani', sans-serif" }}>Revenue by Customer — Top 10</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={custChartData} margin={{ top: 4, right: 16, left: 8, bottom: 56 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                    <XAxis dataKey="name" tick={axisTickStyle} angle={-35} textAnchor="end" interval={0} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={shortFmt} tick={axisTickStyle} tickLine={false} axisLine={false} width={56} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,255,136,0.04)' }} />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={48}>
                      {custChartData.map((_, i) => (
                        <Cell key={i} fill={scaleColor(i, custChartData.length)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <SortableTable cols={custCols} data={byCust} defaultSort="totalrevenue" />
            </>
          )}

          {tab === 'products' && (
            <>
              <ChartCard>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#1e3a52', fontFamily: "'Rajdhani', sans-serif" }}>Top 10 Products by Revenue</p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart layout="vertical" data={prodChartData} margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
                    <XAxis type="number" tickFormatter={shortFmt} tick={axisTickStyle} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" width={180} tick={axisTickStyle} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,255,136,0.04)' }} />
                    <Bar dataKey="revenue" fill={NEON_GOLD} radius={[0, 4, 4, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <SortableTable cols={prodCols} data={topProd} defaultSort="totalrevenue" />
            </>
          )}

          {tab === 'monthly' && (
            <>
              <ChartCard>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1e3a52', fontFamily: "'Rajdhani', sans-serif" }}>Monthly Revenue Trend</p>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium" style={{ color: '#2a5a7e' }}>From</label>
                    <input
                      type="month"
                      value={fromMonth}
                      onChange={e => setFromMonth(e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg outline-none transition-colors duration-150"
                      style={{ backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.12)', color: '#c8dff5' }}
                    />
                    <label className="text-xs font-medium" style={{ color: '#2a5a7e' }}>To</label>
                    <input
                      type="month"
                      value={toMonth}
                      onChange={e => setToMonth(e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg outline-none transition-colors duration-150"
                      style={{ backgroundColor: '#070f1e', border: '1px solid rgba(0,229,255,0.12)', color: '#c8dff5' }}
                    />
                    {(fromMonth || toMonth) && (
                      <button
                        onClick={() => { setFromMonth(''); setToMonth('') }}
                        className="text-xs font-medium underline transition-colors duration-150"
                        style={{ color: '#2a5a7e' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#4d7a9e'}
                        onMouseLeave={e => e.currentTarget.style.color = '#2a5a7e'}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthChartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                    <XAxis dataKey="name" tick={axisTickStyle} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={shortFmt} tick={axisTickStyle} tickLine={false} axisLine={false} width={56} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,229,255,0.04)' }} />
                    <Bar dataKey="revenue" fill={NEON_CYAN} radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <SortableTable cols={monthCols} data={filteredMonthly} defaultSort="salemonth" />
            </>
          )}
        </>
      )}
    </div>
  )
}
