import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Pages
import LandingPage from './pages/LandingPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import ProjectCreatePage from './pages/ProjectCreatePage'
import MemoryCapturePage from './pages/MemoryCapturePage'
import ChapterOverviewPage from './pages/ChapterOverviewPage'
import ChapterReviewPage from './pages/ChapterReviewPage'

// Ghostwriter Pages
import { ProfileSetupPage } from './pages/ghostwriter/ProfileSetupPage'
import { SectionRoadmapPage } from './pages/ghostwriter/SectionRoadmapPage'
import { PromptCapturePage } from './pages/ghostwriter/PromptCapturePage'
import { SynthesisPreviewPage } from './pages/ghostwriter/SynthesisPreviewPage'
import { BookSynthesisPage } from './pages/ghostwriter/BookSynthesisPage'

// Components
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import PWAInstallPrompt from './components/PWAInstallPrompt'

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
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
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

        {/* Ghostwriter Routes */}
        <Route
          path="/ghostwriter/profile-setup/:projectId"
          element={
            <ProtectedRoute>
              <ProfileSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ghostwriter/roadmap/:projectId"
          element={
            <ProtectedRoute>
              <SectionRoadmapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ghostwriter/section/:sectionId"
          element={
            <ProtectedRoute>
              <PromptCapturePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ghostwriter/section/:sectionId/prompt/:promptId"
          element={
            <ProtectedRoute>
              <PromptCapturePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ghostwriter/synthesis/:sectionId"
          element={
            <ProtectedRoute>
              <SynthesisPreviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ghostwriter/book-synthesis/:projectId"
          element={
            <ProtectedRoute>
              <BookSynthesisPage />
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
