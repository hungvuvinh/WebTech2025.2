import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Home, Search, ShoppingCart, Truck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'

const HOT_KEYWORDS = ['điện thoại', 'laptop', 'tai nghe', 'nồi chiên', 'sách']

const TRUST_ITEMS = ['100% hàng thật', 'Freeship mọi đơn', 'Giao nhanh', 'Đổi trả dễ dàng']

export function ShopHeader() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoggedIn, isCustomer, userName } = useAuth()
  const [q, setQ] = useState(searchParams.get('q') || '')

  const onSearch = (e) => {
    e.preventDefault()
    const query = q.trim()
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-[1240px] px-3 pt-2">
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/" className="shrink-0 text-lg font-bold text-[#1A94FF]">
            WebTech Shop
          </Link>

          <form onSubmit={onSearch} className="relative min-w-0 flex-1">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm sản phẩm, thương hiệu, danh mục..."
              className="h-10 rounded-sm border-[#1A94FF]/30 pr-24 shadow-none focus-visible:ring-[#1A94FF]"
            />
            <Button
              type="submit"
              className="absolute right-0 top-0 h-10 rounded-l-none rounded-r-sm bg-[#1A94FF] px-5 hover:bg-[#0b74e5]"
            >
              <Search className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Tìm kiếm</span>
            </Button>
          </form>

          <div className="hidden shrink-0 items-center gap-4 sm:flex">
            <Link to="/" className="flex flex-col items-center gap-0.5 text-xs text-[#1A94FF] hover:opacity-80">
              <Home className="h-6 w-6" />
              <span>Trang chủ</span>
            </Link>
            {isLoggedIn && isCustomer && (
              <Link
                to="/orders?tab=shipping"
                className="flex flex-col items-center gap-0.5 text-xs text-[#1A94FF] hover:opacity-80"
              >
                <Truck className="h-6 w-6" />
                <span>Đang giao</span>
              </Link>
            )}
            <Link
              to={isLoggedIn ? (isCustomer ? '/orders' : '/seller/products') : '/login'}
              className="flex flex-col items-center gap-0.5 text-xs text-[#1A94FF] hover:opacity-80"
            >
              <User className="h-6 w-6" />
              <span className="max-w-[72px] truncate">
                {isLoggedIn ? userName?.split(' ')[0] || 'Tài khoản' : 'Đăng nhập'}
              </span>
            </Link>
            <Link
              to={isLoggedIn && isCustomer ? '/cart' : '/login'}
              className="flex flex-col items-center gap-0.5 text-xs text-[#1A94FF] hover:opacity-80"
            >
              <ShoppingCart className="h-6 w-6" />
              <span>Giỏ hàng</span>
            </Link>
          </div>
        </div>

        <div className="mt-1 hidden flex-wrap gap-x-3 pb-2 text-xs text-muted-foreground md:flex">
          {HOT_KEYWORDS.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => {
                setQ(kw)
                navigate(`/?q=${encodeURIComponent(kw)}`)
              }}
              className="hover:text-[#1A94FF]"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[#ebebf0] bg-[#f5f5fa]">
        <ul className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-4 gap-y-1 px-3 py-1.5 text-xs text-[#1A94FF]">
          {TRUST_ITEMS.map((text) => (
            <li key={text} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1A94FF]" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
