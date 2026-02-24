import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthHook } from '../hooks/useAuth'
import AssignmentService from '../services/assignmentService'
import ProposalService from '../services/proposalService'
import ProposalsList from '../components/ProposalsList'
import type { Assignment, Proposal } from '../types'

export default function MyAssignments() {
  const navigate = useNavigate()
  const { user } = useAuthHook()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null)
  const [acceptingBid, setAcceptingBid] = useState(false)

  useEffect(() => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const unsubscribe = AssignmentService.subscribeToStudentAssignments(user.uid, (data) => {
        setAssignments(data)
        setLoading(false)

        data.forEach((assignment) => {
          ProposalService.subscribeToAssignmentProposals(assignment.id, (proposals) => {
            setProposalCounts((prev) => ({
              ...prev,
              [assignment.id]: proposals.length,
            }))
          })
        })
      })

      return () => unsubscribe()
    } catch (err) {
      setLoading(false)
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      case 'closed':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleAcceptProposal = async (proposal: Proposal) => {
    const assignment = assignments.find((a) => a.id === proposal.assignmentId)
    if (!assignment) return

    setAcceptingBid(true)
    try {
      await AssignmentService.updateAssignmentStatus(
        proposal.assignmentId,
        'in-progress',
        proposal.expertId
      )
    } finally {
      setAcceptingBid(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <header className="bg-slate-900/50 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            DraftAssist
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/create-assignment')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition"
            >
              + New Assignment
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-white transition"
            >
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-2 mb-8">
          <h2 className="text-3xl font-bold">My Assignments</h2>
          <p className="text-slate-400">Manage all your posted assignments</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-400">Loading your assignments...</p>
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No assignments yet</h3>
            <p className="text-slate-400 mb-6">Get started by posting your first assignment</p>
            <button
              onClick={() => navigate('/create-assignment')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition"
            >
              Post First Assignment
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-2xl p-6 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{assignment.title}</h3>
                    <p className="text-slate-400 text-sm mb-3">{assignment.description}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs font-semibold text-slate-300">
                        {assignment.subject}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(assignment.status)} capitalize`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-blue-400 mb-2">${assignment.budget}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Deadline</p>
                    <p className="font-semibold">
                      {formatDate(assignment.deadline)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Posted</p>
                    <p className="font-semibold">
                      {formatDate(assignment.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Bids Received</p>
                    <p className="font-semibold text-blue-400">{proposalCounts[assignment.id] || 0}</p>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => setExpandedAssignment(expandedAssignment === assignment.id ? null : assignment.id)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm font-semibold rounded-lg transition"
                    >
                      {expandedAssignment === assignment.id ? 'Hide Bids' : 'View Bids'}
                    </button>
                  </div>
                </div>

                {expandedAssignment === assignment.id && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h4 className="font-semibold mb-4">Expert Proposals</h4>
                    <ProposalsList
                      assignment={assignment}
                      userId={user?.uid || ''}
                      onAccept={handleAcceptProposal}
                      loading={acceptingBid}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
