/**
 * Đăng ký route — khi thêm trang mới:
 * 1. Tạo file trong pages/
 * 2. Khai báo trong src/config/routes.js
 * 3. Thêm <Route> bên dưới
 * 4. Cập nhật frontend/TODO.md nếu cần
 *
 * @see frontend/README.md
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/customer/HomePage'
import { ProductDetailPage } from '@/pages/customer/ProductDetailPage'
import { CartPage } from '@/pages/customer/CartPage'
import { CheckoutPage } from '@/pages/customer/CheckoutPage'
import { OrdersPage } from '@/pages/customer/OrdersPage'
import { ChatPage } from '@/pages/ChatPage'
import { SellerProductsPage } from '@/pages/seller/SellerProductsPage'
import { SellerOrdersPage } from '@/pages/seller/SellerOrdersPage'
import { SellerStatisticsPage } from '@/pages/seller/SellerStatisticsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<ProtectedRoute role="customer"><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute role="customer"><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute role="customer"><OrdersPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/seller/products" element={<ProtectedRoute role="seller"><SellerProductsPage /></ProtectedRoute>} />
            <Route path="/seller/orders" element={<ProtectedRoute role="seller"><SellerOrdersPage /></ProtectedRoute>} />
            <Route path="/seller/statistics" element={<ProtectedRoute role="seller"><SellerStatisticsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}
