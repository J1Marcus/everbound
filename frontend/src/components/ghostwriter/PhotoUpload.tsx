/**
 * PhotoUpload Component
 * Photo upload with AI analysis
 */

import React, { useState, useCallback } from 'react'
import { Box, Typography, Button, Paper, CircularProgress, TextField } from '@mui/material'
import { CloudUpload as UploadIcon, Close as CloseIcon } from '@mui/icons-material'
import type { PhotoAnalysis } from '../../lib/api/ghostwriter'

interface PhotoUploadProps {
  onUploadComplete: (photoId: string, analysis: PhotoAnalysis) => void
  onCancel?: () => void
  projectId: string
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onUploadComplete,
  onCancel,
  projectId, // Used for future Supabase storage upload
}) => {
  // Suppress unused variable warning - projectId will be used when Supabase storage is implemented
  void projectId
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null)
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // TODO: Implement actual upload to Supabase Storage
      // const { data: uploadData, error: uploadError } = await supabase.storage
      //   .from('memoir-photos')
      //   .upload(`${projectId}/${Date.now()}_${selectedFile.name}`, selectedFile)

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUploading(false)
      setAnalyzing(true)

      // TODO: Call photo analysis API
      // const { analysis } = await analyzePhoto(photoUrl, projectId, photoId, caption)

      // Simulate analysis
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockAnalysis: PhotoAnalysis = {
        people_detected: [
          {
            position: 'center',
            description: 'Person in casual clothing',
          },
        ],
        setting: {
          type: 'outdoor',
          location_type: 'park',
        },
        objects: ['trees', 'bench'],
        mood: 'peaceful',
        emotions: ['happy', 'relaxed'],
        time_period_indicators: ['modern clothing'],
        suggestions: ['Tell us about this day', 'Who were you with?'],
      }

      setAnalysis(mockAnalysis)
      setAnalyzing(false)

      // Call completion handler
      onUploadComplete('mock-photo-id', mockAnalysis)
    } catch (error) {
      console.error('Upload failed:', error)
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setAnalysis(null)
    setCaption('')
    setLocation('')
    setDate('')
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
        Add a photo
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
        Photos help bring your memories to life. We'll analyze it to help you add rich details.
      </Typography>

      {!previewUrl ? (
        <Paper
          elevation={0}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          sx={{
            p: 6,
            mb: 3,
            backgroundColor: 'var(--color-linen)',
            border: '2px dashed var(--color-stone)',
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'var(--color-amber)',
              backgroundColor: 'var(--color-parchment)',
            },
          }}
        >
          <UploadIcon sx={{ fontSize: 64, color: 'var(--color-slate)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'var(--color-ink)', mb: 1 }}>
            Drag and drop your photo here
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-slate)', mb: 3 }}>
            or
          </Typography>
          <Button
            variant="contained"
            component="label"
            sx={{
              minHeight: 48,
              px: 4,
              backgroundColor: 'var(--color-amber)',
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'var(--color-amber-light)',
              },
            }}
          >
            Choose file
            <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
          </Button>
        </Paper>
      ) : (
        <>
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
            <Box sx={{ position: 'relative', mb: 2 }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  borderRadius: '4px',
                }}
              />
              <Button
                onClick={handleRemove}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  minWidth: 'auto',
                  p: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'white',
                  },
                }}
              >
                <CloseIcon />
              </Button>
            </Box>

            {(uploading || analyzing) && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress sx={{ color: 'var(--color-amber)', mb: 2 }} />
                <Typography variant="body1" sx={{ color: 'var(--color-slate)' }}>
                  {uploading ? 'Uploading photo...' : 'Analyzing photo with AI...'}
                </Typography>
              </Box>
            )}

            {analysis && (
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--color-ink)',
                    mb: 2,
                  }}
                >
                  AI Analysis
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'var(--color-slate)', mb: 1 }}>
                    <strong>Setting:</strong> {analysis.setting.type}
                    {analysis.setting.location_type && ` - ${analysis.setting.location_type}`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-slate)', mb: 1 }}>
                    <strong>Mood:</strong> {analysis.mood}
                  </Typography>
                  {analysis.objects.length > 0 && (
                    <Typography variant="body2" sx={{ color: 'var(--color-slate)', mb: 1 }}>
                      <strong>Objects:</strong> {analysis.objects.join(', ')}
                    </Typography>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="Caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption for this photo"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Location (optional)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where was this taken?"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Date (optional)"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="When was this taken?"
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
          </Paper>

          {!uploading && !analyzing && !analysis && (
            <Button
              fullWidth
              variant="contained"
              onClick={handleUpload}
              sx={{
                minHeight: 56,
                fontSize: '1rem',
                fontWeight: 500,
                backgroundColor: 'var(--color-amber)',
                color: 'white',
                borderRadius: '8px',
                textTransform: 'none',
                mb: 2,
                '&:hover': {
                  backgroundColor: 'var(--color-amber-light)',
                },
              }}
            >
              Upload and analyze
            </Button>
          )}

          {analysis && (
            <Button
              fullWidth
              variant="contained"
              onClick={() => onUploadComplete('mock-photo-id', analysis)}
              sx={{
                minHeight: 56,
                fontSize: '1rem',
                fontWeight: 500,
                backgroundColor: 'var(--color-amber)',
                color: 'white',
                borderRadius: '8px',
                textTransform: 'none',
                mb: 2,
                '&:hover': {
                  backgroundColor: 'var(--color-amber-light)',
                },
              }}
            >
              Save photo
            </Button>
          )}

          {onCancel && (
            <Button
              fullWidth
              variant="outlined"
              onClick={onCancel}
              sx={{
                minHeight: 48,
                fontSize: '1rem',
                borderColor: 'var(--color-stone)',
                color: 'var(--color-ink)',
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'var(--color-slate)',
                  backgroundColor: 'var(--color-linen)',
                },
              }}
            >
              Cancel
            </Button>
          )}
        </>
      )}
    </Box>
  )
}
