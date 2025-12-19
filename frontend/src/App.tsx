import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Pages
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import ProjectCreatePage from './pages/ProjectCreatePage'
import VoiceCalibrationPage from './pages/VoiceCalibrationPage'
import MemoryCapturePage from './pages/MemoryCapturePage'
import ChapterOverviewPage from './pages/ChapterOverviewPage'
import ChapterReviewPage from './pages/ChapterReviewPage'

// Components
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { initialize, initialized, loading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/create"
          element={
            <ProtectedRoute>
              <ProjectCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/voice-calibration"
          element={
            <ProtectedRoute>
              <VoiceCalibrationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/memories"
          element={
            <ProtectedRoute>
              <ChapterOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/memories/add"
          element={
            <ProtectedRoute>
              <MemoryCapturePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/chapters"
          element={
            <ProtectedRoute>
              <ChapterOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/chapters/:chapterId"
          element={
            <ProtectedRoute>
              <ChapterReviewPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
