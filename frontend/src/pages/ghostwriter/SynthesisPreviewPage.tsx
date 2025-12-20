/**
 * SynthesisPreviewPage
 * Chapter preview and approval interface
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Container, Button } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { SynthesisCheckpoint } from '../../components/ghostwriter/SynthesisCheckpoint'
import {
  getSectionPreview,
  generateSectionPreview,
  approveSection,
  regenerateSectionPreview,
} from '../../lib/api/ghostwriter'
import type { SectionSynthesis } from '../../lib/api/ghostwriter'
import LoadingSpinner from '../../components/LoadingSpinner'

export const SynthesisPreviewPage: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [synthesis, setSynthesis] = useState<SectionSynthesis | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sectionId) {
      navigate('/dashboard')
      return
    }

    loadSynthesis()
  }, [sectionId])

  const loadSynthesis = async () => {
    if (!sectionId) return

    setLoading(true)
    setError(null)

    try {
      // Try to get existing synthesis
      let synthesisData = await getSectionPreview(sectionId)

      // If no synthesis exists, generate one
      if (!synthesisData) {
        setGenerating(true)
        const projectId = sectionId // TODO: Get actual project ID
        const result = await generateSectionPreview(sectionId, projectId)
        synthesisData = result.synthesis
        setGenerating(false)
      }

      setSynthesis(synthesisData)
    } catch (err) {
      console.error('Failed to load synthesis:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chapter preview')
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }

  const handleApprove = async (feedback?: string) => {
    if (!sectionId || !synthesis) return

    try {
      const projectId = sectionId // TODO: Get actual project ID
      await approveSection(sectionId, projectId, feedback)

      // Navigate back to roadmap
      navigate(`/ghostwriter/roadmap/${projectId}`)
    } catch (err) {
      console.error('Failed to approve section:', err)
      setError(err instanceof Error ? err.message : 'Failed to approve section')
    }
  }

  const handleAddMore = () => {
    // Navigate back to prompt capture
    navigate(`/ghostwriter/section/${sectionId}`)
  }

  const handleRegenerate = async (feedback: string) => {
    if (!sectionId || !feedback.trim()) return

    setGenerating(true)
    setError(null)

    try {
      const projectId = sectionId // TODO: Get actual project ID
      await regenerateSectionPreview(sectionId, projectId, feedback)

      // Reload synthesis
      await loadSynthesis()
    } catch (err) {
      console.error('Failed to regenerate synthesis:', err)
      setError(err instanceof Error ? err.message : 'Failed to regenerate chapter')
    } finally {
      setGenerating(false)
    }
  }

  const handleBack = () => {
    navigate(`/ghostwriter/section/${sectionId}`)
  }

  if (loading || generating) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <LoadingSpinner />
        <Box sx={{ mt: 3, color: 'var(--color-slate)' }}>
          {generating ? 'Generating your chapter preview...' : 'Loading...'}
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Box
          sx={{
            p: 4,
            backgroundColor: 'var(--color-linen)',
            border: '1px solid var(--color-error)',
            borderRadius: '8px',
          }}
        >
          <Box sx={{ color: 'var(--color-error)', mb: 2, fontSize: '1rem' }}>
            {error}
          </Box>
          <Button
            variant="contained"
            onClick={loadSynthesis}
            sx={{
              backgroundColor: 'var(--color-amber)',
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'var(--color-amber-light)',
              },
            }}
          >
            Try again
          </Button>
        </Box>
      </Container>
    )
  }

  if (!synthesis) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ color: 'var(--color-slate)' }}>
          No chapter preview available. Please add more memories first.
        </Box>
        <Button
          variant="contained"
          onClick={handleAddMore}
          sx={{
            mt: 3,
            backgroundColor: 'var(--color-amber)',
            color: 'white',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'var(--color-amber-light)',
            },
          }}
        >
          Add memories
        </Button>
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'var(--color-paper)', py: 4 }}>
      <Container maxWidth="md">
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              textTransform: 'none',
              color: 'var(--color-slate)',
              '&:hover': {
                backgroundColor: 'var(--color-linen)',
                color: 'var(--color-amber)',
              },
            }}
          >
            Back to prompts
          </Button>
        </Box>

        {/* Synthesis Checkpoint */}
        <SynthesisCheckpoint
          synthesis={synthesis}
          onApprove={handleApprove}
          onAddMore={handleAddMore}
          onRegenerate={handleRegenerate}
        />
      </Container>
    </Box>
  )
}
