/**
 * PromptModeSelector Component
 * Allows users to choose their preferred memory capture approach
 */

import React from 'react'
import { Box, Typography, Paper, Button } from '@mui/material'
import {
  List as ListIcon,
  Chat as ChatIcon,
  Edit as EditIcon,
} from '@mui/icons-material'

export type PromptMode = 'structured' | 'conversational' | 'freeform'

interface PromptModeSelectorProps {
  onSelectMode: (mode: PromptMode) => void
  onBack: () => void
}

export const PromptModeSelector: React.FC<PromptModeSelectorProps> = ({
  onSelectMode,
  onBack,
}) => {
  const modes = [
    {
      id: 'conversational' as PromptMode,
      icon: <ChatIcon sx={{ fontSize: 48 }} />,
      title: 'Conversational Guide',
      description: "I'll ask you questions one at a time, adapting based on your responses. Most natural and engaging.",
      recommended: true,
    },
    {
      id: 'structured' as PromptMode,
      icon: <ListIcon sx={{ fontSize: 48 }} />,
      title: 'Structured Prompts',
      description: 'See all guiding questions at once and write your response. Good for organized thinkers.',
      recommended: false,
    },
    {
      id: 'freeform' as PromptMode,
      icon: <EditIcon sx={{ fontSize: 48 }} />,
      title: 'Free Writing',
      description: "Tell me what you want to share, and I'll help you explore it with follow-up questions.",
      recommended: false,
    },
  ]

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
        How would you like to capture this memory?
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: 'var(--color-slate)',
          mb: 4,
          fontSize: '1rem',
          lineHeight: 1.6,
        }}
      >
        Choose the approach that feels most comfortable for you. You can always change this later.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {modes.map((mode) => (
          <Paper
            key={mode.id}
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: 'var(--color-parchment)',
              border: `2px solid ${mode.recommended ? 'var(--color-amber)' : 'var(--color-stone)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              '&:hover': {
                borderColor: 'var(--color-amber)',
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-md)',
              },
            }}
            onClick={() => onSelectMode(mode.id)}
          >
            {mode.recommended && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  right: 16,
                  backgroundColor: 'var(--color-amber)',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                RECOMMENDED
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  color: 'var(--color-amber)',
                  flexShrink: 0,
                }}
              >
                {mode.icon}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--color-ink)',
                    mb: 1,
                    fontSize: '1.25rem',
                  }}
                >
                  {mode.title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'var(--color-slate)',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                  }}
                >
                  {mode.description}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="text"
          onClick={onBack}
          sx={{
            textTransform: 'none',
            color: 'var(--color-slate)',
            '&:hover': {
              backgroundColor: 'var(--color-linen)',
              color: 'var(--color-amber)',
            },
          }}
        >
          Back to prompt list
        </Button>
      </Box>
    </Box>
  )
}
