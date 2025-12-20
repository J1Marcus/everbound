/**
 * BookSynthesisPage
 * Final book review and synthesis page after all sections are complete
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Container, Button, Paper, Typography, Divider } from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  AutoStories as BookIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import LoadingSpinner from '../../components/LoadingSpinner'

export const BookSynthesisPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard')
      return
    }

    // Simulate loading
    setTimeout(() => setLoading(false), 500)
  }, [projectId])

  const handleBackToRoadmap = () => {
    navigate(`/ghostwriter/roadmap/${projectId}`)
  }

  const handleExportBook = () => {
    alert('Book export functionality will be implemented soon!')
  }

  const handleEditSection = (sectionId: string) => {
    // Navigate to synthesis preview for completed sections
    navigate(`/ghostwriter/synthesis/${sectionId}`)
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <LoadingSpinner />
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'var(--color-paper)', py: 4 }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToRoadmap}
            sx={{
              textTransform: 'none',
              color: 'var(--color-slate)',
              '&:hover': {
                backgroundColor: 'var(--color-linen)',
                color: 'var(--color-amber)',
              },
            }}
          >
            Back to roadmap
          </Button>
        </Box>

        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            mb: 4,
            backgroundColor: 'var(--color-parchment)',
            border: '2px solid var(--color-amber)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <BookIcon sx={{ fontSize: 72, color: 'var(--color-amber)' }} />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-ink)',
              mb: 2,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
            }}
          >
            Your Complete Memoir
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'var(--color-slate)',
              mb: 4,
              fontSize: '1.125rem',
              lineHeight: 1.6,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Congratulations! Your life story has been beautifully compiled into a complete memoir.
            Review each chapter below, make any final edits, and when you're ready, export your book.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleExportBook}
              sx={{
                backgroundColor: 'var(--color-amber)',
                color: 'white',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                px: 4,
                py: 1.5,
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'var(--color-amber-dark)',
                },
              }}
            >
              Export Complete Book
            </Button>
          </Box>
        </Paper>

        {/* Book Preview */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-ink)',
            mb: 3,
            fontSize: { xs: '1.25rem', md: '1.5rem' },
          }}
        >
          Chapter Overview
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { id: '1', title: 'Early Childhood', wordCount: 2500 },
            { id: '2', title: 'School Years', wordCount: 2800 },
            { id: '3', title: 'Teenage Years & Coming of Age', wordCount: 3200 },
            { id: '4', title: 'Early Adulthood', wordCount: 2900 },
            { id: '5', title: 'Career & Work Life', wordCount: 3100 },
            { id: '6', title: 'Love & Relationships', wordCount: 2700 },
            { id: '7', title: 'Family Life', wordCount: 3400 },
            { id: '8', title: 'Middle Years & Growth', wordCount: 2600 },
            { id: '9', title: 'Later Life & Wisdom', wordCount: 2800 },
            { id: '10', title: 'Reflections & Legacy', wordCount: 2400 },
          ].map((chapter, index) => (
            <Paper
              key={chapter.id}
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: 'var(--color-parchment)',
                border: '1px solid var(--color-stone)',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'var(--color-amber)',
                  boxShadow: 'var(--shadow-md)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--color-ink)',
                      mb: 0.5,
                      fontSize: '1.125rem',
                    }}
                  >
                    Chapter {index + 1}: {chapter.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--color-slate)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {chapter.wordCount.toLocaleString()} words • ~{Math.round(chapter.wordCount / 250)} pages
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditSection(`${projectId}-section-${chapter.id}`)}
                  sx={{
                    textTransform: 'none',
                    borderColor: 'var(--color-stone)',
                    color: 'var(--color-ink)',
                    '&:hover': {
                      borderColor: 'var(--color-amber)',
                      backgroundColor: 'var(--color-linen)',
                    },
                  }}
                >
                  Review & Edit
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Summary Stats */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 4,
            backgroundColor: 'var(--color-linen)',
            border: '1px solid var(--color-stone)',
            borderRadius: '12px',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-ink)',
              mb: 3,
              fontSize: '1.25rem',
            }}
          >
            Book Statistics
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'var(--color-slate)', fontSize: '0.875rem', mb: 0.5 }}>
                Total Word Count
              </Typography>
              <Typography variant="h5" sx={{ color: 'var(--color-ink)', fontWeight: 600 }}>
                28,400
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'var(--color-slate)', fontSize: '0.875rem', mb: 0.5 }}>
                Estimated Pages
              </Typography>
              <Typography variant="h5" sx={{ color: 'var(--color-ink)', fontWeight: 600 }}>
                ~114
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'var(--color-slate)', fontSize: '0.875rem', mb: 0.5 }}>
                Chapters
              </Typography>
              <Typography variant="h5" sx={{ color: 'var(--color-ink)', fontWeight: 600 }}>
                10
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
