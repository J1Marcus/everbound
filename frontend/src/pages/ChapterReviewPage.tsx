import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Database } from '../types/database.types'

type Chapter = Database['public']['Tables']['chapters']['Row']

export default function ChapterReviewPage() {
  const { projectId, chapterId } = useParams<{ projectId: string; chapterId: string }>()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchChapter()
  }, [chapterId])

  const fetchChapter = async () => {
    try {
      setLoading(true)
      setError('')

      if (!chapterId) {
        setError('Invalid chapter')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single()

      if (fetchError) throw fetchError

      setChapter(data)
    } catch (err) {
      console.error('Error fetching chapter:', err)
      setError('Failed to load chapter')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!chapter) return

    try {
      setSubmitting(true)
      setError('')

      const { error: updateError } = await supabase
        .from('chapters')
        .update({ status: 'approved' } as any)
        .eq('id', chapter.id)

      if (updateError) throw updateError

      navigate(`/projects/${projectId}/chapters`)
    } catch (err) {
      console.error('Error approving chapter:', err)
      setError('Failed to approve chapter')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestChanges = async () => {
    if (!chapter || !feedback.trim()) {
      setError('Please provide feedback for the requested changes')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      // In a real implementation, this would save feedback and trigger regeneration
      // For now, we'll just update the status
      const { error: updateError } = await supabase
        .from('chapters')
        .update({ status: 'draft' } as any)
        .eq('id', chapter.id)

      if (updateError) throw updateError

      navigate(`/projects/${projectId}/chapters`)
    } catch (err) {
      console.error('Error requesting changes:', err)
      setError('Failed to request changes')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegenerate = async () => {
    if (!chapter) return

    try {
      setSubmitting(true)
      setError('')

      // In a real implementation, this would trigger chapter regeneration
      // For now, we'll just update the status
      const { error: updateError } = await supabase
        .from('chapters')
        .update({ status: 'draft' } as any)
        .eq('id', chapter.id)

      if (updateError) throw updateError

      navigate(`/projects/${projectId}/chapters`)
    } catch (err) {
      console.error('Error regenerating chapter:', err)
      setError('Failed to regenerate chapter')
    } finally {
      setSubmitting(false)
    }
  }

  // Mock quality scores (in real implementation, these would come from the chapter data)
  const qualityScores = {
    voice_consistency: 0.92,
    sensory_details: 0.88,
    emotional_depth: 0.87,
    narrative_flow: 0.90
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <LoadingSpinner />
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <p className="text-warm-600 mb-4">Chapter not found</p>
          <Link to={`/projects/${projectId}/chapters`} className="btn-primary">
            Back to Chapters
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link 
              to={`/projects/${projectId}/chapters`} 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Chapters
            </Link>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Approving...' : 'Approve Chapter'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-warm-900 mb-2">
            Chapter {chapter.chapter_number}: {chapter.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-warm-600">
            <span>Status: {chapter.status}</span>
            <span>•</span>
            <span>{chapter.word_count.toLocaleString()} words</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Chapter Content */}
        <div className="card mb-8">
          <div className="prose prose-warm max-w-none">
            {chapter.content ? (
              <div className="whitespace-pre-wrap text-warm-800 leading-relaxed">
                {chapter.content}
              </div>
            ) : (
              <div className="text-center py-12 text-warm-500">
                <p>Chapter content is being generated...</p>
                <p className="text-sm mt-2">This is a placeholder. In the real implementation, the generated chapter content would appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quality Check */}
        <div className="card mb-8">
          <h2 className="text-xl font-serif text-warm-900 mb-4">Quality Check</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-warm-700">Voice Consistency</span>
                <span className="text-sm text-warm-600">{qualityScores.voice_consistency.toFixed(2)}</span>
              </div>
              <div className="w-full bg-warm-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${qualityScores.voice_consistency * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-warm-700">Sensory Details</span>
                <span className="text-sm text-warm-600">{qualityScores.sensory_details.toFixed(2)}</span>
              </div>
              <div className="w-full bg-warm-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${qualityScores.sensory_details * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-warm-700">Emotional Depth</span>
                <span className="text-sm text-warm-600">{qualityScores.emotional_depth.toFixed(2)}</span>
              </div>
              <div className="w-full bg-warm-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${qualityScores.emotional_depth * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-warm-700">Narrative Flow</span>
                <span className="text-sm text-warm-600">{qualityScores.narrative_flow.toFixed(2)}</span>
              </div>
              <div className="w-full bg-warm-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${qualityScores.narrative_flow * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h2 className="text-xl font-serif text-warm-900 mb-4">What would you like to do?</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleApprove}
              className="btn-primary w-full"
              disabled={submitting}
            >
              {submitting ? 'Approving...' : 'Approve Chapter'}
            </button>

            <div className="border-t border-warm-200 pt-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-warm-700 mb-2">
                Request Changes
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe what changes you'd like to see..."
                className="textarea mb-3"
                rows={4}
              />
              <button
                onClick={handleRequestChanges}
                className="btn-secondary w-full"
                disabled={submitting || !feedback.trim()}
              >
                {submitting ? 'Submitting...' : 'Request Changes'}
              </button>
            </div>

            <div className="border-t border-warm-200 pt-4">
              <button
                onClick={handleRegenerate}
                className="btn-secondary w-full"
                disabled={submitting}
              >
                {submitting ? 'Regenerating...' : 'Regenerate Chapter'}
              </button>
              <p className="text-sm text-warm-500 mt-2 text-center">
                Generate a new version using the same memories
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
