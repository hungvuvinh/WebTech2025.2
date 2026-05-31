import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck, Package, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatDate, formatPrice, idOf } from '@/lib/utils'
import { orderStatusLabel, SELLER_STATUS_OPTIONS } from '@/lib/orderStatus'

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

export function SellerOrderDetailPage() {
  const { userId, isSeller } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [productNames, setProductNames] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSeller) {
      navigate('/login')
      return
    }
    loadOrder()
  }, [id, isSeller, navigate])

  const loadOrder = async () => {
    setLoading(true)
    try {
      const data = await api.sellerOrder(userId, id)
      setOrder(data)
      // fetch product names for items
      const ids = Array.from(new Set((data.items || []).map((it) => it.product_id).filter(Boolean)))
      if (ids.length) {
        const proms = ids.map((pid) => api.product(pid).catch(() => null))
        const results = await Promise.all(proms)
        const map = {}
        results.forEach((p) => {
          if (p) map[idOf(p)] = p.product_name || p.productName || ''
        })
        setProductNames(map)
      }
    } catch (e) {
      toast.error(e.message || 'Không tải được đơn hàng')
      navigate('/seller/orders')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status) => {
    try {
      await api.updateSellerOrderStatus(userId, id, status)
      toast.success('Đã cập nhật trạng thái')
      loadOrder()
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
      </div>
    )
  }

  const StatusIcon = statusIcons[order.status] || Package

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/seller/orders')}
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
          <CardContent className="space-y-4">
            <Badge className={statusBadgeClass[order.status] || ''}>
              {orderStatusLabel(order.status)}
            </Badge>
            <div className="flex flex-wrap items-center gap-2 border-t border-[#ebebf0] pt-4">
              <span className="text-sm text-muted-foreground">Cập nhật trạng thái:</span>
              <Select value={order.status} onValueChange={updateStatus}>
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
              {/* 'Chuyển sang đang giao' button removed — status can be changed via selector */}
            </div>
          </CardContent>
        </Card>

        {/* Order Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Khách hàng:</span>
              <span className="font-medium">…{order.customer_id?.slice(-8)}</span>
            </div>
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
                    <p className="font-medium">{item.product_name || productNames[item.product_id] || `Sản phẩm …${item.product_id?.slice(-6)}`}</p>
                    <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.unit_price)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
