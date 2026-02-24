import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Proposal } from '../types'

class ProposalService {
  private static readonly COLLECTION = 'proposals'

  async createProposal(
    assignmentId: string,
    expertId: string,
    expertName: string,
    bidAmount: number,
    message: string,
  ): Promise<string> {
    try {
      const existingBid = await this.checkExistingBid(assignmentId, expertId)
      if (existingBid) {
        throw new Error('You have already placed a bid on this assignment')
      }

      const proposalsRef = collection(db, ProposalService.COLLECTION)
      const docRef = await addDoc(proposalsRef, {
        assignmentId,
        expertId,
        expertName,
        bidAmount,
        message,
        createdAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async checkExistingBid(assignmentId: string, expertId: string): Promise<boolean> {
    try {
      const proposalsRef = collection(db, ProposalService.COLLECTION)
      const q = query(
        proposalsRef,
        where('assignmentId', '==', assignmentId),
        where('expertId', '==', expertId)
      )
      const snapshot = await getDocs(q)
      return !snapshot.empty
    } catch (error) {
      throw this.handleError(error)
    }
  }

  subscribeToAssignmentProposals(
    assignmentId: string,
    callback: (proposals: Proposal[]) => void
  ): () => void {
    try {
      const proposalsRef = collection(db, ProposalService.COLLECTION)
      const q = query(proposalsRef, where('assignmentId', '==', assignmentId))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const proposals: Proposal[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          const proposal: Proposal = {
            id: doc.id,
            assignmentId: data.assignmentId,
            expertId: data.expertId,
            expertName: data.expertName,
            bidAmount: data.bidAmount,
            message: data.message,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          }
          proposals.push(proposal)
        })
        callback(proposals.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()))
      })

      return unsubscribe
    } catch (error) {
      throw this.handleError(error)
    }
  }

  subscribeToExpertProposals(
    expertId: string,
    callback: (proposals: Proposal[]) => void
  ): () => void {
    try {
      const proposalsRef = collection(db, ProposalService.COLLECTION)
      const q = query(proposalsRef, where('expertId', '==', expertId))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const proposals: Proposal[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          const proposal: Proposal = {
            id: doc.id,
            assignmentId: data.assignmentId,
            expertId: data.expertId,
            expertName: data.expertName,
            bidAmount: data.bidAmount,
            message: data.message,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          }
          proposals.push(proposal)
        })
        callback(proposals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
      })

      return unsubscribe
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }
    return new Error('An unexpected error occurred')
  }
}

export default new ProposalService()
