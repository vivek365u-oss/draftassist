import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Home from '../pages/Home'
import SignUp from '../pages/SignUp'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import ExpertDashboard from '../pages/ExpertDashboard'
import CreateAssignment from '../pages/CreateAssignment'
import MyAssignments from '../pages/MyAssignments'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { RoleBasedRoute } from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  const dashboardPath = user?.role === 'expert' ? '/expert-dashboard' : '/dashboard'

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={user ? <Navigate to={dashboardPath} /> : <Home />} />
      </Route>

      <Route path="/signup" element={user ? <Navigate to={dashboardPath} /> : <SignUp />} />
      <Route path="/login" element={user ? <Navigate to={dashboardPath} /> : <Login />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expert-dashboard"
        element={
          <RoleBasedRoute allowedRoles={[ 'expert' ]}>
            <ExpertDashboard />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/create-assignment"
        element={
          <RoleBasedRoute allowedRoles={[ 'student' ]}>
            <CreateAssignment />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/my-assignments"
        element={
          <RoleBasedRoute allowedRoles={[ 'student' ]}>
            <MyAssignments />
          </RoleBasedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
