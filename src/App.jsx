// SMS routing: /dashboard, /sales, /sales/:transNo, /lookups/*, /reports, /admin, /deleted-items, /auth/callback  all guarded by ProtectedRoute
// Error boundary and loading state components applied to all data-fetching pages
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

import DashboardPage from './pages/DashboardPage'
import SalesListPage from './pages/SalesListPage'
import SalesDetailPage from './pages/SalesDetailPage'
import CustomerLookupPage from './pages/CustomerLookupPage'
import EmployeeLookupPage from './pages/EmployeeLookupPage'
import ProductLookupPage from './pages/ProductLookupPage'
import PriceHistoryPage from './pages/PriceHistoryPage'
import ReportsPage from './pages/ReportsPage'
import AdminPage from './pages/AdminPage'
import DeletedItemsPage from './pages/DeletedItemsPage'
import ProfilePage from './pages/ProfilePage'
import AuditLogPage from './pages/AuditLogPage'

const TOAST_OPTS = {
  success: { style: { background: '#0a1628', color: '#c8dff5', border: '1px solid rgba(0,255,136,0.4)', fontFamily: "'Outfit', sans-serif" }, iconTheme: { primary: '#00ff88', secondary: '#040810' } },
  error:   { style: { background: '#0a1628', color: '#c8dff5', border: '1px solid rgba(255,77,106,0.4)', fontFamily: "'Outfit', sans-serif" }, iconTheme: { primary: '#ff4d6a', secondary: '#040810' } },
  duration: 3000,
}

export default function App() {
  return (
    <>
    <Toaster position="top-right" toastOptions={TOAST_OPTS} />
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected routes wrapped in AppShell layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sales" element={<SalesListPage />} />
          <Route path="/sales/:transNo" element={<SalesDetailPage />} />
          <Route path="/lookups/customers" element={<CustomerLookupPage />} />
          <Route path="/lookups/employees" element={<EmployeeLookupPage />} />
          <Route path="/lookups/products" element={<ProductLookupPage />} />
          <Route path="/lookups/prices" element={<PriceHistoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/deleted-items" element={<DeletedItemsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  )
}
