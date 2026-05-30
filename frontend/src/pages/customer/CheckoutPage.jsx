import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatPrice, idOf } from '@/lib/utils'

export function CheckoutPage() {
  const { userId, isCustomer } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [address, setAddress] = useState('')
  const [method, setMethod] = useState('VNPAY')
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState(null)
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])

  const selectedVariantIdsFromCart = location.state?.selectedVariantIds || []

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
      navigate('/login')
      return
    }
    load()
  }, [userId, isCustomer, navigate])

  const items = cart?.item || []
  const productMap = Object.fromEntries(products.map((p) => [idOf(p), p]))
  const variantMap = Object.fromEntries(variants.map((v) => [idOf(v), v]))
  const selectedVariantIds = selectedVariantIdsFromCart.length > 0
    ? selectedVariantIdsFromCart
    : items.map((item) => item.product_variant_id).filter(Boolean)
  const selectedItems = items.filter((item) => selectedVariantIds.includes(item.product_variant_id))

  const lineTotal = (item) => {
    const v = variantMap[item.product_variant_id]
    const price = v?.price ?? 0
    const qty = item.quantity ?? 0
    return price * qty
  }

  const selectedTotal = selectedItems.reduce((sum, item) => sum + lineTotal(item), 0)

  if (!isCustomer) {
    return null
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!address.trim()) return toast.error('Nhập địa chỉ giao hàng')
    if (selectedItems.length === 0) return toast.error('Chọn ít nhất một sản phẩm để thanh toán')
    setLoading(true)
    try {
      const body = {
        customer_id: userId,
        method,
        shipping_address: address,
        selected_product_variant_ids: selectedItems.map((item) => item.product_variant_id),
      }

      if (method === 'VNPAY') {
        const result = await api.checkoutVnpay(body)
        toast.info('Đang mở cổng VNPay sandbox...')
        window.location.assign(result.paymentUrl)
        return
      }

      const order = await api.checkout(body)
      toast.success('Thanh toán thành công')
      navigate('/orders', { state: { newOrderId: order._id || order.id } })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Thanh toán</h1>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin giao hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="space-y-2 rounded-lg border border-[#ebebf0] bg-[#f5f5fa] p-3">
              <Label>Sản phẩm được thanh toán</Label>
              <div className="space-y-2">
                {selectedItems.map((item) => {
                  const product = productMap[item.product_id]
                  const variant = variantMap[item.product_variant_id]
                  return (
                    <div key={`${item.product_variant_id}-${item.product_id}`} className="flex items-center justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium">{product?.product_name || item.product_id}</p>
                        <p className="text-muted-foreground">{variant?.variant_name} × {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-[#FF424E]">{formatPrice(lineTotal(item))}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-sm font-semibold">Tổng: {formatPrice(selectedTotal)}</p>
            </div>
            <div className="space-y-2">
              <Label>Địa chỉ giao hàng</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, quận..." required />
            </div>
            <div className="space-y-2">
              <Label>Phương thức thanh toán</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COD">Tiền mặt (COD)</SelectItem>
                  <SelectItem value="VNPAY">VNPay sandbox</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Chọn VNPay sandbox để mở cổng thanh toán thật từ cấu hình backend.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang xử lý...' : method === 'VNPAY' ? 'Đi tới VNPay sandbox' : 'Xác nhận thanh toán'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
