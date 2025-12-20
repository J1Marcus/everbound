/**
 * Ghostwriter Workflow Store
 * Manages state for the ghostwriter workflow including profile, sections, and progress
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, SectionStatus } from '../lib/api/ghostwriter'

interface GhostwriterState {
  // Profile state
  currentProfile: UserProfile | null
  profileLoading: boolean
  profileError: string | null

  // Section state
  sections: SectionStatus[]
  sectionsLoading: boolean
  sectionsError: string | null
  currentSectionId: string | null
  currentPromptId: string | null

  // Photo upload state
  uploadingPhotos: boolean
  photoUploadProgress: number

  // Progress tracking
  overallProgress: number
  memoriesCollected: number
  photosUploaded: number

  // Actions
  setProfile: (profile: UserProfile | null) => void
  setProfileLoading: (loading: boolean) => void
  setProfileError: (error: string | null) => void

  setSections: (sections: SectionStatus[]) => void
  setSectionsLoading: (loading: boolean) => void
  setSectionsError: (error: string | null) => void

  setCurrentSection: (sectionId: string | null) => void
  setCurrentPrompt: (promptId: string | null) => void

  setUploadingPhotos: (uploading: boolean) => void
  setPhotoUploadProgress: (progress: number) => void

  updateProgress: (progress: {
    overall?: number
    memories?: number
    photos?: number
  }) => void

  // Reset state
  reset: () => void
}

const initialState = {
  currentProfile: null,
  profileLoading: false,
  profileError: null,
  sections: [],
  sectionsLoading: false,
  sectionsError: null,
  currentSectionId: null,
  currentPromptId: null,
  uploadingPhotos: false,
  photoUploadProgress: 0,
  overallProgress: 0,
  memoriesCollected: 0,
  photosUploaded: 0,
}

export const useGhostwriterStore = create<GhostwriterState>()(
  persist(
    (set) => ({
      ...initialState,

      setProfile: (profile) => set({ currentProfile: profile }),
      setProfileLoading: (loading) => set({ profileLoading: loading }),
      setProfileError: (error) => set({ profileError: error }),

      setSections: (sections) => set({ sections }),
      setSectionsLoading: (loading) => set({ sectionsLoading: loading }),
      setSectionsError: (error) => set({ sectionsError: error }),

      setCurrentSection: (sectionId) => set({ currentSectionId: sectionId }),
      setCurrentPrompt: (promptId) => set({ currentPromptId: promptId }),

      setUploadingPhotos: (uploading) => set({ uploadingPhotos: uploading }),
      setPhotoUploadProgress: (progress) => set({ photoUploadProgress: progress }),

      updateProgress: (progress) =>
        set((state) => ({
          overallProgress: progress.overall ?? state.overallProgress,
          memoriesCollected: progress.memories ?? state.memoriesCollected,
          photosUploaded: progress.photos ?? state.photosUploaded,
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'ghostwriter-storage',
      partialize: (state) => ({
        currentProfile: state.currentProfile,
        currentSectionId: state.currentSectionId,
        currentPromptId: state.currentPromptId,
      }),
    }
  )
)
