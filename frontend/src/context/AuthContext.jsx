import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const STORAGE_KEY = 'webtech_auth'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadStored())

  const login = (payload) => {
    const next = {
      role: payload.role,
      userId: payload.userId,
      userName: payload.userName,
      email: payload.email ?? null,
      phoneNumber: payload.phoneNumber ?? null,
      accessToken: payload.accessToken ?? payload.access_token ?? null,
      tokenType: payload.tokenType ?? payload.token_type ?? 'Bearer',
      expiresIn: payload.expiresIn ?? payload.expires_in ?? null,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setAuth(next)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }

  const value = useMemo(
    () => ({
      auth,
      isLoggedIn: Boolean(auth?.userId && auth?.accessToken),
      role: auth?.role ?? null,
      userId: auth?.userId ?? null,
      userName: auth?.userName ?? null,
      accessToken: auth?.accessToken ?? null,
      isCustomer: auth?.role === 'customer',
      isSeller: auth?.role === 'seller',
      login,
      logout,
    }),
    [auth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
