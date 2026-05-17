import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderCard } from '@/components/orders/OrderCard'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { idOf } from '@/lib/utils'
import { SELLER_STATUS_OPTIONS } from '@/lib/orderStatus'

export function SellerOrdersPage() {
  const { userId, isSeller } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'shipping' ? 'shipping' : 'all'
  const [allOrders, setAllOrders] = useState([])
  const [shippingOrders, setShippingOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([api.sellerOrders(userId), api.sellerOrdersInTransit(userId)])
      .then(([all, shipping]) => {
        setAllOrders(Array.isArray(all) ? all : [])
        setShippingOrders(Array.isArray(shipping) ? shipping : [])
      })
      .catch(() => toast.error('Không tải được đơn hàng'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isSeller) {
      navigate('/login')
      return
    }
    load()
  }, [userId, isSeller, navigate])

  const updateStatus = async (orderId, status) => {
    try {
      await api.updateSellerOrderStatus(userId, orderId, status)
      toast.success('Đã cập nhật trạng thái')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const renderActions = (o) => (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#ebebf0] pt-3">
      <span className="text-xs text-muted-foreground">Cập nhật trạng thái:</span>
      <Select value={o.status} onValueChange={(s) => updateStatus(idOf(o), s)}>
        <SelectTrigger className="h-8 w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SELLER_STATUS_OPTIONS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {o.status !== 'SHIPPED' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && (
        <Button
          size="sm"
          className="bg-[#1A94FF] hover:bg-[#0b74e5]"
          onClick={() => updateStatus(idOf(o), 'SHIPPED')}
        >
          Chuyển sang đang giao
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
      <Tabs
        value={tab}
        onValueChange={(v) => setSearchParams(v === 'shipping' ? { tab: 'shipping' } : {})}
      >
        <TabsList className="bg-[#f5f5fa]">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#1A94FF] data-[state=active]:text-white">
            Tất cả ({allOrders.length})
          </TabsTrigger>
          <TabsTrigger value="shipping" className="data-[state=active]:bg-[#1A94FF] data-[state=active]:text-white">
            Đang vận chuyển ({shippingOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Đang tải...</p>
          ) : allOrders.length === 0 ? (
            <p className="text-muted-foreground">Chưa có đơn hàng. Cần có sản phẩm và khách đặt mua.</p>
          ) : (
            allOrders.map((o) => (
              <OrderCard
                key={idOf(o)}
                order={o}
                extra={<p>Khách hàng: …{o.customer_id?.slice(-8)}</p>}
                actions={renderActions(o)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="shipping" className="mt-4 space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Đang tải...</p>
          ) : shippingOrders.length === 0 ? (
            <p className="text-muted-foreground">
              Chưa có đơn đang vận chuyển. Dùng nút &quot;Chuyển sang đang giao&quot; hoặc chọn trạng thái SHIPPED.
            </p>
          ) : (
            shippingOrders.map((o) => (
              <OrderCard
                key={idOf(o)}
                order={o}
                extra={<p>Khách hàng: …{o.customer_id?.slice(-8)}</p>}
                actions={renderActions(o)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
