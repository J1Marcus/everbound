import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

type InputType = 'text' | 'voice' | 'photo'
type LifeStage = 'childhood' | 'teen' | 'young_adult' | 'adult' | 'senior'
type Confidence = 'low' | 'medium' | 'high'

export default function MemoryCapturePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [inputType] = useState<InputType>('text')
  const [content, setContent] = useState('')
  const [dateType, setDateType] = useState<'specific' | 'life_stage' | 'approximate'>('life_stage')
  const [specificDate, setSpecificDate] = useState({ month: '', day: '', year: '' })
  const [lifeStage, setLifeStage] = useState<LifeStage>('childhood')
  const [approximateDate, setApproximateDate] = useState('')
  const [confidence, setConfidence] = useState<Confidence>('medium')
  const [location, setLocation] = useState('')
  const [people, setPeople] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Please enter your memory')
      return
    }

    if (wordCount < 50) {
      setError('Please write at least 50 words to capture meaningful details')
      return
    }

    if (!user || !projectId) {
      setError('Invalid session or project')
      return
    }

    try {
      setLoading(true)

      // Build metadata object
      const metadata: any = {
        date_type: dateType,
        confidence,
        location: location.trim() || null,
        people: people.trim() || null
      }

      if (dateType === 'specific') {
        metadata.specific_date = {
          month: specificDate.month,
          day: specificDate.day,
          year: specificDate.year
        }
      } else if (dateType === 'life_stage') {
        metadata.life_stage = lifeStage
      } else if (dateType === 'approximate') {
        metadata.approximate_date = approximateDate
      }

      const { error: insertError } = await supabase
        .from('memory_fragments')
        .insert({
          project_id: projectId,
          narrator_id: user.id,
          input_type: inputType,
          raw_content: content.trim(),
          metadata,
          tags: [],
          status: 'raw'
        } as any)

      if (insertError) throw insertError

      // Navigate back to project memories page
      navigate(`/projects/${projectId}/memories`)
    } catch (err) {
      console.error('Error saving memory:', err)
      setError('Failed to save memory. Please try again.')
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
          <Link 
            to={`/projects/${projectId}/memories`} 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Memories
          </Link>
        </div>

        <div className="card">
          <h1 className="text-3xl font-serif text-warm-900 mb-6">Add Text Memory</h1>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-8">
            <h3 className="font-medium text-primary-900 mb-2">💡 Tips for great memories:</h3>
            <ul className="text-sm text-primary-800 space-y-1">
              <li>• Focus on a specific moment, not a general summary</li>
              <li>• Include what you saw, heard, smelled, felt</li>
              <li>• Keep it focused: 200-500 words</li>
              <li>• Don't worry about perfect writing—we'll help with that</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Memory Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-warm-700 mb-2">
                Your Memory
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="The summer I turned twelve, my grandfather taught me to fish at the old pond behind his barn. I can still smell the damp earth and hear the bullfrogs croaking in the reeds..."
                className="textarea"
                rows={10}
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-sm ${wordCount >= 50 ? 'text-green-600' : 'text-warm-500'}`}>
                  Word count: {wordCount} {wordCount >= 50 ? '✓' : `(${50 - wordCount} more needed)`}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-3">
                When did this happen?
              </label>
              
              <div className="space-y-3">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="dateType"
                    value="specific"
                    checked={dateType === 'specific'}
                    onChange={(e) => setDateType(e.target.value as any)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-warm-900 mb-2">Specific date</div>
                    {dateType === 'specific' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Month"
                          value={specificDate.month}
                          onChange={(e) => setSpecificDate({ ...specificDate, month: e.target.value })}
                          className="input flex-1"
                        />
                        <input
                          type="text"
                          placeholder="Day"
                          value={specificDate.day}
                          onChange={(e) => setSpecificDate({ ...specificDate, day: e.target.value })}
                          className="input flex-1"
                        />
                        <input
                          type="text"
                          placeholder="Year"
                          value={specificDate.year}
                          onChange={(e) => setSpecificDate({ ...specificDate, year: e.target.value })}
                          className="input flex-1"
                        />
                      </div>
                    )}
                  </div>
                </label>

                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="dateType"
                    value="life_stage"
                    checked={dateType === 'life_stage'}
                    onChange={(e) => setDateType(e.target.value as any)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-warm-900 mb-2">Life stage</div>
                    {dateType === 'life_stage' && (
                      <select
                        value={lifeStage}
                        onChange={(e) => setLifeStage(e.target.value as LifeStage)}
                        className="input"
                      >
                        <option value="childhood">Childhood (0-12)</option>
                        <option value="teen">Teen (13-19)</option>
                        <option value="young_adult">Young Adult (20-35)</option>
                        <option value="adult">Adult (36-65)</option>
                        <option value="senior">Senior (65+)</option>
                      </select>
                    )}
                  </div>
                </label>

                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="dateType"
                    value="approximate"
                    checked={dateType === 'approximate'}
                    onChange={(e) => setDateType(e.target.value as any)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-warm-900 mb-2">Approximate</div>
                    {dateType === 'approximate' && (
                      <input
                        type="text"
                        placeholder="Around 1965"
                        value={approximateDate}
                        onChange={(e) => setApproximateDate(e.target.value)}
                        className="input"
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Confidence Level */}
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-3">
                How confident are you about the timing?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="confidence"
                    value="low"
                    checked={confidence === 'low'}
                    onChange={(e) => setConfidence(e.target.value as Confidence)}
                    className="mr-2"
                  />
                  <span className="text-warm-700">Low</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="confidence"
                    value="medium"
                    checked={confidence === 'medium'}
                    onChange={(e) => setConfidence(e.target.value as Confidence)}
                    className="mr-2"
                  />
                  <span className="text-warm-700">Medium</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="confidence"
                    value="high"
                    checked={confidence === 'high'}
                    onChange={(e) => setConfidence(e.target.value as Confidence)}
                    className="mr-2"
                  />
                  <span className="text-warm-700">High</span>
                </label>
              </div>
            </div>

            {/* Optional Fields */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-warm-700 mb-2">
                Where did this happen? <span className="text-warm-500">(optional)</span>
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Grandpa's farm, rural Ohio"
                className="input"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="people" className="block text-sm font-medium text-warm-700 mb-2">
                Who was there? <span className="text-warm-500">(optional)</span>
              </label>
              <input
                id="people"
                type="text"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                placeholder="Grandfather"
                className="input"
                disabled={loading}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading || wordCount < 50}
              >
                {loading ? 'Saving...' : 'Save Memory'}
              </button>
              <Link 
                to={`/projects/${projectId}/memories`} 
                className="btn-secondary flex-1 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
