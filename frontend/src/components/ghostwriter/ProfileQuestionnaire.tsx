/**
 * ProfileQuestionnaire Component
 * Gentle checkbox-based profile setup for ghostwriter workflow
 */

import React, { useState } from 'react'
import { Box, Typography, Checkbox, FormControlLabel, FormGroup, TextField, Button, Paper } from '@mui/material'

interface ProfileQuestionnaireProps {
  onComplete: (data: ProfileData) => void
  initialData?: Partial<ProfileData>
}

export interface ProfileData {
  // Relationship & Family
  marital_status?: string
  has_children?: boolean
  has_siblings?: boolean
  raised_by?: string

  // Life Structure
  military_service?: boolean
  career_type?: string
  lived_multiple_places?: boolean
  travel_important?: boolean
  faith_important?: boolean

  // Comfort Boundaries
  comfortable_romance?: boolean
  comfortable_trauma?: boolean
  skip_personal?: boolean
}

export const ProfileQuestionnaire: React.FC<ProfileQuestionnaireProps> = ({
  onComplete,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<ProfileData>(initialData)
  const [showCareerInput, setShowCareerInput] = useState(false)

  const handleCheckboxChange = (field: keyof ProfileData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }))
  }

  const handleRadioChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
        Tell us a bit about yourself
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
        This helps us ask the right questions and skip what doesn't apply to you.
        Everything is optional—share only what feels comfortable.
      </Typography>

      {/* Relationship & Family Section */}
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
          Relationship & Family
        </Typography>

        <FormGroup>
          <Typography variant="body2" sx={{ mb: 1, color: 'var(--color-slate)' }}>
            Marital status:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {['Married/partnered now', 'Previously married/partnered', 'Never married'].map(
              (option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={formData.marital_status === option}
                      onChange={() => handleRadioChange('marital_status', option)}
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  }
                  label={option}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
                />
              )
            )}
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.has_children || false}
                onChange={handleCheckboxChange('has_children')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
              />
            }
            label="I have children"
            sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.has_siblings || false}
                onChange={handleCheckboxChange('has_siblings')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
              />
            }
            label="I have siblings"
            sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
          />

          <Typography variant="body2" sx={{ mt: 2, mb: 1, color: 'var(--color-slate)' }}>
            I was raised by:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {['Both parents', 'One parent', 'Grandparents', 'Other family'].map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={formData.raised_by === option}
                    onChange={() => handleRadioChange('raised_by', option)}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  />
                }
                label={option}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
              />
            ))}
          </Box>
        </FormGroup>
      </Paper>

      {/* Life Structure Section */}
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
          Life Structure
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.military_service || false}
                onChange={handleCheckboxChange('military_service')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
              />
            }
            label="I served in the military"
            sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
          />

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showCareerInput}
                  onChange={(e) => {
                    setShowCareerInput(e.target.checked)
                    if (!e.target.checked) {
                      setFormData((prev) => ({ ...prev, career_type: undefined }))
                    }
                  }}
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                />
              }
              label="I had a major career"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
            />
            {showCareerInput && (
              <TextField
                fullWidth
                placeholder="What was your career? (optional)"
                value={formData.career_type || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, career_type: e.target.value }))
                }
                sx={{ mt: 1, ml: 4 }}
                size="small"
              />
            )}
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.lived_multiple_places || false}
                onChange={handleCheckboxChange('lived_multiple_places')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
              />
            }
            label="I've lived in multiple places"
            sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.travel_important || false}
                onChange={handleCheckboxChange('travel_important')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
              />
            }
            label="Travel has been important to me"
            sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.faith_important || false}
                onChange={handleCheckboxChange('faith_important')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
              />
            }
            label="Faith/spirituality is important to me"
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
          />
        </FormGroup>
      </Paper>

      {/* Comfort Boundaries Section */}
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
            mb: 1,
            fontSize: '1.25rem',
          }}
        >
          Comfort Boundaries
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: 'var(--color-slate)', mb: 2, fontSize: '0.875rem' }}
        >
          This helps us respect your privacy and comfort level
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.comfortable_romance || false}
                onChange={handleCheckboxChange('comfortable_romance')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
              />
            }
            label="I'm comfortable discussing romance"
            sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.comfortable_trauma || false}
                onChange={handleCheckboxChange('comfortable_trauma')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
              />
            }
            label="I'm comfortable discussing loss/trauma"
            sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.skip_personal || false}
                onChange={handleCheckboxChange('skip_personal')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
              />
            }
            label="Skip anything too personal"
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '1rem' } }}
          />
        </FormGroup>
      </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
          Continue to timeline
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
        You can change these answers anytime
      </Typography>
    </Box>
  )
}
