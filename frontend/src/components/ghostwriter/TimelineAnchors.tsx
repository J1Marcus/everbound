/**
 * TimelineAnchors Component
 * Timeline scaffolding input for ghostwriter workflow
 */

import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Chip,
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material'

interface TimelineAnchorsProps {
  onComplete: (data: TimelineData) => void
  onBack: () => void
  initialData?: Partial<TimelineData>
}

export interface TimelineData {
  birth_year?: number
  grew_up_location?: string
  high_school_years?: string
  first_job_age?: number
  major_moves?: string[]
  partner_met_year?: number
  children_birth_years?: number[]
  milestones?: string[]
}

export const TimelineAnchors: React.FC<TimelineAnchorsProps> = ({
  onComplete,
  onBack,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<TimelineData>(initialData)
  const [newMove, setNewMove] = useState('')
  const [newChildYear, setNewChildYear] = useState('')
  const [newMilestone, setNewMilestone] = useState('')

  const handleFieldChange = (field: keyof TimelineData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addMove = () => {
    if (newMove.trim()) {
      setFormData((prev) => ({
        ...prev,
        major_moves: [...(prev.major_moves || []), newMove.trim()],
      }))
      setNewMove('')
    }
  }

  const removeMove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      major_moves: prev.major_moves?.filter((_, i) => i !== index),
    }))
  }

  const addChildYear = () => {
    const year = parseInt(newChildYear)
    if (!isNaN(year) && year > 1900 && year <= new Date().getFullYear()) {
      setFormData((prev) => ({
        ...prev,
        children_birth_years: [...(prev.children_birth_years || []), year],
      }))
      setNewChildYear('')
    }
  }

  const removeChildYear = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      children_birth_years: prev.children_birth_years?.filter((_, i) => i !== index),
    }))
  }

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setFormData((prev) => ({
        ...prev,
        milestones: [...(prev.milestones || []), newMilestone.trim()],
      }))
      setNewMilestone('')
    }
  }

  const removeMilestone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones?.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = () => {
    onComplete(formData)
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
        Your life timeline
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
        These anchors help us organize your memories chronologically. All fields are
        optional—add what you remember.
      </Typography>

      {/* Basic Timeline */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
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
          Basic timeline
        </Typography>

        <TextField
          fullWidth
          label="Birth year (or approximate)"
          type="number"
          value={formData.birth_year || ''}
          onChange={(e) => handleFieldChange('birth_year', parseInt(e.target.value) || undefined)}
          placeholder="1950"
          sx={{ mb: 3 }}
          InputProps={{
            sx: { minHeight: 56, fontSize: '1rem' },
          }}
          InputLabelProps={{
            sx: { fontSize: '1rem' },
          }}
        />

        <TextField
          fullWidth
          label="Where you grew up"
          value={formData.grew_up_location || ''}
          onChange={(e) => handleFieldChange('grew_up_location', e.target.value)}
          placeholder="City, State or Country"
          sx={{ mb: 3 }}
          InputProps={{
            sx: { minHeight: 56, fontSize: '1rem' },
          }}
          InputLabelProps={{
            sx: { fontSize: '1rem' },
          }}
        />

        <TextField
          fullWidth
          label="High school years (optional)"
          value={formData.high_school_years || ''}
          onChange={(e) => handleFieldChange('high_school_years', e.target.value)}
          placeholder="1965-1969"
          sx={{ mb: 3 }}
          InputProps={{
            sx: { minHeight: 56, fontSize: '1rem' },
          }}
          InputLabelProps={{
            sx: { fontSize: '1rem' },
          }}
        />

        <TextField
          fullWidth
          label="Age when you got your first job (optional)"
          type="number"
          value={formData.first_job_age || ''}
          onChange={(e) => handleFieldChange('first_job_age', parseInt(e.target.value) || undefined)}
          placeholder="16"
          InputProps={{
            sx: { minHeight: 56, fontSize: '1rem' },
          }}
          InputLabelProps={{
            sx: { fontSize: '1rem' },
          }}
        />
      </Paper>

      {/* Major Moves */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
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
            mb: 2,
            fontSize: '1.25rem',
          }}
        >
          Major moves
        </Typography>

        <Typography variant="body2" sx={{ color: 'var(--color-slate)', mb: 2 }}>
          List cities or places you've lived (optional)
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            value={newMove}
            onChange={(e) => setNewMove(e.target.value)}
            placeholder="e.g., Chicago, IL"
            onKeyPress={(e) => e.key === 'Enter' && addMove()}
            size="small"
            InputProps={{
              sx: { fontSize: '1rem' },
            }}
          />
          <Button
            variant="outlined"
            onClick={addMove}
            startIcon={<AddIcon />}
            sx={{
              minHeight: 48,
              px: 2,
              textTransform: 'none',
              borderColor: 'var(--color-stone)',
              color: 'var(--color-ink)',
            }}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {formData.major_moves?.map((move, index) => (
            <Chip
              key={index}
              label={move}
              onDelete={() => removeMove(index)}
              sx={{
                fontSize: '1rem',
                height: 40,
                backgroundColor: 'var(--color-linen)',
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Family Timeline */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
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
          Family timeline
        </Typography>

        <TextField
          fullWidth
          label="Year you met your partner (optional)"
          type="number"
          value={formData.partner_met_year || ''}
          onChange={(e) =>
            handleFieldChange('partner_met_year', parseInt(e.target.value) || undefined)
          }
          placeholder="1975"
          sx={{ mb: 3 }}
          InputProps={{
            sx: { minHeight: 56, fontSize: '1rem' },
          }}
          InputLabelProps={{
            sx: { fontSize: '1rem' },
          }}
        />

        <Typography variant="body2" sx={{ color: 'var(--color-slate)', mb: 2 }}>
          Children's birth years (optional)
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            type="number"
            value={newChildYear}
            onChange={(e) => setNewChildYear(e.target.value)}
            placeholder="1980"
            onKeyPress={(e) => e.key === 'Enter' && addChildYear()}
            size="small"
            InputProps={{
              sx: { fontSize: '1rem' },
            }}
          />
          <Button
            variant="outlined"
            onClick={addChildYear}
            startIcon={<AddIcon />}
            sx={{
              minHeight: 48,
              px: 2,
              textTransform: 'none',
              borderColor: 'var(--color-stone)',
              color: 'var(--color-ink)',
            }}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {formData.children_birth_years?.map((year, index) => (
            <Chip
              key={index}
              label={year}
              onDelete={() => removeChildYear(index)}
              sx={{
                fontSize: '1rem',
                height: 40,
                backgroundColor: 'var(--color-linen)',
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Milestones */}
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
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-ink)',
            mb: 2,
            fontSize: '1.25rem',
          }}
        >
          Key milestones
        </Typography>

        <Typography variant="body2" sx={{ color: 'var(--color-slate)', mb: 2 }}>
          5-10 important moments in your life (optional)
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            placeholder="e.g., Graduated college, Started my business"
            onKeyPress={(e) => e.key === 'Enter' && addMilestone()}
            size="small"
            InputProps={{
              sx: { fontSize: '1rem' },
            }}
          />
          <Button
            variant="outlined"
            onClick={addMilestone}
            startIcon={<AddIcon />}
            sx={{
              minHeight: 48,
              px: 2,
              textTransform: 'none',
              borderColor: 'var(--color-stone)',
              color: 'var(--color-ink)',
            }}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {formData.milestones?.map((milestone, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                backgroundColor: 'var(--color-linen)',
                borderRadius: '4px',
              }}
            >
              <Typography sx={{ flex: 1, fontSize: '1rem' }}>{milestone}</Typography>
              <IconButton size="small" onClick={() => removeMilestone(index)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Paper>

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
          }}
        >
          Continue to book tone
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
        You can skip any of these and add them later
      </Typography>
    </Box>
  )
}
