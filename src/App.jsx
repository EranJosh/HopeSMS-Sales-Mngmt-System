// SMS routing: /sales, /sales/:transNo, /lookups/*, /reports, /admin, /deleted-items, /auth/callback — all guarded by ProtectedRoute
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

import SalesListPage from './pages/SalesListPage'
import SalesDetailPage from './pages/SalesDetailPage'
import CustomerLookupPage from './pages/CustomerLookupPage'
import EmployeeLookupPage from './pages/EmployeeLookupPage'
import ProductLookupPage from './pages/ProductLookupPage'
import PriceHistoryPage from './pages/PriceHistoryPage'
import ReportsPage from './pages/ReportsPage'
import AdminPage from './pages/AdminPage'
import DeletedItemsPage from './pages/DeletedItemsPage'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected routes — wrapped in AppShell layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/sales" replace />} />
          <Route path="/sales" element={<SalesListPage />} />
          <Route path="/sales/:transNo" element={<SalesDetailPage />} />
          <Route path="/lookups/customers" element={<CustomerLookupPage />} />
          <Route path="/lookups/employees" element={<EmployeeLookupPage />} />
          <Route path="/lookups/products" element={<ProductLookupPage />} />
          <Route path="/lookups/prices" element={<PriceHistoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/deleted-items" element={<DeletedItemsPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/sales" replace />} />
    </Routes>
  )
}
