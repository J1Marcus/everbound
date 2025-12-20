/**
 * ScenePrompt Component
 * Individual scene-based prompt interface for memory capture
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Mic as MicIcon,
  Photo as PhotoIcon,
  Save as SaveIcon,
} from '@mui/icons-material'

interface ScenePromptProps {
  prompt: {
    id: string
    scene: string
    people?: string
    tension?: string
    change?: string
    meaning?: string
  }
  initialResponse?: string
  onSave: (response: string, isDraft: boolean) => void
  onNext?: () => void
  onPrevious?: () => void
  onPhotoUpload?: () => void
  onVoiceRecord?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

export const ScenePrompt: React.FC<ScenePromptProps> = ({
  prompt,
  initialResponse = '',
  onSave,
  onNext,
  onPrevious,
  onPhotoUpload,
  onVoiceRecord,
  hasNext = false,
  hasPrevious = false,
}) => {
  const [response, setResponse] = useState(initialResponse)
  const [wordCount, setWordCount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const words = response.trim().split(/\s+/).filter((word) => word.length > 0)
    setWordCount(words.length)
  }, [response])

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await onSave(response, true)
    setIsSaving(false)
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    await onSave(response, false)
    setIsSaving(false)
  }

  const getWordCountColor = () => {
    if (wordCount < 100) return 'var(--color-slate)'
    if (wordCount < 200) return 'var(--color-warning)'
    if (wordCount <= 500) return 'var(--color-success)'
    return 'var(--color-amber)'
  }

  const getWordCountMessage = () => {
    if (wordCount < 100) return 'Keep going—add more details'
    if (wordCount < 200) return 'Good start—a bit more would be great'
    if (wordCount <= 500) return 'Perfect amount of detail!'
    return 'Wonderful detail! Feel free to continue'
  }

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', p: { xs: 3, md: 4 } }}>
      {/* Navigation Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        {hasPrevious ? (
          <IconButton
            onClick={onPrevious}
            sx={{
              color: 'var(--color-amber)',
              '&:hover': { backgroundColor: 'var(--color-linen)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}

        <Button
          variant="text"
          onClick={handleSaveDraft}
          disabled={isSaving || !response.trim()}
          startIcon={<SaveIcon />}
          sx={{
            textTransform: 'none',
            color: 'var(--color-slate)',
            fontSize: '0.875rem',
            '&:hover': { backgroundColor: 'var(--color-linen)' },
          }}
        >
          Save draft
        </Button>

        {hasNext ? (
          <IconButton
            onClick={onNext}
            sx={{
              color: 'var(--color-amber)',
              '&:hover': { backgroundColor: 'var(--color-linen)' },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}
      </Box>

      {/* Prompt Display */}
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
          variant="h5"
          sx={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-ink)',
            mb: 3,
            fontSize: '1.5rem',
            lineHeight: 1.4,
          }}
        >
          {prompt.scene}
        </Typography>

        {prompt.people && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-slate)',
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              Who was there?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'var(--color-ink)', fontSize: '1rem' }}
            >
              {prompt.people}
            </Typography>
          </Box>
        )}

        {prompt.tension && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-slate)',
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              What was challenging?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'var(--color-ink)', fontSize: '1rem' }}
            >
              {prompt.tension}
            </Typography>
          </Box>
        )}

        {prompt.change && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-slate)',
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              How did it change you?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'var(--color-ink)', fontSize: '1rem' }}
            >
              {prompt.change}
            </Typography>
          </Box>
        )}

        {prompt.meaning && (
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-slate)',
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              Looking back...
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'var(--color-ink)', fontSize: '1rem' }}
            >
              {prompt.meaning}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Response Input */}
      <Box sx={{ position: 'relative', mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={8}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Take your time... What do you remember about this moment?"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: '1rem',
              lineHeight: 1.7,
              fontFamily: 'var(--font-serif)',
              paddingRight: '56px', // Make room for mic button
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              '&:hover fieldset': {
                borderColor: 'var(--color-amber-light)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--color-amber)',
              },
            },
          }}
        />
        <IconButton
          onClick={onVoiceRecord || (() => alert('Voice recording will be implemented soon'))}
          sx={{
            position: 'absolute',
            right: 8,
            bottom: 8,
            color: 'var(--color-amber)',
            backgroundColor: 'var(--color-linen)',
            '&:hover': {
              backgroundColor: 'var(--color-amber)',
              color: 'white',
            },
          }}
          title="Record voice"
        >
          <MicIcon />
        </IconButton>
      </Box>

      {/* Word Count */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: getWordCountColor(),
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {wordCount} words • {getWordCountMessage()}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {onVoiceRecord && (
          <Button
            variant="outlined"
            startIcon={<MicIcon />}
            onClick={onVoiceRecord}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 auto' },
              minHeight: 48,
              textTransform: 'none',
              borderColor: 'var(--color-stone)',
              color: 'var(--color-ink)',
              '&:hover': {
                borderColor: 'var(--color-amber)',
                backgroundColor: 'var(--color-linen)',
              },
            }}
          >
            Record voice
          </Button>
        )}

        {onPhotoUpload && (
          <Button
            variant="outlined"
            startIcon={<PhotoIcon />}
            onClick={onPhotoUpload}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 auto' },
              minHeight: 48,
              textTransform: 'none',
              borderColor: 'var(--color-stone)',
              color: 'var(--color-ink)',
              '&:hover': {
                borderColor: 'var(--color-amber)',
                backgroundColor: 'var(--color-linen)',
              },
            }}
          >
            Add photo
          </Button>
        )}
      </Box>

      {/* Submit Button */}
      <Button
        fullWidth
        variant="contained"
        onClick={handleSubmit}
        disabled={isSaving || !response.trim() || wordCount < 50}
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
          '&:disabled': {
            backgroundColor: 'var(--color-stone)',
            opacity: 0.5,
          },
        }}
      >
        {isSaving ? 'Saving...' : 'Save memory'}
      </Button>

      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          color: 'var(--color-slate)',
          mt: 2,
          fontSize: '0.875rem',
        }}
      >
        Your work is automatically saved as you type
      </Typography>
    </Box>
  )
}
