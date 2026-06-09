import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Send, Wifi, WifiOff, Loader2, User, Store, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatDate, idOf } from '@/lib/utils'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

const RECONNECT_DELAY = 3000 // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 5

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
  const [customerNames, setCustomerNames] = useState({})
  const [sellerNames, setSellerNames] = useState({})
  const [stompClient, setStompClient] = useState(null)
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [pollingIntervalId, setPollingIntervalId] = useState(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const reconnectTimeoutRef = useRef(null)

  const loadNames = async () => {
    try {
      const [customers, sellers] = await Promise.all([api.customers(), api.sellers()])
      const customerMap = {}
      const sellerMap = {}
      customers.forEach(c => {
        if (c._id || c.id) customerMap[c._id || c.id] = c.customer_name || c.email || 'Khách'
      })
      sellers.forEach(s => {
        if (s._id || s.id) sellerMap[s._id || s.id] = s.seller_name || s.email || 'Shop'
      })
      setCustomerNames(customerMap)
      setSellerNames(sellerMap)
    } catch (e) {
      console.error('Failed to load names:', e)
    }
  }

  const loadConversations = async () => {
    const params = isCustomer ? { customer_id: userId } : { seller_id: userId }
    const list = await api.chatConversations(params)
    setConversations(Array.isArray(list) ? list : [])
    return list
  }

  const loadMessages = async (convId) => {
    setLoadingMessages(true)
    try {
      const msgs = await api.chatMessages(convId)
      setMessages(Array.isArray(msgs) ? msgs : [])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) {
      console.error('Failed to load messages:', e)
      toast.error('Không tải được tin nhắn')
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadNames()
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
    if (activeId) {
      loadMessages(activeId)
      connectWebSocket(activeId)
    }
    return () => {
      disconnectWebSocket()
    }
  }, [activeId])

  const connectWebSocket = (conversationId) => {
    disconnectWebSocket()
    setIsConnecting(true)

    try {
      // Bypass Vite proxy - kết nối trực tiếp tới backend WebSocket
      const backendBase = (import.meta.env.VITE_API_BASE || '/api').replace(/\/api$/, '')
      const sockUrl = backendBase ? `${backendBase}/ws-chat` : '/ws-chat'
      const socket = new SockJS(sockUrl)
      const client = Stomp.over(socket)
      
      // Vô hiệu hóa debug output
      client.debug = () => {}

      client.connect({}, () => {
        setStompClient(client)
        socketRef.current = socket
        setIsConnected(true)
        setIsConnecting(false)
        setReconnectAttempts(0)

        stopPolling()
        
        console.log('WebSocket connected to:', conversationId)

        client.subscribe(`/topic/conversations/${conversationId}`, (message) => {
          try {
            const newMessage = JSON.parse(message.body)
            setMessages((prev) => [...prev, newMessage])
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
          } catch (e) {
            console.error('Failed to parse message:', e)
          }
        })
      }, (error) => {
        console.error('WebSocket connection error:', error)
        setIsConnected(false)
        setIsConnecting(false)
        
        // Thử kết nối lại với exponential backoff
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAY * Math.pow(1.5, reconnectAttempts)
          console.log(`Retrying WebSocket connection in ${delay}ms (attempt ${reconnectAttempts + 1})`)
          setReconnectAttempts(prev => prev + 1)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket(conversationId)
          }, delay)
        } else {
          console.warn('Max reconnection attempts reached. Using REST API fallback.')
        }
      })
    } catch (e) {
      console.error('Failed to initialize WebSocket:', e)
      setIsConnected(false)
      setIsConnecting(false)
    }
  }

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    stopPolling()
    
    if (stompClient && stompClient.connected) {
      try {
        stompClient.disconnect()
      } catch (e) {
        console.error('Error disconnecting:', e)
      }
    }
    if (socketRef.current) {
      try {
        socketRef.current.close()
      } catch (e) {
        console.error('Error closing socket:', e)
      }
    }
    setStompClient(null)
    socketRef.current = null
    setIsConnected(false)
    setIsConnecting(false)
  }

  const send = (e) => {
    e.preventDefault()
    if (!content.trim() || !activeId) return

    const message = {
      sender_id: userId,
      sender_type: isCustomer ? 'customer' : 'seller',
      content: content.trim(),
    }

    // Nếu WebSocket kết nối, gửi qua WebSocket
    if (stompClient && isConnected) {
      try {
        stompClient.send(
          `/app/chat/${activeId}/send`,
          {},
          JSON.stringify(message)
        )
        setContent('')
      } catch (err) {
        console.error('WebSocket send error:', err)
        // Fallback to REST API
        sendViaREST(message)
      }
    } else {
      // Fallback to REST API
      sendViaREST(message)
    }
  }

  const sendViaREST = (message) => {
    api.sendMessage(activeId, message)
      .then((savedMessage) => {
        // Thêm tin vừa gửi vào state ngay (optimistic update) thay vì reload toàn bộ
        setMessages(prev => [...prev, savedMessage])
        setContent('')
        
        // Bắt đầu polling để check tin từ người khác
        startPolling(activeId)
        
        // Auto scroll xuống
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      })
      .catch(err => {
        console.error('REST API send error:', err)
        toast.error('Lỗi gửi tin nhắn: ' + (err.message || 'Unknown error'))
      })
  }

  // Chỉ fetch tin nhắn mới (so sánh bằng ID thay vì số lượng)
  const addNewMessages = async (conversationId) => {
    try {
      const allMessages = await api.chatMessages(conversationId)
      if (!Array.isArray(allMessages)) return

      // Tạo Set ID của tin hiện tại để so sánh
      const currentMessageIds = new Set(messages.map(m => idOf(m)))
      
      // Lọc ra những tin có ID không có trong currentMessageIds (tin mới)
      const newMessages = allMessages.filter(m => !currentMessageIds.has(idOf(m)))
      
      // Nếu có tin mới, thêm vào
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages])
        // Auto scroll xuống
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch (e) {
      console.error('Failed to fetch new messages:', e)
    }
  }

  const startPolling = (conversationId) => {
    // Nếu đang polling rồi, không khởi tạo lại
    if (pollingIntervalId) return

    const interval = setInterval(() => {
      addNewMessages(conversationId)  // Gọi hàm mới thay vì loadMessages
    }, 2000)  // Mỗi 2 giây
    
    setPollingIntervalId(interval)
    console.log('Polling started for conversation:', conversationId)
  }

  const stopPolling = () => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId)
      setPollingIntervalId(null)
      console.log('Polling stopped')
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
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Hội thoại</CardTitle>
          <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
            {isConnecting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Đang kết nối
              </>
            ) : isConnected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </CardHeader>
        <CardContent className="max-h-[calc(100%-4rem)] space-y-1 overflow-y-auto p-2">
          {conversations.map((c) => (
            <button
              key={idOf(c)}
              type="button"
              onClick={() => setActiveId(idOf(c))}
              className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 ${activeId === idOf(c) ? 'bg-accent font-medium' : ''}`}
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                {isCustomer ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">
                  {isCustomer ? (sellerNames[c.seller_id] || `Shop ${(c.seller_id || '').slice(-6)}`) : (customerNames[c.customer_id] || `KH ${(c.customer_id || '').slice(-6)}`)}
                </p>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground text-center">Chưa có hội thoại</p>
          )}
        </CardContent>
      </Card>

      <Card className="flex flex-col lg:col-span-2 h-full">
        {activeId ? (
          <>
            {!isConnected && reconnectAttempts >= MAX_RECONNECT_ATTEMPTS && (
              <div className="m-4 p-3 rounded-md bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Kết nối WebSocket không khả dụng. Sử dụng chế độ yên tĩnh (tin nhắn sẽ được gửi qua API).
                </p>
              </div>
            )}
            <CardContent className="flex-1 space-y-3 overflow-y-auto p-4 min-h-0">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Chưa có tin nhắn. Bắt đầu cuộc trò chuyện!
                </div>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_id === userId
                  return (
                    <div
                      key={idOf(m)}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                          mine ? 'bg-[#1A94FF] text-white' : 'bg-muted'
                        }`}
                      >
                        <p className="break-words">{m.content}</p>
                        <p className={`mt-1 text-xs ${mine ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {formatDate(m.time_stamp)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </CardContent>
            <form onSubmit={send} className="flex gap-2 border-t p-3">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập tin nhắn..."
              />
              <Button
                type="submit"
                size="icon"
                disabled={!content.trim()}
                className="bg-[#1A94FF] hover:bg-[#0b74e5]"
              >
                <Send className="h-4 w-4" />
              </Button>
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
