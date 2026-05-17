import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderCard } from '@/components/orders/OrderCard'
import { ShopPage, ShopPanel } from '@/components/layout/ShopPage'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

export function OrdersPage() {
  const { userId, isCustomer } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'shipping' ? 'shipping' : 'all'
  const [allOrders, setAllOrders] = useState([])
  const [shippingOrders, setShippingOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([api.ordersByCustomer(userId), api.ordersInTransitByCustomer(userId)])
      .then(([all, shipping]) => {
        setAllOrders(Array.isArray(all) ? all : [])
        setShippingOrders(Array.isArray(shipping) ? shipping : [])
      })
      .catch(() => toast.error('Không tải được đơn hàng'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isCustomer) {
      navigate('/login')
      return
    }
    load()
  }, [userId, isCustomer, navigate])

  return (
    <ShopPage>
      <ShopPanel>
        <h1 className="mb-4 text-2xl font-bold">Theo dõi đơn hàng</h1>
        <Tabs
          value={tab}
          onValueChange={(v) => setSearchParams(v === 'shipping' ? { tab: 'shipping' } : {})}
        >
          <TabsList className="mb-4 bg-[#f5f5fa]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#1A94FF] data-[state=active]:text-white">
              Tất cả ({allOrders.length})
            </TabsTrigger>
            <TabsTrigger value="shipping" className="data-[state=active]:bg-[#1A94FF] data-[state=active]:text-white">
              Đang vận chuyển ({shippingOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Đang tải...</p>
            ) : allOrders.length === 0 ? (
              <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
            ) : (
              allOrders.map((o) => <OrderCard key={o._id || o.id} order={o} />)
            )}
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Đang tải...</p>
            ) : shippingOrders.length === 0 ? (
              <p className="text-muted-foreground">
                Không có đơn đang vận chuyển. Đơn sẽ hiện ở đây khi người bán xác nhận hoặc chuyển sang trạng thái giao hàng.
              </p>
            ) : (
              shippingOrders.map((o) => <OrderCard key={o._id || o.id} order={o} />)
            )}
          </TabsContent>
        </Tabs>
      </ShopPanel>
    </ShopPage>
  )
}
