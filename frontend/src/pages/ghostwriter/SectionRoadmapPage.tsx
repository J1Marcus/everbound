/**
 * SectionRoadmapPage
 * Main ghostwriter dashboard showing section progress
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Container, Button, Paper, Typography } from '@mui/material'
import { ArrowBack as ArrowBackIcon, AutoStories as BookIcon } from '@mui/icons-material'
import { SectionRoadmap } from '../../components/ghostwriter/SectionRoadmap'
import { ProgressTracker } from '../../components/ghostwriter/ProgressTracker'
import { getSections, getProjectProgress } from '../../lib/api/ghostwriter'
import { useGhostwriterStore } from '../../stores/ghostwriterStore'
import LoadingSpinner from '../../components/LoadingSpinner'

export const SectionRoadmapPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const {
    sections,
    setSections,
    setSectionsLoading,
    setSectionsError,
    updateProgress,
  } = useGhostwriterStore()

  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({
    sections_total: 0,
    sections_completed: 0,
    sections_progress: 0,
    memories_total: 0,
    memories_collected: 0,
    memories_progress: 0,
  })

  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard')
      return
    }

    loadData()
  }, [projectId])

  const loadData = async () => {
    if (!projectId) return

    setLoading(true)
    setSectionsLoading(true)

    try {
      // Load sections
      const sectionsData = await getSections(projectId)
      setSections(sectionsData)

      // Load progress
      const progressData = await getProjectProgress(projectId)
      setProgress(progressData)
      updateProgress({
        overall: progressData.sections_progress,
        memories: progressData.memories_collected,
      })

      setSectionsError(null)
    } catch (error) {
      console.error('Failed to load sections:', error)
      setSectionsError(error instanceof Error ? error.message : 'Failed to load sections')
    } finally {
      setLoading(false)
      setSectionsLoading(false)
    }
  }

  const handleSectionClick = (sectionId: string) => {
    // Find the section to check if it's completed
    const section = sections.find(s => s.section_id === sectionId)
    
    // If section is completed, go directly to synthesis preview
    // Otherwise, go to prompt capture page
    if (section?.is_completed) {
      navigate(`/ghostwriter/synthesis/${sectionId}`)
    } else {
      navigate(`/ghostwriter/section/${sectionId}`)
    }
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const handleContinueToBookSynthesis = () => {
    navigate(`/ghostwriter/book-synthesis/${projectId}`)
  }

  const allSectionsComplete = progress.sections_total > 0 && progress.sections_completed === progress.sections_total

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <LoadingSpinner />
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
            onClick={handleBackToDashboard}
            sx={{
              textTransform: 'none',
              color: 'var(--color-slate)',
              '&:hover': {
                backgroundColor: 'var(--color-linen)',
                color: 'var(--color-amber)',
              },
            }}
          >
            Back to dashboard
          </Button>
        </Box>

        {/* Progress Tracker */}
        <Box sx={{ mb: 4 }}>
          <ProgressTracker
            sectionsTotal={progress.sections_total}
            sectionsCompleted={progress.sections_completed}
            memoriesCollected={progress.memories_collected}
            photosUploaded={0}
            overallProgress={progress.sections_progress}
          />
        </Box>

        {/* Section Roadmap */}
        <SectionRoadmap
          sections={sections}
          onSectionClick={handleSectionClick}
          overallProgress={progress.sections_progress}
        />

        {/* All Sections Complete - Book Synthesis CTA */}
        {allSectionsComplete && (
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: { xs: 4, md: 6 },
              backgroundColor: 'var(--color-success-light)',
              border: '3px solid var(--color-success)',
              borderRadius: '16px',
              textAlign: 'center',
            }}
          >
            <Box sx={{ mb: 3 }}>
              <BookIcon sx={{ fontSize: 64, color: 'var(--color-success)' }} />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-ink)',
                mb: 2,
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              🎉 All Sections Complete!
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'var(--color-slate)',
                mb: 4,
                fontSize: '1.125rem',
                lineHeight: 1.6,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Congratulations! You've captured memories from every chapter of your life.
              Now it's time to see your complete story come together as a beautiful book.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<BookIcon />}
              onClick={handleContinueToBookSynthesis}
              sx={{
                backgroundColor: 'var(--color-success)',
                color: 'white',
                textTransform: 'none',
                fontSize: '1.125rem',
                fontWeight: 600,
                px: 6,
                py: 2,
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                '&:hover': {
                  backgroundColor: '#2d7a3e !important',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Continue to Book Synthesis
            </Button>

            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-slate)',
                mt: 3,
                fontSize: '0.875rem',
              }}
            >
              Review and refine your complete memoir before final production
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  )
}
