# Phase 3 - Setup Checklist

## Before Running the App

- [ ] **Install Firebase Package**
  ```bash
  npm install firebase
  ```

- [ ] **Create Firebase Project**
  - Go to https://console.firebase.google.com
  - Create new project (or use existing)
  - Create web app

- [ ] **Get Firebase Credentials**
  - Project Settings → Web App
  - Copy your config object

- [ ] **Update .env.local**
  - Open `.env.local` in your project root
  - Fill in all 6 Firebase credentials
  - Save file

- [ ] **Enable Authentication Methods in Firebase Console**
  - [ ] Authentication → Sign-in method
  - [ ] Enable "Email/Password"
  - [ ] Enable "Google"
  - [ ] Configure OAuth consent screen (if new)

- [ ] **Create Firestore Database**
  - [ ] Firestore Database → Create database
  - [ ] Start in "test mode"
  - [ ] Choose region (closest to you)

- [ ] **Restart Dev Server**
  ```bash
  npm run dev
  ```

---

## Testing the Auth System

### Test Email/Password Signup
- [ ] Open http://localhost:5173/signup
- [ ] Fill in name, email, password
- [ ] Select role (student or expert)
- [ ] Click "Create Account"
- [ ] Should see dashboard
- [ ] Check Firestore has user document

### Test Email/Password Login
- [ ] Logout (click Sign Out button)
- [ ] Go to /login
- [ ] Enter email and password
- [ ] Should see dashboard

### Test Google Sign-In
- [ ] Go to /signup or /login
- [ ] Click "Sign in with Google"
- [ ] Complete OAuth flow
- [ ] Should see dashboard

### Test Persistent Login
- [ ] Login to app
- [ ] Refresh page (F5)
- [ ] Should stay logged in
- [ ] Check browser console (no auth errors)

### Test Protected Routes
- [ ] Logout
- [ ] Try to access http://localhost:5173/dashboard
- [ ] Should redirect to /login

### Test Role-Based Content
- [ ] Login as student
- [ ] Should see student dashboard
- [ ] Logout
- [ ] Login as expert
- [ ] Should see expert dashboard

---

## Project Files

### New Files Created
- ✅ `src/services/firebase.ts` - Firebase config
- ✅ `src/services/authService.ts` - Auth logic
- ✅ `src/services/AuthContext.tsx` - Auth state management
- ✅ `src/hooks/useAuth.ts` - Custom hooks
- ✅ `src/pages/SignUp.tsx` - Signup page
- ✅ `src/pages/Login.tsx` - Login page
- ✅ `src/pages/Dashboard.tsx` - Dashboard page
- ✅ `src/components/ProtectedRoute.tsx` - Route protection
- ✅ `.env.local` - Environment variables
- ✅ `AUTH_SETUP_GUIDE.md` - Complete setup guide
- ✅ `AUTH_QUICK_REFERENCE.md` - Quick reference
- ✅ `PHASE3_IMPLEMENTATION_SUMMARY.md` - Full summary

### Updated Files
- ✅ `src/App.tsx` - Added AuthProvider wrapper
- ✅ `src/routes/AppRoutes.tsx` - Added all auth routes
- ✅ `src/pages/Home.tsx` - Updated landing page
- ✅ `src/types/index.ts` - Added auth types

---

## Documentation to Review

1. **Start Here:** `AUTH_SETUP_GUIDE.md` (Step-by-step setup)
2. **Quick Ref:** `AUTH_QUICK_REFERENCE.md` (Code examples)
3. **Full Details:** `PHASE3_IMPLEMENTATION_SUMMARY.md` (Complete overview)
4. **This File:** Setup checklist (you are here)

---

## Folder Structure After Setup

```
draftassist-app/
├── src/
│   ├── services/
│   │   ├── firebase.ts              ← Firebase config
│   │   ├── authService.ts           ← Auth logic
│   │   └── AuthContext.tsx          ← Auth state
│   ├── pages/
│   │   ├── Home.tsx                 ← Landing page
│   │   ├── SignUp.tsx               ← Signup form
│   │   ├── Login.tsx                ← Login form
│   │   └── Dashboard.tsx            ← Protected dashboard
│   ├── components/
│   │   └── ProtectedRoute.tsx       ← Route protection
│   ├── hooks/
│   │   └── useAuth.ts               ← Auth hooks
│   ├── types/
│   │   └── index.ts                 ← TypeScript types
│   ├── routes/
│   │   └── AppRoutes.tsx            ← All routes
│   ├── App.tsx                      ← Main app
│   └── main.tsx
├── .env.local                       ← Your credentials here!
├── AUTH_SETUP_GUIDE.md              ← Read this first!
├── AUTH_QUICK_REFERENCE.md
├── PHASE3_IMPLEMENTATION_SUMMARY.md
└── ... (other config files)
```

---

## Troubleshooting

### "Cannot find module 'firebase/...'"
- [ ] Run `npm install firebase`
- [ ] Restart dev server
- [ ] Check package.json has firebase in dependencies

### "Firebase config is invalid" or "auth error"
- [ ] Check `.env.local` has all 6 values
- [ ] No typos in variable names
- [ ] Copy exact values from Firebase Console
- [ ] Restart dev server after updating .env.local

### "Google sign-in popup blocked"
- [ ] Ensure you're on localhost or HTTPS
- [ ] Check OAuth redirect URI in Firebase Console
- [ ] Should be: `http://localhost:5173` or your domain

### "Persistent login not working"
- [ ] Check browser allows localStorage
- [ ] Check auth listener runs on page load
- [ ] Check browser console for errors

### "User not found in Firestore"
- [ ] Create Firestore database first
- [ ] Set to test mode
- [ ] Check your user document exists in console

### "Signup works but dashboard is blank"
- [ ] Check browser console for errors
- [ ] Make sure user has a role in Firestore
- [ ] Check Dashboard.tsx is loading properly

---

## Verification Checklist

After completing setup, verify each item:

- [ ] `npm install firebase` completed
- [ ] `.env.local` has all 6 Firebase credentials
- [ ] Firebase Email/Password auth enabled
- [ ] Firebase Google auth enabled
- [ ] Firestore database created
- [ ] Dev server running (`npm run dev`)
- [ ] Can visit http://localhost:5173
- [ ] Home page loads without errors
- [ ] Can sign up with email/password
- [ ] New user appears in Firestore
- [ ] Can login with same credentials
- [ ] Can logout
- [ ] Can sign in with Google
- [ ] Persistent login works (refresh page)
- [ ] Protected routes redirect properly
- [ ] Dashboard shows correct role content
- [ ] No console errors
- [ ] Tailwind styles are working

---

## Next Steps

### Immediate (Required)
1. Follow AUTH_SETUP_GUIDE.md carefully
2. Test all authentication flows
3. Verify Firestore data structure

### Short Term (Recommended)
1. Add email verification
2. Add password reset
3. Improve error messages
4. Add loading spinners to buttons
5. Add form validation UI feedback

### Medium Term (Nice to Have)
1. User profile page
2. Profile picture upload
3. User preferences/settings
4. Admin dashboard
5. User management system

### Long Term (Future)
1. Two-factor authentication
2. Social login (GitHub, Facebook)
3. Account linking
4. Export user data
5. Advanced analytics

---

## Need Help?

### Documentation
- `AUTH_SETUP_GUIDE.md` - Complete setup guide
- `AUTH_QUICK_REFERENCE.md` - Code examples
- `PHASE3_IMPLEMENTATION_SUMMARY.md` - Full overview

### Firebase Docs
- [Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Web SDK Reference](https://firebase.google.com/docs/database/web/start)

### GitHub
- [Firebase GitHub](https://github.com/firebase)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

---

## Important Reminders

⚠️ **Keep `.env.local` secret!**
- Add to `.gitignore`
- Never commit to GitHub
- Don't share with others

⚠️ **Firestore Test Mode**
- Only for development
- Switch to production rules before deploying
- See AUTH_SETUP_GUIDE.md for security rules

⚠️ **Change Default Password**
- Test users: use strong passwords
- Don't use "password" or "123456"
- Use real email addresses for testing

---

## Success Criteria

✅ Auth system is working when you can:
1. Sign up with email/password + role
2. Login with email/password
3. Sign in with Google
4. See dashboard with role-based content
5. Logout successfully
6. Stay logged in after refresh
7. Cannot access protected routes without login
8. No console errors

---

**You're all set! Follow the checklist and you'll have a working auth system in minutes. 🚀**

Questions? Check the documentation files or Firebase docs linked above.
