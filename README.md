# WebTech2025.2

## Thành viên

1. Vũ Vinh Hùng — 20235099  
2. Chu Gia Huy — 20235104  
3. Tưởng Duy Hưởng — 20225328  
4. Nguyễn Quang Hưng — 20225197  

---

## Cấu trúc dự án

- **`backend/`**: Spring Boot 3, REST API, MongoDB (database **`WebTech20252`**).  
- **`frontend/`**: Vite + React (nếu dùng gọi API, mặc định proxy hoặc CORS đã bật cho `/api/**`).

---

## Yêu cầu môi trường

| Thành phần | Ghi chú |
|------------|---------|
| **JDK** | 17 trở lên (dự án khai báo `java.version` 17). |
| **MongoDB** | Bản chạy local hoặc Atlas; database tên **`WebTech20252`** (khớp namespace trong đề bài). |
| **Maven** | Có thể dùng **`backend/mvnw.cmd`** (Windows) hoặc `./mvnw` (Linux/macOS), không cần cài Maven global. |

---

## Cài đặt và chạy backend

### 1. MongoDB

- Cài [MongoDB Community](https://www.mongodb.com/try/download/community) hoặc dùng MongoDB Atlas.  
- Tạo database **`WebTech20252`** (Spring Data sẽ dùng database từ URI; collection tự tạo khi ghi dữ liệu).  
- URI mặc định trong `backend/src/main/resources/application.properties`:

  ```text
  mongodb://localhost:27017/WebTech20252
  ```

- Ghi đè bằng biến môi trường (khuyến nghị khi deploy):

  ```text
  MONGODB_URI=mongodb://USER:PASS@host:27017/WebTech20252?authSource=admin
  ```

### 2. Chạy ứng dụng

Trong thư mục `backend/`:

```powershell
.\mvnw.cmd spring-boot-run
```

Mặc định API lắng nghe cổng **8080** (trừ khi bạn cấu hình `server.port`).

### 3. Mở rộng schema (quan trọng cho “Quản lý đơn hàng — người bán”)

Trong mô hình ứng dụng, collection **`products`** có thêm trường **`seller_id`** (ObjectId dạng chuỗi hex trong JSON) để biết sản phẩm thuộc người bán nào. Trường này **bổ sung so với file JSON schema gốc** của đề; khi tạo/sửa sản phẩm qua API, hãy gửi `seller_id` để luồng đơn hàng của seller hoạt động đúng.

---

## CRUD cơ bản (REST)

Tất cả endpoint dưới tiền tố **`/api`**. JSON dùng tên trường snake_case như MongoDB (ví dụ `_id`, `customer_id`).

| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|--------|
| **GET** | `/api/{resource}` | Liệt kê toàn bộ. |
| **GET** | `/api/{resource}/{id}` | Chi tiết theo `_id`. |
| **POST** | `/api/{resource}` | Tạo mới (body JSON; có thể bỏ `_id` để Mongo sinh). |
| **PUT** | `/api/{resource}/{id}` | Thay thế toàn bộ document (ghi đè theo `id` trên URL). |
| **DELETE** | `/api/{resource}/{id}` | Xóa. |

### Bảng `resource` → collection

| `resource` (trên URL) | Collection MongoDB |
|----------------------|--------------------|
| `/api/carts` | `carts` |
| `/api/categories` | `categories` |
| `/api/conversations` | `conversations` |
| `/api/customers` | `customers` |
| `/api/messages` | `messages` |
| `/api/orders` | `orders` |
| `/api/payments` | `payment` |
| `/api/product-variants` | `product_variants` |
| `/api/products` | `products` |
| `/api/reports` | `reports` |
| `/api/reviews` | `reviews` |
| `/api/sellers` | `sellers` |

### Ví dụ nhanh với `curl` (PowerShell)

Giả sử backend chạy tại `http://localhost:8080`.

**Tạo khách hàng**

```powershell
curl -Method POST -Uri "http://localhost:8080/api/customers" `
  -ContentType "application/json" `
  -Body '{"customer_name":"Nguyen Van A","email":"a@example.com","phone_number":"0900000000"}'
```

**Lấy danh sách khách hàng**

```powershell
curl "http://localhost:8080/api/customers"
```

**Tạo sản phẩm (có `seller_id` để test đơn hàng seller)**

```powershell
curl -Method POST -Uri "http://localhost:8080/api/products" `
  -ContentType "application/json" `
  -Body '{"product_name":"Laptop","brand":"ACME","category_id":"<ObjectIdDanhMuc>","seller_id":"<ObjectIdNguoiBan>"}'
```

Thay các placeholder bằng ObjectId thật từ MongoDB Compass hoặc từ response API sau khi tạo `categories` / `sellers`.

**Đơn hàng** (`items`: `quantity` và `unit_price` theo schema là **chuỗi**)

```powershell
curl -Method POST -Uri "http://localhost:8080/api/orders" `
  -ContentType "application/json" `
  -Body '{"customer_id":"<ObjectIdKH>","items":[{"product_id":"<ObjectIdSP>","product_variant_id":"<ObjectIdBienThe>","quantity":"1","unit_price":"10000000"}],"order_date":"2026-05-03T10:00:00Z","shipping_address":"HN","status":"PENDING","total_amount":"10000000"}'
```

---

## Use case: Quản lý đơn hàng (người bán)

Người bán chỉ thấy và cập nhật các đơn có **ít nhất một dòng `items` với `product_id` thuộc sản phẩm của seller** (`products.seller_id` = `sellerId` trên URL).

| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|--------|
| **GET** | `/api/sellers/{sellerId}/orders` | Danh sách đơn liên quan đến sản phẩm của seller. |
| **GET** | `/api/sellers/{sellerId}/orders/{orderId}` | Chi tiết đơn (403 nếu đơn không chứa sản phẩm của seller). |
| **PATCH** | `/api/sellers/{sellerId}/orders/{orderId}/status` | Cập nhật `status` (body: `{"status":"SHIPPED"}`). |

**Ví dụ cập nhật trạng thái**

```powershell
curl -Method PATCH -Uri "http://localhost:8080/api/sellers/<sellerId>/orders/<orderId>/status" `
  -ContentType "application/json" `
  -Body '{"status":"SHIPPED"}'
```

Gợi ý giá trị `status` (tùy nghiệp vụ): `PENDING`, `CONFIRMED`, `SHIPPED`, `COMPLETED`, `CANCELLED`.

---

## Use case: Chat (khách hàng và người bán)

| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|--------|
| **POST** | `/api/chat/conversations` | Tạo hội thoại hoặc trả về hội thoại đã có cùng cặp `(customer_id, seller_id)`. Body: `{"customer_id":"...","seller_id":"..."}`. Kiểm tra tồn tại customer/seller. |
| **GET** | `/api/chat/conversations?customer_id=...` **hoặc** `?seller_id=...` | Danh sách hội thoại (chỉ được truyền **một** trong hai tham số). |
| **GET** | `/api/chat/conversations/{conversationId}/messages` | Tin nhắn theo thời gian tăng dần. |
| **POST** | `/api/chat/conversations/{conversationId}/messages` | Gửi tin. Body: `{"sender_id":"...","sender_type":"customer"|"seller","content":"..."}`. `sender_id` phải khớp `customer_id` hoặc `seller_id` của hội thoại tùy `sender_type`. |

**Ví dụ tạo / lấy hội thoại**

```powershell
curl -Method POST -Uri "http://localhost:8080/api/chat/conversations" `
  -ContentType "application/json" `
  -Body '{"customer_id":"<ObjectIdKH>","seller_id":"<ObjectIdNB>"}'
```

**Ví dụ gửi tin (phía khách)**

```powershell
curl -Method POST -Uri "http://localhost:8080/api/chat/conversations/<conversationId>/messages" `
  -ContentType "application/json" `
  -Body '{"sender_id":"<ObjectIdKH>","sender_type":"customer","content":"Xin chao shop"}'
```

---

## Chạy test tự động

Trong `backend/`:

```powershell
.\mvnw.cmd test
```

- **`BackendApplicationTests`**: nạp full context; với cấu hình trong `src/test/resources/application.properties`, **Flapdoodle Embedded MongoDB** sẽ khởi động Mongo tạm (lần đầu có thể **tải binary MongoDB** từ mạng, mất vài phút).  
- **`ChatControllerWebMvcTest`**, **`SellerOrderControllerWebMvcTest`**: kiểm tra lớp web với mock service, **không** cần Mongo thật.

Nếu môi trường không cho phép tải embedded Mongo, bạn vẫn có thể chạy riêng các test `*WebMvcTest` từ IDE, hoặc cài Mongo local và điều chỉnh `spring.data.mongodb.uri` trong profile test (nâng cao).

### Lombok và Maven

Dự án dùng Lombok. Trong `pom.xml` đã cấu hình **`maven-compiler-plugin`** với `annotationProcessorPaths` cho Lombok để **`mvnw compile`** / **`mvnw test`** luôn sinh getter/setter/constructor đúng.

---

## Ghi chú CORS và SPA

- CORS cho **`/api/**`** được bật trong `WebConfig` (phục vụ frontend dev).  
- Forward SPA từ `WebConfig` không che các mapping REST cụ thể hơn; API ưu tiên xử lý bởi controller.
