import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ProductCard, SectionHeader } from '@/components/product/ProductCard'
import { ShopPage, ShopPanel } from '@/components/layout/ShopPage'
import { api } from '@/lib/api'
import { idOf } from '@/lib/utils'

export function SellerPage() {
  const { id } = useParams()
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [priceMap, setPriceMap] = useState({})

  useEffect(() => {
    Promise.all([api.productsBySeller(id), api.seller(id), api.variants()])
      .then(([prods, s, allVariants]) => {
        const prodsArr = Array.isArray(prods) ? prods : []
        setProducts(prodsArr)
        setSeller(s || null)

        // build map of lowest variant price per product
        const pm = {}
        ;(allVariants || []).forEach((v) => {
          const pid = v.product_id
          const p = pm[pid]
          const price = v.price ?? v.price_amount ?? null
          if (price == null) return
          if (p == null || price < p) pm[pid] = price
        })
        setPriceMap(pm)
      })
      .catch(() => toast.error('Không tải được dữ liệu người bán'))
  }, [id])

  useEffect(() => {
    // Prefer backend's `seller_name` field; fallback to other possible keys
    if (!seller) return
    const name = seller.seller_name || seller.sellerName || seller.shop_name || seller.shopName || seller.user_name || seller.userName || seller.name || 'Cửa hàng'
    document.title = `${name} — WebTech Shop`
  }, [seller])

  return (
    <ShopPage>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 rounded-full bg-[#f5f5fa] flex items-center justify-center text-4xl">{(seller?.seller_name || seller?.sellerName || seller?.shop_name || seller?.shopName || seller?.user_name || seller?.userName || seller?.name || '🏪')?.[0] || '🏪'}</div>
            <div>
              <h1 className="text-2xl font-bold">{seller?.seller_name || seller?.sellerName || seller?.shop_name || seller?.shopName || seller?.user_name || seller?.userName || seller?.name || 'Cửa hàng'}</h1>
              <p className="text-sm text-muted-foreground">{seller?.description || ''}</p>
              {(seller?.seller_name || seller?.sellerName) && (
                <p className="text-xs text-muted-foreground">Người bán: {seller.seller_name || seller.sellerName}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/chat?seller_id=${id}`} className="inline-flex items-center rounded-md border border-[#1A94FF] px-3 py-2 text-sm text-[#1A94FF]">Chat với người bán</Link>
          </div>
        </div>

        <ShopPanel>
          <SectionHeader title={`Sản phẩm của cửa hàng (${products.length})`} href={`/sellers/${id}`} />
          {products.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">Người bán chưa có sản phẩm</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((p) => (
                <ProductCard key={idOf(p)} product={p} price={priceMap[idOf(p)]} />
              ))}
            </div>
          )}
        </ShopPanel>
      </div>
    </ShopPage>
  )
}
