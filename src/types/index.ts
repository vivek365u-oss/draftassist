// Type definitions for the application
// Add your custom types here
export type UserRole = 'student' | 'expert'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<UserProfile>
  logIn: (email: string, password: string) => Promise<UserProfile>
  logInWithGoogle: () => Promise<UserProfile>
  logOut: () => Promise<void>
  clearError: () => void
}

export type AssignmentStatus = 'open' | 'in-progress' | 'completed' | 'closed'

export interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  budget: number
  deadline: Date
  status: AssignmentStatus
  studentId: string
  studentName: string
  selectedExpertId?: string
  createdAt: Date
}

export interface Proposal {
  id: string
  assignmentId: string
  expertId: string
  expertName: string
  bidAmount: number
  message: string
  createdAt: Date
}