/**
 * PhotoGallery Component
 * View all photos for project with filtering
 */

import React, { useState } from 'react'
import { Box, Typography, Paper, ImageList, ImageListItem, ImageListItemBar, IconButton, Chip, TextField, MenuItem } from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'

interface Photo {
  id: string
  url: string
  caption?: string
  location?: string
  date?: string
  section?: string
  people?: string[]
}

interface PhotoGalleryProps {
  photos: Photo[]
  onPhotoClick: (photoId: string) => void
  sections?: string[]
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onPhotoClick,
  sections = [],
}) => {
  const [filterSection, setFilterSection] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPhotos = photos.filter((photo) => {
    const matchesSection = filterSection === 'all' || photo.section === filterSection
    const matchesSearch =
      !searchTerm ||
      photo.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.people?.some((person) => person.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSection && matchesSearch
  })

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 3, md: 4 } }}>
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
        Photo gallery
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
        {photos.length} {photos.length === 1 ? 'photo' : 'photos'} in your memoir
      </Typography>

      {/* Filters */}
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
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            select
            label="Filter by section"
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="all">All sections</MenuItem>
            {sections.map((section) => (
              <MenuItem key={section} value={section}>
                {section}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Search photos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Caption, location, or person..."
            sx={{ flex: 1, minWidth: 200 }}
            size="small"
          />
        </Box>
      </Paper>

      {/* Photo Grid */}
      {filteredPhotos.length > 0 ? (
        <ImageList
          sx={{ width: '100%', height: 'auto' }}
          cols={3}
          gap={16}
          variant="masonry"
        >
          {filteredPhotos.map((photo) => (
            <ImageListItem
              key={photo.id}
              sx={{
                cursor: 'pointer',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--color-stone)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 'var(--shadow-lg)',
                  borderColor: 'var(--color-amber)',
                },
              }}
              onClick={() => onPhotoClick(photo.id)}
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Memory photo'}
                loading="lazy"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              <ImageListItemBar
                title={photo.caption || 'Untitled'}
                subtitle={
                  <Box sx={{ mt: 0.5 }}>
                    {photo.location && (
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem' }}>
                        📍 {photo.location}
                      </Typography>
                    )}
                    {photo.date && (
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem' }}>
                        📅 {photo.date}
                      </Typography>
                    )}
                    {photo.section && (
                      <Chip
                        label={photo.section}
                        size="small"
                        sx={{
                          mt: 0.5,
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: 'var(--color-amber)',
                          color: 'white',
                        }}
                      />
                    )}
                  </Box>
                }
                actionIcon={
                  <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onPhotoClick(photo.id)
                    }}
                  >
                    <InfoIcon />
                  </IconButton>
                }
                sx={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: 'var(--color-linen)',
            border: '1px solid var(--color-stone)',
            borderRadius: '8px',
          }}
        >
          <Typography variant="body1" sx={{ color: 'var(--color-slate)' }}>
            {searchTerm || filterSection !== 'all'
              ? 'No photos match your filters'
              : 'No photos yet. Add photos as you capture memories!'}
          </Typography>
        </Paper>
      )}
    </Box>
  )
}
