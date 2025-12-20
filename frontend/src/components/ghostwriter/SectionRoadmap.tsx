/**
 * SectionRoadmap Component
 * Visual progress through memoir sections
 */

import React from 'react'
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Button,
} from '@mui/material'
import {
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UnlockedIcon,
} from '@mui/icons-material'
import type { SectionStatus } from '../../lib/api/ghostwriter'

interface SectionRoadmapProps {
  sections: SectionStatus[]
  onSectionClick: (sectionId: string) => void
  overallProgress: number
}

export const SectionRoadmap: React.FC<SectionRoadmapProps> = ({
  sections,
  onSectionClick,
  overallProgress,
}) => {
  const getStatusIcon = (section: SectionStatus) => {
    if (section.is_completed) {
      return <CheckCircleIcon sx={{ color: 'var(--color-success)', fontSize: 32 }} />
    }
    if (section.is_unlocked) {
      return <UnlockedIcon sx={{ color: 'var(--color-amber)', fontSize: 32 }} />
    }
    return <LockIcon sx={{ color: 'var(--color-stone)', fontSize: 32 }} />
  }

  const getStatusText = (section: SectionStatus) => {
    if (section.is_completed) return 'Completed'
    if (section.is_unlocked) return 'In progress'
    return 'Locked'
  }

  const getStatusColor = (section: SectionStatus) => {
    if (section.is_completed) return 'var(--color-success)'
    if (section.is_unlocked) return 'var(--color-amber)'
    return 'var(--color-stone)'
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
        Your memoir roadmap
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
        Complete each section to unlock the next. Take your time—there's no rush.
      </Typography>

      {/* Overall Progress */}
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
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-ink)',
              fontSize: '1.25rem',
            }}
          >
            Overall progress
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-amber)',
              fontSize: '1.25rem',
            }}
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
      </Paper>

      {/* Section List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map((section, index) => (
          <Paper
            key={section.section_id}
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: section.is_unlocked
                ? 'var(--color-parchment)'
                : 'var(--color-linen)',
              border: `1px solid ${getStatusColor(section)}`,
              borderRadius: '8px',
              opacity: section.is_unlocked ? 1 : 0.7,
              cursor: section.is_unlocked ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              '&:hover': section.is_unlocked
                ? {
                    borderColor: 'var(--color-amber)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-md)',
                  }
                : {},
            }}
            onClick={() => section.is_unlocked && onSectionClick(section.section_id)}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ flexShrink: 0, mt: 0.5 }}>{getStatusIcon(section)}</Box>

              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--color-ink)',
                      fontSize: '1.25rem',
                    }}
                  >
                    {index + 1}. {section.section_title}
                  </Typography>
                  <Chip
                    label={getStatusText(section)}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(section),
                      color: 'white',
                      fontSize: '0.75rem',
                      height: 24,
                    }}
                  />
                </Box>

                {section.is_unlocked && (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}
                        >
                          {section.collected_memories} of {section.required_memories} memories
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}
                        >
                          {Math.round(section.progress_percentage)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={section.progress_percentage}
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
                    </Box>

                    {section.is_completed ? (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'var(--color-success)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      >
                        ✓ Section complete! Click to review chapter preview
                      </Typography>
                    ) : (
                      <Button
                        variant="text"
                        sx={{
                          p: 0,
                          minHeight: 'auto',
                          textTransform: 'none',
                          color: 'var(--color-amber-dark)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Continue capturing memories →
                      </Button>
                    )}
                  </>
                )}

                {!section.is_unlocked && (
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}
                  >
                    Complete the previous section to unlock
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
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
          💡 Tip: You can always come back to add more memories to any completed section
        </Typography>
      </Box>
    </Box>
  )
}
