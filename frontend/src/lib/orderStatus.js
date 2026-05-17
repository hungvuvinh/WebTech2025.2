/** Trạng thái đơn — khớp backend OrderShippingStatuses */

export const IN_TRANSIT_STATUSES = ['CONFIRMED', 'SHIPPED']

export const ORDER_STATUS_LABELS = {
  CREATED: 'Mới tạo',
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang vận chuyển',
  COMPLETED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

export function orderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || status || '—'
}

export function isInTransit(status) {
  return IN_TRANSIT_STATUSES.includes(status)
}

export const SELLER_STATUS_OPTIONS = [
  { value: 'CREATED', label: 'Mới tạo' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPED', label: 'Đang vận chuyển' },
  { value: 'COMPLETED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]
