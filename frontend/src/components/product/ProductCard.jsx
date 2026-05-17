import { Link } from 'react-router-dom'
import { ThumbsUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, productName } from '@/lib/utils'

export function ProductCard({ product, price }) {
  const id = product._id || product.id
  const name = productName(product)
  const discount = 10 + (name.length % 15)
  const displayPrice = price != null ? formatPrice(price) : 'Liên hệ'
  const oldPrice = price != null ? Math.round(price * 1.2) : null

  return (
    <Link
      to={`/products/${id}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-[#e8f4ff] to-[#f5f5fa] p-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-white/80 text-4xl shadow-inner">
          📦
        </div>
        <Badge className="absolute left-2 top-2 border-0 bg-[#FF424E] text-white hover:bg-[#FF424E]">
          -{discount}%
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm group-hover:text-[#1A94FF]">{name}</h3>
        {product.brand && <p className="mt-1 text-xs text-muted-foreground">{product.brand}</p>}
        <p className="mt-2 text-lg font-bold text-[#FF424E]">{displayPrice}</p>
        {oldPrice != null && (
          <p className="text-xs text-muted-foreground line-through">{formatPrice(oldPrice)}</p>
        )}
      </div>
    </Link>
  )
}

export function SectionHeader({ title, href = '/' }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-bold text-[#FF424E]">
        <ThumbsUp className="h-5 w-5 fill-[#FF424E] text-[#FF424E]" />
        {title}
      </h2>
      <Link to={href} className="text-sm font-medium text-[#1A94FF] hover:underline">
        Xem tất cả ›
      </Link>
    </div>
  )
}
