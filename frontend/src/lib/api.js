/**
 * Lớp gọi REST API duy nhất của frontend.
 *
 * Quy tắc:
 * - Mọi endpoint backend phải khai báo hàm tại đây.
 * - Page/component chỉ import { api } từ file này.
 * - Base URL: VITE_API_BASE (mặc định /api, proxy Vite → :8080)
 *
 * @see frontend/README.md
 * @see src/config/routes.js — mapping use-case ↔ API
 */

const API = import.meta.env.VITE_API_BASE || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = body.message || body.error || JSON.stringify(body)
    } catch {
      try {
        message = await res.text()
      } catch {
        /* ignore */
      }
    }
    throw new Error(message || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  // --- Danh mục & sản phẩm ---
  categories: () => request('/categories'),
  products: () => request('/products'),
  product: (id) => request(`/products/${id}`),
  productsBySeller: (sellerId) => request(`/products/seller/${sellerId}`),
  createProduct: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  variants: () => request('/product-variants'),
  createVariant: (body) => request('/product-variants', { method: 'POST', body: JSON.stringify(body) }),
  updateVariant: (id, body) => request(`/product-variants/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteVariant: (id) => request(`/product-variants/${id}`, { method: 'DELETE' }),

  // --- Tài khoản demo (login chọn list) ---
  customers: () => request('/customers'),
  sellers: () => request('/sellers'),

  // --- Giỏ & thanh toán ---
  cart: (customerId) => request(`/carts/customer/${customerId}`),
  addCartItem: (customerId, item) =>
    request(`/carts/${customerId}/items`, { method: 'POST', body: JSON.stringify(item) }),

  checkout: (body) => request('/payments/checkout', { method: 'POST', body: JSON.stringify(body) }),

  // --- Đơn hàng khách ---
  ordersByCustomer: (customerId) => request(`/orders/customer/${customerId}`),
  ordersInTransitByCustomer: (customerId) => request(`/orders/customer/${customerId}/in-transit`),
  order: (id) => request(`/orders/${id}`),

  // --- Đánh giá & báo cáo ---
  reviewsByProduct: (productId) => request(`/reviews/product/${productId}`),
  createReview: (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }),

  createReport: (body) => request('/reports', { method: 'POST', body: JSON.stringify(body) }),

  // --- Seller ---
  sellerOrders: (sellerId) => request(`/sellers/${sellerId}/orders`),
  sellerOrdersInTransit: (sellerId) => request(`/sellers/${sellerId}/orders/in-transit`),
  sellerOrder: (sellerId, orderId) => request(`/sellers/${sellerId}/orders/${orderId}`),
  sellerStatistics: (sellerId) => request(`/sellers/${sellerId}/orders/statistics`),
  updateSellerOrderStatus: (sellerId, orderId, status) =>
    request(`/sellers/${sellerId}/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // --- Chat ---
  chatConversations: (params) => {
    const q = new URLSearchParams(params).toString()
    return request(`/chat/conversations?${q}`)
  },
  createConversation: (body) =>
    request('/chat/conversations', { method: 'POST', body: JSON.stringify(body) }),
  chatMessages: (conversationId) => request(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, body) =>
    request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}
