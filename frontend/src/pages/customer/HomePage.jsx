import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Flame, Sparkles, Tag, Ticket } from 'lucide-react'
import { ProductCard, SectionHeader } from '@/components/product/ProductCard'
import { api } from '@/lib/api'
import { idOf, productName } from '@/lib/utils'

// Category icons removed — categories will display text only

export function HomePage() {
  const [searchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])
  const [sellers, setSellers] = useState([])
  const [categoryId, setCategoryId] = useState('all')
  const q = searchParams.get('q') || ''

  useEffect(() => {
    Promise.all([api.categories(), api.products(), api.variants()])
      .then(([cats, prods, vars]) => {
        setCategories(Array.isArray(cats) ? cats : [])
        setProducts(Array.isArray(prods) ? prods : [])
        setVariants(Array.isArray(vars) ? vars : [])
      })
      .catch(() => {})

    api.sellers()
      .then((list) => setSellers(Array.isArray(list) ? list : []))
      .catch(() => {})
  }, [])

  const priceByProduct = useMemo(() => {
    const map = {}
    for (const v of variants) {
      const pid = v.product_id
      if (!pid || v.price == null) continue
      if (map[pid] == null || v.price < map[pid]) map[pid] = v.price
    }
    return map
  }, [variants])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const name = productName(p).toLowerCase()
      const matchSearch = !q || name.includes(q.toLowerCase())
      const matchCat = categoryId === 'all' || p.category_id === categoryId
      return matchSearch && matchCat
    })
  }, [products, q, categoryId])

  const filteredSellers = useMemo(() => {
    if (!q) return []
    const term = q.toLowerCase()
    return sellers.filter((s) => {
      const name = (s.seller_name || s.shop_name || s.user_name || s.name || '').toLowerCase()
      const desc = (s.description || s.bio || '').toLowerCase()
      return name.includes(term) || desc.includes(term)
    })
  }, [sellers, q])

  return (
    <div className="mx-auto max-w-[1240px] px-3 py-3">
      <div className="flex gap-3">
        {/* Sidebar danh mục */}
        <aside className="hidden w-[240px] shrink-0 md:block">
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <h2 className="border-b border-[#ebebf0] px-4 py-3 text-sm font-bold text-foreground">
              Danh mục
            </h2>
            <ul className="py-1">
              <li>
                <button
                  type="button"
                  onClick={() => setCategoryId('all')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-[#e8f4ff] ${
                    categoryId === 'all' ? 'bg-[#e8f4ff] font-medium text-[#1A94FF]' : ''
                  }`}
                >
                  Tất cả sản phẩm
                </button>
              </li>
              {categories.map((c) => {
                const cid = idOf(c)
                return (
                  <li key={cid}>
                    <button
                      type="button"
                      onClick={() => setCategoryId(cid)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-[#e8f4ff] ${
                        categoryId === cid ? 'bg-[#e8f4ff] font-medium text-[#1A94FF]' : ''
                      }`}
                    >
                      <span className="line-clamp-1">{c.category_name || c.categoryName}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* Nội dung chính */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Sản phẩm */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <SectionHeader title="TOP DEAL • SIÊU RẺ" />
            {q && filteredSellers.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium">Cửa hàng</h3>
                <div className="flex flex-wrap gap-3">
                  {filteredSellers.map((s) => (
                    <Link
                      to={`/sellers/${s._id || s.id}`}
                      key={s._id || s.id}
                      className="rounded-md border px-3 py-2 text-sm hover:bg-[#f5faff]"
                    >
                      <div className="font-medium text-[#1A94FF] line-clamp-1">{s.seller_name || s.shop_name || s.user_name || s.name}</div>
                      {s.location && <div className="text-xs text-muted-foreground">{s.location}</div>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {q && (
              <p className="mb-3 text-sm text-muted-foreground">
                Kết quả tìm kiếm: <strong className="text-[#1A94FF]">{q}</strong> ({filtered.length} sản phẩm)
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((p) => (
                <ProductCard
                  key={idOf(p)}
                  product={p}
                  price={priceByProduct[idOf(p)]}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">Không có sản phẩm phù hợp</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
