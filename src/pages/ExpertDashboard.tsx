import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import AssignmentService from '../services/assignmentService'
import ProposalService from '../services/proposalService'
import ReviewService from '../services/reviewService'
import BidModal from '../components/BidModal'
import { formatPrice } from '../utils/formatPrice'
import type { Assignment } from '../types'

export default function ExpertDashboard() {
  const navigate = useNavigate()
  const { user, logOut } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [activeAssignments, setActiveAssignments] = useState<Assignment[]>([])
  const [completedAssignments, setCompletedAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingActive, setLoadingActive] = useState(true)
  const [loadingCompleted, setLoadingCompleted] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [bidding, setBidding] = useState(false)
  const [marking, setMarking] = useState<string | null>(null)
  const [submissionFiles, setSubmissionFiles] = useState<Record<string, File | null>>({})
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc')
  const [averageRating, setAverageRating] = useState<{ average: number; count: number }>({ average: 0, count: 0 })

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

  useEffect(() => {
    if (!user) return

    setLoadingActive(true)

    try {
      const unsubscribe = AssignmentService.subscribeToExpertActiveAssignments(user.uid, (data) => {
        setActiveAssignments(data)
        setLoadingActive(false)
      })

      return () => unsubscribe()
    } catch (err) {
      setLoadingActive(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    setLoadingCompleted(true)

    try {
      const unsubscribe = AssignmentService.subscribeToExpertCompletedAssignments(user.uid, (data) => {
        setCompletedAssignments(data)
        setLoadingCompleted(false)
      })

      return () => unsubscribe()
    } catch (err) {
      setLoadingCompleted(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const fetchRating = async () => {
      try {
        const rating = await ReviewService.getExpertAverageRating(user.uid)
        setAverageRating(rating)
      } catch (err) {
        console.error('Error fetching rating:', err)
      }
    }

    fetchRating()
  }, [user])

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

  const handleMarkAsCompleted = async (assignmentId: string) => {
    setMarking(assignmentId)
    try {
      const file = submissionFiles[assignmentId]
      await AssignmentService.uploadSubmissionAndComplete(assignmentId, file || undefined)
      setSubmissionFiles((prev) => {
        const updated = { ...prev }
        delete updated[assignmentId]
        return updated
      })
    } catch (err) {
      console.error('Error marking assignment as completed:', err)
    } finally {
      setMarking(null)
    }
  }

  const handleSubmissionFileChange = (assignmentId: string, file: File | null) => {
    setSubmissionFiles((prev) => ({
      ...prev,
      [assignmentId]: file,
    }))
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
        {/* Expert Rating Card */}
        <div className="mb-12 backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Performance</h3>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-400">
                      {averageRating.count > 0 ? averageRating.average : 'N/A'}
                    </span>
                    {averageRating.count > 0 && (
                      <>
                        <span className="text-yellow-400">★</span>
                        <span className="text-xs text-slate-400">({averageRating.count} reviews)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-5xl opacity-30">⭐</div>
          </div>
        </div>

        {/* My Active Assignments Section */}
        <div className="mb-12">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold">My Active Assignments</h2>
            <p className="text-slate-400">Assignments currently in progress</p>
          </div>

          {loadingActive ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : activeAssignments.length === 0 ? (
            <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
              <p className="text-slate-400">No active assignments yet</p>
            </div>
          ) : (
            <div className="grid gap-6 mb-8">
              {activeAssignments.map((assignment) => {
                const daysRemaining = getDaysRemaining(assignment.deadline)
                return (
                  <div
                    key={assignment.id}
                    className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-2xl p-6 transition"
                  >
                    <div className="grid md:grid-cols-3 gap-6 mb-4">
                      <div className="md:col-span-2">
                        <h3 className="text-xl font-bold mb-2">{assignment.title}</h3>
                        <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs font-semibold text-slate-300">
                          {assignment.subject}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-400 mb-2">{formatPrice(assignment.budget)}</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Deadline</p>
                        <p className="font-semibold text-sm">{formatDate(assignment.deadline)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Days Remaining</p>
                        <p className={`font-semibold text-sm ${daysRemaining < 0 ? 'text-red-400' : daysRemaining <= 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {daysRemaining < 0 ? 'Overdue' : daysRemaining <= 2 ? 'Urgent' : `${daysRemaining} days`}
                        </p>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <div className="flex items-center justify-center px-2">
                          <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition">
                            <span className="text-sm text-slate-400 font-medium">
                              {submissionFiles[assignment.id] ? submissionFiles[assignment.id]!.name : 'Upload PDF'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) =>
                                handleSubmissionFileChange(assignment.id, e.target.files?.[0] || null)
                              }
                              className="hidden"
                            />
                          </label>
                        </div>
                        <button
                          onClick={() => handleMarkAsCompleted(assignment.id)}
                          disabled={marking === assignment.id}
                          className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 rounded-lg font-semibold transition text-white text-sm"
                        >
                          {marking === assignment.id ? 'Submitting...' : 'Mark as Completed'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Completed Assignments Section */}
        <div className="mb-12">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold">Completed Assignments</h2>
            <p className="text-slate-400">Your completed work history</p>
          </div>

          {loadingCompleted ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : completedAssignments.length === 0 ? (
            <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
              <p className="text-slate-400">No completed assignments yet</p>
            </div>
          ) : (
            <div className="grid gap-6 mb-8">
              {completedAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-6 transition"
                >
                  <div className="grid md:grid-cols-3 gap-6 mb-4">
                    <div className="md:col-span-2">
                      <h3 className="text-xl font-bold mb-2">{assignment.title}</h3>
                      <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs font-semibold text-slate-300">
                        {assignment.subject}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400 mb-2">{formatPrice(assignment.budget)}</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Completed Date</p>
                      <p className="font-semibold text-sm">
                        {assignment.completedAt ? formatDate(assignment.completedAt) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      {assignment.submissionUrl ? (
                        <a
                          href={assignment.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition text-white text-sm inline-block"
                        >
                          View Submission
                        </a>
                      ) : (
                        <p className="text-slate-500 text-sm">No submission file</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Assignments Section */}
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
                    <div className="text-3xl font-bold text-blue-400 mb-2">{formatPrice(assignment.budget)}</div>
                    {assignment.pdfUrl && (
                      <a
                        href={assignment.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full mb-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-center transition text-white"
                      >
                        View PDF
                      </a>
                    )}
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
