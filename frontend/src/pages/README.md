# Pages

Mỗi use-case có file riêng. **Không** gọi `fetch` trực tiếp — dùng `@/lib/api`.

| Thư mục | Vai trò |
|---------|---------|
| `customer/` | Khách: mua, giỏ, đơn, đánh giá, báo lỗi |
| `seller/` | Người bán: SP, đơn, thống kê |
| `LoginPage.jsx` | Chọn tài khoản demo |
| `ChatPage.jsx` | Chat hai chiều |

Bản đồ đầy đủ: [`../config/routes.js`](../config/routes.js)  
Hướng dẫn dev: [`../../README.md`](../../README.md)
