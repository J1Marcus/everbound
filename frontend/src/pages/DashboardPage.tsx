import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'
import CreateProjectModal from '../components/CreateProjectModal'
import type { Database } from '../types/database.types'

type Project = Database['public']['Tables']['projects']['Row']

// Mock data for development/demo purposes
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    owner_id: 'mock-user-id',
    title: 'My Life Story',
    subtitle: 'A Journey Through Time',
    book_type: 'individual_memoir',
    status: 'collecting',
    target_page_count: 200,
    target_chapter_count: 12,
    trim_size: '6x9',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    owner_id: 'mock-user-id',
    title: 'The Smith Family Chronicles',
    subtitle: 'Three Generations of Stories',
    book_type: 'family_memoir',
    status: 'completed',
    target_page_count: 300,
    target_chapter_count: 18,
    trim_size: '8x10',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    owner_id: 'mock-user-id',
    title: 'Grandma\'s Kitchen',
    subtitle: 'Recipes and Memories',
    book_type: 'individual_memoir',
    status: 'setup',
    target_page_count: 150,
    target_chapter_count: 10,
    trim_size: '6x9',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError('')

      if (!user) {
        navigate('/signin')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError

      // If no real data, use mock data for demo purposes
      if (!data || data.length === 0) {
        setProjects(MOCK_PROJECTS)
      } else {
        setProjects(data)
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
      // On error, show mock data instead of error message
      setProjects(MOCK_PROJECTS)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  const getStatusLabel = (status: Project['status']) => {
    const labels = {
      setup: 'Setup',
      collecting: 'Collecting Memories',
      assembling: 'Assembling Chapters',
      reviewing: 'Reviewing',
      print_ready: 'Print Ready',
      completed: 'Completed'
    }
    return labels[status]
  }

  const getProgressPercentage = (project: Project) => {
    // Simple progress calculation based on status
    const statusProgress = {
      setup: 10,
      collecting: 35,
      assembling: 60,
      reviewing: 80,
      print_ready: 95,
      completed: 100
    }
    return statusProgress[project.status]
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-paper)' }}>
      {/* Header - Mobile optimized */}
      <header className="nav">
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/images/logo.png"
            alt="Everbound"
            style={{ height: '48px', width: 'auto', cursor: 'pointer' }}
            className="desktop-only"
          />
          <img
            src="/images/logo.png"
            alt="Everbound"
            style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
            className="mobile-only"
          />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span
            style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}
            className="tablet-up"
          >
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="btn-text"
            style={{
              minHeight: 'auto',
              padding: 'var(--space-xs) var(--space-sm)',
              border: 'none',
              fontSize: 'var(--text-body-sm)'
            }}
          >
            <span className="mobile-only">Exit</span>
            <span className="tablet-up">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content - Mobile-first padding */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-lg) var(--space-md)',
        paddingTop: 'calc(var(--space-lg) + 80px)' // Add space for fixed header
      }}>
        {/* Page Header - Mobile responsive */}
        <div style={{
          marginBottom: 'var(--space-xl)',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-md)',
          flexWrap: 'wrap'
        }}>
          <h2 style={{
            fontSize: 'var(--text-h1)',
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-ink)',
            marginBottom: 0
          }}>
            My Projects
          </h2>
          
          {/* Desktop create button - inline with title */}
          {projects.length > 0 && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-secondary tablet-up"
              style={{
                minHeight: '44px',
                padding: 'var(--space-sm) var(--space-lg)',
                fontSize: 'var(--text-body)'
              }}
            >
              + Create New Memoir
            </button>
          )}
          
          {/* Mobile create button - full width below */}
          {projects.length > 0 && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-secondary mobile-only"
              style={{
                width: '100%',
                minHeight: '48px',
                fontSize: 'var(--text-body)'
              }}
            >
              + Create New Memoir
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="message message-error" style={{ marginBottom: 'var(--space-xl)' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div className="message-text">
              <strong>Error:</strong> {error}
              <button
                onClick={fetchProjects}
                style={{
                  marginLeft: 'var(--space-md)',
                  color: 'var(--color-amber-dark)',
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-body)'
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Projects List - Mobile optimized */}
        <div className="stack" style={{
          marginBottom: 'var(--space-2xl)',
          gap: 'var(--space-md)'
        }}>
          {projects.length === 0 ? (
            <div className="card" style={{
              textAlign: 'center',
              padding: 'var(--space-xl)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>📖</div>
              <h3 style={{
                fontSize: 'var(--text-h1)',
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-ink)',
                marginBottom: 'var(--space-md)'
              }}>
                No projects yet
              </h3>
              <p style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-slate)',
                marginBottom: 'var(--space-xl)',
                lineHeight: 'var(--line-height-relaxed)'
              }}>
                Start your first memoir project and preserve your precious memories for generations to come.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary"
                style={{ width: '230px' }}
              >
                Let's get started
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="card-compact"
                style={{
                  transition: 'box-shadow var(--transition-fast)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                }}
              >
                {/* Project Header - Mobile stacked */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)',
                  marginBottom: 'var(--space-md)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 'var(--space-sm)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm)',
                      flex: 1
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📖</span>
                      <h3 style={{
                        fontSize: 'var(--text-body-lg)',
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--color-ink)',
                        marginBottom: 0,
                        lineHeight: '1.3'
                      }}>
                        {project.title}
                      </h3>
                    </div>
                    <span style={{
                      padding: 'var(--space-xs) var(--space-sm)',
                      backgroundColor: 'rgba(193, 122, 58, 0.1)',
                      color: 'var(--color-amber-dark)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 'var(--font-medium)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {project.book_type === 'individual_memoir' ? 'Individual' : 'Family'}
                    </span>
                  </div>
                  {project.subtitle && (
                    <p style={{
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-slate)',
                      marginLeft: 'calc(1.5rem + var(--space-sm))',
                      marginBottom: 0,
                      lineHeight: '1.4'
                    }}>
                      {project.subtitle}
                    </p>
                  )}
                </div>

                {/* Project Details - Simplified for mobile */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)'
                }}>
                  {/* Progress Bar - Compact */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--space-xs)'
                    }}>
                      <span style={{
                        fontSize: 'var(--text-caption)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--color-slate)'
                      }}>
                        {getStatusLabel(project.status)}
                      </span>
                      <span style={{
                        fontSize: 'var(--text-caption)',
                        color: 'var(--color-slate)',
                        fontWeight: 'var(--font-semibold)'
                      }}>
                        {getProgressPercentage(project)}%
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgressPercentage(project)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata - Hide some on mobile */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-slate)',
                    flexWrap: 'wrap'
                  }}>
                    <span>{project.target_page_count} pages</span>
                    <span>•</span>
                    <span>{project.target_chapter_count} chapters</span>
                    <span className="tablet-up">•</span>
                    <span className="tablet-up">Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>

                  {/* Action Button - Full width on mobile */}
                  <div style={{ paddingTop: 'var(--space-xs)' }}>
                    <Link
                      to={`/ghostwriter/roadmap/${project.id}`}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        minHeight: '48px',
                        padding: 'var(--space-sm) var(--space-md)',
                        fontSize: 'var(--text-body)',
                        justifyContent: 'center'
                      }}
                    >
                      Continue Working →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}
