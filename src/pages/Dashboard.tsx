import { useNavigate } from 'react-router-dom'
import { useAuthHook } from '../hooks/useAuth'
import { useState } from 'react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logOut } = useAuthHook()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logOut()
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            DraftAssist
          </h1>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-slate-400">Logged in as</p>
              <p className="font-semibold">{user?.displayName}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition"
            >
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Welcome, {user?.displayName}!
                </h2>
                <p className="text-slate-400">
                  You are logged in as a <span className="text-blue-400 font-semibold capitalize">{user?.role}</span>
                </p>
              </div>
              <div className="text-6xl opacity-20">
                {user?.role === 'student' ? '📚' : '👨‍🏫'}
              </div>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Email Card */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-2">Email Address</p>
            <p className="text-lg font-semibold break-all">{user?.email}</p>
          </div>

          {/* Role Card */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-2">Account Type</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold capitalize">{user?.role}</span>
              <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Role-Specific Content */}
        {user?.role === 'student' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Student Dashboard</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Post Assignment', description: 'Share your assignment', icon: '📝', path: '/create-assignment' },
                { title: 'My Assignments', description: 'View all your posted assignments', icon: '📋', path: '/my-assignments' },
                { title: 'Browse Experts', description: 'Find available experts', icon: '👨‍🏫', path: '/dashboard' },
              ].map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(card.path)}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition cursor-pointer transform hover:scale-105"
                >
                  <p className="text-4xl mb-3">{card.icon}</p>
                  <h4 className="font-semibold mb-2">{card.title}</h4>
                  <p className="text-slate-400 text-sm">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {user?.role === 'expert' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Expert Dashboard</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Review Queue', description: 'Pending student submissions', icon: '✅' },
                { title: 'My Feedback', description: 'View your given feedback', icon: '💬' },
                { title: 'Analytics', description: 'Track your reviews', icon: '📊' },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition cursor-pointer"
                >
                  <p className="text-4xl mb-3">{card.icon}</p>
                  <h4 className="font-semibold mb-2">{card.title}</h4>
                  <p className="text-slate-400 text-sm">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="mt-12 p-6 bg-slate-800 rounded-xl border border-slate-700 text-sm text-slate-400">
          <p>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </main>
    </div>
  )
}
