import { useEffect, useMemo, useState } from 'react'
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

  const selectedVariantIdsFromCart = useMemo(
    () => location.state?.selectedVariantIds || [],
    [location.state?.selectedVariantIds]
  )
  const [stockErrors, setStockErrors] = useState([])

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

  const items = useMemo(() => cart?.item || [], [cart])
  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [idOf(p), p])), [products])
  const variantMap = useMemo(() => Object.fromEntries(variants.map((v) => [idOf(v), v])), [variants])
  const selectedVariantIds = useMemo(
    () => (selectedVariantIdsFromCart.length > 0
      ? selectedVariantIdsFromCart
      : items.map((item) => item.product_variant_id).filter(Boolean)),
    [items, selectedVariantIdsFromCart]
  )
  const selectedItems = useMemo(
    () => items.filter((item) => selectedVariantIds.includes(item.product_variant_id)),
    [items, selectedVariantIds]
  )

  // Validate stock for selected items
  const validateStock = () => {
    const errors = []
    selectedItems.forEach((item) => {
      const variant = variantMap[item.product_variant_id]
      const availableStock = variant?.stock_quantity ?? 0
      if (item.quantity > availableStock) {
        errors.push({
          variantId: item.product_variant_id,
          variantName: variant?.variant_name,
          requested: item.quantity,
          available: availableStock,
        })
      }
    })
    setStockErrors(errors)
    return errors.length === 0
  }

  // Validate stock whenever selected items or variants change
  useEffect(() => {
    validateStock()
  }, [selectedItems, variantMap])

  useEffect(() => {
    if (!isCustomer) {
      navigate('/login')
      return
    }
    load()
  }, [userId, isCustomer, navigate])

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
    
    // Validate stock before checkout
    if (!validateStock()) {
      return toast.error('Số lượng mua vượt quá hàng tồn kho. Vui lòng điều chỉnh số lượng.')
    }
    
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
            {stockErrors.length > 0 && (
              <div className="space-y-2 rounded-lg border-l-4 border-red-500 bg-red-50 p-3">
                <p className="font-semibold text-red-700">⚠️ Số lượng mua vượt quá hàng tồn kho</p>
                {stockErrors.map((error) => (
                  <p key={error.variantId} className="text-sm text-red-600">
                    {error.variantName}: yêu cầu {error.requested}, chỉ còn {error.available} sản phẩm
                  </p>
                ))}
              </div>
            )}
            <div className="space-y-2 rounded-lg border border-[#ebebf0] bg-[#f5f5fa] p-3">
              <Label>Sản phẩm được thanh toán</Label>
              <div className="space-y-2">
                {selectedItems.map((item) => {
                  const product = productMap[item.product_id]
                  const variant = variantMap[item.product_variant_id]
                  const availableStock = variant?.stock_quantity ?? 0
                  const isInsufficientStock = item.quantity > availableStock
                  return (
                    <div key={`${item.product_variant_id}-${item.product_id}`} className={`flex items-start justify-between gap-3 text-sm ${isInsufficientStock ? 'opacity-60' : ''}`}>
                      <div className="flex-1">
                        <p className="font-medium">{product?.product_name || item.product_id}</p>
                        <p className="text-muted-foreground">{variant?.variant_name} × {item.quantity}</p>
                        <p className={`text-xs ${isInsufficientStock ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                          {isInsufficientStock ? `❌ Chỉ còn ${availableStock}` : `✓ Còn ${availableStock}`}
                        </p>
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
            <Button type="submit" className="w-full" disabled={loading || stockErrors.length > 0}>
              {loading ? 'Đang xử lý...' : method === 'VNPAY' ? 'Đi tới VNPay sandbox' : 'Xác nhận thanh toán'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
