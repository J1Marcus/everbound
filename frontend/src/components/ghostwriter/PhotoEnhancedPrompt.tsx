/**
 * PhotoEnhancedPrompt Component
 * Photo-specific follow-up questions
 */

import React from 'react'
import { Box, Typography, Paper, Button } from '@mui/material'
import type { PhotoAnalysis } from '../../lib/api/ghostwriter'

interface PhotoEnhancedPromptProps {
  photoUrl: string
  analysis: PhotoAnalysis
  onPromptSelect: (prompt: string) => void
}

export const PhotoEnhancedPrompt: React.FC<PhotoEnhancedPromptProps> = ({
  photoUrl,
  analysis,
  onPromptSelect,
}) => {
  const generatePrompts = (): string[] => {
    const prompts: string[] = []

    // People-based prompts
    if (analysis.people_detected.length > 0) {
      prompts.push('Tell me about the people in this photo. What were they like?')
      prompts.push('What do you remember about this day with them?')
    }

    // Setting-based prompts
    if (analysis.setting.location_type) {
      prompts.push(`What was it like to be at this ${analysis.setting.location_type}?`)
      prompts.push('What sounds and smells do you remember from this place?')
    }

    // Mood-based prompts
    if (analysis.mood) {
      prompts.push(`This photo feels ${analysis.mood}. What made it that way?`)
    }

    // General prompts
    prompts.push('Who took this photo? Why was it important to capture this moment?')
    prompts.push('What happened right before or after this photo was taken?')

    return prompts
  }

  const prompts = generatePrompts()

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', p: { xs: 3, md: 4 } }}>
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
        Tell us more about this photo
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
        Choose a prompt to help you add rich details to your memory
      </Typography>

      {/* Photo Display */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          backgroundColor: 'var(--color-parchment)',
          border: '1px solid var(--color-stone)',
          borderRadius: '8px',
        }}
      >
        <img
          src={photoUrl}
          alt="Memory"
          style={{
            width: '100%',
            maxHeight: 300,
            objectFit: 'contain',
            borderRadius: '4px',
          }}
        />
      </Paper>

      {/* AI Analysis Summary */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: 'var(--color-linen)',
          border: '1px solid var(--color-stone)',
          borderRadius: '8px',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'var(--color-slate)',
            fontSize: '0.875rem',
            mb: 1,
          }}
        >
          <strong>What we see:</strong>
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}>
          {analysis.setting.type} setting
          {analysis.people_detected.length > 0 && ` with ${analysis.people_detected.length} ${analysis.people_detected.length === 1 ? 'person' : 'people'}`}
          {analysis.mood && `, ${analysis.mood} mood`}
        </Typography>
      </Paper>

      {/* Prompt Options */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            onClick={() => onPromptSelect(prompt)}
            sx={{
              p: 3,
              textAlign: 'left',
              backgroundColor: 'var(--color-parchment)',
              border: '1px solid var(--color-stone)',
              borderRadius: '8px',
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'var(--color-amber)',
                backgroundColor: 'var(--color-linen)',
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-md)',
              },
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: 'var(--color-ink)',
                fontSize: '1rem',
                lineHeight: 1.6,
              }}
            >
              {prompt}
            </Typography>
          </Button>
        ))}
      </Box>
    </Box>
  )
}
