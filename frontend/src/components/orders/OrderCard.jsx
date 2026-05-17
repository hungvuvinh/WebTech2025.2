import { Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatPrice, idOf } from '@/lib/utils'
import { isInTransit, orderStatusLabel } from '@/lib/orderStatus'

const badgeClass = {
  CREATED: 'bg-secondary text-secondary-foreground',
  PENDING: 'border border-input bg-background',
  CONFIRMED: 'bg-[#1A94FF] text-white hover:bg-[#1A94FF]',
  SHIPPED: 'bg-[#1A94FF] text-white hover:bg-[#1A94FF]',
  COMPLETED: 'bg-green-600 text-white hover:bg-green-600',
  CANCELLED: 'bg-destructive text-white hover:bg-destructive',
}

export function OrderCard({ order, extra, actions }) {
  const inTransit = isInTransit(order.status)

  return (
    <Card className={inTransit ? 'border-[#1A94FF]/40 ring-1 ring-[#1A94FF]/20' : ''}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {inTransit && <Truck className="h-4 w-4 text-[#1A94FF]" />}
          Đơn #{idOf(order).slice(-8)}
        </CardTitle>
        <Badge className={badgeClass[order.status] || ''}>{orderStatusLabel(order.status)}</Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {extra}
        <p>Ngày đặt: {formatDate(order.order_date)}</p>
        <p>Địa chỉ: {order.shipping_address}</p>
        <p className="font-semibold text-[#FF424E]">Tổng: {formatPrice(order.total_amount)}</p>
        <ul className="mt-2 space-y-1 border-t border-[#ebebf0] pt-2">
          {(order.items || []).map((item, i) => (
            <li key={i} className="text-muted-foreground">
              Sản phẩm …{item.product_id?.slice(-6)} × {item.quantity} — {formatPrice(item.unit_price)}
            </li>
          ))}
        </ul>
        {actions}
      </CardContent>
    </Card>
  )
}
