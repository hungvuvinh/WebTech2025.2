import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

export function CheckoutPage() {
  const { userId, isCustomer } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [method, setMethod] = useState('COD')
  const [loading, setLoading] = useState(false)

  if (!isCustomer) {
    navigate('/login')
    return null
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!address.trim()) return toast.error('Nhập địa chỉ giao hàng')
    setLoading(true)
    try {
      const order = await api.checkout({
        customer_id: userId,
        method,
        shipping_address: address,
      })
      toast.success('Thanh toán thành công')
      navigate(`/orders`, { state: { newOrderId: order._id || order.id } })
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
                  <SelectItem value="BANK">Chuyển khoản</SelectItem>
                  <SelectItem value="CARD">Thẻ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
