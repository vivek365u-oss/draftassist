import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthHook } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Wrapper component that protects routes by requiring user to be authenticated
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthHook()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

interface RoleBasedRouteProps {
  children: ReactNode
  allowedRoles: Array<'student' | 'expert'>
}

/**
 * Wrapper component that protects routes based on user role
 * Redirects to dashboard if user doesn't have the required role
 */
function RoleBasedRoute({ children, allowedRoles }: RoleBasedRouteProps) {
  const { user, loading } = useAuthHook()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export { ProtectedRoute, RoleBasedRoute }

