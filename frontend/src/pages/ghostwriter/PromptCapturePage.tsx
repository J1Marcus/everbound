/**
 * PromptCapturePage
 * Memory capture interface for a specific section
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Container, Button } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { ScenePrompt } from '../../components/ghostwriter/ScenePrompt'
import { PromptList } from '../../components/ghostwriter/PromptList'
import { ConversationalPrompt } from '../../components/ghostwriter/ConversationalPrompt'
import { PromptModeSelector } from '../../components/ghostwriter/PromptModeSelector'
import type { PromptMode } from '../../components/ghostwriter/PromptModeSelector'
import { getSectionPrompts } from '../../lib/api/ghostwriter'
import { useGhostwriterStore } from '../../stores/ghostwriterStore'
import LoadingSpinner from '../../components/LoadingSpinner'

export const PromptCapturePage: React.FC = () => {
  const { sectionId, promptId } = useParams<{ sectionId: string; promptId?: string }>()
  const navigate = useNavigate()
  const { setCurrentSection, setCurrentPrompt } = useGhostwriterStore()

  const [loading, setLoading] = useState(true)
  const [prompts, setPrompts] = useState<any[]>([])
  const [sectionTitle, setSectionTitle] = useState<string>('Section')
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [showPromptList, setShowPromptList] = useState(!promptId)
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [selectedMode, setSelectedMode] = useState<PromptMode | null>(null)

  useEffect(() => {
    if (!sectionId) {
      navigate('/dashboard')
      return
    }

    setCurrentSection(sectionId)
    loadPrompts()
  }, [sectionId])

  useEffect(() => {
    if (promptId && prompts.length > 0) {
      const index = prompts.findIndex((p) => p.id === promptId)
      if (index !== -1) {
        setCurrentPromptIndex(index)
        setShowPromptList(false)
      }
    }
  }, [promptId, prompts])

  const loadPrompts = async () => {
    if (!sectionId) return

    setLoading(true)
    try {
      const promptsData = await getSectionPrompts(sectionId)
      setPrompts(promptsData)
      
      // Extract section title from first prompt if available
      if (promptsData.length > 0 && promptsData[0].sectionTitle) {
        setSectionTitle(promptsData[0].sectionTitle)
      } else {
        // Try to derive from sectionId (e.g., "project-123-section-1" -> "Early Childhood")
        const sectionTitles: Record<string, string> = {
          'section-1': 'Early Childhood',
          'section-2': 'School Years',
          'section-3': 'Teenage Years & Coming of Age',
          'section-4': 'Early Adulthood',
          'section-5': 'Career & Work Life',
          'section-6': 'Love & Relationships',
          'section-7': 'Family Life',
          'section-8': 'Middle Years & Growth',
          'section-9': 'Later Life & Wisdom',
          'section-10': 'Reflections & Legacy',
        }
        
        // Extract section number from sectionId
        const match = sectionId.match(/section-(\d+)/)
        if (match) {
          const key = `section-${match[1]}`
          setSectionTitle(sectionTitles[key] || 'Section')
        }
      }
    } catch (error) {
      console.error('Failed to load prompts:', error)
      // Still try to set section title from sectionId
      const match = sectionId.match(/section-(\d+)/)
      if (match) {
        const sectionTitles: Record<string, string> = {
          'section-1': 'Early Childhood',
          'section-2': 'School Years',
          'section-3': 'Teenage Years & Coming of Age',
          'section-4': 'Early Adulthood',
          'section-5': 'Career & Work Life',
          'section-6': 'Love & Relationships',
          'section-7': 'Family Life',
          'section-8': 'Middle Years & Growth',
          'section-9': 'Later Life & Wisdom',
          'section-10': 'Reflections & Legacy',
        }
        const key = `section-${match[1]}`
        setSectionTitle(sectionTitles[key] || 'Section')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePromptClick = (promptId: string) => {
    const index = prompts.findIndex((p) => p.id === promptId)
    if (index !== -1) {
      setCurrentPromptIndex(index)
      setCurrentPrompt(promptId)
      setShowPromptList(false)
      setShowModeSelector(true)
      navigate(`/ghostwriter/section/${sectionId}/prompt/${promptId}`)
    }
  }

  const handleModeSelect = (mode: PromptMode) => {
    setSelectedMode(mode)
    setShowModeSelector(false)
  }

  const handleBackToModeSelector = () => {
    setSelectedMode(null)
    setShowModeSelector(true)
  }

  const handleConversationalComplete = (transcript: string) => {
    handleSaveMemory(transcript, false)
    setSelectedMode(null)
    setShowModeSelector(false)
    // Optionally move to next prompt or back to list
    if (currentPromptIndex < prompts.length - 1) {
      handleNext()
    } else {
      handleBackToList()
    }
  }

  const handleSaveMemory = async (response: string, isDraft: boolean) => {
    // TODO: Implement save to backend
    console.log('Saving memory:', { response, isDraft })
    
    // For now, just mark as completed
    const updatedPrompts = [...prompts]
    updatedPrompts[currentPromptIndex] = {
      ...updatedPrompts[currentPromptIndex],
      completed: !isDraft,
      response,
      wordCount: response.trim().split(/\s+/).length,
    }
    setPrompts(updatedPrompts)
  }

  const handleNext = () => {
    if (currentPromptIndex < prompts.length - 1) {
      const nextIndex = currentPromptIndex + 1
      setCurrentPromptIndex(nextIndex)
      setCurrentPrompt(prompts[nextIndex].id)
      navigate(`/ghostwriter/section/${sectionId}/prompt/${prompts[nextIndex].id}`)
    } else {
      // All prompts completed, go to synthesis
      navigate(`/ghostwriter/synthesis/${sectionId}`)
    }
  }

  const handlePrevious = () => {
    if (currentPromptIndex > 0) {
      const prevIndex = currentPromptIndex - 1
      setCurrentPromptIndex(prevIndex)
      setCurrentPrompt(prompts[prevIndex].id)
      navigate(`/ghostwriter/section/${sectionId}/prompt/${prompts[prevIndex].id}`)
    }
  }

  const handleBackToList = () => {
    setShowPromptList(true)
    navigate(`/ghostwriter/section/${sectionId}`)
  }

  const handleBackToRoadmap = () => {
    const projectId = sectionId // TODO: Get actual project ID
    navigate(`/ghostwriter/roadmap/${projectId}`)
  }

  const handleGeneratePrompts = async () => {
    if (!sectionId) return

    try {
      // Demo mode: Generate sample prompts
      console.log('Generating prompts for section:', sectionId)
      
      // Create demo prompts with the current section title
      const demoPrompts = [
        {
          id: `demo-prompt-1-${Date.now()}`,
          scene: 'A defining moment from this period',
          people: 'Who was there with you?',
          tension: 'What challenge or decision did you face?',
          change: 'How did this moment change you?',
          meaning: 'Why does this memory still matter to you?',
          sectionTitle: sectionTitle,
          completed: false,
        },
        {
          id: `demo-prompt-2-${Date.now()}`,
          scene: 'A place that shaped you',
          people: 'Who shared this place with you?',
          tension: 'What emotions did this place evoke?',
          change: 'How did this place influence your journey?',
          meaning: 'What does this place represent in your story?',
          sectionTitle: sectionTitle,
          completed: false,
        },
        {
          id: `demo-prompt-3-${Date.now()}`,
          scene: 'An unexpected turning point',
          people: 'Who played a role in this moment?',
          tension: 'What made this moment significant?',
          change: 'What path did this open for you?',
          meaning: 'How does this connect to who you are today?',
          sectionTitle: sectionTitle,
          completed: false,
        },
      ]
      
      setPrompts(demoPrompts)
      setShowPromptList(true)
    } catch (error) {
      console.error('Failed to generate prompts:', error)
      alert('Failed to generate prompts. Please try again.')
    }
  }

  const handleContinueToSynthesis = () => {
    if (!sectionId) return
    navigate(`/ghostwriter/synthesis/${sectionId}`)
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <LoadingSpinner />
      </Container>
    )
  }

  const currentPrompt = prompts[currentPromptIndex]
  const completedCount = prompts.filter((p) => p.completed).length

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'var(--color-paper)', py: 4 }}>
      <Container maxWidth="md">
        {/* Back Button */}
        {!showModeSelector && !selectedMode && (
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={showPromptList ? handleBackToRoadmap : handleBackToList}
              sx={{
                textTransform: 'none',
                color: 'var(--color-slate)',
                '&:hover': {
                  backgroundColor: 'var(--color-linen)',
                  color: 'var(--color-amber)',
                },
              }}
            >
              {showPromptList ? 'Back to roadmap' : 'Back to prompt list'}
            </Button>
          </Box>
        )}

        {/* Content */}
        {showPromptList ? (
          <PromptList
            prompts={prompts.map((p) => ({
              id: p.id,
              title: p.scene || p.title,
              completed: p.completed || false,
              wordCount: p.wordCount,
            }))}
            onPromptClick={handlePromptClick}
            sectionTitle={sectionTitle}
            completedCount={completedCount}
            totalCount={prompts.length}
            onGeneratePrompts={handleGeneratePrompts}
            onContinueToSynthesis={handleContinueToSynthesis}
          />
        ) : showModeSelector ? (
          <PromptModeSelector
            onSelectMode={handleModeSelect}
            onBack={handleBackToList}
          />
        ) : selectedMode === 'conversational' && currentPrompt ? (
          <ConversationalPrompt
            prompt={{
              id: currentPrompt.id,
              scene: currentPrompt.scene || currentPrompt.title,
            }}
            sectionContext={sectionTitle}
            onComplete={handleConversationalComplete}
            onBack={handleBackToModeSelector}
          />
        ) : selectedMode === 'structured' && currentPrompt ? (
          <ScenePrompt
            prompt={{
              id: currentPrompt.id,
              scene: currentPrompt.scene || currentPrompt.title,
              people: currentPrompt.people,
              tension: currentPrompt.tension,
              change: currentPrompt.change,
              meaning: currentPrompt.meaning,
            }}
            initialResponse={currentPrompt.response || ''}
            onSave={handleSaveMemory}
            onNext={currentPromptIndex < prompts.length - 1 ? handleNext : undefined}
            onPrevious={currentPromptIndex > 0 ? handlePrevious : undefined}
            hasNext={currentPromptIndex < prompts.length - 1}
            hasPrevious={currentPromptIndex > 0}
          />
        ) : selectedMode === 'freeform' && currentPrompt ? (
          <ConversationalPrompt
            prompt={{
              id: currentPrompt.id,
              scene: 'Share what you want to talk about',
            }}
            sectionContext={sectionTitle}
            onComplete={handleConversationalComplete}
            onBack={handleBackToModeSelector}
          />
        ) : null}
      </Container>
    </Box>
  )
}
