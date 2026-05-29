import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck, Package, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShopPage, ShopPanel } from '@/components/layout/ShopPage'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatDate, formatPrice, idOf } from '@/lib/utils'
import { orderStatusLabel } from '@/lib/orderStatus'

const statusIcons = {
  CREATED: Package,
  PENDING: Package,
  CONFIRMED: CheckCircle,
  SHIPPED: Truck,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
}

const statusBadgeClass = {
  CREATED: 'bg-secondary text-secondary-foreground',
  PENDING: 'border border-input bg-background',
  CONFIRMED: 'bg-[#1A94FF] text-white hover:bg-[#1A94FF]',
  SHIPPED: 'bg-[#1A94FF] text-white hover:bg-[#1A94FF]',
  COMPLETED: 'bg-green-600 text-white hover:bg-green-600',
  CANCELLED: 'bg-destructive text-white hover:bg-destructive',
}

export function OrderDetailPage() {
  const { userId, isCustomer } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isCustomer) {
      navigate('/login')
      return
    }
    loadOrder()
  }, [id, isCustomer, navigate])

  const loadOrder = async () => {
    setLoading(true)
    try {
      const data = await api.order(id)
      if (data.customer_id !== userId) {
        toast.error('Bạn không có quyền xem đơn hàng này')
        navigate('/orders')
        return
      }
      setOrder(data)
    } catch (e) {
      toast.error(e.message || 'Không tải được đơn hàng')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ShopPage>
        <ShopPanel>
          <p className="text-muted-foreground">Đang tải...</p>
        </ShopPanel>
      </ShopPage>
    )
  }

  if (!order) {
    return (
      <ShopPage>
        <ShopPanel>
          <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
        </ShopPanel>
      </ShopPage>
    )
  }

  const StatusIcon = statusIcons[order.status] || Package

  return (
    <ShopPage>
      <ShopPanel>
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/orders')}
            className="mb-4 text-[#1A94FF] hover:text-[#0b74e5]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
          <p className="mt-1 text-sm text-muted-foreground">Mã đơn: #{idOf(order).slice(-8)}</p>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <StatusIcon className="h-5 w-5" />
                Trạng thái đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={statusBadgeClass[order.status] || ''}>
                {orderStatusLabel(order.status)}
              </Badge>
            </CardContent>
          </Card>

          {/* Order Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày đặt:</span>
                <span className="font-medium">{formatDate(order.order_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Địa chỉ giao:</span>
                <span className="font-medium">{order.shipping_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng tiền:</span>
                <span className="text-lg font-semibold text-[#FF424E]">{formatPrice(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Items Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(order.items || []).map((item, i) => (
                  <li key={i} className="flex justify-between border-b border-[#ebebf0] pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">Sản phẩm …{item.product_id?.slice(-6)}</p>
                      <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.unit_price)}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </ShopPanel>
    </ShopPage>
  )
}
