# Authentication System - Quick Reference

## Quick Setup (5 minutes)

```bash
# 1. Install Firebase
npm install firebase

# 2. Update .env.local with your Firebase credentials
# See AUTH_SETUP_GUIDE.md for instructions

# 3. Enable auth methods in Firebase Console
# - Email/Password
# - Google OAuth

# 4. Create Firestore database (test mode)

# 5. Run app
npm run dev
```

---

## Using Auth in Components

### Example 1: Access Current User

```tsx
import { useAuthHook } from '../hooks/useAuth'

function MyComponent() {
  const { user, loading } = useAuthHook()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>

  return <div>Welcome, {user.displayName}!</div>
}
```

### Example 2: Protected Component

```tsx
import { ProtectedRoute } from '../components/ProtectedRoute'
import Dashboard from './Dashboard'

function App() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
```

### Example 3: Check User Role

```tsx
import { useUserRole } from '../hooks/useAuth'

function FeatureX() {
  const userRole = useUserRole()

  if (userRole === 'expert') {
    return <ExpertFeature />
  }

  return <StudentFeature />
}
```

### Example 4: Logout Button

```tsx
import { useAuthHook } from '../hooks/useAuth'

function LogoutButton() {
  const { logOut } = useAuthHook()

  const handleLogout = async () => {
    try {
      await logOut()
      // User will be redirected by auth listener
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return <button onClick={handleLogout}>Sign Out</button>
}
```

---

## Auth Context API

### useAuthHook()

```typescript
const {
  user,              // UserProfile | null
  loading,           // boolean - true while checking auth
  error,             // string | null - error message
  signUp,            // (email, password, name, role) => Promise
  logIn,             // (email, password) => Promise
  logInWithGoogle,   // () => Promise
  logOut,            // () => Promise
  clearError,        // () => void
} = useAuthHook()
```

### UserProfile Type

```typescript
interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: 'student' | 'expert'
  createdAt: Date
  updatedAt: Date
}
```

---

## Component Examples

### Check if Authenticated

```tsx
const { user, loading } = useAuthHook()

if (loading) return <Spinner />
if (!user) return <Login />
return <Dashboard />
```

### Show Role-Specific Content

```tsx
const { user } = useAuthHook()

return (
  <>
    {user?.role === 'student' && <StudentTools />}
    {user?.role === 'expert' && <ExpertTools />}
  </>
)
```

### Redirect After Login

```tsx
import { useNavigate } from 'react-router-dom'
import { useAuthHook } from '../hooks/useAuth'

function LoginPage() {
  const navigate = useNavigate()
  const { logIn } = useAuthHook()

  const handleLogin = async (email, password) => {
    try {
      await logIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      // Error is in context, show to user
    }
  }

  return (/* form */)
}
```

---

## Firestore Structure

### Users Collection

```
firestore/
  ├── users/
  │   ├── uid123/
  │   │   ├── uid: "uid123"
  │   │   ├── email: "user@example.com"
  │   │   ├── displayName: "John Doe"
  │   │   ├── role: "student"
  │   │   ├── createdAt: Timestamp
  │   │   └── updatedAt: Timestamp
  │   │
  │   └── uid456/
  │       ├── uid: "uid456"
  │       ├── email: "expert@example.com"
  │       ├── displayName: "Jane Expert"
  │       ├── role: "expert"
  │       ├── createdAt: Timestamp
  │       └── updatedAt: Timestamp
```

### Query User Data

```typescript
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

const userRef = doc(db, 'users', userId)
const userSnap = await getDoc(userRef)
const userData = userSnap.data()
```

---

## Route Setup

### AppRoutes.tsx Pattern

```tsx
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<SignUp />} />

  {/* Protected routes */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  {/* Role-specific routes */}
  <Route
    path="/expert-only"
    element={
      <RoleBasedRoute allowedRoles={['expert']}>
        <ExpertPage />
      </RoleBasedRoute>
    }
  />
</Routes>
```

---

## Error Handling

### Firebase Errors (Auto-mapped)

| Firebase Error | User Message |
|---|---|
| `auth/email-already-in-use` | Email is already registered |
| `auth/invalid-email` | Invalid email address |
| `auth/weak-password` | Password should be at least 6 characters |
| `auth/user-not-found` | No account found with this email |
| `auth/wrong-password` | Incorrect password |

### Display Errors in UI

```tsx
const { error } = useAuthHook()

{error && (
  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200">
    {error}
  </div>
)}
```

---

## Environment Variables

### Required (.env.local)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Access in code:
```typescript
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
```

---

## Testing

### Test Signup
1. Go to `/signup`
2. Enter email, password, name
3. Select role
4. Click "Create Account"
5. Should redirect to `/dashboard`
6. Check Firestore for user document

### Test Login
1. Go to `/login`
2. Enter email and password
3. Click "Sign In"
4. Should redirect to `/dashboard`

### Test Persistence
1. Login
2. Refresh page
3. Should stay logged in
4. Check localStorage has auth token

### Test Protected Routes
1. Logout
2. Try to access `/dashboard` directly
3. Should redirect to `/login`

---

## Common Tasks

### Add New Protected Page

```tsx
// 1. Create page
// src/pages/MyPage.tsx
function MyPage() {
  return <div>My protected content</div>
}

// 2. Add route
// src/routes/AppRoutes.tsx
<Route
  path="/mypage"
  element={
    <ProtectedRoute>
      <MyPage />
    </ProtectedRoute>
  }
/>
```

### Check User's Role

```tsx
import { useUserRole } from '../hooks/useAuth'

const role = useUserRole()
// Returns: 'student' | 'expert' | null
```

### Custom Firestore Query

```tsx
import { useAuthHook } from '../hooks/useAuth'
import { db } from '../services/firebase'
import { query, collection, where, getDocs } from 'firebase/firestore'

function MyComponent() {
  const { user } = useAuthHook()

  const loadUserData = async () => {
    const q = query(
      collection(db, 'myCollection'),
      where('userId', '==', user?.uid)
    )
    const snapshot = await getDocs(q)
    // Process results
  }
}
```

---

## Security Best Practices

✅ Never log sensitive data to console
✅ Always use Firebase security rules
✅ Keep API keys in `.env.local`
✅ Don't commit `.env.local` to git
✅ Validate data on backend (Firestore rules)
✅ Use HTTPS in production
✅ Regularly audit Firestore rules

---

## Links

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [React Integration](https://firebase.google.com/docs/database/web/start)
- [Auth Setup Guide](./AUTH_SETUP_GUIDE.md)
- [Implementation Summary](./PHASE3_IMPLEMENTATION_SUMMARY.md)

---

**Need more? Check the full files in src/services and src/pages!**
