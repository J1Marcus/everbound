# Ghostwriter Workflow Components

This directory contains all React components for the Ghostwriter Workflow feature, which provides a guided, professional ghostwriter-style memoir creation experience.

## Overview

The Ghostwriter Workflow transforms memoir creation from an open-ended process into a structured, intelligent interview process. It includes:

- **Profile Setup**: Gentle questionnaire to understand the user's life and comfort boundaries
- **Section Roadmap**: Visual progress through memoir sections with progressive unlocking
- **Scene-Based Prompts**: Specific, sensory-rich questions that produce book-quality material
- **Photo Intelligence**: AI-powered photo analysis to enhance narrative descriptions
- **Synthesis Checkpoints**: Chapter previews with quality feedback

## Component Architecture

### Profile Setup Components

#### `ProfileQuestionnaire.tsx`
Gentle checkbox-based profile setup with three sections:
- **Relationship & Family**: Marital status, children, siblings, upbringing
- **Life Structure**: Military service, career, travel, faith
- **Comfort Boundaries**: Privacy preferences for sensitive topics

**Props:**
- `onComplete: (data: ProfileData) => void` - Called when questionnaire is completed
- `initialData?: Partial<ProfileData>` - Pre-fill with existing data

**Usage:**
```tsx
<ProfileQuestionnaire
  onComplete={(data) => console.log('Profile data:', data)}
  initialData={existingProfile}
/>
```

#### `TimelineAnchors.tsx`
Timeline scaffolding input for organizing memories chronologically.

**Props:**
- `onComplete: (data: TimelineData) => void` - Called when timeline is completed
- `onBack: () => void` - Navigate back to previous step
- `initialData?: Partial<TimelineData>` - Pre-fill with existing data

**Features:**
- Birth year and location
- High school years, first job age
- Major moves (dynamic list with chips)
- Partner met year, children birth years
- Key milestones (bulleted list)

#### `BookToneSelector.tsx`
Tone/flavor selection for memoir writing style.

**Props:**
- `onComplete: (tone: string) => void` - Called when tone is selected
- `onBack: () => void` - Navigate back
- `initialTone?: string` - Pre-select a tone

**Tone Options:**
- **Reflective**: Thoughtful and introspective
- **Warm**: Conversational and intimate
- **Humorous**: Light-hearted and playful
- **Direct**: Straightforward and factual

### Section & Prompt Components

#### `SectionRoadmap.tsx`
Visual progress through memoir sections with locked/unlocked/completed states.

**Props:**
- `sections: SectionStatus[]` - Array of section status objects
- `onSectionClick: (sectionId: string) => void` - Handle section navigation
- `overallProgress: number` - Overall completion percentage (0-100)

**Features:**
- Overall progress bar
- Section cards with status icons
- Progress indicators per section
- Click to navigate to unlocked sections

#### `ScenePrompt.tsx`
Individual scene-based prompt interface for memory capture.

**Props:**
- `prompt: { id, scene, people?, tension?, change?, meaning? }` - Prompt structure
- `initialResponse?: string` - Pre-fill response
- `onSave: (response: string, isDraft: boolean) => void` - Save handler
- `onNext?: () => void` - Navigate to next prompt
- `onPrevious?: () => void` - Navigate to previous prompt
- `onPhotoUpload?: () => void` - Trigger photo upload
- `onVoiceRecord?: () => void` - Trigger voice recording
- `hasNext?: boolean` - Show next button
- `hasPrevious?: boolean` - Show previous button

**Features:**
- 5-part prompt structure (Scene, People, Tension, Change, Meaning)
- Word count indicator with color-coded feedback
- Auto-save draft functionality
- Voice recording and photo upload options

#### `PromptList.tsx`
List of prompts for a section with completion status.

**Props:**
- `prompts: Prompt[]` - Array of prompt objects
- `onPromptClick: (promptId: string) => void` - Handle prompt selection
- `sectionTitle: string` - Section name
- `completedCount: number` - Number of completed prompts
- `totalCount: number` - Total number of prompts

### Photo Intelligence Components

#### `PhotoUpload.tsx`
Photo upload with AI analysis.

**Props:**
- `onUploadComplete: (photoId: string, analysis: PhotoAnalysis) => void` - Upload completion handler
- `onCancel?: () => void` - Cancel handler
- `projectId: string` - Project identifier

**Features:**
- Drag-and-drop or click to upload
- Image preview
- AI analysis loading state
- Display AI-detected details (people, setting, objects, mood)
- Caption, location, and date inputs

#### `PhotoEnhancedPrompt.tsx`
Photo-specific follow-up questions based on AI analysis.

**Props:**
- `photoUrl: string` - Photo URL to display
- `analysis: PhotoAnalysis` - AI analysis results
- `onPromptSelect: (prompt: string) => void` - Prompt selection handler

**Features:**
- Displays uploaded photo
- Shows AI analysis summary
- Generates contextual prompts based on photo content
- Examples: "Tell me about this day...", "Who are the people in this photo?"

#### `PhotoGallery.tsx`
View all photos for project with filtering.

**Props:**
- `photos: Photo[]` - Array of photo objects
- `onPhotoClick: (photoId: string) => void` - Photo click handler
- `sections?: string[]` - Available sections for filtering

**Features:**
- Grid layout with masonry style
- Filter by section
- Search by caption, location, or people
- Click to view details and linked memories

### Synthesis & Progress Components

#### `SynthesisCheckpoint.tsx`
Chapter preview with quality feedback.

**Props:**
- `synthesis: SectionSynthesis` - Synthesis data
- `onApprove: (feedback?: string) => void` - Approve and continue
- `onAddMore: () => void` - Add more memories
- `onRegenerate?: (feedback: string) => void` - Regenerate with feedback

**Features:**
- Display synthesized chapter prose
- Show placed photos with captions
- Quality feedback section with scores
- Suggestions for improvement
- User feedback input
- Approve or add more memories

#### `ProgressTracker.tsx`
Section completion visualization.

**Props:**
- `sectionsTotal: number` - Total sections
- `sectionsCompleted: number` - Completed sections
- `memoriesCollected: number` - Total memories captured
- `photosUploaded: number` - Total photos uploaded
- `overallProgress: number` - Overall completion percentage

**Features:**
- Overall progress bar
- Stats grid (sections, memories, photos)
- Visual progress indicators

#### `QualityFeedback.tsx`
Display quality scores and suggestions.

**Props:**
- `scores: QualityScores` - Quality score object
- `suggestions: string[]` - Improvement suggestions
- `strengths?: string[]` - What's working well

**Features:**
- Overall quality score with label
- Individual score breakdowns (sensory richness, emotional depth, detail)
- Strengths highlighted
- Actionable suggestions

## Pages

### `ProfileSetupPage.tsx`
Complete profile setup flow with three steps:
1. ProfileQuestionnaire
2. TimelineAnchors
3. BookToneSelector

**Route:** `/ghostwriter/profile-setup/:projectId`

### `SectionRoadmapPage.tsx`
Main ghostwriter dashboard showing section progress.

**Route:** `/ghostwriter/roadmap/:projectId`

**Features:**
- Progress tracker
- Section roadmap
- Navigation to sections

### `PromptCapturePage.tsx`
Memory capture interface for a specific section.

**Routes:**
- `/ghostwriter/section/:sectionId` - Show prompt list
- `/ghostwriter/section/:sectionId/prompt/:promptId` - Show specific prompt

**Features:**
- Prompt list view
- Individual prompt capture
- Navigation between prompts
- Auto-save functionality

### `SynthesisPreviewPage.tsx`
Chapter preview and approval interface.

**Route:** `/ghostwriter/synthesis/:sectionId`

**Features:**
- Display chapter preview
- Quality feedback
- Approve or request changes
- Add more memories option

## State Management

### `ghostwriterStore.ts`
Zustand store for ghostwriter workflow state.

**State:**
- `currentProfile: UserProfile | null` - Current user profile
- `sections: SectionStatus[]` - All sections with status
- `currentSectionId: string | null` - Active section
- `currentPromptId: string | null` - Active prompt
- `uploadingPhotos: boolean` - Photo upload state
- `overallProgress: number` - Overall completion percentage
- `memoriesCollected: number` - Total memories count
- `photosUploaded: number` - Total photos count

**Actions:**
- `setProfile(profile)` - Update profile
- `setSections(sections)` - Update sections
- `setCurrentSection(sectionId)` - Set active section
- `updateProgress(progress)` - Update progress metrics
- `reset()` - Reset all state

## Design Principles

### Elder-Friendly UX
- **Large touch targets**: Minimum 48px × 48px
- **Clear typography**: 16px minimum, high contrast
- **Generous spacing**: Prevents overwhelm
- **One thing at a time**: Single primary action per screen
- **Forgiving interactions**: Undo, auto-save, confirmation dialogs

### Calm & Guided Aesthetic
- **Warm color palette**: Paper, amber, natural tones
- **Book-like design**: Serif fonts, subtle shadows
- **Gentle feedback**: Encouraging, not demanding
- **Progress visibility**: Always show where you are
- **Reassurance**: "You can change this anytime"

### Mobile-Responsive
- All components are mobile-first
- Full-width buttons on mobile
- Stacked layouts on small screens
- Touch-friendly interactions

## API Integration

All components integrate with the Ghostwriter API client (`lib/api/ghostwriter.ts`):

- `getProfile(projectId)` - Fetch user profile
- `saveProfile(profileData)` - Save profile
- `getSections(projectId)` - Fetch sections
- `getSectionPrompts(sectionId)` - Fetch prompts
- `analyzePhoto(photoUrl, projectId)` - Analyze photo with AI
- `enhanceMemoryWithPhoto(text, photoId)` - Enhance memory text
- `generateSectionPreview(sectionId)` - Generate chapter preview
- `approveSection(sectionId)` - Approve and continue

## Testing

### Component Testing
Each component should be tested for:
- Rendering with required props
- User interactions (clicks, inputs)
- State updates
- API integration
- Error handling
- Loading states

### Integration Testing
Test complete workflows:
1. Profile setup → Section roadmap
2. Section selection → Prompt capture → Save
3. Photo upload → AI analysis → Enhanced prompt
4. Section completion → Synthesis → Approval

### Accessibility Testing
- Keyboard navigation
- Screen reader compatibility
- Color contrast (WCAG AAA)
- Focus indicators
- Touch target sizes

## Future Enhancements

- **Voice-first interface**: Larger voice recording buttons, waveform feedback
- **Collaborative features**: Family member contributions, perspective comparison
- **Advanced photo features**: Photo timeline view, automatic enhancement
- **Accessibility modes**: High contrast, simplified mode, text-to-speech

## Related Documentation

- [`docs/GHOSTWRITER_WORKFLOW_GUIDE.md`](../../../docs/GHOSTWRITER_WORKFLOW_GUIDE.md) - Complete workflow specification
- [`docs/GHOSTWRITER_ARCHITECTURE_PART2.md`](../../../docs/GHOSTWRITER_ARCHITECTURE_PART2.md) - Technical architecture
- [`docs/UI_DESIGN_SYSTEM.md`](../../../docs/UI_DESIGN_SYSTEM.md) - Design system guidelines
- [`lib/api/ghostwriter.ts`](../../lib/api/ghostwriter.ts) - API client documentation
