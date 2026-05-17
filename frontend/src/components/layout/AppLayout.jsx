import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Circle,
  LayoutGrid,
  LogOut,
  MessageCircle,
  Package,
  ShoppingCart,
  Store,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShopHeader } from '@/components/layout/ShopHeader'
import { useAuth } from '@/context/AuthContext'
import { navLinksForRole } from '@/config/routes'
import { cn } from '@/lib/utils'

const ICON_MAP = {
  LayoutGrid,
  ShoppingCart,
  Package,
  MessageCircle,
  Store,
  BarChart3,
  Circle,
}

function NavIcon({ name, className }) {
  const Icon = ICON_MAP[name] || Circle
  return <Icon className={className} />
}

function NavItems({ links, className }) {
  return links.map(({ path, label, icon }) => (
    <NavLink
      key={path}
      to={path}
      end={path === '/'}
      className={({ isActive }) =>
        cn(
          'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#e8f4ff]',
          isActive && 'bg-[#e8f4ff] font-medium text-[#1A94FF]',
          className
        )
      }
    >
      <NavIcon name={icon} className="h-4 w-4 shrink-0" />
      <span className={className?.includes('flex-col') ? 'text-[10px] leading-tight' : ''}>{label}</span>
    </NavLink>
  ))
}

/** Header cửa hàng cho khách; header riêng cho khu vực người bán */
function useShopLayout() {
  const { pathname } = useLocation()
  const { isSeller } = useAuth()
  if (isSeller || pathname.startsWith('/seller')) return false
  return true
}

function SellerHeader() {
  const { auth, isLoggedIn, isCustomer, logout } = useAuth()
  const navigate = useNavigate()
  const links = navLinksForRole('seller')

  return (
    <header className="sticky top-0 z-40 border-b border-[#ebebf0] bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-4 px-4">
        <Link to="/seller/products" className="text-lg font-bold text-[#1A94FF]">
          WebTech Shop
          <span className="ml-2 text-sm font-normal text-muted-foreground">Kênh người bán</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          <NavItems links={links} />
          <Link
            to="/seller/orders?tab=shipping"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#1A94FF] hover:bg-[#e8f4ff]"
          >
            <Truck className="h-4 w-4" />
            Đang giao
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {isLoggedIn && (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">{auth.userName}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#1A94FF]"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function AppLayout() {
  const { pathname } = useLocation()
  const { isLoggedIn, role } = useAuth()
  const shopLayout = useShopLayout()
  const links = navLinksForRole(role)

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5fa] pb-16 md:pb-0">
      {shopLayout ? <ShopHeader /> : <SellerHeader />}

      <main
        className={cn(
          'flex-1',
          shopLayout ? '' : 'mx-auto w-full max-w-[1240px] px-4 py-6',
          pathname === '/login' && 'mx-auto max-w-[1240px]'
        )}
      >
        <Outlet />
      </main>

      {isLoggedIn && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#ebebf0] bg-white md:hidden">
          <div className="mx-auto flex max-w-lg justify-around px-1 py-1">
            <NavItems links={links} className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-xs text-[#1A94FF]" />
          </div>
        </nav>
      )}
    </div>
  )
}
