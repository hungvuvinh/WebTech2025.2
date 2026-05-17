/**
 * BẢN ĐỒ ROUTE — sửa tại đây khi thêm trang mới.
 * App.jsx và AppLayout.jsx đọc file này để đồng bộ menu + router.
 *
 * @see frontend/README.md — hướng dẫn chi tiết cho dev
 */

/** @type {'customer' | 'seller' | null} */
export const ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  GUEST: null,
}

/**
 * Trang công khai (không bắt buộc đăng nhập)
 */
export const PUBLIC_ROUTES = [
  {
    path: '/',
    id: 'home',
    label: 'Cửa hàng',
    useCase: 'Duyệt sản phẩm theo danh mục',
    component: 'HomePage',
    file: 'pages/customer/HomePage.jsx',
    api: ['GET /api/categories', 'GET /api/products'],
  },
  {
    path: '/products/:id',
    id: 'product-detail',
    label: 'Chi tiết sản phẩm',
    useCase: 'Xem SP, thêm giỏ, đánh giá, báo lỗi, chat seller',
    component: 'ProductDetailPage',
    file: 'pages/customer/ProductDetailPage.jsx',
    api: [
      'GET /api/products/:id',
      'GET /api/product-variants',
      'GET /api/reviews/product/:id',
      'POST /api/reviews',
      'POST /api/reports',
      'POST /api/carts/:customerId/items',
    ],
  },
  {
    path: '/login',
    id: 'login',
    label: 'Đăng nhập',
    useCase: 'Chọn vai trò + tài khoản demo (chưa có JWT)',
    component: 'LoginPage',
    file: 'pages/LoginPage.jsx',
    api: ['GET /api/customers', 'GET /api/sellers'],
  },
]

/**
 * Trang khách hàng — cần đăng nhập role=customer
 */
export const CUSTOMER_ROUTES = [
  {
    path: '/cart',
    id: 'cart',
    label: 'Giỏ hàng',
    useCase: 'Chọn sản phẩm & thanh toán (bước 1)',
    component: 'CartPage',
    file: 'pages/customer/CartPage.jsx',
    api: ['GET /api/carts/customer/:customerId'],
    nav: true,
    icon: 'ShoppingCart',
  },
  {
    path: '/checkout',
    id: 'checkout',
    label: 'Thanh toán',
    useCase: 'Chọn sản phẩm & thanh toán (bước 2)',
    component: 'CheckoutPage',
    file: 'pages/customer/CheckoutPage.jsx',
    api: ['POST /api/payments/checkout'],
    nav: false,
  },
  {
    path: '/orders',
    id: 'orders',
    label: 'Đơn hàng',
    useCase: 'Theo dõi đơn hàng',
    component: 'OrdersPage',
    file: 'pages/customer/OrdersPage.jsx',
    api: ['GET /api/orders/customer/:customerId'],
    nav: true,
    icon: 'Package',
  },
]

/**
 * Trang người bán — cần đăng nhập role=seller
 */
export const SELLER_ROUTES = [
  {
    path: '/seller/products',
    id: 'seller-products',
    label: 'Sản phẩm',
    useCase: 'Quản lý sản phẩm',
    component: 'SellerProductsPage',
    file: 'pages/seller/SellerProductsPage.jsx',
    api: [
      'GET /api/products/seller/:sellerId',
      'POST|PUT|DELETE /api/products',
      'POST /api/product-variants',
    ],
    nav: true,
    icon: 'Store',
  },
  {
    path: '/seller/orders',
    id: 'seller-orders',
    label: 'Đơn hàng',
    useCase: 'Quản lý đơn hàng',
    component: 'SellerOrdersPage',
    file: 'pages/seller/SellerOrdersPage.jsx',
    api: [
      'GET /api/sellers/:sellerId/orders',
      'PATCH /api/sellers/:sellerId/orders/:orderId/status',
    ],
    nav: true,
    icon: 'Package',
  },
  {
    path: '/seller/statistics',
    id: 'seller-stats',
    label: 'Thống kê',
    useCase: 'Báo cáo - thống kê',
    component: 'SellerStatisticsPage',
    file: 'pages/seller/SellerStatisticsPage.jsx',
    api: ['GET /api/sellers/:sellerId/orders/statistics'],
    nav: true,
    icon: 'BarChart3',
  },
]

/** Chat dùng chung cả khách và seller */
export const SHARED_ROUTES = [
  {
    path: '/chat',
    id: 'chat',
    label: 'Chat',
    useCase: 'Chat khách hàng ↔ người bán',
    component: 'ChatPage',
    file: 'pages/ChatPage.jsx',
    api: [
      'GET|POST /api/chat/conversations',
      'GET|POST /api/chat/conversations/:id/messages',
    ],
    nav: true,
    icon: 'MessageCircle',
  },
]

/** Menu cửa hàng cho khách (chưa đăng nhập vẫn thấy) */
export const CUSTOMER_STORE_NAV = {
  path: '/',
  label: 'Cửa hàng',
  icon: 'LayoutGrid',
}

export function navLinksForRole(role) {
  if (role === ROLES.SELLER) {
    return SELLER_ROUTES.filter((r) => r.nav).concat(SHARED_ROUTES.filter((r) => r.nav))
  }
  if (role === ROLES.CUSTOMER) {
    return [CUSTOMER_STORE_NAV]
      .concat(CUSTOMER_ROUTES.filter((r) => r.nav))
      .concat(SHARED_ROUTES.filter((r) => r.nav))
  }
  return [CUSTOMER_STORE_NAV]
}
