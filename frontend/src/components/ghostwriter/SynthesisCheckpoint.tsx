/**
 * SynthesisCheckpoint Component
 * Chapter preview with quality feedback
 */

import React, { useState } from 'react'
import { Box, Typography, Paper, Button, Divider, TextField } from '@mui/material'
import { QualityFeedback } from './QualityFeedback'
import type { SectionSynthesis } from '../../lib/api/ghostwriter'

interface SynthesisCheckpointProps {
  synthesis: SectionSynthesis
  onApprove: (feedback?: string) => void
  onAddMore: () => void
  onRegenerate?: (feedback: string) => void
}

export const SynthesisCheckpoint: React.FC<SynthesisCheckpointProps> = ({
  synthesis,
  onApprove,
  onAddMore,
  onRegenerate,
}) => {
  const [showFeedback, setShowFeedback] = useState(false)
  const [userFeedback, setUserFeedback] = useState('')

  const qualityScores = {
    sensory_richness_score: synthesis.quality_checks?.sensory_richness || 0.7,
    emotional_depth_score: synthesis.quality_checks?.emotional_depth || 0.75,
    detail_score: synthesis.quality_checks?.detail_level || 0.8,
    overall_quality: synthesis.quality_score || 0.75,
  }

  // Convert recommendations objects to strings for display
  const suggestions = Array.isArray(synthesis.recommendations)
    ? synthesis.recommendations.map((rec: any) =>
        typeof rec === 'string' ? rec : rec.message || JSON.stringify(rec)
      )
    : []

  const strengths = synthesis.quality_checks?.strengths || []

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 3, md: 4 } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontFamily: 'var(--font-serif)',
          color: 'var(--color-ink)',
          mb: 2,
          fontSize: { xs: '1.5rem', md: '2rem' },
        }}
      >
        Chapter preview
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: 'var(--color-slate)',
          mb: 4,
          fontSize: '1rem',
          lineHeight: 1.7,
        }}
      >
        Here's how your memories are coming together. Review the chapter and let us know if you'd
        like to add more details or if it's ready to continue.
      </Typography>

      {/* Chapter Preview */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          backgroundColor: 'white',
          border: '1px solid var(--color-stone)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-ink)',
            fontSize: '1.125rem',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
          }}
        >
          {synthesis.preview_content}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}>
            {synthesis.preview_word_count} words • {synthesis.fragment_ids.length} memories •{' '}
            {synthesis.photo_ids?.length || 0} photos
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--color-amber)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Quality: {Math.round(synthesis.quality_score * 100)}%
          </Typography>
        </Box>
      </Paper>

      {/* Quality Feedback */}
      <Box sx={{ mb: 4 }}>
        <QualityFeedback scores={qualityScores} suggestions={suggestions} strengths={strengths} />
      </Box>

      {/* User Feedback Section */}
      {showFeedback && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: 'var(--color-linen)',
            border: '1px solid var(--color-stone)',
            borderRadius: '8px',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-ink)',
              mb: 2,
              fontSize: '1.125rem',
            }}
          >
            Your feedback
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={userFeedback}
            onChange={(e) => setUserFeedback(e.target.value)}
            placeholder="What would you like to change or improve? (optional)"
            sx={{
              mb: 2,
              '& .MuiInputBase-root': {
                backgroundColor: 'white',
              },
            }}
          />
          {onRegenerate && (
            <Button
              variant="outlined"
              onClick={() => onRegenerate(userFeedback)}
              disabled={!userFeedback.trim()}
              sx={{
                minHeight: 48,
                px: 3,
                textTransform: 'none',
                borderColor: 'var(--color-stone)',
                color: 'var(--color-ink)',
                '&:hover': {
                  borderColor: 'var(--color-amber)',
                  backgroundColor: 'var(--color-parchment)',
                },
              }}
            >
              Regenerate with feedback
            </Button>
          )}
        </Paper>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onApprove(userFeedback || undefined)}
          sx={{
            minHeight: 56,
            fontSize: '1rem',
            fontWeight: 500,
            backgroundColor: 'var(--color-amber)',
            color: 'white',
            borderRadius: '8px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'var(--color-amber-light)',
            },
          }}
        >
          Approve and continue to next section
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={onAddMore}
          sx={{
            minHeight: 56,
            fontSize: '1rem',
            fontWeight: 500,
            borderColor: 'var(--color-stone)',
            color: 'var(--color-ink)',
            borderRadius: '8px',
            textTransform: 'none',
            '&:hover': {
              borderColor: 'var(--color-amber)',
              backgroundColor: 'var(--color-linen)',
            },
          }}
        >
          Add more memories to this section
        </Button>

        {!showFeedback && (
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowFeedback(true)}
            sx={{
              minHeight: 48,
              fontSize: '0.875rem',
              color: 'var(--color-slate)',
              textTransform: 'none',
              textDecoration: 'underline',
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'var(--color-amber-dark)',
              },
            }}
          >
            Provide feedback for improvements
          </Button>
        )}
      </Box>

      <Box
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: 'var(--color-linen)',
          borderRadius: '8px',
          border: '1px solid var(--color-stone)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'var(--color-slate)',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          💡 Remember: You can always come back to add more memories or make changes later
        </Typography>
      </Box>
    </Box>
  )
}
