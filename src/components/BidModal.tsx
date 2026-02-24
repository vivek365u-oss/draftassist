import { useState } from 'react'
import type { Assignment } from '../types'

interface BidModalProps {
  assignment: Assignment
  expertName: string
  onClose: () => void
  onSubmit: (bidAmount: number, message: string) => Promise<void>
  loading: boolean
}

export default function BidModal({ assignment,  onClose, onSubmit, loading }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState<string>(assignment.budget.toString())
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    try {
      const amount = parseFloat(bidAmount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid bid amount')
      }
      if (!message.trim()) {
        throw new Error('Please enter a message')
      }
      if (message.length > 1000) {
        throw new Error('Message must be 1000 characters or less')
      }

      await onSubmit(amount, message)
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place bid'
      setError(errorMessage)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 className="text-2xl font-bold mb-4">Place Your Bid</h3>
        <p className="text-slate-400 text-sm mb-6">
          Assignment: <span className="font-semibold text-white">{assignment.title}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">Your Bid Amount (USD) *</label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="e.g., 50.00"
              step="0.01"
              min="0"
              disabled={loading}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            <p className="text-xs text-slate-500 mt-1">Budget: ${assignment.budget}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">Your Proposal Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain your approach, timeline, and why you're the best fit..."
              rows={4}
              disabled={loading}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">{message.length}/1000</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? 'Placing Bid...' : 'Place Bid'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
