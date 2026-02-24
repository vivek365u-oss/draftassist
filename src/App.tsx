import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './services/AuthContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
