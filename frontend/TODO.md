# Frontend — Backlog cho dev tiếp theo

Cập nhật file này khi nhận hoặc hoàn thành task. Tham chiếu thêm `src/config/features.js`.

---

## P0 — Bắt buộc trước production

- [ ] **Đăng nhập / đăng ký thật**
  - Backend: endpoint auth + JWT (Spring Security)
  - Frontend: form email/password, lưu token, gửi `Authorization` header trong `lib/api.js`
  - Files: `AuthContext.jsx`, `LoginPage.jsx`, `api.js`

---

## P1 — Trải nghiệm cốt lõi còn thiếu

- [ ] **Giỏ hàng: sửa số lượng / xóa dòng**
  - Cần API: `PUT /api/carts/customer/:id` hoặc `DELETE .../items`
  - File: `pages/customer/CartPage.jsx`

- [ ] **Seller chọn danh mục bằng dropdown**
  - `GET /api/categories` đã có
  - File: `pages/seller/SellerProductsPage.jsx`

- [ ] **Hiển thị tên khách/seller trong Chat** (thay vì `slice(-6)` id)
  - Fetch `customers` / `sellers` map id → name
  - File: `pages/ChatPage.jsx`

---

## P2 — Cải thiện nghiệp vụ

- [ ] **Chat real-time** (WebSocket hoặc SSE) — bỏ `setInterval` 5s
- [ ] **Trang seller: danh sách báo cáo lỗi SP** (`GET /api/reports` + filter)
- [ ] **Trang chi tiết đơn hàng** (khách + seller) thay vì chỉ list
- [ ] **Error boundary** + trang 404 custom

---

## P3 — Nice to have

- [ ] Phân trang sản phẩm (server-side)
- [ ] Upload ảnh sản phẩm
- [ ] Dark mode toggle
- [ ] Vitest + React Testing Library cho `api.js`, `ProtectedRoute`
- [ ] TypeScript migration (`*.jsx` → `*.tsx`)

---

## Đã xong (tham khảo)

- [x] Cửa hàng + chi tiết SP + thêm giỏ
- [x] Checkout + theo dõi đơn
- [x] Đánh giá + báo lỗi trên trang SP
- [x] Seller: CRUD SP, quản lý đơn, thống kê
- [x] Chat cơ bản (polling)
- [x] shadcn + Sonner + Lucide + React Router
- [x] Proxy Vite `/api` → backend

---

## Ghi chú khi nhận task mới

1. Đọc `README.md` → xác định file cần sửa
2. Thêm hàm API vào `lib/api.js` trước
3. Cập nhật `config/routes.js` nếu có route mới
4. Chạy `npm run build` trước khi commit
5. Gạch checkbox trong file này + đổi `features.js`
