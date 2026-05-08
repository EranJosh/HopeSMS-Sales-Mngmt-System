// DashboardPage -- KPI overview, monthly trend, top products, recent transactions -- Micole Kurt Gonda
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSales } from '../services/salesService'
import { getCustomers } from '../services/lookupService'
import { getTopProducts, getMonthlySalesTrend } from '../services/reportsService'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

// ── Formatters ───────────────────────────────────────────────
const fmt = n => n != null
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) : '--'

const fmtShort = v => {
  const n = Number(v)
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

const fmtDateShort = d => d
  ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'

// ── Count-up hook ────────────────────────────────────────────
function useCountUp(end, duration = 1800) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!end || end <= 0) return
    const startTime = Date.now()
    const tick = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4) // ease-out quart
      setVal(end * eased)
      if (progress < 1) requestAnimationFrame(tick)
      else setVal(end)
    }
    requestAnimationFrame(tick)
  }, [end, duration])
  return val
}

// ── Live clock ───────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

// ── KPI Card ─────────────────────────────────────────────────
const KPI_ICONS = {
  revenue: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  transactions: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>
    </svg>
  ),
  customers: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  avg: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
}

function KpiCard({ label, countEnd, format, iconKey, color, glow, delay }) {
  const animated = useCountUp(countEnd, 1800)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animation: `fadeInUp 0.55s ease-out forwards`,
        animationDelay: `${delay}s`,
        opacity: 0,
        flex: 1,
        minWidth: 0,
        backgroundColor: '#0a1628',
        borderRadius: '14px',
        border: `1px solid ${color}1a`,
        borderTop: `2px solid ${color}`,
        padding: '24px 22px 20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 56px rgba(0,0,0,0.55), 0 0 40px ${glow}`
          : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.013) 3px, rgba(0,229,255,0.013) 4px)',
      }} />
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 110, height: 110, pointerEvents: 'none',
        background: `radial-gradient(circle at 100% 0%, ${color}1c, transparent 70%)`,
      }} />
      {/* Icon */}
      <div style={{ position: 'absolute', top: 18, right: 18, color, opacity: hovered ? 0.5 : 0.2, transition: 'opacity 0.25s ease' }}>
        {KPI_ICONS[iconKey]}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          color,
          fontSize: '2.15rem',
          fontWeight: 700,
          fontFamily: "'Rajdhani', sans-serif",
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: '-0.02em',
          textShadow: hovered ? `0 0 20px ${glow}` : 'none',
          transition: 'text-shadow 0.25s ease',
        }}>
          {format(animated)}
        </p>
        <p style={{
          color: '#2a5a7e',
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontFamily: "'Rajdhani', sans-serif",
        }}>
          {label}
        </p>
      </div>
    </div>
  )
}

// ── Top Product Row ───────────────────────────────────────────
function ProductBar({ rank, name, revenue, maxRevenue, delay, color }) {
  const [width, setWidth] = useState(0)
  const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), (delay + 0.8) * 1000)
    return () => clearTimeout(t)
  }, [pct, delay])

  const rankColors = ['#ffd24d', '#00ff88', '#00e5ff', '#a78bfa', '#6a90aa']
  const barColor = rankColors[rank - 1] || '#2a5a7e'

  return (
    <div style={{ animation: `fadeInLeft 0.45s ease-out forwards`, animationDelay: `${delay + 0.65}s`, opacity: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
          <span style={{
            color: barColor,
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            minWidth: 20,
          }}>#{rank}</span>
          <span style={{ color: '#c8dff5', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
        </div>
        <span style={{ color: barColor, fontWeight: 700, fontSize: 13, fontFamily: "'Rajdhani', sans-serif", flexShrink: 0, marginLeft: 12 }}>
          {fmtShort(revenue)}
        </span>
      </div>
      <div style={{ height: 3, backgroundColor: 'rgba(0,229,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${width}%`,
          backgroundColor: barColor,
          boxShadow: `0 0 8px ${barColor}60`,
          borderRadius: 2,
          transition: 'width 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>
    </div>
  )
}

// ── Chart Tooltip ─────────────────────────────────────────────
function DashTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d1f36', borderRadius: 8, padding: '8px 14px',
      border: '1px solid rgba(0,229,255,0.12)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
    }}>
      <p style={{ color: '#2a5a7e', fontSize: 11, marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#00ff88', fontSize: 14, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>
        {fmt(payload[0].value)}
      </p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function DashboardPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const clock = useClock()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [monthly, setMonthly] = useState([])

  useEffect(() => {
    Promise.all([
      getSales(currentUser?.user_type),
      getCustomers(),
      getTopProducts(),
      getMonthlySalesTrend(),
    ])
      .then(([s, c, p, m]) => {
        setSales(s); setCustomers(c); setProducts(p); setMonthly(m)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Derived data ─────────────────────────────────────────────
  const activeSales = useMemo(() => sales.filter(s => s.record_status === 'ACTIVE'), [sales])
  const totalRevenue = useMemo(() => activeSales.reduce((sum, s) => sum + (Number(s.totalamount) || 0), 0), [activeSales])
  const totalTrans = activeSales.length
  const avgOrder = totalTrans > 0 ? totalRevenue / totalTrans : 0
  const custCount = customers.length

  const recentSales = useMemo(() =>
    [...activeSales]
      .sort((a, b) => (b.salesdate || '').localeCompare(a.salesdate || ''))
      .slice(0, 6)
  , [activeSales])

  const topFive = useMemo(() =>
    [...products]
      .sort((a, b) => Number(b.totalrevenue) - Number(a.totalrevenue))
      .slice(0, 5)
  , [products])

  const maxProdRev = topFive.length > 0 ? Number(topFive[0].totalrevenue) : 1

  const chartData = useMemo(() =>
    [...monthly]
      .sort((a, b) => a.salemonth.localeCompare(b.salemonth))
      .slice(-8)
      .map(r => ({ name: r.salemonth, revenue: Number(r.totalrevenue) }))
  , [monthly])

  const timeStr = clock.toLocaleTimeString('en-US', { hour12: false })
  const dateStr = clock.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 20 }}>
        <div className="rounded-full animate-spin" style={{
          width: 48, height: 48, borderWidth: 3, borderStyle: 'solid',
          borderColor: '#00ff88', borderTopColor: 'transparent',
          boxShadow: '0 0 24px rgba(0,255,136,0.35)',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <p style={{ color: '#00ff88', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Initializing System Data
          </p>
          <p style={{ color: '#3a6882', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '0.12em' }}>
            Fetching transactions, customers, reports...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#ff4d6a' }}>
        {error}
      </div>
    )
  }

  // ── KPI config ───────────────────────────────────────────────
  const kpis = [
    { label: 'Total Revenue',    countEnd: totalRevenue, format: n => fmt(n),             iconKey: 'revenue',      color: '#00ff88', glow: 'rgba(0,255,136,0.2)',  delay: 0.05 },
    { label: 'Transactions',     countEnd: totalTrans,   format: n => Math.round(n).toLocaleString(), iconKey: 'transactions', color: '#00e5ff', glow: 'rgba(0,229,255,0.2)',  delay: 0.15 },
    { label: 'Active Customers', countEnd: custCount,    format: n => Math.round(n).toLocaleString(), iconKey: 'customers',    color: '#ffd24d', glow: 'rgba(255,210,77,0.2)',  delay: 0.25 },
    { label: 'Avg. Order Value', countEnd: avgOrder,     format: n => fmt(n),             iconKey: 'avg',          color: '#a78bfa', glow: 'rgba(167,139,250,0.2)', delay: 0.35 },
  ]

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Ambient background glow ── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '10%', left: '5%',
          width: 600, height: 500,
          background: 'radial-gradient(ellipse, rgba(0,255,136,0.04) 0%, transparent 60%)',
          animation: 'ambientDrift 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%', right: '8%',
          width: 500, height: 400,
          background: 'radial-gradient(ellipse, rgba(0,229,255,0.035) 0%, transparent 60%)',
          animation: 'ambientDrift 22s ease-in-out infinite reverse',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div
          className="flex items-center justify-between mb-8"
          style={{ animation: 'fadeInDown 0.5s ease-out forwards', opacity: 0 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '2rem',
                fontWeight: 700,
                color: '#c8dff5',
                letterSpacing: '-0.01em',
                lineHeight: 1,
              }}>
                Dashboard
              </h1>
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 99, backgroundColor: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00ff88', animation: 'glowPulse 1.5s ease-in-out infinite' }} />
                <span style={{ color: '#00ff88', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }}>LIVE</span>
              </div>
            </div>
            <p style={{ color: '#2a5a7e', fontSize: 13 }}>
              {dateStr} — <span style={{ color: '#1e3a52', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em' }}>{timeStr}</span>
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/sales')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer"
              style={{ backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.14)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,255,136,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Transactions
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer"
              style={{ backgroundColor: 'rgba(0,229,255,0.06)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.12)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,229,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.06)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Reports
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
          {kpis.map(k => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>

        {/* ── Charts row ── */}
        <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>

          {/* Monthly trend chart */}
          <div
            style={{
              animation: 'fadeInUp 0.55s ease-out forwards',
              animationDelay: '0.5s',
              opacity: 0,
              flex: '1 1 360px',
              backgroundColor: '#0a1628',
              border: '1px solid rgba(0,229,255,0.08)',
              borderRadius: '14px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Card scanlines */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.01) 3px, rgba(0,229,255,0.01) 4px)', pointerEvents: 'none' }} />

            <div className="flex items-center justify-between mb-5">
              <div>
                <p style={{ color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 2 }}>Monthly Revenue Trend</p>
                <p style={{ color: '#c8dff5', fontSize: 16, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>
                  Last {chartData.length} months
                </p>
              </div>
              <button
                onClick={() => navigate('/reports')}
                className="text-xs font-bold flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
                style={{ color: '#2a5a7e', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase' }}
                onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
                onMouseLeave={e => e.currentTarget.style.color = '#2a5a7e'}
              >
                Full Report
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            {chartData.length === 0 ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#1e3a52', fontSize: 13 }}>No trend data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#1e3a52', fontSize: 10, fontFamily: "'Rajdhani', sans-serif" }}
                    tickLine={false} axisLine={false}
                  />
                  <YAxis
                    tickFormatter={fmtShort}
                    tick={{ fill: '#1e3a52', fontSize: 10 }}
                    tickLine={false} axisLine={false} width={48}
                  />
                  <Tooltip content={<DashTooltip />} cursor={{ fill: 'rgba(0,255,136,0.04)' }} />
                  <Bar dataKey="revenue" fill="#00ff88" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top products */}
          <div
            style={{
              animation: 'fadeInUp 0.55s ease-out forwards',
              animationDelay: '0.62s',
              opacity: 0,
              flex: '1 1 260px',
              backgroundColor: '#0a1628',
              border: '1px solid rgba(0,229,255,0.08)',
              borderRadius: '14px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.01) 3px, rgba(0,229,255,0.01) 4px)', pointerEvents: 'none' }} />
            <div className="flex items-center justify-between mb-5">
              <div>
                <p style={{ color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 2 }}>Top Products</p>
                <p style={{ color: '#c8dff5', fontSize: 16, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>By Revenue</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,210,77,0.4)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>

            {topFive.length === 0 ? (
              <p style={{ color: '#1e3a52', fontSize: 13 }}>No product data</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {topFive.map((p, i) => (
                  <ProductBar
                    key={p.prodcode}
                    rank={i + 1}
                    name={p.description}
                    revenue={Number(p.totalrevenue)}
                    maxRevenue={maxProdRev}
                    delay={i * 0.08}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        <div
          style={{
            animation: 'fadeInUp 0.55s ease-out forwards',
            animationDelay: '0.75s',
            opacity: 0,
            backgroundColor: '#0a1628',
            border: '1px solid rgba(0,229,255,0.08)',
            borderRadius: '14px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Card scanlines */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.01) 3px, rgba(0,229,255,0.01) 4px)', pointerEvents: 'none', zIndex: 0 }} />

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid rgba(0,229,255,0.07)',
            backgroundColor: '#0d1f36',
            position: 'relative', zIndex: 1,
          }}>
            <div>
              <p style={{ color: '#3a6882', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Rajdhani', sans-serif", marginBottom: 2 }}>Recent Activity</p>
              <p style={{ color: '#c8dff5', fontSize: 16, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>
                Latest Transactions
              </p>
            </div>
            <button
              onClick={() => navigate('/sales')}
              className="text-xs font-bold flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
              style={{ color: '#2a5a7e', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase' }}
              onMouseEnter={e => e.currentTarget.style.color = '#00ff88'}
              onMouseLeave={e => e.currentTarget.style.color = '#2a5a7e'}
            >
              View All
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', position: 'relative', zIndex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#0d1f36' }}>
                  {['Trans No', 'Date', 'Customer', 'Agent', 'Items', 'Total'].map(col => (
                    <th key={col} style={{
                      padding: '10px 20px',
                      textAlign: col === 'Items' || col === 'Total' ? 'right' : 'left',
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                      color: '#3a6882', fontFamily: "'Rajdhani', sans-serif",
                      borderBottom: '1px solid rgba(0,229,255,0.07)',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#1e3a52' }}>
                      No recent transactions
                    </td>
                  </tr>
                ) : recentSales.map((s, i) => (
                  <tr
                    key={s.transno}
                    onClick={() => navigate(`/sales/${s.transno}`)}
                    style={{
                      borderBottom: '1px solid rgba(0,229,255,0.04)',
                      animation: `fadeInLeft 0.4s ease-out forwards`,
                      animationDelay: `${1.0 + i * 0.07}s`,
                      opacity: 0,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                        padding: '2px 8px', borderRadius: 6,
                        backgroundColor: 'rgba(0,255,136,0.08)', color: '#00ff88',
                      }}>
                        {s.transno}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', color: '#4d7a9e', fontSize: 12 }}>{fmtDateShort(s.salesdate)}</td>
                    <td style={{ padding: '13px 20px', color: '#c8dff5', fontWeight: 500 }}>{s.custname}</td>
                    <td style={{ padding: '13px 20px', color: '#4d7a9e' }}>{s.empname}</td>
                    <td style={{ padding: '13px 20px', textAlign: 'right', color: '#6a90aa', fontVariantNumeric: 'tabular-nums' }}>{s.lineitemcount}</td>
                    <td style={{ padding: '13px 20px', textAlign: 'right', fontWeight: 700, color: '#00ff88', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, textShadow: '0 0 10px rgba(0,255,136,0.25)' }}>
                      {fmt(s.totalamount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 22px',
            borderTop: '1px solid rgba(0,229,255,0.05)',
            backgroundColor: '#0d1f36',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', zIndex: 1,
          }}>
            <span style={{ color: '#1e3a52', fontSize: 11, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Showing last <span style={{ color: '#4d7a9e', fontWeight: 700 }}>{recentSales.length}</span> transactions
            </span>
            <span style={{ color: '#3a6882', fontSize: 11 }}>
              {totalTrans} total active records
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
