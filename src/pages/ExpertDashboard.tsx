import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import AssignmentService from '../services/assignmentService'
import ProposalService from '../services/proposalService'
import BidModal from '../components/BidModal'
import type { Assignment } from '../types'

export default function ExpertDashboard() {
  const navigate = useNavigate()
  const { user, logOut } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [bidding, setBidding] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    setLoading(true)

    try {
      const unsubscribe = AssignmentService.subscribeToOpenAssignments((data) => {
        setAssignments(data)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (err) {
      setLoading(false)
    }
  }, [])

  const filteredAndSorted = assignments
    .filter((a) => (subjectFilter ? a.subject === subjectFilter : true))
    .sort((a, b) => {
      const comparison = a.budget - b.budget
      return sortBy === 'asc' ? comparison : -comparison
    })

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logOut()
      navigate('/login')
    } catch (err) {
      setLoggingOut(false)
    }
  }

  const handleBidClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setShowBidModal(true)
  }

  const handleBidSubmit = async (bidAmount: number, message: string) => {
    if (!selectedAssignment || !user) return

    setBidding(true)
    try {
      await ProposalService.createProposal(
        selectedAssignment.id,
        user.uid,
        user.displayName,
        bidAmount,
        message
      )
      setShowBidModal(false)
    } catch (err) {
      console.error('Error placing bid:', err)
      throw err
    } finally {
      setBidding(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const subjects = Array.from(new Set(assignments.map((a) => a.subject)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <header className="bg-slate-900/50 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
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

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-2 mb-8">
          <h2 className="text-3xl font-bold">Available Assignments</h2>
          <p className="text-slate-400">Browse and place bids on student assignments</p>
        </div>

        <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-200">Filter by Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-200">Sort by Budget</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'asc' | 'desc')}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="desc">Highest to Lowest</option>
                <option value="asc">Lowest to Highest</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-400">Loading assignments...</p>
            </div>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No assignments available</h3>
            <p className="text-slate-400">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAndSorted.map((assignment) => (
              <div
                key={assignment.id}
                className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-2xl p-6 transition group"
              >
                <div className="grid md:grid-cols-3 gap-6 mb-4">
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-bold group-hover:text-blue-400 transition mb-2">{assignment.title}</h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{assignment.description}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs font-semibold text-slate-300">
                        {assignment.subject}
                      </span>
                      <span className="text-xs text-slate-500">by {assignment.studentName}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-400 mb-2">${assignment.budget}</div>
                    <button
                      onClick={() => handleBidClick(assignment)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition"
                    >
                      Place Bid
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Deadline</p>
                    <p className="font-semibold">{formatDate(assignment.deadline)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Posted</p>
                    <p className="font-semibold">{formatDate(assignment.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showBidModal && selectedAssignment && (
        <BidModal
          assignment={selectedAssignment}
          expertName={user?.displayName || ''}
          onClose={() => setShowBidModal(false)}
          onSubmit={handleBidSubmit}
          loading={bidding}
        />
      )}
    </div>
  )
}
