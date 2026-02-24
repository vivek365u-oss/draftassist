import { useState, useEffect } from 'react'
import ProposalService from '../services/proposalService'
import type { Proposal, Assignment } from '../types'

interface ProposalsListProps {
  assignment: Assignment
  userId: string
  onAccept: (proposal: Proposal) => Promise<void>
  loading: boolean
}

export default function ProposalsList({ assignment,  onAccept, loading }: ProposalsListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [proposalsLoading, setProposalsLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)

  useEffect(() => {
    setProposalsLoading(true)

    try {
      const unsubscribe = ProposalService.subscribeToAssignmentProposals(
        assignment.id,
        (data) => {
          setProposals(data)
          setProposalsLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      setProposalsLoading(false)
    }
  }, [assignment.id])

  const handleAccept = async (proposal: Proposal) => {
    setAccepting(proposal.id)
    try {
      await onAccept(proposal)
    } finally {
      setAccepting(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (proposalsLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-slate-400 text-sm">Loading proposals...</p>
        </div>
      </div>
    )
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-slate-400">No bids yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {proposals.map((proposal) => (
        <div
          key={proposal.id}
          className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold">{proposal.expertName}</h4>
              <p className="text-xs text-slate-500">{formatDate(proposal.createdAt)}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-400">${proposal.bidAmount}</div>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-3 whitespace-pre-wrap break-words">{proposal.message}</p>

          {assignment.selectedExpertId === proposal.expertId ? (
            <div className="px-3 py-1 bg-green-500/20 text-green-300 rounded text-xs font-semibold text-center">
              ✓ Accepted
            </div>
          ) : assignment.selectedExpertId && assignment.selectedExpertId !== proposal.expertId ? (
            <div className="px-3 py-1 bg-slate-700/50 text-slate-400 rounded text-xs font-semibold text-center">
              Other Expert Selected
            </div>
          ) : (
            <button
              onClick={() => handleAccept(proposal)}
              disabled={loading || accepting === proposal.id}
              className="w-full px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition"
            >
              {accepting === proposal.id ? 'Accepting...' : 'Accept Bid'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
