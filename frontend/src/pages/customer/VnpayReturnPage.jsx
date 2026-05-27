import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export function VnpayReturnPage() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const query = searchParams.toString()
    if (!query) {
      toast.error('Thiếu thông tin phản hồi từ VNPay')
      window.location.replace('/checkout')
      return
    }

    window.location.replace(`/api/payments/vnpay/return?${query}`)
  }, [searchParams])

  return (
    <div className="mx-auto flex min-h-[40vh] max-w-lg items-center justify-center py-10 text-sm text-muted-foreground">
      Đang xác thực kết quả thanh toán VNPay...
    </div>
  )
}