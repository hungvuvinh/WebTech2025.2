import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value) {
  const n = Number(value) || 0
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(n)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('vi-VN')
}

export function idOf(doc) {
  return doc?._id || doc?.id || ''
}

export function productName(p) {
  return p?.product_name || p?.productName || p?.name || 'Sản phẩm'
}
