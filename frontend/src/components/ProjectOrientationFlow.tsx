import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database.types'

type Project = Database['public']['Tables']['projects']['Row']

// Orientation data types
type Audience = 'children' | 'grandchildren' | 'extended_family' | 'specific_person' | 'future_readers'
type OpennessLevel = 'family_safe' | 'honest_thoughtful' | 'fully_open'
type SensitiveTopic = 'relationships_outside_marriage' | 'loss_grief' | 'illness_disability' | 'family_conflict' | 'mental_health' | 'other_difficult'
type TopicHandling = 'include_fully' | 'include_gently' | 'keep_private'
type AuthorshipType = 'solo' | 'collaborative'

interface Collaborator {
  name: string
  relationship: string
}

interface OrientationData {
  // Step 2: Authorship
  authorshipType: AuthorshipType
  collaborators: Collaborator[] // Co-authors with their relationships
  
  // Step 3: Audience
  audiences: Audience[]
  
  // Step 4: Openness
  opennessLevel: OpennessLevel
  
  // Step 5: Sensitive topics
  sensitiveTopics: Record<SensitiveTopic, TopicHandling | null>
  
  // Step 6: Reader's takeaway
  readerTakeaway: string
  
  // Basic project info (collected at end)
  title: string
  subtitle: string
}

interface ProjectOrientationFlowProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProjectOrientationFlow({ isOpen, onClose }: ProjectOrientationFlowProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestingTitle, setSuggestingTitle] = useState(false)
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [orientationData, setOrientationData] = useState<OrientationData>({
    authorshipType: 'solo',
    collaborators: [],
    audiences: [],
    opennessLevel: 'honest_thoughtful',
    sensitiveTopics: {
      relationships_outside_marriage: null,
      loss_grief: null,
      illness_disability: null,
      family_conflict: null,
      mental_health: null,
      other_difficult: null
    },
    readerTakeaway: '',
    title: '',
    subtitle: ''
  })

  const handleSuggestTitle = async () => {
    if (!orientationData.readerTakeaway.trim()) {
      setError('Please complete step 5 (Reader Takeaway) first to get personalized title suggestions')
      return
    }

    setSuggestingTitle(true)
    setError('')
    setTitleSuggestions([]) // Clear previous suggestions to show loading state

    try {
      // Call Supabase Edge Function for AI-powered title suggestions
      const { data, error: functionError } = await supabase.functions.invoke('suggest-memoir-title', {
        body: {
          readerTakeaway: orientationData.readerTakeaway,
          audiences: orientationData.audiences,
          opennessLevel: orientationData.opennessLevel
        }
      })

      if (functionError) {
        console.error('Function error:', functionError)
        throw new Error('Failed to generate suggestions')
      }

      if (data && data.suggestions && Array.isArray(data.suggestions)) {
        setTitleSuggestions(data.suggestions)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error suggesting title:', err)
      
      // Fallback to local generation if API fails
      console.log('Falling back to local title generation')
      const takeaway = orientationData.readerTakeaway.trim()
      const words = takeaway.toLowerCase().split(/\s+/)
      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'that', 'this', 'they', 'i', 'my', 'me'])
      const meaningfulWords = words.filter(w => w.length > 3 && !stopWords.has(w))
      
      const templates = [
        `A Life of ${meaningfulWords.slice(0, 2).join(' and ').charAt(0).toUpperCase() + meaningfulWords.slice(0, 2).join(' and ').slice(1)}`,
        `My Journey Through ${meaningfulWords.slice(0, 2).join(' and ').charAt(0).toUpperCase() + meaningfulWords.slice(0, 2).join(' and ').slice(1)}`,
        `Reflections on ${meaningfulWords[0]?.charAt(0).toUpperCase() + meaningfulWords[0]?.slice(1)}`
      ]
      
      const validSuggestions = templates.filter(s => s && !s.includes('undefined') && s.split(' ').length >= 2)
      
      setTitleSuggestions(validSuggestions.length > 0 ? validSuggestions : [
        'My Life Story',
        'A Journey Worth Sharing',
        'Memories for Tomorrow'
      ])
    } finally {
      setSuggestingTitle(false)
    }
  }

  const selectTitleSuggestion = (suggestion: string) => {
    setOrientationData(prev => ({ ...prev, title: suggestion }))
    setTitleSuggestions([]) // Clear suggestions after selection
  }

  const totalSteps = 7 // 1 intro + 1 authorship + 4 orientation steps + 1 basic info step

  // Step 2: Authorship
  const setAuthorshipType = (type: AuthorshipType) => {
    setOrientationData(prev => ({
      ...prev,
      authorshipType: type,
      // Clear collaborators if switching to solo
      collaborators: type === 'solo' ? [] : prev.collaborators
    }))
  }

  const addCollaborator = (name: string, relationship: string) => {
    if (name.trim() && relationship.trim()) {
      setOrientationData(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, { name: name.trim(), relationship: relationship.trim() }]
      }))
    }
  }

  const removeCollaborator = (index: number) => {
    setOrientationData(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index)
    }))
  }

  // Step 3: Audience Selection
  const toggleAudience = (audience: Audience) => {
    setOrientationData(prev => ({
      ...prev,
      audiences: prev.audiences.includes(audience)
        ? prev.audiences.filter(a => a !== audience)
        : [...prev.audiences, audience]
    }))
  }

  // Step 4: Openness Level
  const setOpennessLevel = (level: OpennessLevel) => {
    setOrientationData(prev => ({ ...prev, opennessLevel: level }))
  }

  // Step 5: Sensitive Topics
  const toggleSensitiveTopic = (topic: SensitiveTopic) => {
    setOrientationData(prev => ({
      ...prev,
      sensitiveTopics: {
        ...prev.sensitiveTopics,
        [topic]: prev.sensitiveTopics[topic] === null ? 'include_gently' : null
      }
    }))
  }

  const setTopicHandling = (topic: SensitiveTopic, handling: TopicHandling) => {
    setOrientationData(prev => ({
      ...prev,
      sensitiveTopics: {
        ...prev.sensitiveTopics,
        [topic]: handling
      }
    }))
  }

  const handleNext = () => {
    // Validation for each step
    if (step === 2 && orientationData.authorshipType === 'collaborative' && orientationData.collaborators.length === 0) {
      setError('Please add at least one collaborator or select "Solo authorship"')
      return
    }
    if (step === 3 && orientationData.audiences.length === 0) {
      setError('Please select at least one audience')
      return
    }
    if (step === 6 && !orientationData.readerTakeaway.trim()) {
      setError('Please share what you hope readers will understand')
      return
    }
    // Note: Title is now optional on step 7 - users can decide later

    setError('')
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    setError('')
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be signed in to create a project')
      navigate('/signin')
      return
    }

    try {
      setLoading(true)

      // Use provided title or generate a temporary one
      const projectTitle = orientationData.title.trim() || 'My Life Story'

      const projectData = {
        owner_id: user.id,
        book_type: 'individual_memoir' as const,
        title: projectTitle,
        subtitle: orientationData.subtitle.trim() || null,
        status: 'setup' as const,
        target_page_count: 300,
        target_chapter_count: 20,
        trim_size: '7x10',
        // Store orientation data in metadata
        metadata: {
          orientation: {
            authorshipType: orientationData.authorshipType,
            collaborators: orientationData.collaborators,
            audiences: orientationData.audiences,
            opennessLevel: orientationData.opennessLevel,
            sensitiveTopics: orientationData.sensitiveTopics,
            readerTakeaway: orientationData.readerTakeaway
          }
        }
      }

      const { data, error: createError } = await supabase
        .from('projects')
        .insert(projectData as any)
        .select()
        .single()

      if (createError) {
        console.warn('Backend not available, using mock project ID')
        const mockProjectId = `demo-project-${Date.now()}`
        navigate(`/ghostwriter/profile-setup/${mockProjectId}`)
        return
      }

      if (data) {
        navigate(`/ghostwriter/profile-setup/${(data as Project).id}`)
      }
    } catch (err) {
      console.error('Error creating project:', err)
      const mockProjectId = `demo-project-${Date.now()}`
      navigate(`/ghostwriter/profile-setup/${mockProjectId}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(43, 40, 38, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-lg)'
      }}
      onClick={onClose}
    >
      <div 
        className="card"
        style={{
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-paper)',
          boxShadow: 'var(--shadow-xl)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--space-lg)'
        }}>
          <div>
            <h2 style={{
              fontSize: 'var(--text-h1)',
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-ink)',
              marginBottom: 'var(--space-xs)'
            }}>
              {step === 1 && "Let's talk about what kind of book you want to create"}
              {step === 2 && "Who is writing this book?"}
              {step === 3 && "Who is this book for?"}
              {step === 4 && "How open do you want to be?"}
              {step === 5 && "Topics that deserve extra care"}
              {step === 6 && "What do you hope readers will take away?"}
              {step === 7 && "Understanding the process"}
            </h2>
            <p style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-slate)',
              marginTop: 'var(--space-xs)'
            }}>
              Step {step} of {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--color-slate)',
              padding: 'var(--space-sm)'
            }}
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '4px',
          backgroundColor: 'var(--color-stone)',
          borderRadius: '2px',
          marginBottom: 'var(--space-xl)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: 'var(--color-amber)',
            width: `${(step / totalSteps) * 100}%`,
            transition: 'width var(--transition-normal)'
          }} />
        </div>

        {error && (
          <div className="message message-error" style={{ marginBottom: 'var(--space-lg)' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div className="message-text">{error}</div>
          </div>
        )}

        {/* Step Content */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          {step === 1 && <IntroStep />}
          {step === 2 && (
            <AuthorshipStep
              authorshipType={orientationData.authorshipType}
              collaborators={orientationData.collaborators}
              onSetAuthorshipType={setAuthorshipType}
              onAddCollaborator={addCollaborator}
              onRemoveCollaborator={removeCollaborator}
            />
          )}
          {step === 3 && (
            <AudienceStep
              audiences={orientationData.audiences}
              onToggle={toggleAudience}
            />
          )}
          {step === 4 && (
            <OpennessStep
              level={orientationData.opennessLevel}
              onSelect={setOpennessLevel}
            />
          )}
          {step === 5 && (
            <SensitiveTopicsStep
              topics={orientationData.sensitiveTopics}
              onToggle={toggleSensitiveTopic}
              onSetHandling={setTopicHandling}
            />
          )}
          {step === 6 && (
            <ReaderTakeawayStep
              value={orientationData.readerTakeaway}
              onChange={(value) => setOrientationData(prev => ({ ...prev, readerTakeaway: value }))}
            />
          )}
          {step === 7 && (
            <ProcessExplanationStep
              title={orientationData.title}
              subtitle={orientationData.subtitle}
              onTitleChange={(value) => setOrientationData(prev => ({ ...prev, title: value }))}
              onSubtitleChange={(value) => setOrientationData(prev => ({ ...prev, subtitle: value }))}
              onSuggestTitle={handleSuggestTitle}
              suggestingTitle={suggestingTitle}
              titleSuggestions={titleSuggestions}
              onSelectSuggestion={selectTitleSuggestion}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: 'var(--space-md)', 
          paddingTop: 'var(--space-md)',
          borderTop: '1px solid var(--color-stone)'
        }}>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-secondary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary"
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? 'Creating...' : step === totalSteps ? 'Begin Your Story' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Step 1: Introduction
function IntroStep() {
  return (
    <div style={{ fontSize: 'var(--text-body)', lineHeight: '1.7', color: 'var(--color-ink)' }}>
      <p style={{ marginBottom: 'var(--space-lg)' }}>
        Before we begin, let's have a quiet conversation about the kind of book you want to create.
      </p>
      <p style={{ marginBottom: 'var(--space-lg)' }}>
        This isn't setup or configuration — it's about understanding your intentions, protecting what matters to you, and ensuring this memoir becomes exactly what you hope it will be.
      </p>
      <p style={{ color: 'var(--color-slate)' }}>
        We'll ask a few thoughtful questions to guide us. You can change any of these choices at any time.
      </p>
    </div>
  )
}

// Step 2: Authorship
interface AuthorshipStepProps {
  authorshipType: AuthorshipType
  collaborators: Collaborator[]
  onSetAuthorshipType: (type: AuthorshipType) => void
  onAddCollaborator: (name: string, relationship: string) => void
  onRemoveCollaborator: (index: number) => void
}

function AuthorshipStep({
  authorshipType,
  collaborators,
  onSetAuthorshipType,
  onAddCollaborator,
  onRemoveCollaborator
}: AuthorshipStepProps) {
  const [newCollaboratorName, setNewCollaboratorName] = useState('')
  const [newCollaboratorRelationship, setNewCollaboratorRelationship] = useState('')

  const handleAddCollaborator = () => {
    if (newCollaboratorName.trim() && newCollaboratorRelationship.trim()) {
      onAddCollaborator(newCollaboratorName, newCollaboratorRelationship)
      setNewCollaboratorName('')
      setNewCollaboratorRelationship('')
    }
  }

  return (
    <div>
      <p style={{
        fontSize: 'var(--text-body)',
        color: 'var(--color-ink)',
        marginBottom: 'var(--space-lg)',
        lineHeight: '1.7'
      }}>
        Are you writing this memoir on your own, or will others be contributing their memories and perspectives?
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <label style={{
          padding: 'var(--space-lg)',
          border: `2px solid ${authorshipType === 'solo' ? 'var(--color-amber)' : 'var(--color-stone)'}`,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          backgroundColor: authorshipType === 'solo' ? 'rgba(193, 122, 58, 0.05)' : 'transparent',
          transition: 'all var(--transition-fast)'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-md)' }}>
            <input
              type="radio"
              name="authorship"
              value="solo"
              checked={authorshipType === 'solo'}
              onChange={() => onSetAuthorshipType('solo')}
              style={{ marginTop: '2px', cursor: 'pointer' }}
            />
            <div>
              <div style={{
                fontWeight: 'var(--font-medium)',
                marginBottom: 'var(--space-xs)',
                fontSize: 'var(--text-body)'
              }}>
                Solo authorship
              </div>
              <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>
                This is my story, told in my voice
              </div>
            </div>
          </div>
        </label>

        <label style={{
          padding: 'var(--space-lg)',
          border: `2px solid ${authorshipType === 'collaborative' ? 'var(--color-amber)' : 'var(--color-stone)'}`,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          backgroundColor: authorshipType === 'collaborative' ? 'rgba(193, 122, 58, 0.05)' : 'transparent',
          transition: 'all var(--transition-fast)'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-md)' }}>
            <input
              type="radio"
              name="authorship"
              value="collaborative"
              checked={authorshipType === 'collaborative'}
              onChange={() => onSetAuthorshipType('collaborative')}
              style={{ marginTop: '2px', cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 'var(--font-medium)',
                marginBottom: 'var(--space-xs)',
                fontSize: 'var(--text-body)'
              }}>
                Collaborative memoir
              </div>
              <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)', marginBottom: 'var(--space-md)' }}>
                Multiple voices contributing memories and perspectives
              </div>

              {authorshipType === 'collaborative' && (
                <div style={{ marginTop: 'var(--space-md)' }}>
                  <label style={{
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-ink)',
                    display: 'block',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    Co-authors
                  </label>
                  
                  {/* List of collaborators */}
                  {collaborators.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-sm)',
                      marginBottom: 'var(--space-md)'
                    }}>
                      {collaborators.map((collaborator, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-sm) var(--space-md)',
                          backgroundColor: 'var(--color-paper)',
                          border: '1px solid var(--color-stone)',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-ink)', fontWeight: 'var(--font-medium)' }}>
                              {collaborator.name}
                            </div>
                            <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)', marginTop: '2px' }}>
                              {collaborator.relationship}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              onRemoveCollaborator(index)
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-error)',
                              cursor: 'pointer',
                              fontSize: 'var(--text-body)',
                              padding: 'var(--space-xs)'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add collaborator inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <input
                      type="text"
                      value={newCollaboratorName}
                      onChange={(e) => setNewCollaboratorName(e.target.value)}
                      placeholder="Name"
                      className="input"
                      style={{ fontSize: 'var(--text-body-sm)' }}
                    />
                    <input
                      type="text"
                      value={newCollaboratorRelationship}
                      onChange={(e) => setNewCollaboratorRelationship(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCollaborator()
                        }
                      }}
                      placeholder="Relationship (e.g., spouse, daughter, brother)"
                      className="input"
                      style={{ fontSize: 'var(--text-body-sm)' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCollaborator}
                      className="btn btn-secondary"
                      style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        fontSize: 'var(--text-body-sm)'
                      }}
                    >
                      Add Co-Author
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </label>
      </div>

      <p style={{
        fontSize: 'var(--text-body-sm)',
        color: 'var(--color-slate)',
        fontStyle: 'italic',
        padding: 'var(--space-md)',
        backgroundColor: 'rgba(193, 122, 58, 0.05)',
        borderRadius: 'var(--radius-sm)'
      }}>
        Collaborative everbound allow family members or friends to contribute their own memories and perspectives, creating a richer, multi-voiced narrative.
      </p>
    </div>
  )
}

// Step 3: Audience Selection
interface AudienceStepProps {
  audiences: Audience[]
  onToggle: (audience: Audience) => void
}

function AudienceStep({ audiences, onToggle }: AudienceStepProps) {
  const audienceOptions: { value: Audience; label: string }[] = [
    { value: 'children', label: 'My children' },
    { value: 'grandchildren', label: 'My grandchildren' },
    { value: 'extended_family', label: 'Extended family' },
    { value: 'specific_person', label: 'One specific person' },
    { value: 'future_readers', label: 'Anyone in the future who wants to know me' }
  ]

  return (
    <div>
      <p style={{ 
        fontSize: 'var(--text-body)', 
        color: 'var(--color-ink)', 
        marginBottom: 'var(--space-lg)',
        lineHeight: '1.7'
      }}>
        Before we begin, let's talk about who you imagine reading this book.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        {audienceOptions.map(option => (
          <label key={option.value} style={{
            padding: 'var(--space-md)',
            border: `2px solid ${audiences.includes(option.value) ? 'var(--color-amber)' : 'var(--color-stone)'}`,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            backgroundColor: audiences.includes(option.value) ? 'rgba(193, 122, 58, 0.05)' : 'transparent',
            transition: 'all var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)'
          }}>
            <input
              type="checkbox"
              checked={audiences.includes(option.value)}
              onChange={() => onToggle(option.value)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink)' }}>
              {option.label}
            </span>
          </label>
        ))}
      </div>

      <p style={{ 
        fontSize: 'var(--text-body-sm)', 
        color: 'var(--color-slate)',
        fontStyle: 'italic',
        padding: 'var(--space-md)',
        backgroundColor: 'rgba(193, 122, 58, 0.05)',
        borderRadius: 'var(--radius-sm)'
      }}>
        This helps us guide the tone and topics of your story.
      </p>
    </div>
  )
}

// Step 3: Openness Level
interface OpennessStepProps {
  level: OpennessLevel
  onSelect: (level: OpennessLevel) => void
}

function OpennessStep({ level, onSelect }: OpennessStepProps) {
  const levels: { value: OpennessLevel; label: string; description: string }[] = [
    {
      value: 'family_safe',
      label: 'Family-safe',
      description: 'Appropriate for all ages. Some topics are summarized gently or omitted.'
    },
    {
      value: 'honest_thoughtful',
      label: 'Honest but thoughtful',
      description: 'Life is shared truthfully, with care for the reader.'
    },
    {
      value: 'fully_open',
      label: 'Fully open',
      description: 'Nothing is off-limits. This book is an honest record.'
    }
  ]

  return (
    <div>
      <p style={{ 
        fontSize: 'var(--text-body)', 
        color: 'var(--color-ink)', 
        marginBottom: 'var(--space-md)',
        lineHeight: '1.7'
      }}>
        Every life has private moments. You're always in control of what's included.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        {levels.map(option => (
          <label key={option.value} style={{
            padding: 'var(--space-lg)',
            border: `2px solid ${level === option.value ? 'var(--color-amber)' : 'var(--color-stone)'}`,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            backgroundColor: level === option.value ? 'rgba(193, 122, 58, 0.05)' : 'transparent',
            transition: 'all var(--transition-fast)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-md)' }}>
              <input
                type="radio"
                name="openness"
                value={option.value}
                checked={level === option.value}
                onChange={() => onSelect(option.value)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ 
                  fontWeight: 'var(--font-medium)', 
                  marginBottom: 'var(--space-xs)',
                  fontSize: 'var(--text-body)'
                }}>
                  {option.label}
                </div>
                <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>
                  {option.description}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>

      <p style={{ 
        fontSize: 'var(--text-body-sm)', 
        color: 'var(--color-slate)',
        fontStyle: 'italic',
        padding: 'var(--space-md)',
        backgroundColor: 'rgba(193, 122, 58, 0.05)',
        borderRadius: 'var(--radius-sm)'
      }}>
        You can change this at any time.
      </p>
    </div>
  )
}

// Step 4: Sensitive Topics
interface SensitiveTopicsStepProps {
  topics: Record<SensitiveTopic, TopicHandling | null>
  onToggle: (topic: SensitiveTopic) => void
  onSetHandling: (topic: SensitiveTopic, handling: TopicHandling) => void
}

function SensitiveTopicsStep({ topics, onToggle, onSetHandling }: SensitiveTopicsStepProps) {
  const topicOptions: { value: SensitiveTopic; label: string }[] = [
    { value: 'relationships_outside_marriage', label: 'Relationships outside of marriage' },
    { value: 'loss_grief', label: 'Loss or grief' },
    { value: 'illness_disability', label: 'Illness or disability' },
    { value: 'family_conflict', label: 'Conflict with family' },
    { value: 'mental_health', label: 'Mental health struggles' },
    { value: 'other_difficult', label: 'Other difficult experiences' }
  ]

  const handlingOptions: { value: TopicHandling; label: string }[] = [
    { value: 'include_fully', label: 'Include fully' },
    { value: 'include_gently', label: 'Include gently' },
    { value: 'keep_private', label: 'Keep private (not in the book)' }
  ]

  return (
    <div>
      <p style={{ 
        fontSize: 'var(--text-body)', 
        color: 'var(--color-ink)', 
        marginBottom: 'var(--space-lg)',
        lineHeight: '1.7'
      }}>
        Some topics deserve extra care. Let us know how you'd like them treated.
      </p>
      
      <p style={{ 
        fontSize: 'var(--text-body-sm)', 
        color: 'var(--color-slate)',
        marginBottom: 'var(--space-lg)',
        fontStyle: 'italic'
      }}>
        All topics are optional. Select only those you want to specify handling for.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {topicOptions.map(option => (
          <div key={option.value} style={{
            padding: 'var(--space-md)',
            border: `2px solid ${topics[option.value] !== null ? 'var(--color-amber)' : 'var(--color-stone)'}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: topics[option.value] !== null ? 'rgba(193, 122, 58, 0.05)' : 'transparent',
            transition: 'all var(--transition-fast)'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              cursor: 'pointer',
              marginBottom: topics[option.value] !== null ? 'var(--space-md)' : 0
            }}>
              <input
                type="checkbox"
                checked={topics[option.value] !== null}
                onChange={() => onToggle(option.value)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink)' }}>
                {option.label}
              </span>
            </label>

            {topics[option.value] !== null && (
              <div style={{ 
                marginLeft: '34px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-sm)'
              }}>
                {handlingOptions.map(handling => (
                  <label key={handling.value} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-body-sm)'
                  }}>
                    <input
                      type="radio"
                      name={`handling-${option.value}`}
                      value={handling.value}
                      checked={topics[option.value] === handling.value}
                      onChange={() => onSetHandling(option.value, handling.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ color: 'var(--color-slate)' }}>
                      {handling.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Step 5: Reader Takeaway
interface ReaderTakeawayStepProps {
  value: string
  onChange: (value: string) => void
}

function ReaderTakeawayStep({ value, onChange }: ReaderTakeawayStepProps) {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  // Initialize speech recognition on mount
  useState(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          onChange(value + finalTranscript)
        }
      }

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  })

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('Voice input is not supported in your browser. Please try Chrome or Safari.')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  return (
    <div>
      <p style={{
        fontSize: 'var(--text-body)',
        color: 'var(--color-ink)',
        marginBottom: 'var(--space-lg)',
        lineHeight: '1.7'
      }}>
        When someone finishes this book, what do you hope they understand about you?
      </p>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share what matters most to you..."
        className="input"
        rows={6}
        style={{
          width: '100%',
          resize: 'vertical',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-body)',
          lineHeight: '1.6',
          marginBottom: 'var(--space-md)'
        }}
      />

      {/* Voice Input Button */}
      <button
        type="button"
        onClick={toggleVoiceInput}
        style={{
          width: '100%',
          padding: 'var(--space-lg)',
          backgroundColor: isListening ? 'var(--color-error)' : 'var(--color-amber)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-body)',
          fontWeight: 'var(--font-medium)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-md)',
          transition: 'all var(--transition-fast)',
          boxShadow: 'var(--shadow-md)'
        }}
        onMouseEnter={(e) => {
          if (!isListening) {
            e.currentTarget.style.backgroundColor = 'var(--color-amber-dark)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isListening) {
            e.currentTarget.style.backgroundColor = 'var(--color-amber)'
          }
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>
          {isListening ? '⏹️' : '🎤'}
        </span>
        <span>
          {isListening ? 'Stop Recording' : 'Speak Your Answer'}
        </span>
      </button>

      {isListening && (
        <p style={{
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-error)',
          marginTop: 'var(--space-sm)',
          textAlign: 'center',
          fontWeight: 'var(--font-medium)'
        }}>
          🔴 Listening... Speak now
        </p>
      )}

      <p style={{
        fontSize: 'var(--text-body-sm)',
        color: 'var(--color-slate)',
        marginTop: 'var(--space-md)',
        fontStyle: 'italic'
      }}>
        This becomes your emotional compass — guiding the tone and focus of your story.
      </p>
    </div>
  )
}

// Step 6: Process Explanation + Basic Info
interface ProcessExplanationStepProps {
  title: string
  subtitle: string
  onTitleChange: (value: string) => void
  onSubtitleChange: (value: string) => void
  onSuggestTitle: () => void
  suggestingTitle: boolean
  titleSuggestions: string[]
  onSelectSuggestion: (suggestion: string) => void
}

function ProcessExplanationStep({
  title,
  subtitle,
  onTitleChange,
  onSubtitleChange,
  onSuggestTitle,
  suggestingTitle,
  titleSuggestions,
  onSelectSuggestion
}: ProcessExplanationStepProps) {
  return (
    <div>
      <div style={{
        padding: 'var(--space-lg)',
        backgroundColor: 'rgba(193, 122, 58, 0.05)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-xl)',
        borderLeft: '4px solid var(--color-amber)'
      }}>
        <h3 style={{
          fontSize: 'var(--text-body)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-ink)',
          marginBottom: 'var(--space-md)'
        }}>
          How this works
        </h3>
        <div style={{ 
          fontSize: 'var(--text-body-sm)', 
          color: 'var(--color-slate)',
          lineHeight: '1.7',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)'
        }}>
          <p>
            We'll guide you through your life in stages — beginning with where you came from, and gradually moving forward.
          </p>
          <p>
            You won't be asked to write chapters or long essays. Instead, we'll ask thoughtful questions, one at a time.
          </p>
          <p>
            As you share memories, we carefully shape them into chapters. You'll always be able to review, revise, or remove anything.
          </p>
          <p style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-ink)' }}>
            This is your story. We're here to help you tell it.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
            <label htmlFor="title" className="input-label" style={{ marginBottom: 0 }}>
              What would you like to call your memoir? <span style={{ color: 'var(--color-slate)', fontWeight: 'var(--font-regular)' }}>(optional)</span>
            </label>
            <button
              type="button"
              onClick={onSuggestTitle}
              disabled={suggestingTitle}
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-amber)',
                background: 'none',
                border: 'none',
                cursor: suggestingTitle ? 'wait' : 'pointer',
                padding: 'var(--space-xs)',
                textDecoration: 'underline',
                fontWeight: 'var(--font-medium)'
              }}
            >
              {suggestingTitle ? '✨ Suggesting...' : '✨ Suggest titles'}
            </button>
          </div>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="My Life Story"
            className="input"
          />
          
          {/* Display title suggestions */}
          {titleSuggestions.length > 0 && (
            <div style={{
              marginTop: 'var(--space-md)',
              padding: 'var(--space-md)',
              backgroundColor: 'rgba(193, 122, 58, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-stone)'
            }}>
              <p style={{
                fontSize: 'var(--text-body-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-ink)',
                marginBottom: 'var(--space-sm)'
              }}>
                Suggested titles (click to use):
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {titleSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onSelectSuggestion(suggestion)}
                    style={{
                      padding: 'var(--space-sm) var(--space-md)',
                      backgroundColor: 'var(--color-paper)',
                      border: '2px solid var(--color-stone)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-ink)',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-amber)'
                      e.currentTarget.style.backgroundColor = 'rgba(193, 122, 58, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-stone)'
                      e.currentTarget.style.backgroundColor = 'var(--color-paper)'
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <p style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-slate)',
            marginTop: 'var(--space-sm)',
            fontStyle: 'italic'
          }}>
            Don't worry — you can change this anytime, decide later, or use the button above for AI suggestions.
          </p>
        </div>

        <div>
          <label htmlFor="subtitle" className="input-label">
            Subtitle <span style={{ color: 'var(--color-slate)', fontWeight: 'var(--font-regular)' }}>(optional)</span>
          </label>
          <input
            id="subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            placeholder="A Journey Through Time"
            className="input"
          />
        </div>
      </div>
    </div>
  )
}
