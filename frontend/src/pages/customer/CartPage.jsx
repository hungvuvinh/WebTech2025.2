import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatPrice, idOf } from '@/lib/utils'

export function CartPage() {
  const { userId, isCustomer } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])

  const load = async () => {
    if (!userId) return
    try {
      const [c, p, v] = await Promise.all([
        api.cart(userId).catch(() => null),
        api.products(),
        api.variants(),
      ])
      setCart(c)
      setProducts(p || [])
      setVariants(v || [])
    } catch {
      toast.error('Không tải được giỏ hàng')
    }
  }

  useEffect(() => {
    if (!isCustomer) {
      toast.error('Vui lòng đăng nhập khách hàng')
      navigate('/login')
      return
    }
    load()
  }, [userId, isCustomer, navigate])

  const items = cart?.item || []
  const productMap = Object.fromEntries(products.map((p) => [idOf(p), p]))
  const variantMap = Object.fromEntries(variants.map((v) => [idOf(v), v]))

  const lineTotal = (item) => {
    const v = variantMap[item.product_variant_id]
    const price = v?.price ?? 0
    const qty = item.quantity ?? 0
    return price * qty
  }

  const total = items.reduce((s, i) => s + lineTotal(i), 0)

  if (!cart) {
    return <p className="text-muted-foreground">Đang tải giỏ hàng...</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Giỏ hàng</h1>
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Giỏ hàng trống. <Link to="/" className="text-primary underline">Mua sắm ngay</Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item, idx) => {
              const p = productMap[item.product_id]
              const v = variantMap[item.product_variant_id]
              return (
                <Card key={`${item.product_variant_id}-${idx}`}>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div>
                      <CardTitle className="text-base">
                        {p?.product_name || item.product_id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {v?.variant_name} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(lineTotal(item))}</p>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <span className="text-lg font-semibold">Tổng: {formatPrice(total)}</span>
              <Button onClick={() => navigate('/checkout')}>Thanh toán</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
