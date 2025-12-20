/**
 * QualityFeedback Component
 * Display quality scores and suggestions
 */

import React from 'react'
import { Box, Typography, Paper, LinearProgress, Chip } from '@mui/material'
import { Lightbulb as LightbulbIcon } from '@mui/icons-material'

interface QualityScores {
  sensory_richness_score: number
  emotional_depth_score: number
  detail_score: number
  overall_quality: number
}

interface QualityFeedbackProps {
  scores: QualityScores
  suggestions: string[]
  strengths?: string[]
}

export const QualityFeedback: React.FC<QualityFeedbackProps> = ({
  scores,
  suggestions,
  strengths = [],
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'var(--color-success)'
    if (score >= 0.6) return 'var(--color-amber)'
    return 'var(--color-warning)'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent'
    if (score >= 0.6) return 'Good'
    if (score >= 0.4) return 'Fair'
    return 'Needs work'
  }

  const scoreItems = [
    { label: 'Sensory richness', score: scores.sensory_richness_score },
    { label: 'Emotional depth', score: scores.emotional_depth_score },
    { label: 'Detail level', score: scores.detail_score },
  ]

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
        Quality feedback
      </Typography>

      {/* Overall Score */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" sx={{ color: 'var(--color-ink)', fontSize: '1rem' }}>
            Overall quality
          </Typography>
          <Chip
            label={getScoreLabel(scores.overall_quality)}
            sx={{
              backgroundColor: getScoreColor(scores.overall_quality),
              color: 'white',
              fontWeight: 500,
            }}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={scores.overall_quality * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'var(--color-stone)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getScoreColor(scores.overall_quality),
              borderRadius: 4,
            },
          }}
        />
      </Box>

      {/* Individual Scores */}
      <Box sx={{ mb: 3 }}>
        {scoreItems.map((item) => (
          <Box key={item.label} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}>
                {item.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: getScoreColor(item.score),
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {Math.round(item.score * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={item.score * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'var(--color-stone)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(item.score),
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Strengths */}
      {strengths.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--color-success)',
              fontSize: '0.875rem',
              fontWeight: 500,
              mb: 1,
            }}
          >
            ✓ What's working well:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {strengths.map((strength, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ color: 'var(--color-slate)', fontSize: '0.875rem', pl: 2 }}
              >
                • {strength}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Box
          sx={{
            p: 2,
            backgroundColor: 'var(--color-linen)',
            borderRadius: '4px',
            border: '1px solid var(--color-stone)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LightbulbIcon sx={{ color: 'var(--color-amber)', fontSize: 20 }} />
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-ink)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Suggestions to enrich your story:
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {suggestions.map((suggestion, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ color: 'var(--color-slate)', fontSize: '0.875rem', pl: 2 }}
              >
                • {suggestion}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  )
}
