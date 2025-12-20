/**
 * ProgressTracker Component
 * Section completion visualization
 */

import React from 'react'
import { Box, Typography, Paper, LinearProgress } from '@mui/material'

interface ProgressTrackerProps {
  sectionsTotal: number
  sectionsCompleted: number
  memoriesCollected: number
  photosUploaded: number
  overallProgress: number
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  sectionsTotal,
  sectionsCompleted,
  memoriesCollected,
  photosUploaded,
  overallProgress,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: 'var(--color-parchment)',
        border: '1px solid var(--color-stone)',
        borderRadius: '8px',
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
        Your progress
      </Typography>

      {/* Overall Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}>
            Overall completion
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'var(--color-amber)', fontSize: '0.875rem', fontWeight: 500 }}
          >
            {Math.round(overallProgress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={overallProgress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'var(--color-stone)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'var(--color-amber)',
              borderRadius: 4,
            },
          }}
        />
      </Box>

      {/* Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: 'var(--color-linen)',
            borderRadius: '4px',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-amber)',
              mb: 0.5,
            }}
          >
            {sectionsCompleted}/{sectionsTotal}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}>
            Sections complete
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'var(--color-linen)',
            borderRadius: '4px',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-amber)',
              mb: 0.5,
            }}
          >
            {memoriesCollected}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}>
            Memories captured
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'var(--color-linen)',
            borderRadius: '4px',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-amber)',
              mb: 0.5,
            }}
          >
            {photosUploaded}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}>
            Photos added
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}
