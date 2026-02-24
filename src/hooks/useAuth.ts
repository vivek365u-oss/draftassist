import { useAuth } from '../services/AuthContext'

/**
 * Primary hook to consume auth context
 */
export function useAuthHook() {
  return useAuth()
}

// Re-export the raw hook name for convenience
export { useAuth } from '../services/AuthContext'

/**
 * Custom hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { user, loading } = useAuth()
  return { isAuthenticated: !!user, loading }
}

/**
 * Custom hook to check user role
 */
export function useUserRole() {
  const { user } = useAuth()
  return user?.role || null
}
