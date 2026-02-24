# Phase 3: Authentication System - Setup Guide

## ✅ Implementation Complete

Your production-ready authentication system has been fully implemented. Follow these steps to get it working:

---

## Step 1: Install Firebase Dependencies

Run this command in your terminal:

```bash
npm install firebase
```

---

## Step 2: Configure Firebase

### Get Your Firebase Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** → **Web App**
4. Copy your Firebase config object

### Update `.env.local` file:

Open `c:\c\Projects\draftassist-app\.env.local` and fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

**Example:**
```env
VITE_FIREBASE_API_KEY=AIzaSyBxX1234567890abcdefghijklmnopqrstu
VITE_FIREBASE_AUTH_DOMAIN=myproject-123456.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=myproject-123456
VITE_FIREBASE_STORAGE_BUCKET=myproject-123456.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
```

---

## Step 3: Enable Firebase Features

### Enable Email/Password Authentication:
1. Go to Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Email/Password**

### Enable Google Sign-In:
1. Go to Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Google**
3. Set up your OAuth consent screen if needed

### Create Firestore Database:
1. Go to Firebase Console → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode**
4. Choose your preferred region

---

## Step 4: Firestore Security Rules (Test Mode to Production)

When ready for production, update your Firestore rules. Go to **Firestore Database** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

---

## Step 5: Run Your App

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
src/
├── services/
│   ├── firebase.ts              # Firebase initialization
│   ├── authService.ts           # Auth logic (signup, login, logout)
│   └── AuthContext.tsx          # Auth context & provider
├── pages/
│   ├── Home.tsx                 # Landing page
│   ├── SignUp.tsx               # Signup form (with role selection)
│   ├── Login.tsx                # Login form
│   └── Dashboard.tsx            # Protected dashboard (role-based)
├── components/
│   └── ProtectedRoute.tsx        # Route protection component
├── hooks/
│   └── useAuth.ts               # Auth custom hooks
├── types/
│   └── index.ts                 # TypeScript types (User, Role, etc.)
└── routes/
    └── AppRoutes.tsx            # All routes with protection
```

---

## 🔑 Key Features Implemented

### ✅ Authentication
- [x] Email & password registration
- [x] Email & password login
- [x] Google OAuth sign-in
- [x] Persistent login (browser refresh keeps user logged in)
- [x] Logout functionality

### ✅ Role Management
- [x] Role selection during signup (student/expert)
- [x] User roles stored in Firestore
- [x] Role-based redirection after login
- [x] Role-specific dashboards

### ✅ Protected Routes
- [x] ProtectedRoute component (requires authentication)
- [x] RoleBasedRoute component (requires specific role)
- [x] Auto-redirect to dashboard if already logged in
- [x] Auto-redirect to login if not authenticated

### ✅ Error Handling
- [x] User-friendly error messages
- [x] Validation on signup/login forms
- [x] Firebase error code mapping
- [x] Clear error display to users

### ✅ Loading States
- [x] Auth state checking on app load
- [x] Loading spinner during auth operations
- [x] Disabled buttons during submission
- [x] Proper async/await handling

### ✅ UI/UX
- [x] Clean, modern Tailwind design (dark theme)
- [x] Responsive on mobile, tablet, desktop
- [x] Smooth transitions and hover effects
- [x] Professional gradient styling
- [x] Accessible forms and buttons

---

## 🎯 User Flow

1. **Landing Page (Home)** → Shows CTA buttons
2. **Signup Page** → Register with email/password + role selection
3. **Login Page** → Login with email/password or Google
4. **Dashboard** → Role-specific content (student or expert)
5. **Logout** → Returns to login page

---

## 🧪 Testing the Auth System

### Test Email/Password Signup:
1. Go to `http://localhost:5173/signup`
2. Enter details (name, email, password)
3. Select role (student/expert)
4. Click "Create Account"
5. Should see dashboard

### Test Google Sign-In:
1. Go to `http://localhost:5173/signup` or `/login`
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Should see dashboard (role defaults to 'student' for Google signups)

### Test Protected Routes:
1. Logout from dashboard
2. Try to access `http://localhost:5173/dashboard`
3. Should redirect to `/login`

### Test Persistent Login:
1. Log in
2. Refresh the page
3. You should stay logged in (check browser console for no errors)

---

## 🔒 Firestore Data Structure

When a user signs up, their profile is stored in Firestore:

```json
{
  "users": {
    "uid_of_user": {
      "uid": "uid_of_user",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "student",
      "createdAt": "Timestamp",
      "updatedAt": "Timestamp"
    }
  }
}
```

---

## 📝 Available Hooks

### `useAuth()`
```typescript
const { user, loading, error, signUp, logIn, logInWithGoogle, logOut, clearError } = useAuth()
```

### `useIsAuthenticated()`
```typescript
const { isAuthenticated, loading } = useIsAuthenticated()
```

### `useUserRole()`
```typescript
const userRole = useUserRole() // Returns 'student' | 'expert' | null
```

---

## 🚀 Next Steps (Optional Enhancements)

1. Add email verification
2. Add password reset functionality
3. Add profile update page
4. Add user profile pictures
5. Add more granular Firestore security rules
6. Add user preferences/settings
7. Add admin dashboard
8. Add role upgrade/downgrade logic

---

## 🐛 Troubleshooting

### "Unknown custom element" errors
Make sure you've added Firebase config to `.env.local`

### Can't login/signup
- Check Firebase console for enabled auth methods
- Check `.env.local` has correct values
- Check Firestore database is created and test mode enabled
- Check browser console for specific error

### Persistent login not working
- Check if auth state listener is running (should see "Loading..." briefly on refresh)
- Check browser localStorage is not disabled
- Check Firebase persistence is enabled in code

### Google sign-in not working
- Make sure Google OAuth is enabled in Firebase
- Make sure authorized redirect URI includes your app URL
- Check browser console for OAuth error codes

---

## 📞 Need Help?

Check Firebase documentation:
- [Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Web SDK Setup](https://firebase.google.com/docs/web/setup)

---

**Phase 3 Setup Complete! 🎉**

Your authentication system is production-ready. Test it thoroughly and let me know if you need any adjustments!
