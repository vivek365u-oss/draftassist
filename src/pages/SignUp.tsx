import { useState, type ChangeEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types'

type SignUpForm = {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

const initialForm: SignUpForm = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp, logInWithGoogle, error: contextError, clearError } = useAuth()

  const [formData, setFormData] = useState<SignUpForm>(initialForm)
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [loading, setLoading] = useState<boolean>(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof SignUpForm
    const value = e.target.value
    setFormData((prev) => ({ ...prev, [name]: value } as SignUpForm))
    setLocalError(null)
    clearError()
  }

  const validateForm = (): boolean => {
    if (!formData.displayName.trim()) {
      setLocalError('Display name is required')
      return false
    }
    if (!formData.email.trim()) {
      setLocalError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('Please enter a valid email')
      return false
    }
    if (!formData.password) {
      setLocalError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setLocalError(null)
    try {
      const user = await signUp(formData.email, formData.password, formData.displayName, selectedRole)
      navigate(user?.role === 'expert' ? '/expert-dashboard' : '/dashboard')
    } catch (err) {
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setLocalError(null)
    try {
      const user = await logInWithGoogle()
      navigate(user?.role === 'expert' ? '/expert-dashboard' : '/dashboard')
    } catch (err) {
      console.error('Google signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const displayError = contextError ?? localError

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            DraftAssist
          </h1>
          <p className="text-slate-400">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-xl">
          {/* Error Message */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm animate-pulse">
              <div className="flex gap-2">
                <span>⚠️</span>
                <span>{displayError}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                id="displayName"
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
              />
              <p className="mt-1 text-xs text-slate-400">Minimum 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
              />
            </div>

            {/* Role Selection */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-300 mb-3">I am a:</label>
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'expert'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role as UserRole)
                      setLocalError(null)
                    }}
                    disabled={loading}
                    className={`p-3 rounded-lg border-2 transition font-medium capitalize ${
                      selectedRole === role
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-700/40 border-slate-600 text-slate-300 hover:border-slate-500'
                    } disabled:opacity-50`}
                  >
                    {role === 'student' ? '📚 Student' : '👨‍🏫 Expert'}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {selectedRole === 'expert'
                  ? 'You will review student submissions'
                  : 'You will submit assignments for review'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-700 disabled:to-blue-700 disabled:opacity-50 rounded-lg font-semibold transition duration-300 shadow-lg shadow-blue-500/20 mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/40 text-slate-400">or continue with</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full py-3 bg-slate-700/40 hover:bg-slate-700/60 disabled:opacity-50 border border-slate-600 hover:border-slate-500 rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          {/* Login Link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
