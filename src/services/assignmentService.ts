import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, storage } from './firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import type { Assignment } from '../types'

class AssignmentService {
  private static readonly COLLECTION = 'assignments'

  async createAssignment(
    data: Omit<Assignment, 'id' | 'createdAt'> & { file?: File },
  ): Promise<string> {
    try {
      let pdfUrl: string | undefined = undefined

      if (data.file) {
        const file = data.file

        if (file.type !== 'application/pdf') {
          throw new Error('Only PDF files are allowed')
        }

        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          throw new Error('File exceeds maximum size of 5MB')
        }

        const path = `assignments/${Date.now()}-${file.name}`
        const sRef = ref(storage, path)
        await uploadBytes(sRef, file)
        pdfUrl = await getDownloadURL(sRef)
      }

      const assignmentsRef = collection(db, AssignmentService.COLLECTION)
      const payload: any = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        budget: data.budget,
        deadline: data.deadline,
        status: data.status,
        studentId: data.studentId,
        studentName: data.studentName,
        selectedExpertId: data.selectedExpertId,
        pdfUrl,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(assignmentsRef, payload)
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
            pdfUrl: data.pdfUrl,
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
            pdfUrl: data.pdfUrl,
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
      if (status === 'completed') {
        updateData.completedAt = serverTimestamp()
      }
      await updateDoc(assignmentRef, updateData)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  subscribeToExpertActiveAssignments(
    expertId: string,
    callback: (assignments: Assignment[]) => void
  ): () => void {
    try {
      const assignmentsRef = collection(db, AssignmentService.COLLECTION)
      const q = query(
        assignmentsRef,
        where('selectedExpertId', '==', expertId),
        where('status', '==', 'in_progress')
      )

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
            pdfUrl: data.pdfUrl,
            submissionUrl: data.submissionUrl,
            completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toDate() : data.completedAt,
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

  subscribeToExpertCompletedAssignments(
    expertId: string,
    callback: (assignments: Assignment[]) => void
  ): () => void {
    try {
      const assignmentsRef = collection(db, AssignmentService.COLLECTION)
      const q = query(
        assignmentsRef,
        where('selectedExpertId', '==', expertId),
        where('status', '==', 'completed')
      )

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
            pdfUrl: data.pdfUrl,
            submissionUrl: data.submissionUrl,
            completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toDate() : data.completedAt,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          }
          assignments.push(assignment)
        })
        callback(assignments.sort((a, b) => {
          const aTime = (b.completedAt || b.createdAt).getTime()
          const bTime = (a.completedAt || a.createdAt).getTime()
          return aTime - bTime
        }))
      })

      return unsubscribe
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async markAssignmentAsCompleted(assignmentId: string): Promise<void> {
    try {
      const assignmentRef = doc(db, AssignmentService.COLLECTION, assignmentId)
      await updateDoc(assignmentRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
      })
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async uploadSubmissionAndComplete(assignmentId: string, file?: File): Promise<void> {
    try {
      let submissionUrl: string | undefined = undefined

      if (file) {
        if (file.type !== 'application/pdf') {
          throw new Error('Only PDF files are allowed')
        }

        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          throw new Error('File exceeds maximum size of 5MB')
        }

        const timestamp = Date.now()
        const path = `submissions/${assignmentId}/${timestamp}.pdf`
        const sRef = ref(storage, path)
        await uploadBytes(sRef, file)
        submissionUrl = await getDownloadURL(sRef)
      }

      const assignmentRef = doc(db, AssignmentService.COLLECTION, assignmentId)
      const updateData: any = {
        status: 'completed',
        completedAt: serverTimestamp(),
      }
      if (submissionUrl) {
        updateData.submissionUrl = submissionUrl
      }
      await updateDoc(assignmentRef, updateData)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async markRatingAsGiven(assignmentId: string): Promise<void> {
    try {
      const assignmentRef = doc(db, AssignmentService.COLLECTION, assignmentId)
      await updateDoc(assignmentRef, {
        ratingGiven: true,
      })
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
