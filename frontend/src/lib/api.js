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
const AUTH_STORAGE_KEY = 'webtech_auth'

function readAuthFromStorage() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function request(path, options = {}) {
  const auth = readAuthFromStorage()
  const accessToken = auth?.accessToken

  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    let message = res.statusText
    let body = null
    try {
      body = await res.json()
      message = body.message || body.error || JSON.stringify(body)
    } catch {
      try {
        message = await res.text()
      } catch {
        /* ignore */
      }
    }
    const err = new Error(message || `HTTP ${res.status}`)
    if (body) err.body = body
    throw err
  }
  if (res.status === 204) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

function normalizeListResponse(data) {
  if (Array.isArray(data)) return data

  if (!data || typeof data !== 'object') return []

  const candidateKeys = ['categories', 'data', 'items', 'results', 'content']
  for (const key of candidateKeys) {
    if (Array.isArray(data[key])) return data[key]
  }

  for (const value of Object.values(data)) {
    if (Array.isArray(value)) return value
  }

  return []
}

export const api = {
  // --- Danh mục & sản phẩm ---
  categories: async () => normalizeListResponse(await request('/categories')),
  products: () => request('/products'),
  product: (id) => request(`/products/${id}`),
  productsBySeller: (sellerId) => request(`/products/seller/${sellerId}`),
  createProduct: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  createProductWithImage: async (body, file) => {
    const API_BASE = API
    const auth = readAuthFromStorage()
    const accessToken = auth?.accessToken
    const form = new FormData()
    form.append('product_name', body.product_name)
    if (body.brand) form.append('brand', body.brand)
    if (body.category_id) form.append('category_id', body.category_id)
    if (body.seller_id) form.append('seller_id', body.seller_id)
    if (body.img_url) form.append('img_url', body.img_url)
    if (file) form.append('file', file)
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: form,
    })
    if (!res.ok) {
      let txt = await res.text()
      throw new Error(txt || res.statusText)
    }
    return res.json()
  },
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // upload product image (multipart/form-data)
  uploadProductImage: async (productId, file) => {
    const auth = readAuthFromStorage()
    const accessToken = auth?.accessToken
    const API_BASE = API
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_BASE}/products/${productId}/image`, {
      method: 'POST',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: form,
    })
    if (!res.ok) {
      let txt = await res.text()
      throw new Error(txt || res.statusText)
    }
    return res.json()
  },

  variants: () => request('/product-variants'),
  createVariant: (body) => request('/product-variants', { method: 'POST', body: JSON.stringify(body) }),
  updateVariant: (id, body) => request(`/product-variants/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteVariant: (id) => request(`/product-variants/${id}`, { method: 'DELETE' }),

  // --- Tài khoản demo (login chọn list) ---
  customers: () => request('/customers'),
  sellers: () => request('/sellers'),
  seller: (id) => request(`/sellers/${id}`),

  // --- Xác thực ---
  auth: {
    register: (body) => {
      // backend expects snake_case keys: user_name, phone_number
      const payload = {
        user_name: body.userName,
        email: body.email,
        phone_number: body.phoneNumber,
        password: body.password,
        role: body.role,
      }
      return request('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
    },
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },

  // --- Giỏ & thanh toán ---
  cart: (customerId) => request(`/carts/customer/${customerId}`),
  addCartItem: (customerId, item) =>
    request(`/carts/${customerId}/items`, { method: 'POST', body: JSON.stringify(item) }),
  updateCartItemQuantity: (customerId, productVariantId, item) =>
    request(`/carts/${customerId}/items/${productVariantId}`, { method: 'PUT', body: JSON.stringify(item) }),
  removeCartItem: (customerId, productVariantId) =>
    request(`/carts/${customerId}/items/${productVariantId}`, { method: 'DELETE' }),

  checkout: (body) => request('/payments/checkout', { method: 'POST', body: JSON.stringify(body) }),
  checkoutVnpay: (body) => request('/payments/vnpay/checkout', { method: 'POST', body: JSON.stringify(body) }),
  confirmVnpayPayment: (body) =>
    request('/payments/vnpay/confirm', { method: 'POST', body: JSON.stringify(body) }),

  // --- Đơn hàng khách ---
  ordersByCustomer: (customerId) => request(`/orders/customer/${customerId}`),
  ordersInTransitByCustomer: (customerId) => request(`/orders/customer/${customerId}/in-transit`),
  order: (id) => request(`/orders/${id}`),

  // --- Đánh giá & báo cáo ---
  reviewsByProduct: (productId) => request(`/reviews/product/${productId}`),
  createReview: (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  updateReview: (reviewId, body) => request(`/reviews/${reviewId}`, { method: 'PUT', body: JSON.stringify(body) }),

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
