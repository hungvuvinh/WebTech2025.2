/**
 * TRẠNG THÁI TÍNH NĂNG — cập nhật khi hoàn thành hoặc bàn giao việc mới.
 * Giá trị status: 'done' | 'partial' | 'todo'
 *
 * Dev tiếp theo: ưu tiên các mục status !== 'done'
 */

export const FEATURE_MATRIX = {
  customer: {
    browseAndSearch: {
      status: 'done',
      route: '/',
      notes: 'Lọc danh mục + tìm theo tên. Chưa phân trang server-side.',
    },
    productDetail: {
      status: 'done',
      route: '/products/:id',
      notes: 'Cần product-variant có price + stock trước khi mua.',
    },
    cart: {
      status: 'partial',
      route: '/cart',
      notes: 'Chưa có xóa/sửa số lượng từng dòng giỏ (API chưa có endpoint riêng).',
    },
    checkout: {
      status: 'done',
      route: '/checkout',
      notes: 'Gọi POST /api/payments/checkout.',
    },
    orderTracking: {
      status: 'done',
      route: '/orders',
      notes: 'Danh sách đơn theo customer_id.',
    },
    reviews: {
      status: 'done',
      route: '/products/:id',
      notes: 'Form đánh giá trên trang chi tiết SP.',
    },
    productReports: {
      status: 'done',
      route: '/products/:id',
      notes: 'POST /api/reports. Seller chưa có UI xem báo cáo.',
    },
    chat: {
      status: 'partial',
      route: '/chat',
      notes: 'Polling 5s. Chưa WebSocket / chưa hiện tên shop đầy đủ.',
    },
  },
  seller: {
    productManagement: {
      status: 'partial',
      route: '/seller/products',
      notes: 'CRUD sản phẩm + thêm variant. Chọn category bằng ID thủ công.',
    },
    orderManagement: {
      status: 'done',
      route: '/seller/orders',
      notes: 'PATCH trạng thái đơn.',
    },
    statistics: {
      status: 'done',
      route: '/seller/statistics',
      notes: 'Đọc OrderStatisticsResponse từ backend.',
    },
    chat: {
      status: 'partial',
      route: '/chat',
      notes: 'Giống phía khách.',
    },
  },
  platform: {
    authentication: {
      status: 'todo',
      notes: 'Hiện chỉ chọn account từ list (localStorage). Cần JWT/OAuth + form đăng ký.',
    },
    authorization: {
      status: 'todo',
      notes: 'ProtectedRoute kiểm tra role client-side; backend chưa có Spring Security.',
    },
    errorHandling: {
      status: 'partial',
      notes: 'Toast qua Sonner. Chưa có ErrorBoundary / trang 404 riêng.',
    },
    tests: {
      status: 'todo',
      notes: 'Chưa có Vitest/RTL. Nên test api.js + ProtectedRoute.',
    },
    i18n: {
      status: 'todo',
      notes: 'UI tiếng Việt hard-code.',
    },
  },
}

/** Việc ưu tiên gợi ý cho sprint tiếp theo */
export const NEXT_TASKS = [
  {
    priority: 'P0',
    task: 'Tích hợp đăng nhập thật (JWT) — thay LoginPage chọn list',
    files: ['context/AuthContext.jsx', 'pages/LoginPage.jsx', 'lib/api.js'],
  },
  {
    priority: 'P1',
    task: 'Giỏ hàng: sửa/xóa item (cần API backend hoặc PUT cart)',
    files: ['pages/customer/CartPage.jsx', 'lib/api.js'],
  },
  {
    priority: 'P1',
    task: 'Seller: dropdown chọn category thay vì nhập ObjectId',
    files: ['pages/seller/SellerProductsPage.jsx'],
  },
  {
    priority: 'P2',
    task: 'Chat real-time (WebSocket / SSE) thay polling',
    files: ['pages/ChatPage.jsx'],
  },
  {
    priority: 'P2',
    task: 'Trang seller xem báo cáo lỗi sản phẩm từ khách',
    files: ['pages/seller/ (mới)', 'lib/api.js'],
  },
  {
    priority: 'P3',
    task: 'Phân trang + upload ảnh sản phẩm',
    files: ['pages/customer/HomePage.jsx', 'pages/seller/SellerProductsPage.jsx'],
  },
]
