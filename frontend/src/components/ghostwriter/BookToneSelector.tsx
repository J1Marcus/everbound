/**
 * BookToneSelector Component
 * Tone/flavor selection for memoir writing style
 */

import React, { useState } from 'react'
import { Box, Typography, Button, Paper, Radio, RadioGroup, FormControlLabel } from '@mui/material'

interface BookToneSelectorProps {
  onComplete: (tone: string) => void
  onBack: () => void
  initialTone?: string
}

const toneOptions = [
  {
    value: 'reflective',
    title: 'Reflective',
    description: 'Thoughtful and introspective, exploring the meaning behind events',
    example: 'Looking back, I can see how that moment shaped who I became...',
  },
  {
    value: 'warm',
    title: 'Warm',
    description: 'Conversational and intimate, like sharing stories with family',
    example: 'I remember it like it was yesterday—the smell of fresh bread...',
  },
  {
    value: 'humorous',
    title: 'Humorous',
    description: 'Light-hearted and playful, finding joy in life\'s moments',
    example: 'If you think that was bad, wait until you hear what happened next...',
  },
  {
    value: 'direct',
    title: 'Direct',
    description: 'Straightforward and factual, telling it like it was',
    example: 'The facts are simple: I was born in 1950, the youngest of four...',
  },
]

export const BookToneSelector: React.FC<BookToneSelectorProps> = ({
  onComplete,
  onBack,
  initialTone = '',
}) => {
  const [selectedTone, setSelectedTone] = useState(initialTone)

  const handleSubmit = () => {
    if (selectedTone) {
      onComplete(selectedTone)
    }
  }

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
        Choose your book's tone
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
        How would you like your memoir to feel? This helps us match your natural voice.
      </Typography>

      <RadioGroup value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {toneOptions.map((option) => (
            <Paper
              key={option.value}
              elevation={0}
              sx={{
                p: 3,
                backgroundColor:
                  selectedTone === option.value ? 'var(--color-linen)' : 'var(--color-parchment)',
                border:
                  selectedTone === option.value
                    ? '2px solid var(--color-amber)'
                    : '1px solid var(--color-stone)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'var(--color-amber-light)',
                  backgroundColor: 'var(--color-linen)',
                },
              }}
              onClick={() => setSelectedTone(option.value)}
            >
              <FormControlLabel
                value={option.value}
                control={
                  <Radio
                    sx={{
                      '& .MuiSvgIcon-root': {
                        fontSize: 28,
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--color-ink)',
                        mb: 1,
                        fontSize: '1.25rem',
                      }}
                    >
                      {option.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--color-slate)',
                        mb: 2,
                        fontSize: '1rem',
                      }}
                    >
                      {option.description}
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        borderLeft: '3px solid var(--color-amber)',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: 'italic',
                          color: 'var(--color-slate)',
                          fontSize: '0.875rem',
                        }}
                      >
                        "{option.example}"
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{
                  alignItems: 'flex-start',
                  m: 0,
                  width: '100%',
                }}
              />
            </Paper>
          ))}
        </Box>
      </RadioGroup>

      <Box
        sx={{
          p: 3,
          mb: 4,
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
            mb: 1,
          }}
        >
          <strong>Think of it this way:</strong>
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--color-slate)',
            fontSize: '0.875rem',
          }}
        >
          • "More like a letter to my family" → Warm or Reflective
          <br />• "More like a life story for history" → Direct or Reflective
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'center',
        }}
      >
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            minHeight: 56,
            px: 4,
            fontSize: '1rem',
            fontWeight: 500,
            borderColor: 'var(--color-stone)',
            color: 'var(--color-ink)',
            borderRadius: '8px',
            textTransform: 'none',
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              borderColor: 'var(--color-slate)',
              backgroundColor: 'var(--color-linen)',
            },
          }}
        >
          Go back
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedTone}
          sx={{
            minHeight: 56,
            px: 4,
            fontSize: '1rem',
            fontWeight: 500,
            backgroundColor: 'var(--color-amber)',
            color: 'white',
            borderRadius: '8px',
            textTransform: 'none',
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              backgroundColor: 'var(--color-amber-light)',
            },
            '&:disabled': {
              backgroundColor: 'var(--color-stone)',
              opacity: 0.5,
            },
          }}
        >
          Start capturing memories
        </Button>
      </Box>

      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          color: 'var(--color-slate)',
          mt: 2,
          fontSize: '0.875rem',
        }}
      >
        Don't worry—you can adjust this later
      </Typography>
    </Box>
  )
}
