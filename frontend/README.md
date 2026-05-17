# Frontend — WebTech Shop

> **Đọc file này trước khi sửa UI.** Mọi route, API và việc còn lại đều được ghi ở đây hoặc trong `src/config/`.

## Bắt đầu nhanh (5 phút)

```powershell
# Terminal 1 — backend (cổng 8080, cần MongoDB)
cd ..\backend
.\mvnw.cmd spring-boot:run

# Terminal 2 — frontend dev (cổng 5173, proxy /api → 8080)
cd frontend
npm install
npm run dev
```

Mở http://localhost:5173 → **Đăng nhập** → chọn Khách hàng hoặc Người bán và một tài khoản có trong DB.

Nếu danh sách tài khoản trống: tạo `customers` / `sellers` qua API (xem `../README.md`).

---

## Cấu trúc thư mục

```
frontend/
├── README.md              ← BẠN ĐANG Ở ĐÂY
├── TODO.md                ← Backlog có thứ tự ưu tiên
├── components.json        ← Cấu hình shadcn/ui
├── package.json
├── vite.config.js         ← Proxy /api, alias @ → src/
└── src/
    ├── main.jsx           ← Entry
    ├── App.jsx            ← React Router (đăng ký route)
    ├── index.css          ← Tailwind + theme shadcn
    ├── config/
    │   ├── routes.js      ← Bản đồ route + use-case + API
    │   └── features.js    ← Trạng thái tính năng + việc tiếp theo
    ├── lib/
    │   ├── api.js         ← MỌI gọi REST (không fetch rải rác trong page)
    │   └── utils.js       ← cn(), formatPrice, idOf, ...
    ├── context/
    │   └── AuthContext.jsx
    ├── components/
    │   ├── layout/AppLayout.jsx
    │   ├── ProtectedRoute.jsx
    │   └── ui/            ← shadcn (Button, Card, ...)
    └── pages/
        ├── LoginPage.jsx
        ├── ChatPage.jsx
        ├── customer/      ← Luồng khách
        └── seller/        ← Luồng người bán
```

### Quy tắc khi thêm code

| Việc | Làm ở đâu | Không làm |
|------|-----------|-----------|
| Gọi API | `src/lib/api.js` | `fetch()` trực tiếp trong page |
| Route mới | `config/routes.js` + `App.jsx` + menu `AppLayout` | Chỉ sửa một chỗ |
| UI tái sử dụng | `components/ui/` hoặc `components/` | Copy paste class Tailwind |
| Trạng thái đăng nhập | `useAuth()` | State riêng trong page |
| Thông báo lỗi/thành công | `toast` từ `sonner` | `alert()` |

---

## Use-case ↔ Route ↔ File

| Use-case (đề bài) | Route | File page | API chính |
|-------------------|-------|-----------|-------------|
| Chọn SP & thanh toán | `/`, `/products/:id`, `/cart`, `/checkout` | `HomePage`, `ProductDetailPage`, `CartPage`, `CheckoutPage` | `carts`, `payments/checkout` |
| Theo dõi đơn hàng | `/orders` | `OrdersPage` | `GET orders/customer/:id` |
| Đánh giá SP | `/products/:id` (tab đánh giá) | `ProductDetailPage` | `POST/GET reviews` |
| Báo lỗi SP | `/products/:id` (tab báo lỗi) | `ProductDetailPage` | `POST reports` |
| Quản lý SP (seller) | `/seller/products` | `SellerProductsPage` | `products`, `product-variants` |
| Quản lý đơn (seller) | `/seller/orders` | `SellerOrdersPage` | `sellers/:id/orders`, PATCH status |
| Báo cáo thống kê | `/seller/statistics` | `SellerStatisticsPage` | `.../orders/statistics` |
| Chat | `/chat` | `ChatPage` | `/api/chat/*` |

Chi tiết từng route: **`src/config/routes.js`**.

---

## Luồng nghiệp vụ quan trọng

### Khách mua hàng

```
Home → ProductDetail → [Thêm giỏ] → Cart → Checkout → Orders
         ↓                              ↑
    POST /carts/:customerId/items       POST /payments/checkout
```

**Điều kiện:** Sản phẩm phải có **product-variant** (`price`, `stock_quantity`). Seller thêm variant tại `/seller/products`.

### Đăng nhập (hiện tại — demo)

- Không có mật khẩu.
- `AuthContext` lưu `{ role, userId, userName }` vào `localStorage` key `webtech_auth`.
- `ProtectedRoute` chặn route theo `role`.

**Việc dev sau:** thay bằng JWT (xem `TODO.md` P0).

### Chat

- Khách: `?seller_id=...` trên URL hoặc nút trên trang SP.
- Poll tin nhắn mỗi 5 giây (`ChatPage.jsx`).

---

## Stack & lệnh

| Công nghệ | Ghi chú |
|-----------|---------|
| React 19 + Vite 8 | `npm run dev` / `build` |
| React Router 7 | `BrowserRouter` trong `App.jsx` |
| Tailwind 4 | `@tailwindcss/vite`, theme trong `index.css` |
| shadcn/ui | Radix + `components/ui/*`, thêm component: xem [shadcn docs](https://ui.shadcn.com) |
| Sonner | `<Toaster />` trong `App.jsx` |
| Lucide | Icon trong page/layout |

```powershell
npm run dev      # development
npm run build    # production → dist/
npm run preview  # xem bản build
npm run lint
```

### Build gắn vào Spring Boot (tùy chọn)

```powershell
npm run build
# Copy dist/* → ../backend/src/main/resources/static/
# Sau đó chỉ cần chạy backend, SPA phục vụ tại :8080
```

---

## Biến môi trường

Tạo `.env` từ `.env.example`:

```env
VITE_API_BASE=/api
```

Mặc định dùng proxy Vite (`/api` → `localhost:8080`). Production có thể đặt `VITE_API_BASE=https://api.example.com/api`.

---

## Checklist trước khi merge PR frontend

- [ ] API mới đã thêm vào `lib/api.js`
- [ ] Route mới đã khai báo trong `config/routes.js` và `App.jsx`
- [ ] Menu (desktop + mobile) hiển thị đúng role
- [ ] `npm run build` pass
- [ ] Đã test thủ công với backend + MongoDB có dữ liệu
- [ ] Cập nhật `config/features.js` hoặc `TODO.md` nếu đổi phạm vi

---

## Tài liệu liên quan

| File | Nội dung |
|------|----------|
| [TODO.md](./TODO.md) | Backlog ưu tiên P0–P3 |
| [src/config/features.js](./src/config/features.js) | Ma trận done/partial/todo |
| [src/config/routes.js](./src/config/routes.js) | Route + API mapping |
| [../README.md](../README.md) | Backend, MongoDB, curl mẫu |

---

## Liên hệ / bàn giao

Khi bàn giao sprint, cập nhật:

1. `config/features.js` — đổi `status`
2. `TODO.md` — gạch việc xong, thêm việc mới
3. Phần **Known issues** dưới đây (nếu có)

### Known issues

- Giỏ hàng không xóa/sửa số lượng từ UI.
- Seller nhập `category_id` thủ công (ObjectId).
- Chat polling, không real-time.
- Không có ảnh sản phẩm.
- Auth demo — không production-ready.
