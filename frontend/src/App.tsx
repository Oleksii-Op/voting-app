import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/common/Navigation'
import { AnimatedLayout } from '@/components/common/AnimatedLayout'

// Pages
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import VotingPage from '@/pages/VotingPage'
import ProfilePage from '@/pages/ProfilePage'
import ResultsPage from '@/pages/ResultsPage'
import AdminPage from '@/pages/AdminPage'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnimatedLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/vote" element={<VotingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </AnimatedLayout>
      <Toaster />
    </div>
  )
}

export default App