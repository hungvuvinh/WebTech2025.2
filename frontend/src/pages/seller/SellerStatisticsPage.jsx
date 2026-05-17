import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { BarChart3, Package, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

export function SellerStatisticsPage() {
  const { userId, isSeller } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!isSeller) {
      navigate('/login')
      return
    }
    api.sellerStatistics(userId)
      .then(setStats)
      .catch(() => toast.error('Không tải được thống kê'))
  }, [userId, isSeller, navigate])

  if (!stats) return <p className="text-muted-foreground">Đang tải...</p>

  const statusEntries = Object.entries(stats.status_counts || {})

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="h-7 w-7" />
        Báo cáo & thống kê
      </h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Số đơn</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.order_count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPrice(stats.total_revenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Giá trị TB/đơn</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPrice(stats.average_order_value)}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Đơn theo trạng thái</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {statusEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
          ) : (
            statusEntries.map(([status, count]) => (
              <Badge key={status} variant="secondary" className="text-sm">
                {status}: {count}
              </Badge>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
