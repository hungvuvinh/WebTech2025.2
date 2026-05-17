/** Wrapper container giống trang chủ Tiki */
export function ShopPage({ children, className = '' }) {
  return (
    <div className={`mx-auto max-w-[1240px] px-3 py-3 ${className}`}>
      {children}
    </div>
  )
}

/** Khối nội dung trắng bo góc */
export function ShopPanel({ children, className = '' }) {
  return (
    <div className={`rounded-lg bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  )
}
