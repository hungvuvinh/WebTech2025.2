import { useEffect, useMemo, useState } from 'react'
import './App.css'

const FALLBACK_CATEGORIES = [
  'Điện thoại',
  'Laptop',
  'Phụ kiện',
  'Đồng hồ',
  'Gia dụng',
]

const FALLBACK_PRODUCTS = [
  { id: 'p1', name: 'Sản phẩm 1' },
  { id: 'p2', name: 'Sản phẩm 2' },
  { id: 'p3', name: 'Sản phẩm 3' },
  { id: 'p4', name: 'Sản phẩm 4' },
  { id: 'p5', name: 'Sản phẩm 5' },
]

function App() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [products, setProducts] = useState(FALLBACK_PRODUCTS)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryRes, productRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
        ])

        if (categoryRes.ok) {
          const categoryData = await categoryRes.json()
          if (Array.isArray(categoryData) && categoryData.length > 0) {
            setCategories(
              categoryData.map(
                (item) =>
                  item.category_name || item.categoryName || item.name || 'Thể loại'
              )
            )
          }
        }

        if (productRes.ok) {
          const productData = await productRes.json()
          if (Array.isArray(productData) && productData.length > 0) {
            setProducts(productData)
          }
        }
      } catch (error) {
        // Keep fallback data when backend is not available.
      }
    }

    loadData()
  }, [])

  const productCards = useMemo(() => {
    return products.slice(0, 5).map((product, index) => ({
      id: product.id || product._id || `product-${index}`,
      name:
        product.name ||
        product.product_name ||
        product.productName ||
        product.title ||
        `Sản phẩm ${index + 1}`,
    }))
  }, [products])

  return (
    <div className="page">
      <header className="header">
        <div className="logo">Logo</div>
        <input className="search" placeholder="Thanh tìm kiếm" />
        <div className="actions">
          <button><img src="cart-icon.png" alt="Giỏ hàng"/></button>
          <button>Đăng nhập</button>
        </div>
      </header>

      <main className="content">
        <aside className="categories">
          <h3>Danh sách thể loại</h3>
          <ul>
            {categories.slice(0, 8).map((category, index) => (
              <li key={`${category}-${index}`}>{category}</li>
            ))}
          </ul>
        </aside>

        <section className="products">
          <div className="product-grid">
            {productCards.map((product) => (
              <article key={product.id} className="product-card">
                {product.name}
              </article>
            ))}
          </div>
          <div className="pagination">
            <span />
            <span />
            <span />
          </div>
        </section>
      </main>

      <button className="chat-btn">Chat</button>
    </div>
  )
}

export default App
