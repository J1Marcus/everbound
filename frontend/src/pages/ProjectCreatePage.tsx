import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Database } from '../types/database.types'

type BookType = 'individual_memoir' | 'family_memoir'
type TargetLength = 'short' | 'standard' | 'extended'
type Project = Database['public']['Tables']['projects']['Row']

export default function ProjectCreatePage() {
  const [bookType, setBookType] = useState<BookType>('individual_memoir')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetLength, setTargetLength] = useState<TargetLength>('standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const getLengthSpecs = (length: TargetLength) => {
    const specs = {
      short: { pages: 175, chapters: 15 },
      standard: { pages: 300, chapters: 20 },
      extended: { pages: 450, chapters: 30 }
    }
    return specs[length]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a title for your memoir')
      return
    }

    if (!user) {
      setError('You must be signed in to create a project')
      navigate('/signin')
      return
    }

    try {
      setLoading(true)
      const specs = getLengthSpecs(targetLength)

      const projectData = {
        owner_id: user.id,
        book_type: bookType,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        status: 'setup' as const,
        target_page_count: specs.pages,
        target_chapter_count: specs.chapters,
        trim_size: '7x10'
      }

      const { data, error: createError } = await supabase
        .from('projects')
        .insert(projectData as any)
        .select()
        .single()

      if (createError) throw createError

      if (data) {
        // Navigate to ghostwriter profile setup for the new project
        navigate(`/ghostwriter/profile-setup/${(data as Project).id}`)
      }
    } catch (err) {
      console.error('Error creating project:', err)
      setError('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="card">
          <h1 className="text-3xl font-serif text-warm-900 mb-2">Create Your Memoir</h1>
          <p className="text-warm-600 mb-8">
            Let's set up your memoir project. You can always change these settings later.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Book Type Selection */}
            <div>
              <label className="block text-lg font-medium text-warm-900 mb-4">
                What type of memoir would you like to create?
              </label>
              
              <div className="space-y-4">
                <label className={`card cursor-pointer transition-all ${
                  bookType === 'individual_memoir' 
                    ? 'ring-2 ring-primary-600 bg-primary-50' 
                    : 'hover:bg-warm-50'
                }`}>
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="bookType"
                      value="individual_memoir"
                      checked={bookType === 'individual_memoir'}
                      onChange={(e) => setBookType(e.target.value as BookType)}
                      className="mt-1 mr-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-warm-900 mb-2">
                        Individual Memoir (My Story)
                      </div>
                      <p className="text-sm text-warm-600 mb-2">
                        Your personal life story in your own voice
                      </p>
                      <ul className="text-sm text-warm-600 space-y-1">
                        <li>• Single narrator</li>
                        <li>• Family can provide feedback</li>
                        <li>• You maintain full authorship</li>
                      </ul>
                    </div>
                  </div>
                </label>

                <label className={`card cursor-pointer transition-all ${
                  bookType === 'family_memoir' 
                    ? 'ring-2 ring-primary-600 bg-primary-50' 
                    : 'hover:bg-warm-50'
                }`}>
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="bookType"
                      value="family_memoir"
                      checked={bookType === 'family_memoir'}
                      onChange={(e) => setBookType(e.target.value as BookType)}
                      className="mt-1 mr-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-warm-900 mb-2">
                        Family Memoir (Our Story)
                      </div>
                      <p className="text-sm text-warm-600 mb-2">
                        Shared family history from multiple perspectives
                      </p>
                      <ul className="text-sm text-warm-600 space-y-1">
                        <li>• Multiple co-narrators</li>
                        <li>• Each voice remains distinct</li>
                        <li>• Perspectives are preserved, not merged</li>
                      </ul>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-warm-900">Project Details</h3>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-warm-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Life Story"
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-warm-700 mb-2">
                  Subtitle <span className="text-warm-500">(optional)</span>
                </label>
                <input
                  id="subtitle"
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="A Journey Through Time"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-warm-700 mb-2">
                  Description <span className="text-warm-500">(optional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of what you'd like to capture in your memoir..."
                  className="textarea"
                  rows={4}
                />
                <p className="text-sm text-warm-500 mt-1">
                  This helps guide the memoir creation process
                </p>
              </div>
            </div>

            {/* Target Length */}
            <div>
              <label className="block text-lg font-medium text-warm-900 mb-4">
                Target Length
              </label>
              
              <div className="space-y-3">
                <label className={`card cursor-pointer transition-all ${
                  targetLength === 'short' 
                    ? 'ring-2 ring-primary-600 bg-primary-50' 
                    : 'hover:bg-warm-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="targetLength"
                        value="short"
                        checked={targetLength === 'short'}
                        onChange={(e) => setTargetLength(e.target.value as TargetLength)}
                        className="mr-4"
                      />
                      <div>
                        <div className="font-medium text-warm-900">Short</div>
                        <div className="text-sm text-warm-600">150-200 pages, ~15 chapters</div>
                      </div>
                    </div>
                  </div>
                </label>

                <label className={`card cursor-pointer transition-all ${
                  targetLength === 'standard' 
                    ? 'ring-2 ring-primary-600 bg-primary-50' 
                    : 'hover:bg-warm-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="targetLength"
                        value="standard"
                        checked={targetLength === 'standard'}
                        onChange={(e) => setTargetLength(e.target.value as TargetLength)}
                        className="mr-4"
                      />
                      <div>
                        <div className="font-medium text-warm-900">Standard</div>
                        <div className="text-sm text-warm-600">250-350 pages, ~20 chapters</div>
                      </div>
                    </div>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      Recommended
                    </span>
                  </div>
                </label>

                <label className={`card cursor-pointer transition-all ${
                  targetLength === 'extended' 
                    ? 'ring-2 ring-primary-600 bg-primary-50' 
                    : 'hover:bg-warm-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="targetLength"
                        value="extended"
                        checked={targetLength === 'extended'}
                        onChange={(e) => setTargetLength(e.target.value as TargetLength)}
                        className="mr-4"
                      />
                      <div>
                        <div className="font-medium text-warm-900">Extended</div>
                        <div className="text-sm text-warm-600">400-500 pages, ~30 chapters</div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Creating Project...' : 'Create Project'}
              </button>
              <Link to="/dashboard" className="btn-secondary flex-1 text-center">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
