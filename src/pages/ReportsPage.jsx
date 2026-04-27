import { useEffect, useState, useMemo } from 'react'
import {
  getSalesByEmployee,
  getSalesByCustomer,
  getTopProducts,
  getMonthlySalesTrend,
} from '../services/reportsService'

const fmt = n => n != null
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  : '—'

function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>
  return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {cols.map(c => (
                <th
                  key={c.key}
                  onClick={() => handleSort(c.key)}
                  className={`px-4 py-3 font-medium text-gray-600 cursor-pointer select-none hover:bg-gray-100 ${c.right ? 'text-right' : 'text-left'}`}
                >
                  {c.label}
                  <SortIcon col={c.key} sortKey={sortKey} sortDir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={cols.length} className="py-10 text-center text-gray-400">No data available.</td></tr>
            ) : sorted.map((row, i) => (
              <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                {cols.map(c => (
                  <td key={c.key} className={`px-4 py-3 ${c.right ? 'text-right' : ''} ${c.bold ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
                    {c.fmt ? c.fmt(row[c.key]) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
        {sorted.length} record{sorted.length !== 1 ? 's' : ''}
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
      <h1 className="text-xl font-semibold text-gray-800 mb-5">Reports</h1>

      <div className="border-b border-gray-200 mb-5">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 mr-2 transition-colors ${
              tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
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
