import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ children, role }) {
  const { isLoggedIn, role: userRole } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (role && userRole !== role) {
    return <Navigate to={userRole === 'seller' ? '/seller/products' : '/'} replace />
  }
  return children
}
