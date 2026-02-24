# Authentication Architecture Diagram

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Application (main.tsx)               │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │  <App /> (App.tsx)                              │   │  │
│  │  │                                                  │   │  │
│  │  │  ┌──────────────────────────────────────────┐  │   │  │
│  │  │  │  <AuthProvider>                          │  │   │  │
│  │  │  │  (AuthContext.tsx)                       │  │   │  │
│  │  │  │                                          │  │   │  │
│  │  │  │  ┌────────────────────────────────────┐ │  │   │  │
│  │  │  │  │  <AppRoutes />                     │ │  │   │  │
│  │  │  │  │  (AppRoutes.tsx)                   │ │  │   │  │
│  │  │  │  │                                    │ │  │   │  │
│  │  │  │  │  Routes:                          │ │  │   │  │
│  │  │  │  │  • / (Home)                       │ │  │   │  │
│  │  │  │  │  • /signup (SignUp)               │ │  │   │  │
│  │  │  │  │  • /login (Login)                 │ │  │   │  │
│  │  │  │  │  • /dashboard (Protected)         │ │  │   │  │
│  │  │  │  │                                    │ │  │   │  │
│  │  │  │  └────────────────────────────────────┘ │  │   │  │
│  │  │  │                                          │  │   │  │
│  │  │  └──────────────────────────────────────────┘  │   │  │
│  │  │                                                  │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                      │
│                  uses useAuthHook()                             │
│                          ↓                                      │
│              AuthContext provides state:                        │
│              • user (UserProfile)                               │
│              • loading (boolean)                                │
│              • error (string)                                   │
│              • methods (signUp, logIn, logOut, etc)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         ↓                                          ↑
         │                                          │
         │ calls                                    │ returns
         │                                          │
         ↓                                          ↑


┌─────────────────────────────────────────────────────────────────┐
│         Firebase Authentication Service (.firebaserc)           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AuthService (authService.ts):                                 │
│  • signUp() ──────→ Creates user in Firebase Auth              │
│  • logIn() ───────→ Signs in user with email/password          │
│  • logInWithGoogle() → Signs in with Google OAuth              │
│  • logOut() ──────→ Signs out user                             │
│  • getUserProfile() → Fetches user from Firestore              │
│                                                                 │
│                   ↓                    ↓                        │
│         ┌─────────────────────────────────┐                   │
│         │   Firebase Auth Service         │                   │
│         │   (Web SDK)                     │                   │
│         ├─────────────────────────────────┤                   │
│         │ • User authentication           │                   │
│         │ • Session management            │                   │
│         │ • OAuth handling                │                   │
│         │ • Error handling                │                   │
│         └─────────────────────────────────┘                   │
│                   ↓                    ↓                        │
│         ┌─────────────────────────────────┐                   │
│         │  Firestore Database             │                   │
│         │  (Cloud Firestore)              │                   │
│         ├─────────────────────────────────┤                   │
│         │ users/{uid}/                    │                   │
│         │  ├─ uid                         │                   │
│         │  ├─ email                       │                   │
│         │  ├─ displayName                 │                   │
│         │  ├─ role (student/expert)       │                   │
│         │  ├─ createdAt                   │                   │
│         │  └─ updatedAt                   │                   │
│         └─────────────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

```

---

## Component Hierarchy

```
App.tsx
│
└── <AuthProvider>
    │
    ├── AuthContext provides:
    │   ├── user
    │   ├── loading
    │   ├── error
    │   ├── signUp()
    │   ├── logIn()
    │   ├── logInWithGoogle()
    │   ├── logOut()
    │   └── clearError()
    │
    └── <AppRoutes>
        │
        ├── <MainLayout>
        │   └── <Home /> (public)
        │
        ├── <SignUp /> (public, redirects if logged in)
        │
        ├── <Login /> (public, redirects if logged in)
        │
        └── <ProtectedRoute>
            └── <Dashboard /> (requires auth)
```

---

## Authentication Flow

### Signup Flow
```
User fills signup form
        ↓
Validates inputs (client-side)
        ↓
Calls AuthService.signUp(email, password, name, role)
        ↓
Creates user account in Firebase Auth
        ↓
Creates user profile document in Firestore
        ↓
AuthContext listens to auth state change
        ↓
Updates user state in AuthContext
        ↓
Component redirects to /dashboard
```

### Login Flow
```
User fills login form
        ↓
Calls AuthService.logIn(email, password)
        ↓
Firebase authenticates user
        ↓
Fetches user profile from Firestore
        ↓
AuthContext listens to auth state change
        ↓
Updates user state with profile data
        ↓
Component redirects to /dashboard
```

### Logout Flow
```
User clicks logout button
        ↓
Calls AuthService.logOut()
        ↓
Firebase signs out user
        ↓
AuthContext listens to auth state change
        ↓
Sets user to null
        ↓
Component redirects to /login
```

### Persistent Login (Page Refresh)
```
App loads
        ↓
AuthProvider useEffect runs
        ↓
Calls AuthService.onAuthStateChanged()
        ↓
Firebase checks for existing session
        ↓
If session exists:
  └──→ Gets user UID
      └──→ Fetches user profile from Firestore
          └──→ Updates AuthContext with user data
              └──→ Component shows Dashboard
        ↓
If no session:
  └──→ Sets user to null
      └──→ Component shows Login
```

---

## Data Flow Diagram

### State Management

```
┌──────────────────┐
│  Firebase Auth   │
│  (currentUser)   │
└────────┬─────────┘
         │
         │ onAuthStateChanged()
         ↓
┌──────────────────────────┐
│   AuthProvider           │
│   (AuthContext.tsx)      │
├──────────────────────────┤
│ State:                   │
│  • user                  │
│  • loading               │
│  • error                 │
├──────────────────────────┤
│ Methods:                 │
│  • signUp()              │
│  • logIn()               │
│  • logInWithGoogle()     │
│  • logOut()              │
│  • clearError()          │
└────────┬─────────────────┘
         │
         │ provides context
         ↓
┌──────────────────────────┐
│  useAuthHook()           │
│  (useAuth.ts)            │
└────────┬─────────────────┘
         │
         │ provides to components
         ↓
┌──────────────────────────┐
│  Any Component           │
│  (Pages, Components)     │
│                          │
│  const { user, ... }     │
│    = useAuthHook()       │
│                          │
│  Renders based on:       │
│  • user state            │
│  • loading state         │
│  • error messages        │
└──────────────────────────┘
```

---

## Route Protection Flow

```
User visits /dashboard
        ↓
AppRoutes checks route config
        ↓
Route wrapped in <ProtectedRoute>
        ↓
ProtectedRoute calls useAuthHook()
        ↓
Check: Is loading?
  ├─ YES → Show spinner
  └─ NO  → Continue
        ↓
Check: Is user logged in?
  ├─ YES → Render Dashboard
  └─ NO  → Redirect to /login (Navigate component)
```

---

## File Dependencies

```
main.tsx
  └── App.tsx
      └── AuthContext.tsx
          ├── authService.ts
          │   ├── firebase.ts
          │   └── types/index.ts
          └── AppRoutes.tsx
              ├── Home.tsx
              ├── SignUp.tsx (uses useAuthHook)
              ├── Login.tsx  (uses useAuthHook)
              ├── Dashboard.tsx (uses useAuthHook)
              │   └── useAuth.ts
              └── ProtectedRoute.tsx
                  └── useAuth.ts
```

---

## Firestore Document Structure

### Single User Document

```
Collection: users
Document: {uid of user}

{
  uid: "firebase_uid_string",
  email: "user@example.com",
  displayName: "John Doe",
  role: "student",                    // or "expert"
  createdAt: Timestamp(seconds, ms),
  updatedAt: Timestamp(seconds, ms)
}
```

### Query Flow

```
Component requests user data
        ↓
AuthService.getUserProfile(uid)
        ↓
Query: db.collection('users').doc(uid).get()
        ↓
Firestore returns document
        ↓
Convert Timestamp to Date
        ↓
Return UserProfile object
        ↓
Push to AuthContext.user
        ↓
Component re-renders with data
```

---

## Error Handling Flow

```
User action (signup/login)
        ↓
AuthService.method() throws Error
        ↓
authService catches error
        ↓
Maps Firebase error code to user message
        ↓
Throws new Error with message
        ↓
AuthContext catches in try/catch
        ↓
Stores error in state: error = "User message"
        ↓
Component displays error UI
        ↓
User fixes issue and tries again
        ↓
Component calls clearError() on new attempt
        ↓
Error replaced with null
```

---

## Authentication State Lifecycle

```
Initial: user=null, loading=true
  ↓
User navigates to app
  ↓
AuthProvider mounts
  ↓
onAuthStateChanged() listener set up
  ↓
Firebase checks for existing session
  ↓
[Session Found]               [No Session]
  ↓                               ↓
Fetch profile from Firestore      ↓
  ↓                               ↓
user = ProfileData            user = null
loading = false               loading = false
  ↓                               ↓
  └─────────────┬─────────────────┘
                ↓
        App Ready to Render
        Components can check `user`
        ProtectedRoutes work correctly

[User Signs Up/Logs In]       [User Logs Out]
  ↓                               ↓
Firebase Auth changes        Firebase Auth clears
  ↓                               ↓
onAuthStateChanged fires      onAuthStateChanged fires
  ↓                               ↓
Fetch/Create profile          user = null
  ↓                               ↓
user = ProfileData            Components re-render
  ↓                               ↓
Components re-render          Routes redirect
  ↓
Redirect to dashboard
```

---

**This architecture ensures:**
✅ Single source of truth (AuthContext)
✅ Real-time updates (Firebase listeners)
✅ Type-safe operations (TypeScript)
✅ Clean component hierarchy
✅ Persistent user sessions
✅ Protected routes
✅ Role-based access
