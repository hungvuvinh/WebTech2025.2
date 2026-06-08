import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Star, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ShopPage, ShopPanel } from '@/components/layout/ShopPage'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatDate, formatPrice, idOf, productName } from '@/lib/utils'

export function ProductDetailPage() {
  const { id } = useParams()
  const { isCustomer, userId } = useAuth()
  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [reviews, setReviews] = useState([])
  const [variantId, setVariantId] = useState('')
  const [qty, setQty] = useState(1)
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')
  const [reviewId, setReviewId] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)

  const load = () => {
    const ordersRequest = isCustomer && userId ? api.ordersByCustomer(userId) : Promise.resolve([])

    Promise.all([api.product(id), api.variants(), api.reviewsByProduct(id), ordersRequest])
      .then(([p, allVariants, revs, orders]) => {
        setProduct(p)
        const vs = (allVariants || []).filter((v) => v.product_id === id)
        setVariants(vs)
        if (vs.length && !variantId) setVariantId(idOf(vs[0]))
        setReviews(Array.isArray(revs) ? revs : [])

        const purchased = Array.isArray(orders)
          && orders.some((order) =>
            Array.isArray(order.items)
            && order.items.some((item) => item.product_id === id)
            && order.status !== 'CANCELLED'
          )
        setHasPurchased(Boolean(purchased))
      })
      .catch(() => toast.error('Không tải được sản phẩm'))
  }

  useEffect(() => {
    setReviewId('')
    setRating('5')
    setComment('')
    setIsEditing(false)
    load()
  }, [id, isCustomer, userId])

  useEffect(() => {
    if (isEditing) return
    if (!userId) {
      if (reviewId) {
        setReviewId('')
      }
      return
    }

    const existingReview = reviews.find((review) => review.customer_id === userId)
    if (!existingReview) {
      if (reviewId) {
        setReviewId('')
      }
      return
    }

    const existingId = idOf(existingReview)
    if (existingId !== reviewId) {
      setReviewId(existingId)
      setRating(String(existingReview.rating ?? 5))
      setComment(existingReview.comment ?? '')
      if (existingReview.product_variant_id) {
        setVariantId(existingReview.product_variant_id)
      }
    }
  }, [reviews, userId, reviewId])

  const ownReview = reviews.find((review) => review.customer_id === userId)
  const otherReviews = reviews.filter((review) => review.customer_id !== userId)
  const selectedVariant = variants.find((v) => idOf(v) === variantId)
  const canReview = isCustomer && (ownReview || hasPurchased)

  const addToCart = async () => {
    if (!isCustomer) return toast.error('Vui lòng đăng nhập với tài khoản khách hàng')
    if (!variantId) return toast.error('Chọn biến thể sản phẩm')
    try {
      await api.addCartItem(userId, {
        product_id: id,
        product_variant_id: variantId,
        quantity: Number(qty) || 1,
      })
      toast.success('Đã thêm vào giỏ hàng')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const submitReview = async () => {
    if (!isCustomer) return toast.error('Đăng nhập để đánh giá')
    try {
      const payload = {
        product_id: id,
        product_variant_id: variantId || null,
        customer_id: userId,
        rating: Number(rating),
        comment,
      }

      if (reviewId) {
        await api.updateReview(reviewId, payload)
        toast.success('Đã cập nhật đánh giá')
      } else {
        await api.createReview(payload)
        toast.success('Đã gửi đánh giá')
      }

      setIsEditing(false)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (!product) {
    return (
      <ShopPage>
        <p className="py-12 text-center text-muted-foreground">Đang tải...</p>
      </ShopPage>
    )
  }

  return (
    <ShopPage className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ShopPanel>
          <div className="mb-4 flex aspect-square max-h-80 items-center justify-center rounded-lg bg-gradient-to-br from-[#e8f4ff] to-[#f5f5fa] text-6xl">
            📦
          </div>
          <h1 className="text-2xl font-bold">{productName(product)}</h1>
          {product.brand && <Badge className="mt-2">{product.brand}</Badge>}
          <div className="mt-4 space-y-4">
            {variants.length > 0 ? (
              <>
                <div className="space-y-2">
                  <Label>Biến thể</Label>
                  <Select value={variantId} onValueChange={setVariantId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {variants.map((v) => (
                        <SelectItem key={idOf(v)} value={idOf(v)}>
                          {v.variant_name || v.variantName} — {formatPrice(v.price)} (còn {v.stock_quantity ?? 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedVariant && (
                  <p className="text-3xl font-bold text-[#FF424E]">{formatPrice(selectedVariant.price)}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có biến thể — người bán cần thêm variant</p>
            )}
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label>Số lượng</Label>
                <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className="w-24" />
              </div>
              <Button className="bg-[#1A94FF] hover:bg-[#0b74e5]" onClick={addToCart} disabled={!variants.length}>
                Thêm vào giỏ hàng
              </Button>
            </div>
            {product.seller_id && (
              <div className="flex gap-2">
                <Button variant="outline" className="border-[#1A94FF] text-[#1A94FF]" asChild>
                  <Link to={`/chat?seller_id=${product.seller_id}`}>
                    <MessageCircle className="h-4 w-4" />
                    Chat với người bán
                  </Link>
                </Button>
                <Button variant="ghost" className="text-[#1A94FF]" asChild>
                  <Link to={`/sellers/${product.seller_id}`}>Xem cửa hàng</Link>
                </Button>
              </div>
            )}
          </div>
        </ShopPanel>

        <div className="space-y-4">
          <ShopPanel>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <Star className="h-5 w-5 text-[#FFB800]" />
              Đánh giá sản phẩm
            </h2>
            {isCustomer && ownReview && !isEditing && (
              <div className="mb-4 rounded-lg border border-[#ebebf0] bg-[#f5f5fa] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Đánh giá của bạn</p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium text-[#FFB800]">{ownReview.rating}★</span>
                      {ownReview.comment ? ` — ${ownReview.comment}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(ownReview.created_at)}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    Sửa đánh giá
                  </Button>
                </div>
              </div>
            )}
            {isCustomer && !ownReview && !hasPurchased && (
              <div className="mb-4 rounded-lg border border-[#ebebf0] bg-[#f5f5fa] p-3 text-sm text-muted-foreground">
                Bạn chỉ có thể đánh giá sản phẩm sau khi mua.
              </div>
            )}
            {isCustomer && (isEditing || !ownReview) && canReview && (
              <div className="mb-4 space-y-2 rounded-lg border border-[#ebebf0] bg-[#f5f5fa] p-3">
                <Label>Điểm (1-5)</Label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} sao</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea placeholder="Nhận xét..." value={comment} onChange={(e) => setComment(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#1A94FF]" onClick={submitReview}>
                    {reviewId ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                  </Button>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        if (ownReview) {
                          setRating(String(ownReview.rating ?? 5))
                          setComment(ownReview.comment ?? '')
                          if (ownReview.product_variant_id) {
                            setVariantId(ownReview.product_variant_id)
                          }
                        }
                      }}
                    >
                      Hủy
                    </Button>
                  )}
                </div>
              </div>
            )}
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {otherReviews.map((r) => (
                <li key={idOf(r)} className="rounded border border-[#ebebf0] p-2 text-sm">
                  <span className="font-medium text-[#FFB800]">{r.rating}★</span> — {r.comment || '(không có nội dung)'}
                  <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                </li>
              ))}
              {reviews.length === 0 && (
                <p className="text-sm text-muted-foreground">Chưa có đánh giá</p>
              )}
            </ul>
          </ShopPanel>

        </div>
      </div>
    </ShopPage>
  )
}
