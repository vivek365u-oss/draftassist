import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AuthContextType, UserProfile, UserRole } from '../types'
import AuthService from './authService'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen to auth state changes on component mount
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userProfile = await AuthService.getUserProfile(firebaseUser.uid)
          setUser(userProfile)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Error loading user profile:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
    try {
      setError(null)
      const userProfile = await AuthService.signUp(email, password, displayName, role)
      setUser(userProfile)
      return userProfile
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed'
      setError(errorMessage)
      throw err
    }
  }

  const logIn = async (email: string, password: string) => {
    try {
      setError(null)
      const userProfile = await AuthService.logIn(email, password)
      setUser(userProfile)
      return userProfile
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    }
  }

  const logInWithGoogle = async () => {
    try {
      setError(null)
      const userProfile = await AuthService.logInWithGoogle()
      setUser(userProfile)
      return userProfile
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed'
      setError(errorMessage)
      throw err
    }
  }

  const logOut = async () => {
    try {
      setError(null)
      await AuthService.logOut()
      setUser(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      setError(errorMessage)
      throw err
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    logIn,
    logInWithGoogle,
    logOut,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Alias for backward compatibility
export const useAuthHook = useAuth

