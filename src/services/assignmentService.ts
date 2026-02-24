import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Assignment } from '../types'

class AssignmentService {
  private static readonly COLLECTION = 'assignments'

  async createAssignment(
    data: Omit<Assignment, 'id' | 'createdAt'>,
  ): Promise<string> {
    try {
      const assignmentsRef = collection(db, AssignmentService.COLLECTION)
      const docRef = await addDoc(assignmentsRef, {
        ...data,
        createdAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      throw this.handleError(error)
    }
  }

  subscribeToStudentAssignments(
    studentId: string,
    callback: (assignments: Assignment[]) => void
  ): () => void {
    try {
      const assignmentsRef = collection(db, AssignmentService.COLLECTION)
      const q = query(assignmentsRef, where('studentId', '==', studentId))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const assignments: Assignment[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          const assignment: Assignment = {
            id: doc.id,
            title: data.title,
            description: data.description,
            subject: data.subject,
            budget: data.budget,
            deadline: data.deadline instanceof Timestamp ? data.deadline.toDate() : data.deadline,
            status: data.status,
            studentId: data.studentId,
            studentName: data.studentName,
            selectedExpertId: data.selectedExpertId,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          }
          assignments.push(assignment)
        })
        callback(assignments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
      })

      return unsubscribe
    } catch (error) {
      throw this.handleError(error)
    }
  }

  subscribeToOpenAssignments(
    callback: (assignments: Assignment[]) => void
  ): () => void {
    try {
      const assignmentsRef = collection(db, AssignmentService.COLLECTION)
      const q = query(assignmentsRef, where('status', '==', 'open'))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const assignments: Assignment[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          const assignment: Assignment = {
            id: doc.id,
            title: data.title,
            description: data.description,
            subject: data.subject,
            budget: data.budget,
            deadline: data.deadline instanceof Timestamp ? data.deadline.toDate() : data.deadline,
            status: data.status,
            studentId: data.studentId,
            studentName: data.studentName,
            selectedExpertId: data.selectedExpertId,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          }
          assignments.push(assignment)
        })
        callback(assignments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
      })

      return unsubscribe
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async updateAssignmentStatus(assignmentId: string, status: string, selectedExpertId?: string): Promise<void> {
    try {
      const assignmentRef = doc(db, AssignmentService.COLLECTION, assignmentId)
      const updateData: any = { status }
      if (selectedExpertId) {
        updateData.selectedExpertId = selectedExpertId
      }
      await updateDoc(assignmentRef, updateData)
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

export default new AssignmentService()
