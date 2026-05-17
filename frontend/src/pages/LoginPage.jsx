import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { idOf } from '@/lib/utils'

export function LoginPage() {
  const { login, isLoggedIn, isSeller } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('customer')
  const [customers, setCustomers] = useState([])
  const [sellers, setSellers] = useState([])
  const [userId, setUserId] = useState('')

  useEffect(() => {
    if (isLoggedIn) navigate(isSeller ? '/seller/products' : '/', { replace: true })
  }, [isLoggedIn, isSeller, navigate])

  useEffect(() => {
    Promise.all([api.customers(), api.sellers()])
      .then(([c, s]) => {
        setCustomers(Array.isArray(c) ? c : [])
        setSellers(Array.isArray(s) ? s : [])
      })
      .catch(() => toast.error('Không tải được danh sách tài khoản'))
  }, [])

  const list = role === 'customer' ? customers : sellers
  const nameOf = (u) =>
    role === 'customer' ? u.customer_name || u.customerName : u.seller_name || u.sellerName

  const handleLogin = () => {
    if (!userId) {
      toast.error('Vui lòng chọn tài khoản')
      return
    }
    const user = list.find((u) => idOf(u) === userId)
    login(role, userId, nameOf(user) || userId)
    toast.success('Đăng nhập thành công')
    navigate(role === 'seller' ? '/seller/products' : '/')
  }

  return (
    <div className="mx-auto max-w-md px-3 py-8">
      <Card className="border-[#ebebf0] shadow-md">
        <CardHeader className="text-center">
          <p className="text-xl font-bold text-[#1A94FF]">WebTech Shop</p>
          <CardTitle className="mt-2">Đăng nhập</CardTitle>
          <CardDescription>Chọn vai trò và tài khoản demo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={role} onValueChange={(v) => { setRole(v); setUserId('') }}>
            <TabsList className="grid w-full grid-cols-2 bg-[#f5f5fa]">
              <TabsTrigger value="customer" className="data-[state=active]:bg-[#1A94FF] data-[state=active]:text-white">
                Khách hàng
              </TabsTrigger>
              <TabsTrigger value="seller" className="data-[state=active]:bg-[#1A94FF] data-[state=active]:text-white">
                Người bán
              </TabsTrigger>
            </TabsList>
            <TabsContent value={role} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Tài khoản</Label>
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder={list.length ? 'Chọn tài khoản' : 'Chưa có dữ liệu — tạo qua API'} />
                  </SelectTrigger>
                  <SelectContent>
                    {list.map((u) => (
                      <SelectItem key={idOf(u)} value={idOf(u)}>
                        {nameOf(u)} ({idOf(u).slice(-6)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-[#1A94FF] hover:bg-[#0b74e5]" onClick={handleLogin}>
                Vào hệ thống
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
