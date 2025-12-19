import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Database } from '../types/database.types'

type Chapter = Database['public']['Tables']['chapters']['Row']

export default function ChapterOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchChapters()
  }, [projectId])

  const fetchChapters = async () => {
    try {
      setLoading(true)
      setError('')

      if (!projectId) {
        setError('Invalid project')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('chapters')
        .select('*')
        .eq('project_id', projectId)
        .order('chapter_number', { ascending: true })

      if (fetchError) throw fetchError

      setChapters(data || [])
    } catch (err) {
      console.error('Error fetching chapters:', err)
      setError('Failed to load chapters')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Chapter['status']) => {
    const icons = {
      insufficient: '🔴',
      draft: '🟡',
      validated: '🟢',
      approved: '✅'
    }
    return icons[status]
  }

  const getStatusLabel = (status: Chapter['status']) => {
    const labels = {
      insufficient: 'Needs More Memories',
      draft: 'Draft',
      validated: 'Ready to Review',
      approved: 'Approved'
    }
    return labels[status]
  }

  const getStatusColor = (status: Chapter['status']) => {
    const colors = {
      insufficient: 'text-red-600',
      draft: 'text-amber-600',
      validated: 'text-green-600',
      approved: 'text-green-700'
    }
    return colors[status]
  }

  const approvedCount = chapters.filter(c => c.status === 'approved').length
  const readyCount = chapters.filter(c => c.status === 'validated').length
  const needsWorkCount = chapters.filter(c => c.status === 'insufficient').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={`/projects/${projectId}`} className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Project
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-warm-900 mb-2">Chapters</h1>
          <p className="text-warm-600">
            Progress: {approvedCount} approved, {readyCount} ready, {needsWorkCount} need more memories
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Chapters List */}
        <div className="space-y-4">
          {chapters.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-serif text-warm-900 mb-2">No chapters yet</h3>
              <p className="text-warm-600 mb-6">
                Start by adding memories to your project
              </p>
              <Link 
                to={`/projects/${projectId}/memories`} 
                className="btn-primary inline-block"
              >
                Add Memories
              </Link>
            </div>
          ) : (
            chapters.map((chapter) => (
              <div key={chapter.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getStatusIcon(chapter.status)}</span>
                      <h3 className="text-xl font-serif text-warm-900">
                        Chapter {chapter.chapter_number}: {chapter.title}
                      </h3>
                    </div>
                    
                    <div className="ml-11">
                      <p className={`text-sm font-medium mb-2 ${getStatusColor(chapter.status)}`}>
                        Status: {getStatusLabel(chapter.status)}
                      </p>

                      {chapter.status === 'approved' && (
                        <div className="text-sm text-warm-600 mb-3">
                          {chapter.word_count.toLocaleString()} words
                        </div>
                      )}

                      {chapter.status === 'validated' && (
                        <div className="text-sm text-warm-600 mb-3">
                          Ready to generate • Estimated: {chapter.word_count.toLocaleString()} words
                        </div>
                      )}

                      {chapter.status === 'insufficient' && (
                        <div className="text-sm text-warm-600 mb-3">
                          Needs more memories to generate chapter
                        </div>
                      )}

                      {chapter.status === 'draft' && (
                        <div className="text-sm text-warm-600 mb-3">
                          Draft in progress • {chapter.word_count.toLocaleString()} words
                        </div>
                      )}

                      <div className="flex gap-3">
                        {chapter.status === 'approved' && (
                          <Link
                            to={`/projects/${projectId}/chapters/${chapter.id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View Chapter
                          </Link>
                        )}
                        
                        {chapter.status === 'validated' && (
                          <button
                            onClick={() => navigate(`/projects/${projectId}/chapters/${chapter.id}/generate`)}
                            className="btn-primary text-sm"
                          >
                            Generate Chapter
                          </button>
                        )}
                        
                        {chapter.status === 'insufficient' && (
                          <Link
                            to={`/projects/${projectId}/memories/add`}
                            className="btn-secondary text-sm"
                          >
                            Add Memories
                          </Link>
                        )}

                        {chapter.status === 'draft' && (
                          <Link
                            to={`/projects/${projectId}/chapters/${chapter.id}`}
                            className="btn-primary text-sm"
                          >
                            Review Draft
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
