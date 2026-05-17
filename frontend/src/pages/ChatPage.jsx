import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatDate, idOf } from '@/lib/utils'

export function ChatPage() {
  const { userId, isCustomer, isSeller, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sellerFromUrl = searchParams.get('seller_id')

  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const bottomRef = useRef(null)

  const loadConversations = async () => {
    const params = isCustomer ? { customer_id: userId } : { seller_id: userId }
    const list = await api.chatConversations(params)
    setConversations(Array.isArray(list) ? list : [])
    return list
  }

  const loadMessages = async (convId) => {
    const msgs = await api.chatMessages(convId)
    setMessages(Array.isArray(msgs) ? msgs : [])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadConversations().then(async (list) => {
      if (sellerFromUrl && isCustomer) {
        try {
          const conv = await api.createConversation({ customer_id: userId, seller_id: sellerFromUrl })
          setActiveId(idOf(conv))
          await loadConversations()
        } catch (e) {
          toast.error(e.message)
        }
      } else if (list?.length && !activeId) {
        setActiveId(idOf(list[0]))
      }
    })
  }, [userId, isLoggedIn])

  useEffect(() => {
    if (activeId) loadMessages(activeId)
    const t = setInterval(() => activeId && loadMessages(activeId), 5000)
    return () => clearInterval(t)
  }, [activeId])

  const send = async (e) => {
    e.preventDefault()
    if (!content.trim() || !activeId) return
    try {
      await api.sendMessage(activeId, {
        sender_id: userId,
        sender_type: isCustomer ? 'customer' : 'seller',
        content: content.trim(),
      })
      setContent('')
      loadMessages(activeId)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const startWithSeller = async (sellerId) => {
    if (!isCustomer) return
    try {
      const conv = await api.createConversation({ customer_id: userId, seller_id: sellerId })
      setActiveId(idOf(conv))
      await loadConversations()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1 overflow-hidden">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Hội thoại</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100%-4rem)] space-y-1 overflow-y-auto p-2">
          {conversations.map((c) => (
            <button
              key={idOf(c)}
              type="button"
              onClick={() => setActiveId(idOf(c))}
              className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent ${activeId === idOf(c) ? 'bg-accent font-medium' : ''}`}
            >
              {isCustomer ? `Shop ${(c.seller_id || '').slice(-6)}` : `KH ${(c.customer_id || '').slice(-6)}`}
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground">Chưa có hội thoại</p>
          )}
        </CardContent>
      </Card>

      <Card className="flex flex-col lg:col-span-2">
        {activeId ? (
          <>
            <CardContent className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => {
                const mine = m.sender_id === userId
                return (
                  <div
                    key={idOf(m)}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        mine ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      <p>{m.content}</p>
                      <p className="mt-1 text-xs opacity-70">{formatDate(m.time_stamp)}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </CardContent>
            <form onSubmit={send} className="flex gap-2 border-t p-3">
              <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập tin nhắn..." />
              <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
            </form>
          </>
        ) : (
          <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
            Chọn hoặc tạo hội thoại
          </CardContent>
        )}
      </Card>
    </div>
  )
}
