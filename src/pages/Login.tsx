import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthHook } from '../hooks/useAuth'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../services/firebase'

export default function Login() {
  const navigate = useNavigate()
  const { logIn, logInWithGoogle, error, clearError } = useAuthHook()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setLocalError(null)
    clearError()
  }

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setLocalError('Email is required')
      return false
    }
    if (!formData.password) {
      setLocalError('Password is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const user = await logIn(formData.email, formData.password)
      navigate(user?.role === 'expert' ? '/expert-dashboard' : '/dashboard')
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const user = await logInWithGoogle()
      navigate(user?.role === 'expert' ? '/expert-dashboard' : '/dashboard')
    } catch (err) {
      console.error('Google login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const displayError = error || localError

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      setResetMessage({ type: 'error', text: 'Please enter your email address' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    setResetLoading(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setResetMessage({ type: 'success', text: 'Password reset email sent. Please check your inbox.' })
      setTimeout(() => {
        setShowPasswordReset(false)
        setResetEmail('')
        setResetMessage(null)
      }, 3000)
    } catch (err: any) {
      const errorMessage = err?.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : 'Failed to send reset email. Please try again.'
      setResetMessage({ type: 'error', text: errorMessage })
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            DraftAssist
          </h1>
          <p className="text-slate-400">Welcome back</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
          {/* Error Message */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {displayError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition duration-300 shadow-lg shadow-blue-500/20 mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">or</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 border border-slate-600 rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          {/* Signup Link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 w-full max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Reset Password</h2>

            {resetMessage && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${
                  resetMessage.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/50 text-green-200'
                    : 'bg-red-500/10 border border-red-500/50 text-red-200'
                }`}
              >
                {resetMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value)
                    setResetMessage(null)
                  }}
                  placeholder="you@example.com"
                  disabled={resetLoading}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordReset(false)
                    setResetEmail('')
                    setResetMessage(null)
                  }}
                  disabled={resetLoading}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
