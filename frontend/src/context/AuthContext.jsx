/**
 * Xác thực demo (chưa JWT).
 *
 * localStorage key: webtech_auth
 * Shape: { role: 'customer'|'seller', userId: string, userName: string }
 *
 * Dev sau: thay login() bằng gọi API auth, lưu accessToken, gắn header trong api.js
 *
 * @see frontend/TODO.md — P0 Đăng nhập thật
 */

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

  const login = (role, userId, userName) => {
    const next = { role, userId, userName }
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
      isLoggedIn: Boolean(auth?.userId),
      role: auth?.role ?? null,
      userId: auth?.userId ?? null,
      userName: auth?.userName ?? null,
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
