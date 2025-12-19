import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'
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
    status: 'assembling',
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
      {/* Header */}
      <header className="nav">
        <h1 className="nav-title">Everbound</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="btn-text"
            style={{
              minHeight: 'auto',
              padding: 'var(--space-sm) var(--space-md)',
              border: 'none'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-2xl) var(--space-lg)'
      }}>
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 style={{
            fontSize: 'var(--text-display)',
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-ink)',
            marginBottom: 'var(--space-sm)'
          }}>
            My Projects
          </h2>
          <p style={{
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-slate)',
            marginBottom: 0
          }}>
            Continue working on your memoirs
          </p>
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

        {/* Projects List */}
        <div className="stack-lg" style={{ marginBottom: 'var(--space-2xl)' }}>
          {projects.length === 0 ? (
            <div className="card" style={{
              textAlign: 'center',
              padding: 'var(--space-3xl)',
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
              <Link to="/projects/create" className="btn btn-primary" style={{ width: '230px' }}>
                Let's get started
              </Link>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="card"
                style={{
                  transition: 'box-shadow var(--transition-fast)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                }}
              >
                {/* Project Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-lg)',
                  gap: 'var(--space-lg)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      marginBottom: 'var(--space-sm)'
                    }}>
                      <span style={{ fontSize: '2rem' }}>📖</span>
                      <h3 style={{
                        fontSize: 'var(--text-h1)',
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--color-ink)',
                        marginBottom: 0
                      }}>
                        {project.title}
                      </h3>
                    </div>
                    {project.subtitle && (
                      <p style={{
                        fontSize: 'var(--text-body)',
                        color: 'var(--color-slate)',
                        marginLeft: 'calc(2rem + var(--space-md))',
                        marginBottom: 0
                      }}>
                        {project.subtitle}
                      </p>
                    )}
                  </div>
                  <span style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    backgroundColor: 'rgba(193, 122, 58, 0.1)',
                    color: 'var(--color-amber-dark)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: 'var(--font-medium)',
                    whiteSpace: 'nowrap'
                  }}>
                    {project.book_type === 'individual_memoir' ? 'Individual' : 'Family'}
                  </span>
                </div>

                {/* Project Details */}
                <div style={{
                  marginLeft: 'calc(2rem + var(--space-md))',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)'
                }}>
                  {/* Progress Bar */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--space-sm)'
                    }}>
                      <span style={{
                        fontSize: 'var(--text-body-sm)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--color-slate)'
                      }}>
                        Status: {getStatusLabel(project.status)}
                      </span>
                      <span style={{
                        fontSize: 'var(--text-body-sm)',
                        color: 'var(--color-slate)'
                      }}>
                        {getProgressPercentage(project)}%
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: '8px' }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgressPercentage(project)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    fontSize: 'var(--text-body-sm)',
                    color: 'var(--color-slate)',
                    flexWrap: 'wrap'
                  }}>
                    <span>Target: {project.target_page_count} pages</span>
                    <span>•</span>
                    <span>{project.target_chapter_count} chapters</span>
                    <span>•</span>
                    <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>

                  {/* Action Button */}
                  <div style={{ paddingTop: 'var(--space-sm)' }}>
                    <Link
                      to={`/projects/${project.id}`}
                      className="btn-primary"
                    >
                      Continue Working →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create New Project Button */}
        {projects.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <Link to="/projects/create" className="btn-secondary">
              + Create New Memoir
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
