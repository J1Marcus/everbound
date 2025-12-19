import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

type Step = 'writing' | 'voice'

export default function VoiceCalibrationPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [step, setStep] = useState<Step>('writing')
  const [writingSample, setWritingSample] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [hasRecording, setHasRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const wordCount = writingSample.trim().split(/\s+/).filter(Boolean).length
  const minWords = 500
  const maxWords = 1000

  const handleWritingSampleSubmit = async () => {
    setError('')

    if (wordCount < minWords) {
      setError(`Please write at least ${minWords} words`)
      return
    }

    if (!user || !projectId) {
      setError('Invalid session or project')
      return
    }

    try {
      setLoading(true)

      // Save writing sample to voice_profiles table
      const { error: insertError } = await supabase
        .from('voice_profiles')
        .insert({
          narrator_id: user.id,
          writing_sample: writingSample.trim(),
          characteristics: {},
          constraints: {}
        } as any)

      if (insertError) throw insertError

      // Move to voice recording step
      setStep('voice')
    } catch (err) {
      console.error('Error saving writing sample:', err)
      setError('Failed to save writing sample. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    setRecordingDuration(0)
    
    // Simulate recording duration counter
    const interval = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= 300) { // 5 minutes max
          clearInterval(interval)
          setIsRecording(false)
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setHasRecording(true)
  }

  const handleCompleteCalibration = async () => {
    setError('')

    if (!hasRecording && recordingDuration < 180) {
      setError('Please record at least 3 minutes')
      return
    }

    if (!user || !projectId) {
      setError('Invalid session or project')
      return
    }

    try {
      setLoading(true)

      // Update project status to collecting
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: 'collecting' } as any)
        .eq('id', projectId)

      if (updateError) throw updateError

      // Navigate to memory capture
      navigate(`/projects/${projectId}/memories`)
    } catch (err) {
      console.error('Error completing calibration:', err)
      setError('Failed to complete calibration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-serif text-warm-900">Voice Calibration</h1>
            <span className="text-warm-600">
              Step {step === 'writing' ? '1' : '2'} of 2
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {step === 'writing' ? (
            <>
              {/* Writing Sample Step */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                <h3 className="font-medium text-primary-900 mb-3">Why we need this:</h3>
                <p className="text-primary-800">
                  We'll analyze your natural writing style to ensure the book sounds like you—not 
                  like AI, not like a transcript, but like something you intentionally authored.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-serif text-warm-900 mb-4">Writing Sample</h2>
                <p className="text-warm-600 mb-4">
                  Write {minWords}-{maxWords} words about any topic in your natural style. 
                  Don't overthink it—just write like you normally would.
                </p>

                <div className="bg-warm-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-warm-700 mb-2">Suggestions:</p>
                  <ul className="text-sm text-warm-600 space-y-1">
                    <li>• Describe a typical day in your life</li>
                    <li>• Write about a place that's meaningful to you</li>
                    <li>• Share a lesson you've learned</li>
                    <li>• Tell a story from your past</li>
                  </ul>
                </div>

                <textarea
                  value={writingSample}
                  onChange={(e) => setWritingSample(e.target.value)}
                  placeholder="I grew up in a small town in Ohio, where everyone knew everyone else's business. My childhood was filled with simple pleasures—riding bikes until the streetlights came on, playing baseball in the empty lot behind the church, and spending summers at my grandparents' farm..."
                  className="textarea"
                  rows={15}
                  disabled={loading}
                />

                <div className="flex justify-between items-center mt-3">
                  <span className={`text-sm ${
                    wordCount >= minWords 
                      ? 'text-green-600' 
                      : 'text-warm-500'
                  }`}>
                    Word count: {wordCount} / {minWords} minimum {wordCount >= minWords && '✓'}
                  </span>
                  {wordCount > maxWords && (
                    <span className="text-sm text-amber-600">
                      Consider keeping it under {maxWords} words
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleWritingSampleSubmit}
                  className="btn-primary flex-1"
                  disabled={loading || wordCount < minWords}
                >
                  {loading ? 'Saving...' : 'Continue to Step 2'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Voice Recording Step */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                <h3 className="font-medium text-primary-900 mb-3">Now let's hear your voice:</h3>
                <p className="text-primary-800">
                  Record 3-5 minutes of yourself speaking naturally. This helps us capture your 
                  speech patterns, personality, and the way you naturally tell stories.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-serif text-warm-900 mb-4">Voice Recording</h2>
                <p className="text-warm-600 mb-4">
                  Talk about anything that comes to mind. Here are some ideas:
                </p>

                <div className="bg-warm-50 rounded-lg p-4 mb-6">
                  <ul className="text-sm text-warm-600 space-y-1">
                    <li>• Tell a story from your childhood</li>
                    <li>• Describe your family</li>
                    <li>• Talk about your career or a hobby</li>
                    <li>• Share a memory that makes you smile</li>
                  </ul>
                </div>

                {/* Recording Interface */}
                <div className="bg-warm-100 rounded-lg p-12 text-center mb-6">
                  <div className="text-6xl mb-6">
                    {isRecording ? '🔴' : '🎤'}
                  </div>
                  
                  <div className="text-2xl font-medium text-warm-900 mb-4">
                    {isRecording ? 'Recording...' : hasRecording ? 'Recording Complete' : 'Not Recording'}
                  </div>

                  <div className="text-xl text-warm-600 mb-6">
                    Duration: {formatDuration(recordingDuration)} / 3:00 minimum
                  </div>

                  {!isRecording && !hasRecording && (
                    <button
                      onClick={handleStartRecording}
                      className="btn-primary"
                    >
                      Start Recording
                    </button>
                  )}

                  {isRecording && (
                    <button
                      onClick={handleStopRecording}
                      className="btn-secondary"
                    >
                      Stop Recording
                    </button>
                  )}

                  {hasRecording && (
                    <button
                      onClick={() => {
                        setHasRecording(false)
                        setRecordingDuration(0)
                      }}
                      className="btn-secondary"
                    >
                      Record Again
                    </button>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  ℹ️ Your recording is private and will only be used to analyze your voice 
                  characteristics. It won't be shared or published.
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('writing')}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  ← Back to Step 1
                </button>
                <button
                  onClick={handleCompleteCalibration}
                  className="btn-primary flex-1"
                  disabled={loading || recordingDuration < 180}
                >
                  {loading ? 'Completing...' : 'Complete Calibration'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
