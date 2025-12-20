/**
 * PromptList Component
 * List of prompts for a section with completion status
 */

import React from 'react'
import { Box, Typography, Paper, Chip, LinearProgress, Button } from '@mui/material'
import { CheckCircle as CheckCircleIcon, RadioButtonUnchecked as UncompletedIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material'

interface Prompt {
  id: string
  title: string
  completed: boolean
  wordCount?: number
}

interface PromptListProps {
  prompts: Prompt[]
  onPromptClick: (promptId: string) => void
  sectionTitle: string
  completedCount: number
  totalCount: number
  onGeneratePrompts?: () => void
  onContinueToSynthesis?: () => void
}

export const PromptList: React.FC<PromptListProps> = ({
  prompts,
  onPromptClick,
  sectionTitle,
  completedCount,
  totalCount,
  onGeneratePrompts,
  onContinueToSynthesis,
}) => {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const allCompleted = totalCount > 0 && completedCount === totalCount

  // Empty state when no prompts exist
  if (prompts.length === 0) {
    return (
      <Box sx={{ maxWidth: 680, mx: 'auto', p: { xs: 3, md: 4 } }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-ink)',
            mb: 4,
            fontSize: { xs: '1.5rem', md: '2rem' },
          }}
        >
          {sectionTitle}
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            backgroundColor: 'var(--color-parchment)',
            border: '2px solid var(--color-amber)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <AutoAwesomeIcon
              sx={{
                fontSize: 64,
                color: 'var(--color-amber)',
                mb: 2,
              }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-ink)',
              mb: 2,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
            }}
          >
            Ready to Capture Your Memories?
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
            This section is waiting for your stories. We'll guide you through thoughtful prompts
            to help you capture the memories that matter most.
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<AutoAwesomeIcon />}
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
            onClick={onGeneratePrompts}
            disabled={!onGeneratePrompts}
          >
            Generate Memory Prompts
          </Button>

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
              sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}
            >
              💡 <strong>What happens next?</strong> We'll create personalized prompts based on your profile
              to help you share your unique experiences and stories.
            </Typography>
          </Box>
        </Paper>
      </Box>
    )
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
        {sectionTitle}
      </Typography>

      {/* Progress Summary */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: 'var(--color-parchment)',
          border: '1px solid var(--color-stone)',
          borderRadius: '8px',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body1" sx={{ color: 'var(--color-ink)', fontSize: '1rem' }}>
            {completedCount} of {totalCount} memories captured
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'var(--color-amber)', fontSize: '1rem', fontWeight: 500 }}
          >
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'var(--color-stone)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'var(--color-amber)',
              borderRadius: 3,
            },
          }}
        />
      </Paper>

      {/* Prompt List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {prompts.map((prompt, index) => (
          <Paper
            key={prompt.id}
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: 'var(--color-parchment)',
              border: `1px solid ${prompt.completed ? 'var(--color-success)' : 'var(--color-stone)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'var(--color-amber)',
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-md)',
              },
            }}
            onClick={() => onPromptClick(prompt.id)}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                {prompt.completed ? (
                  <CheckCircleIcon sx={{ color: 'var(--color-success)', fontSize: 28 }} />
                ) : (
                  <UncompletedIcon sx={{ color: 'var(--color-stone)', fontSize: 28 }} />
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--color-ink)',
                      fontSize: '1.125rem',
                    }}
                  >
                    {index + 1}. {prompt.title}
                  </Typography>
                  {prompt.completed && (
                    <Chip
                      label="Complete"
                      size="small"
                      sx={{
                        backgroundColor: 'var(--color-success)',
                        color: 'white',
                        fontSize: '0.75rem',
                        height: 24,
                      }}
                    />
                  )}
                </Box>

                {prompt.completed && prompt.wordCount && (
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}
                  >
                    {prompt.wordCount} words • Click to review or edit
                  </Typography>
                )}

                {!prompt.completed && (
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-amber-dark)', fontSize: '0.875rem', fontWeight: 500 }}
                  >
                    Start capturing this memory →
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Completion State or Tip */}
      {allCompleted ? (
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 4,
            backgroundColor: 'var(--color-success-light)',
            border: '2px solid var(--color-success)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-ink)',
              mb: 2,
              fontSize: '1.25rem',
            }}
          >
            🎉 Section Complete!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'var(--color-slate)',
              mb: 3,
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            You've captured all the memories for this section. Ready to see how they come together?
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onContinueToSynthesis}
            disabled={!onContinueToSynthesis}
            sx={{
              backgroundColor: 'var(--color-success)',
              color: 'white',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              px: 4,
              py: 1.5,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'var(--color-success-dark)',
              },
            }}
          >
            Continue to Chapter Preview
          </Button>
        </Paper>
      ) : (
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
            sx={{ color: 'var(--color-slate)', fontSize: '0.875rem', textAlign: 'center' }}
          >
            💡 Tip: You don't need to complete all prompts—focus on the memories that matter most to you
          </Typography>
        </Box>
      )}
    </Box>
  )
}
