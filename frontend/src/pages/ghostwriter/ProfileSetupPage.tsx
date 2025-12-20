/**
 * ProfileSetupPage
 * Complete profile setup flow with three steps
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Stepper, Step, StepLabel, Container } from '@mui/material'
import { ProfileQuestionnaire, type ProfileData } from '../../components/ghostwriter/ProfileQuestionnaire'
import { TimelineAnchors, type TimelineData } from '../../components/ghostwriter/TimelineAnchors'
import { BookToneSelector } from '../../components/ghostwriter/BookToneSelector'
import { saveProfile } from '../../lib/api/ghostwriter'
import { useGhostwriterStore } from '../../stores/ghostwriterStore'
import LoadingSpinner from '../../components/LoadingSpinner'

const steps = ['About you', 'Timeline', 'Book tone']

export const ProfileSetupPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { setProfile, setProfileLoading, setProfileError } = useGhostwriterStore()

  const [activeStep, setActiveStep] = useState(0)
  const [profileData, setProfileData] = useState<ProfileData>({})
  const [timelineData, setTimelineData] = useState<TimelineData>({})
  const [bookTone, setBookTone] = useState<string>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard')
    }
  }, [projectId, navigate])

  const handleProfileComplete = (data: ProfileData) => {
    setProfileData(data)
    setActiveStep(1)
  }

  const handleTimelineComplete = (data: TimelineData) => {
    setTimelineData(data)
    setActiveStep(2)
  }

  const handleTimelineBack = () => {
    setActiveStep(0)
  }

  const handleToneComplete = async (tone: string) => {
    if (!projectId) return

    setBookTone(tone)
    setSaving(true)
    setProfileLoading(true)

    try {
      // Combine all profile data
      const completeProfile = {
        project_id: projectId,
        ...profileData,
        ...timelineData,
        book_tone: tone,
        profile_completed: true,
        profile_completed_at: new Date().toISOString(),
      }

      // DEMO MODE: Store locally since backend isn't set up yet
      console.log('Profile data (demo mode):', completeProfile)
      localStorage.setItem(`ghostwriter_profile_${projectId}`, JSON.stringify(completeProfile))
      
      // Try to save to backend, but don't fail if it's not available
      try {
        const { profile } = await saveProfile(completeProfile)
        setProfile(profile)
        setProfileError(null)
      } catch (backendError) {
        console.warn('Backend not available, using demo mode:', backendError)
        // Store in Zustand anyway for demo
        setProfile(completeProfile as any)
        setProfileError(null)
      }

      // Navigate to section roadmap
      navigate(`/ghostwriter/roadmap/${projectId}`)
    } catch (error) {
      console.error('Failed to save profile:', error)
      setProfileError(error instanceof Error ? error.message : 'Failed to save profile')
    } finally {
      setSaving(false)
      setProfileLoading(false)
    }
  }

  const handleToneBack = () => {
    setActiveStep(1)
  }

  if (!projectId) {
    return <LoadingSpinner />
  }

  if (saving) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <LoadingSpinner />
        <Box sx={{ mt: 3, color: 'var(--color-slate)' }}>
          Setting up your memoir...
        </Box>
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'var(--color-paper)', py: 4 }}>
      <Container maxWidth="md">
        {/* Progress Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem',
                      color: 'var(--color-slate)',
                      '&.Mui-active': {
                        color: 'var(--color-amber)',
                        fontWeight: 500,
                      },
                      '&.Mui-completed': {
                        color: 'var(--color-success)',
                      },
                    },
                    '& .MuiStepIcon-root': {
                      color: 'var(--color-stone)',
                      '&.Mui-active': {
                        color: 'var(--color-amber)',
                      },
                      '&.Mui-completed': {
                        color: 'var(--color-success)',
                      },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        {activeStep === 0 && (
          <ProfileQuestionnaire
            onComplete={handleProfileComplete}
            initialData={profileData}
          />
        )}

        {activeStep === 1 && (
          <TimelineAnchors
            onComplete={handleTimelineComplete}
            onBack={handleTimelineBack}
            initialData={timelineData}
          />
        )}

        {activeStep === 2 && (
          <BookToneSelector
            onComplete={handleToneComplete}
            onBack={handleToneBack}
            initialTone={bookTone}
          />
        )}
      </Container>
    </Box>
  )
}
