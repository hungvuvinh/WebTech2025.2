import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, CreditCard, ShieldAlert, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

export function VnpayPaymentPage() {
  const { isCustomer } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [submitting, setSubmitting] = useState(false)
  const paymentId = searchParams.get('paymentId')

  useEffect(() => {
    if (!isCustomer) {
      navigate('/login', { replace: true })
      return
    }

    if (!paymentId) {
      toast.error('Thiếu paymentId của phiên VNPay sandbox')
      navigate('/checkout', { replace: true })
    }
  }, [isCustomer, navigate, paymentId])

  const handleResult = async (success) => {
    if (!paymentId) return
    setSubmitting(true)
    try {
      await api.confirmVnpayPayment({ payment_id: paymentId, success })
      toast.success(success ? 'Thanh toán VNPay sandbox thành công' : 'Đã hủy thanh toán VNPay sandbox')
      navigate('/orders', {
        replace: true,
        state: { paymentMethod: 'VNPAY', paymentResult: success ? 'success' : 'cancelled' },
      })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <Card className="overflow-hidden border-[#1A94FF]/20 shadow-xl">
        <div className="bg-gradient-to-r from-[#1A94FF] via-[#0f6fd8] to-[#ffb800] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/15 p-3">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm/none uppercase tracking-[0.28em] text-white/80">VNPay Sandbox</p>
              <h1 className="text-2xl font-semibold">Xác nhận thanh toán sandbox</h1>
            </div>
          </div>
        </div>
        <CardHeader>
          <CardTitle>Chọn kết quả giao dịch</CardTitle>
          <CardDescription>
            Đây là màn hình hỗ trợ kiểm thử luồng VNPay sandbox. Mã giao dịch hiện tại là {paymentId || '—'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed border-[#1A94FF]/30 bg-[#f5faff] p-4 text-sm text-[#35506b]">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-[#1A94FF]" />
              <p>
                Chọn <strong>thanh toán thành công</strong> để hoàn tất đơn hàng, hoặc <strong>hủy</strong> để giữ đơn ở trạng thái đã hủy.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              className="bg-[#1A94FF] text-white hover:bg-[#0f7de0]"
              onClick={() => handleResult(true)}
              disabled={submitting}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Thanh toán thành công
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-[#ff6b6b] text-[#e84c4c] hover:bg-[#fff4f4] hover:text-[#d63a3a]"
              onClick={() => handleResult(false)}
              disabled={submitting}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Hủy thanh toán
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => navigate('/checkout', { replace: true })}
            disabled={submitting}
          >
            Quay lại form thanh toán
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}