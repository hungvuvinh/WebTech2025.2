import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  ChevronRight,
  Flame,
  Gift,
  Headphones,
  Laptop,
  Smartphone,
  Sparkles,
  Tag,
  Ticket,
  UtensilsCrossed,
} from 'lucide-react'
import { ProductCard, SectionHeader } from '@/components/product/ProductCard'
import { api } from '@/lib/api'
import { idOf, productName } from '@/lib/utils'

const CATEGORY_ICONS = [BookOpen, Smartphone, Laptop, Headphones, UtensilsCrossed, Gift, Sparkles, Tag]

const QUICK_LINKS = [
  { label: 'Tiki VIP', icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
  { label: 'Hot Coupon', icon: Ticket, color: 'bg-orange-100 text-orange-600' },
  { label: 'Giá Kho', icon: Tag, color: 'bg-blue-100 text-[#1A94FF]' },
  { label: 'Deal Sốc', icon: Flame, color: 'bg-red-100 text-[#FF424E]' },
]

export function HomePage() {
  const [searchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])
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
                  <Tag className="h-5 w-5 shrink-0 text-[#1A94FF]" />
                  Tất cả sản phẩm
                </button>
              </li>
              {categories.map((c, i) => {
                const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length]
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
                      <Icon className="h-5 w-5 shrink-0 text-[#1A94FF]" />
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
          {/* Banner */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#1A94FF] to-[#0b74e5] p-5 text-white shadow-sm">
              <p className="text-xs font-medium uppercase opacity-90">Ưu đãi đặc biệt</p>
              <h3 className="mt-1 text-xl font-bold">Giảm đến 50%</h3>
              <p className="mt-1 text-sm opacity-90">Hàng ngàn sản phẩm chính hãng</p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#1A94FF]"
              >
                Mua ngay <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#FF424E] to-[#ff6b6b] p-5 text-white shadow-sm">
              <p className="text-xs font-medium uppercase opacity-90">Freeship</p>
              <h3 className="mt-1 text-xl font-bold">Mọi đơn hàng</h3>
              <p className="mt-1 text-sm opacity-90">Giao nhanh 2 giờ nội thành</p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#FF424E]"
              >
                Khám phá <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-4 gap-2 rounded-lg bg-white p-3 shadow-sm sm:grid-cols-4">
            {QUICK_LINKS.map(({ label, icon: Icon, color }) => (
              <button
                key={label}
                type="button"
                className="flex flex-col items-center gap-2 rounded-lg p-2 transition-colors hover:bg-[#f5f5fa]"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-center text-xs text-foreground">{label}</span>
              </button>
            ))}
          </div>

          {/* Sản phẩm */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <SectionHeader title="TOP DEAL • SIÊU RẺ" />
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
