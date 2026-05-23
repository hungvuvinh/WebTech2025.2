import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

function redirectByRole(navigate, role) {
  navigate(role === 'seller' ? '/seller/products' : '/', { replace: true })
}

export function LoginPage() {
  const { login, isLoggedIn, isSeller } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'customer',
  })
  const [registerErrors, setRegisterErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isLoggedIn) redirectByRole(navigate, isSeller ? 'seller' : 'customer')
  }, [isLoggedIn, isSeller, navigate])

  const handleLogin = async (event) => {
    event.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      toast.error('Vui lòng nhập email và mật khẩu')
      return
    }
    setIsSubmitting(true)
    try {
      const result = await api.auth.login(loginForm)
      login(result.role, result.userId, result.userName)
      toast.success('Đăng nhập thành công')
      redirectByRole(navigate, result.role)
    } catch (error) {
      toast.error(error.message || 'Đăng nhập thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    const { userName, email, phoneNumber, password, role } = registerForm
    if (!userName || !email || !phoneNumber || !password || !role) {
      toast.error('Vui lòng điền đầy đủ thông tin đăng ký')
      return
    }
    setIsSubmitting(true)
    try {
      const result = await api.auth.register(registerForm)
      login(result.role, result.userId, result.userName)
      toast.success('Đăng ký thành công')
      redirectByRole(navigate, result.role)
      setRegisterErrors({})
    } catch (error) {
      // Prefer structured body attached by api.request
      if (error && error.body && error.body.errors) {
        setRegisterErrors(error.body.errors)
        const first = Object.values(error.body.errors)[0]
        toast.error(first || error.body.message || 'Đăng ký thất bại')
        return
      }
      // Fallback: parse message string if it contains JSON
      let message = error.message || 'Đăng ký thất bại'
      try {
        const parsed = JSON.parse(message)
        if (parsed && parsed.errors) {
          setRegisterErrors(parsed.errors)
          const first = Object.values(parsed.errors)[0]
          toast.error(first || parsed.message || 'Đăng ký thất bại')
          return
        }
        if (parsed && parsed.message) message = parsed.message
      } catch {
        // not JSON
      }
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center px-3 py-8">
      <Card className="w-full max-w-md border-[#ebebf0] shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <p className="text-xl font-bold text-[#1A94FF]">WebTech Shop</p>
          <CardTitle>{tab === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}</CardTitle>
          <CardDescription>
            {tab === 'login' ? 'Nhập email và mật khẩu để tiếp tục' : 'Chọn vai trò người mua hoặc người bán khi đăng ký'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-[#f5f5fa]">
              <TabsTrigger value="login" className="data-[state=active]:bg-[#1A94FF] data-[state=active]:text-white">
                Đăng nhập
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-[#1A94FF] data-[state=active]:text-white">
                Đăng ký
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 pt-2">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mật khẩu</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  />
                </div>
                <Button className="w-full bg-[#1A94FF] hover:bg-[#0b74e5]" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 pt-2">
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <Label htmlFor="register-name">Họ và tên / Tên cửa hàng</Label>
                  <Input
                    id="register-name"
                    placeholder="Nguyễn Văn A"
                    value={registerForm.userName}
                    onChange={(event) => {
                      const v = event.target.value
                      setRegisterForm((current) => ({ ...current, userName: v }))
                      setRegisterErrors((c) => ({ ...c, user_name: '' }))
                    }}
                  />
                  {registerErrors.user_name && (
                    <p className="text-sm text-red-600">{registerErrors.user_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={(event) => {
                      const v = event.target.value
                      setRegisterForm((current) => ({ ...current, email: v }))
                      setRegisterErrors((c) => ({ ...c, email: '' }))
                    }}
                  />
                  {registerErrors.email && <p className="text-sm text-red-600">{registerErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Số điện thoại</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="0901234567"
                    value={registerForm.phoneNumber}
                    onChange={(event) => {
                      const v = event.target.value
                      setRegisterForm((current) => ({ ...current, phoneNumber: v }))
                      setRegisterErrors((c) => ({ ...c, phone_number: '' }))
                    }}
                  />
                  {registerErrors.phone_number && (
                    <p className="text-sm text-red-600">{registerErrors.phone_number}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mật khẩu</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(event) => {
                      const v = event.target.value
                      setRegisterForm((current) => ({ ...current, password: v }))
                      setRegisterErrors((c) => ({ ...c, password: '' }))
                    }}
                  />
                  {registerErrors.password && <p className="text-sm text-red-600">{registerErrors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <Select
                    value={registerForm.role}
                    onValueChange={(value) => {
                      setRegisterForm((current) => ({ ...current, role: value }))
                      setRegisterErrors((c) => ({ ...c, role: '' }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Người mua</SelectItem>
                      <SelectItem value="seller">Người bán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-[#1A94FF] hover:bg-[#0b74e5]" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : 'Tạo tài khoản'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}