import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Review } from '../types'

class ReviewService {
  private static readonly COLLECTION = 'reviews'

  async createReview(
    assignmentId: string,
    studentId: string,
    expertId: string,
    rating: number,
    comment?: string
  ): Promise<string> {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5')
      }

      const reviewsRef = collection(db, ReviewService.COLLECTION)
      const payload: any = {
        assignmentId,
        studentId,
        expertId,
        rating,
        comment: comment || null,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(reviewsRef, payload)
      return docRef.id
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getExpertAverageRating(expertId: string): Promise<{ average: number; count: number }> {
    try {
      const reviewsRef = collection(db, ReviewService.COLLECTION)
      const q = query(reviewsRef, where('expertId', '==', expertId))

      const snapshot = await getDocs(q)
      const reviews: Review[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        const review: Review = {
          id: doc.id,
          assignmentId: data.assignmentId,
          studentId: data.studentId,
          expertId: data.expertId,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        }
        reviews.push(review)
      })

      if (reviews.length === 0) {
        return { average: 0, count: 0 }
      }

      const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
      const average = sum / reviews.length

      return { average: Math.round(average * 10) / 10, count: reviews.length }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  subscribeToExpertReviews(
    expertId: string,
    callback: (reviews: Review[]) => void
  ): () => void {
    try {
      const reviewsRef = collection(db, ReviewService.COLLECTION)
      const q = query(reviewsRef, where('expertId', '==', expertId))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reviews: Review[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          const review: Review = {
            id: doc.id,
            assignmentId: data.assignmentId,
            studentId: data.studentId,
            expertId: data.expertId,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          }
          reviews.push(review)
        })
        callback(reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
      })

      return unsubscribe
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async hasReviewForAssignment(assignmentId: string, studentId: string): Promise<boolean> {
    try {
      const reviewsRef = collection(db, ReviewService.COLLECTION)
      const q = query(
        reviewsRef,
        where('assignmentId', '==', assignmentId),
        where('studentId', '==', studentId)
      )

      const snapshot = await getDocs(q)
      return snapshot.size > 0
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

export default new ReviewService()
