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
  const [selectedVariantIds, setSelectedVariantIds] = useState([])

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
      setSelectedVariantIds(Array.from(new Set((c?.item || []).map((item) => item.product_variant_id).filter(Boolean))))
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
  const selectedItems = items.filter((item) => selectedVariantIds.includes(item.product_variant_id))
  const selectedTotal = selectedItems.reduce((s, i) => s + lineTotal(i), 0)

  const toggleSelected = (productVariantId) => {
    setSelectedVariantIds((current) => (
      current.includes(productVariantId)
        ? current.filter((id) => id !== productVariantId)
        : [...current, productVariantId]
    ))
  }

  const deleteItem = async (productVariantId) => {
    try {
      const updatedCart = await api.removeCartItem(userId, productVariantId)
      setCart(updatedCart)
      setSelectedVariantIds((current) => current.filter((id) => id !== productVariantId))
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const updateQuantity = async (item, nextQuantity) => {
    const quantity = Number(nextQuantity)
    if (!Number.isFinite(quantity)) return

    try {
      const updatedCart = await api.updateCartItemQuantity(userId, item.product_variant_id, {
        product_id: item.product_id,
        quantity,
      })
      setCart(updatedCart)
      toast.success(quantity <= 0 ? 'Đã xóa sản phẩm khỏi giỏ hàng' : 'Đã cập nhật số lượng')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const selectAll = () => {
    setSelectedVariantIds(items.map((item) => item.product_variant_id).filter(Boolean))
  }

  const clearSelection = () => {
    setSelectedVariantIds([])
  }

  const checkoutSelected = () => {
    if (selectedItems.length === 0) {
      toast.error('Chọn ít nhất một sản phẩm để thanh toán')
      return
    }

    navigate('/checkout', {
      state: { selectedVariantIds: selectedItems.map((item) => item.product_variant_id) },
    })
  }

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
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#ebebf0] bg-[#f5f5fa] p-3">
            <p className="text-sm text-muted-foreground">
              Đã chọn {selectedItems.length}/{items.length} sản phẩm
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>Chọn tất cả</Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>Bỏ chọn</Button>
            </div>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => {
              const p = productMap[item.product_id]
              const v = variantMap[item.product_variant_id]
              const checked = selectedVariantIds.includes(item.product_variant_id)
              return (
                <Card key={`${item.product_variant_id}-${idx}`}>
                  <CardHeader className="py-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-[#1A94FF] text-[#1A94FF]"
                        checked={checked}
                        onChange={() => toggleSelected(item.product_variant_id)}
                      />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base">
                          {p?.product_name || item.product_id}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {v?.variant_name} × {item.quantity}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item, (item.quantity ?? 1) - 1)}
                            disabled={(item.quantity ?? 1) <= 1}
                          >
                            -
                          </Button>
                          <span className="min-w-10 rounded-md border border-input px-3 py-1 text-center text-sm font-medium">
                            {item.quantity ?? 1}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item, (item.quantity ?? 0) + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <p className="mt-1 font-semibold text-[#FF424E]">{formatPrice(lineTotal(item))}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteItem(item.product_variant_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <span className="block text-lg font-semibold">Tổng đã chọn: {formatPrice(selectedTotal)}</span>
                <span className="block text-sm text-muted-foreground">Tổng toàn bộ giỏ: {formatPrice(total)}</span>
              </div>
              <Button onClick={checkoutSelected} disabled={selectedItems.length === 0}>Thanh toán</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
