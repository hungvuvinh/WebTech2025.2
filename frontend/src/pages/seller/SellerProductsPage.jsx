import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatPrice, idOf, productName } from '@/lib/utils'

const emptyForm = () => ({
  product_name: '',
  brand: '',
  category_id: '',
  variant_name: 'Mặc định',
  price: '',
  stock_quantity: '',
})

export function SellerProductsPage() {
  const { userId, isSeller } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [variants, setVariants] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [variantForm, setVariantForm] = useState({ variant_name: '', price: '', stock_quantity: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    Promise.all([api.productsBySeller(userId), api.categories(), api.variants()])
      .then(([p, c, v]) => {
        setProducts(p || [])
        setCategories(c || [])
        const productIds = new Set((p || []).map((pr) => idOf(pr)))
        setVariants((v || []).filter((x) => productIds.has(x.product_id)))
      })
      .catch(() => toast.error('Không tải được sản phẩm'))
  }

  useEffect(() => {
    if (!isSeller) {
      navigate('/login')
      return
    }
    load()
  }, [userId, isSeller, navigate])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setOpen(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      product_name: p.product_name || '',
      brand: p.brand || '',
      category_id: p.category_id || '',
      variant_name: '',
      price: '',
      stock_quantity: '',
    })
    setOpen(true)
  }

  const validateProduct = () => {
    if (!form.product_name.trim()) {
      toast.error('Nhập tên sản phẩm')
      return false
    }
    if (!form.category_id) {
      toast.error('Chọn danh mục')
      return false
    }
    if (!editing) {
      if (!form.variant_name.trim()) {
        toast.error('Nhập tên biến thể')
        return false
      }
      if (!form.price || Number(form.price) <= 0) {
        toast.error('Nhập giá hợp lệ')
        return false
      }
      if (form.stock_quantity === '' || Number(form.stock_quantity) < 0) {
        toast.error('Nhập số lượng tồn kho')
        return false
      }
    }
    return true
  }

  const saveProduct = async () => {
    if (!validateProduct()) return
    setSaving(true)
    try {
      const body = {
        product_name: form.product_name.trim(),
        brand: form.brand.trim() || undefined,
        category_id: form.category_id,
        seller_id: userId,
      }
      if (editing) {
        await api.updateProduct(idOf(editing), body)
        toast.success('Đã cập nhật sản phẩm')
      } else {
        const created = await api.createProduct(body)
        const productId = idOf(created)
        await api.createVariant({
          product_id: productId,
          variant_name: form.variant_name.trim(),
          price: Number(form.price),
          stock_quantity: Number(form.stock_quantity),
        })
        toast.success('Đã thêm sản phẩm và biến thể — khách có thể mua ngay')
      }
      setOpen(false)
      setEditing(null)
      setForm(emptyForm())
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return
    try {
      await api.deleteProduct(id)
      toast.success('Đã xóa')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const addVariant = async (productId) => {
    if (!variantForm.variant_name.trim() || !variantForm.price) {
      toast.error('Nhập tên biến thể và giá')
      return
    }
    try {
      await api.createVariant({
        product_id: productId,
        variant_name: variantForm.variant_name.trim(),
        price: Number(variantForm.price),
        stock_quantity: Number(variantForm.stock_quantity) || 0,
      })
      toast.success('Đã thêm biến thể')
      setVariantForm({ variant_name: '', price: '', stock_quantity: '' })
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-sm text-muted-foreground">Thêm sản phẩm kèm giá và tồn kho để khách đặt mua</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1A94FF] hover:bg-[#0b74e5]" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
              <DialogDescription>
                {editing
                  ? 'Cập nhật thông tin cơ bản. Thêm biến thể bên dưới danh sách.'
                  : 'Tạo sản phẩm và một biến thể (giá, tồn) trong một bước.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Tên sản phẩm *</Label>
                <Input
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  placeholder="VD: Laptop Dell XPS"
                />
              </div>
              <div className="space-y-2">
                <Label>Thương hiệu</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="VD: Dell"
                />
              </div>
              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={categories.length ? 'Chọn danh mục' : 'Chưa có danh mục — tạo qua API'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={idOf(c)} value={idOf(c)}>
                        {c.category_name || c.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!editing && (
                <>
                  <Separator />
                  <p className="text-sm font-medium text-[#1A94FF]">Biến thể đầu tiên (bắt buộc)</p>
                  <div className="space-y-2">
                    <Label>Tên biến thể *</Label>
                    <Input
                      value={form.variant_name}
                      onChange={(e) => setForm({ ...form, variant_name: e.target.value })}
                      placeholder="VD: 16GB/512GB"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Giá (VNĐ) *</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tồn kho *</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.stock_quantity}
                        onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button className="w-full bg-[#1A94FF] hover:bg-[#0b74e5]" onClick={saveProduct} disabled={saving}>
                {saving ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Chưa có sản phẩm. Bấm &quot;Thêm sản phẩm&quot; để bắt đầu bán hàng.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map((p) => {
            const pVariants = variants.filter((v) => v.product_id === idOf(p))
            return (
              <Card key={idOf(p)}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{productName(p)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{p.brand || '—'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => deleteProduct(idOf(p))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm font-medium">Biến thể ({pVariants.length}):</p>
                  <ul className="space-y-1 text-sm">
                    {pVariants.map((v) => (
                      <li key={idOf(v)} className="rounded bg-[#f5f5fa] px-2 py-1">
                        {v.variant_name} — <span className="font-semibold text-[#FF424E]">{formatPrice(v.price)}</span>{' '}
                        (tồn: {v.stock_quantity ?? 0})
                      </li>
                    ))}
                    {pVariants.length === 0 && (
                      <li className="text-destructive">Chưa có biến thể — khách không thể mua</li>
                    )}
                  </ul>
                  <div className="flex flex-wrap gap-2 border-t pt-3">
                    <Input
                      className="w-28"
                      placeholder="Tên variant"
                      value={variantForm.variant_name}
                      onChange={(e) => setVariantForm({ ...variantForm, variant_name: e.target.value })}
                    />
                    <Input
                      className="w-24"
                      placeholder="Giá"
                      type="number"
                      value={variantForm.price}
                      onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                    />
                    <Input
                      className="w-20"
                      placeholder="Tồn"
                      type="number"
                      value={variantForm.stock_quantity}
                      onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: e.target.value })}
                    />
                    <Button size="sm" variant="secondary" onClick={() => addVariant(idOf(p))}>
                      + Thêm biến thể
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
