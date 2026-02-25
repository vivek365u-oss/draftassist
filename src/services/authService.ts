import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  type User,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { UserProfile, UserRole } from '../types'

class AuthService {
  /**
   * Register a new user with email and password
   * Stores user profile in Firestore with role
   */
  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ): Promise<UserProfile> {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email,
        displayName,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const userRef = doc(db, 'users', firebaseUser.uid)
      await setDoc(userRef, {
        ...userProfile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      return userProfile
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Login user with email and password
   */
  async logIn(email: string, password: string): Promise<UserProfile> {
    try {
      // Use session persistence so the user is signed out when the browser is closed.
      await setPersistence(auth, browserSessionPersistence)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userProfile = await this.getUserProfile(userCredential.user.uid)

      if (!userProfile) {
        throw new Error('User profile not found')
      }

      return userProfile
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Login user with Google
   */
  async logInWithGoogle(): Promise<UserProfile> {
    try {
      const googleProvider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user

      // Check if user already exists in Firestore
      let userProfile = await this.getUserProfile(firebaseUser.uid)

      // If first time Google login, create profile with 'student' role by default
      if (!userProfile) {
        userProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'User',
          role: 'student',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const userRef = doc(db, 'users', firebaseUser.uid)
        await setDoc(userRef, {
          ...userProfile,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      }

      return userProfile
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Logout user
   */
  async logOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        return null
      }

      const data = userSnap.data()
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  /**
   * Watch for auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return auth.currentUser
  }

  /**
   * Handle Firebase errors and convert to user-friendly messages
   */
  private handleError(error: unknown): Error {
    let message = 'An error occurred during authentication'

    if (error instanceof Error) {
      const code = (error as any).code

      switch (code) {
        case 'auth/email-already-in-use':
          message = 'Email is already registered'
          break
        case 'auth/invalid-email':
          message = 'Invalid email address'
          break
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters'
          break
        case 'auth/user-not-found':
          message = 'No account found with this email'
          break
        case 'auth/wrong-password':
          message = 'Incorrect password'
          break
        case 'auth/operation-not-allowed':
          message = 'Operation not allowed. Please try again'
          break
        case 'auth/popup-closed-by-user':
          message = 'Google sign-in was cancelled'
          break
        case 'auth/account-exists-with-different-credential':
          message = 'Account already exists with different credentials'
          break
        default:
          message = error.message
      }
    }

    return new Error(message)
  }
}

// Export as singleton
export default new AuthService()
